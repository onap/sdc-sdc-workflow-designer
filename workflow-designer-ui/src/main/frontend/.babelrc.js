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

module.exports = function(api, opts) {
    if (!opts) {
        opts = {};
    }

    var env = process.env.BABEL_ENV || process.env.NODE_ENV;
    var isEnvDevelopment = env === 'development';
    var isEnvProduction = env === 'production';
    var isEnvTest = env === 'test';

    if (!isEnvDevelopment && !isEnvProduction && !isEnvTest) {
        throw new Error(
            '`NODE_ENV` or `BABEL_ENV` environment variables required.'
        );
    }

    api.cache.invalidate(() => isEnvProduction);

    return {
        presets: [
            isEnvTest && [
                require('@babel/preset-env').default,
                {
                    targets: {
                        node: '8.11'
                    }
                }
            ],
            (isEnvProduction || isEnvDevelopment) && [
                require('@babel/preset-env').default,
                {
                    modules: false,
                    targets: {
                        browsers: ['last 2 versions', 'Firefox >= 52']
                    }
                }
            ],
            [
                require('@babel/preset-react').default,
                {
                    development: isEnvDevelopment || isEnvTest
                }
            ]
        ].filter(Boolean),
        plugins: [
            require('babel-plugin-macros'),
            require('@babel/plugin-transform-destructuring').default,
            [
                require('@babel/plugin-proposal-class-properties').default,
                {
                    loose: true
                }
            ],
            [require('@babel/plugin-proposal-object-rest-spread').default],
            [
                require('@babel/plugin-transform-runtime').default,
                {
                    helpers: false
                }
            ],
            isEnvProduction && [
                require('babel-plugin-transform-react-remove-prop-types')
                    .default,
                {
                    removeImport: true
                }
            ],
            !isEnvTest && [
                require('@babel/plugin-transform-regenerator').default,
                {
                    async: false
                }
            ],
            require('@babel/plugin-syntax-dynamic-import').default,
            isEnvTest &&
                require('babel-plugin-transform-dynamic-import').default
        ].filter(Boolean)
    };
};
