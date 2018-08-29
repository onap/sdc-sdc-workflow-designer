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

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { DefinePlugin } = require('webpack');
const ModuleRedirectPlugin = require('./tools/ModuleRedirectPlugin');
const devConfig = require('./tools/getDevConfig');
const apiMocker = require('webpack-api-mocker');
const proxyServer = require('./tools/proxy-server');

module.exports = (env, argv) => {
    const WITH_MOCK = env === 'mock';
    const DEV = argv.mode && argv.mode === 'development';
    console.log('WITH_MOCK', WITH_MOCK);
    let srcPath = [path.resolve(__dirname, 'src')];
    let commonPath = [path.resolve(__dirname, 'common')];
    let resourcesPath = [path.resolve(__dirname, 'resources')];
    let modulePath = [path.resolve('.'), path.join(__dirname, 'node_modules')];

    let webpackConfig = {
        performance: { hints: false },
        entry: [__dirname + '/src/index.js'],
        devtool: DEV ? 'eval-source-map' : 'none',
        resolve: {
            modules: modulePath,
            extensions: ['.js', '.json', '.css', '.scss', '.jsx', '.ts'],
            alias: {
                wfapp: path.resolve(__dirname, 'src/'),
                features: path.resolve(__dirname, 'src/features'),
                i18n: path.resolve(__dirname, 'src/i18n'),
                services: path.resolve(__dirname, 'src/services'),
                shared: path.resolve(__dirname, 'src/shared'),
                config: path.resolve(__dirname, 'src/config')
            }
        },
        output: {
            path: __dirname + '/dist',
            filename: 'bundle.js'
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    include: [srcPath, commonPath],
                    use: [
                        { loader: 'babel-loader' },
                        { loader: 'eslint-loader', options: { fix: false } }
                    ]
                },
                {
                    test: /\.(js|jsx)$/,
                    loader: 'source-map-loader',
                    include: [srcPath, commonPath],
                    enforce: 'pre'
                },
                {
                    test: /\.(css|scss)$/,
                    use: [
                        {
                            loader: 'style-loader'
                        },
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                output: { path: path.join(__dirname, 'dist') }
                            }
                        }
                    ],
                    include: [
                        resourcesPath,
                        path.join(__dirname, 'node_modules/sdc-ui'),
                        commonPath
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        {
                            loader: 'style-loader'
                        },
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'less-loader',
                            options: {
                                output: { path: path.join(__dirname, 'dist') }
                            }
                        }
                    ]
                },
                {
                    test: /\.(bpmn|xml)$/,
                    loader: 'raw-loader'
                },
                {
                    test: /\.ts|\.tsx$/,
                    loader: ['babel-loader', 'awesome-typescript-loader'],
                    include: srcPath
                },
                {
                    test: /\.(eot|svg|ttf|woff|woff2)(\?.*)?$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {}
                        }
                    ]
                }
            ]
        },
        plugins: [
            new DefinePlugin({
                DEBUG: DEV === true
            }),
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: __dirname + '/index.html'
            })
        ]
    };

    if (DEV) {
        webpackConfig.devServer = {
            before: WITH_MOCK
                ? app => apiMocker(app, path.resolve('./tools/mocks/mock.js'))
                : app => proxyServer(app),
            port: devConfig.port,
            historyApiFallback: true,
            publicPath: `http://localhost:${devConfig.port}`,
            contentBase: [path.join(__dirname, 'dist')],
            inline: true,
            hot: true,
            stats: {
                colors: true,
                exclude: ['node_modules']
            }
        };
    } else {
        webpackConfig.plugins.push(new UglifyJsPlugin());
    }
    console.log('Running build for : ' + argv.mode);
    return webpackConfig;
};
