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

module.exports = {
    collectCoverageFrom: [
        'src/**/*.{js,jsx,mjs,ts}',
        '!src/i18n/i18next-scanner.config.js'
    ],
    coverageReporters: ['text-summary', 'lcov', 'json', 'json-summary'],
    coverageThreshold: {
        global: { statements: 90, branches: 85, functions: 90, lines: 90 },
        './src/services/restAPIUtil.js': {
            statements: 100,
            branches: 95,
            functions: 100,
            lines: 100
        },
        './src/features/version/inputOutput/inputOutputValidations.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100
        }
    },
    clearMocks: true,
    restoreMocks: true,
    setupTestFrameworkScriptFile: '<rootDir>/testSetup/setupTests.js',
    setupFiles: ['jest-localstorage-mock'],
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,mjs,ts}',
        '<rootDir>/src/**/?(*.)(spec|test).{js,jsx,mjs,ts}'
    ],
    testEnvironment: 'jsdom',
    testURL: 'http://localhost',
    globals: {
        DEBUG: false
    },
    // BPMN packages publish ES modules consumed by webpack and Babel in tests.
    transformIgnorePatterns: [
        'node_modules[/\\\\](?!(bpmn-js|bpmn-moddle|moddle|moddle-xml|min-dash|diagram-js|tiny-svg|didi|object-refs|min-dom|ids|css.escape)[/\\\\])'
    ],
    moduleNameMapper: {
        '\\.(css|scss|less)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg)$': '<rootDir>/__mocks__/fileMock.js',
        '^src(.*)$': '<rootDir>/src$1',
        '^config(.*)$': '<rootDir>/src/config$1',
        '^features(.*)$': '<rootDir>/src/features$1',
        '^wfapp(.*)$': '<rootDir>/src$1',
        '^common(.*)$': '<rootDir>/common$1',
        '^services(.*)$': '<rootDir>/src/services$1',
        '^shared(.*)$': '<rootDir>/src/shared$1',
        '^i18n(.*)$': '<rootDir>/src/i18n$1'
    },
    moduleFileExtensions: ['js', 'jsx', 'mjs', 'ts', 'json', 'node'],
    transform: {
        '^.+\\.ts$': '<rootDir>/testSetup/typescriptTransform.js',
        '^.+\\.(js|jsx|mjs)$': '<rootDir>/node_modules/babel-jest',
        '^(?!.*\\.(js|jsx|mjs|ts|css|json)$)':
            '<rootDir>/testSetup/fileTransform.js'
    },
    roots: ['<rootDir>/src']
};
