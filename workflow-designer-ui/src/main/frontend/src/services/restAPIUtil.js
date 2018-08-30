/*
 * Copyright © 2018 European Support Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import uuid from 'uuid-js';
import md5 from 'md5';
import axios from 'axios';

import store from 'store';
import { USER_ID } from 'appConstants';

import {
    sendRequestAction,
    recieveResponseAction
} from 'shared/loader/LoaderConstants';

import Configuration from 'config/Configuration.js';
import errorResponseHandler from 'shared/errorResponseHandler/errorResponseHandler';

//methods
const GET = 'GET';
const POST = 'POST';
const PUT = 'PUT';
const DELETE = 'DELETE';
const PATCH = 'PATCH';

// content-types
const APPLICATION_JSON = 'application/json';
const MULTIPART_FORM_DATA = 'multipart/form-data';

const BINARY = 'binary';

const AUTHORIZATION_HEADER = 'X-AUTH-TOKEN';
const STORAGE_AUTH_KEY = 'sdc-auth-token';
const REQUEST_ID_HEADER = 'X-ECOMP-RequestID';
const CONTENT_MD5_HEADER = 'Content-MD5';

function applySecurity(options, data) {
    let headers = options.headers || (options.headers = {});
    if (options.isAnonymous) {
        return;
    }

    let authToken = localStorage.getItem(STORAGE_AUTH_KEY);
    if (authToken) {
        headers[AUTHORIZATION_HEADER] = authToken;
    }

    let catalogApiHeaders = Configuration.get('CatalogApiHeaders'),
        catalogUidHeader = catalogApiHeaders && catalogApiHeaders.userId;
    if (catalogUidHeader) {
        headers[catalogUidHeader.name] = catalogUidHeader.value;
    }

    headers[REQUEST_ID_HEADER] = uuid.create().toString();
    if (options.md5) {
        let headers = options.headers;
        headers[CONTENT_MD5_HEADER] = window.btoa(
            md5(JSON.stringify(data)).toLowerCase()
        );
    }

    if (localStorage.getItem(USER_ID)) {
        headers[USER_ID] = localStorage.getItem(USER_ID);
    }
}

function handleSuccess(responseHeaders, requestHeaders) {
    let authToken = responseHeaders[AUTHORIZATION_HEADER];
    let prevToken = requestHeaders && requestHeaders[AUTHORIZATION_HEADER];
    if (authToken && authToken !== prevToken) {
        if (authToken === 'null') {
            localStorage.removeItem(STORAGE_AUTH_KEY);
        } else {
            localStorage.setItem(STORAGE_AUTH_KEY, authToken);
        }
    }
}

class RestAPIUtil {
    async handleRequest(url, type, options = {}, data) {
        applySecurity(options, data);

        // TODO see ig necessary or in transformrequest funtion
        if (type === POST || type === PUT || type === PATCH) {
            options.headers.contentType =
                data instanceof FormData
                    ? MULTIPART_FORM_DATA
                    : APPLICATION_JSON;
        } else {
            data = null;
        }

        let config = {
            method: type,
            url: url,
            headers: options.headers,
            data: data
        };

        store.dispatch(sendRequestAction(url));

        if (options.dataType === BINARY) {
            config.responseType = 'arraybuffer';
        }
        try {
            const result = await axios(config);
            store.dispatch(recieveResponseAction(url));
            if (options.dataType !== BINARY) {
                handleSuccess(result.headers, result.config.headers);
            }
            return options.dataType === BINARY
                ? {
                      blob: new Blob([result.data]),
                      headers: result.headers
                  }
                : result.data;
        } catch (error) {
            store.dispatch(recieveResponseAction(url));
            errorResponseHandler(error.response);
            return Promise.reject({
                responseJSON: error.response.data
            });
        }
    }

    fetch(url, options) {
        return this.handleRequest(url, GET, options);
    }

    get(url, options) {
        return this.fetch(url, options);
    }

    post(url, data, options) {
        return this.handleRequest(url, POST, options, data);
    }

    put(url, data, options) {
        return this.handleRequest(url, PUT, options, data);
    }

    destroy(url, options) {
        return this.handleRequest(url, DELETE, options);
    }

    patch(url, options) {
        return this.handleRequest(url, PATCH, options);
    }
}

const instance = new RestAPIUtil();

export default instance;
