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

function ModuleRedirectPlugin (options) {
    options = options || {};
    this.intercept = options.intercept;
    this.redirect = options.redirect;
    this.ignore = options.ignore;
}

ModuleRedirectPlugin.prototype.apply = function (resolver) {
    resolver.plugin('described-resolve', (request, callback) => {
        if (!request.request.match(this.intercept) ||
            request.request.match(this.ignore)
        ) {
            return callback();
        }
        var newRequest = {
            ...request,
            request: request.request.replace(this.intercept, this.redirect)
        };
        resolver.doResolve(
            'resolve',
            newRequest,
            `Resolved request '${request.request}' to '${newRequest.request}'.`,
            callback
        );
    });
}

module.exports = ModuleRedirectPlugin;
