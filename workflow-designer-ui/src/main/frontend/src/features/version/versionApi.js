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

import RestfulAPIUtil from 'services/restAPIUtil';
import Configuration from 'config/Configuration.js';
import { CERTIFY_JSON } from 'features/version/versionController/versionControllerConstants';

function baseUrl(workflowId) {
    const restPrefix = Configuration.get('restPrefix');
    return `${restPrefix}/workflows/${workflowId}/versions`;
}

const Api = {
    fetchVersion: ({ workflowId, versionId }) => {
        return RestfulAPIUtil.fetch(`${baseUrl(workflowId)}/${versionId}`);
    },
    createNewVersion: ({ workflowId, baseId, description }) => {
        return baseId
            ? RestfulAPIUtil.post(
                  `${baseUrl(workflowId)}?baseVersionId=${baseId}`,
                  {
                      description
                  }
              )
            : RestfulAPIUtil.post(`${baseUrl(workflowId)}`, {
                  description
              });
    },
    updateVersion: ({ workflowId, ...payload }) => {
        return RestfulAPIUtil.put(
            `${baseUrl(workflowId)}/${payload.params.id}`,
            {
                ...payload.params
            }
        );
    },
    certifyVersion: ({ workflowId, versionId }) => {
        return RestfulAPIUtil.post(
            `${baseUrl(workflowId)}/${versionId}/state`,
            CERTIFY_JSON
        );
    }
};

export default Api;
