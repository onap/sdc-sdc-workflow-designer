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
'use strict';

const proxy = require('http-proxy-middleware');
const devConfig = require('./getDevConfig');

module.exports = function(server) {
    let proxyConfigDefaults = {
        changeOrigin: true,
        secure: false,
        onProxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader(
                'USER_ID',
                devConfig.proxyConfig.cookies.USER_ID
            );
        }
    };

    let middlewares = [];

    middlewares.push(
        proxy(
            ['/wf', '/v1.0/activity-spec'],
            Object.assign({}, proxyConfigDefaults, {
                target: devConfig.proxyTarget
            })
        )
    );
    server.use(middlewares);
};
