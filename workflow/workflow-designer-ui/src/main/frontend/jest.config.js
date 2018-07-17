module.exports = {
    collectCoverageFrom: ['src/**/*.{js,jsx,mjs}'],
    setupFiles: ['jest-localstorage-mock'],
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,mjs}',
        '<rootDir>/src/**/?(*.)(spec|test).{js,jsx,mjs}'
    ],
    testEnvironment: 'node',
    testURL: 'http://localhost',
    globals: {
        DEBUG: false
    },
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$'],
    moduleNameMapper: {
        '\\.(css|scss)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg)$': '<rootDir>/__mocks__/fileMock.js',
        '^src(.*)$': '<rootDir>/src$1',
        '^config(.*)$': '<rootDir>/src/config$1',
        '^features(.*)$': '<rootDir>/src/features$1',
        '^common(.*)$': '<rootDir>/common$1',
        '^services(.*)$': '<rootDir>/src/services$1',
        '^shared(.*)$': '<rootDir>/src/shared$1',
        '^i18n(.*)$': '<rootDir>/src/i18n$1'
    },
    transform: {
        '^.+\\.(js|jsx|mjs)$': '<rootDir>/node_modules/babel-jest',
        '^(?!.*\\.(js|jsx|mjs|css|json)$)':
            '<rootDir>/testSetup/fileTransform.js'
    },
    roots: ['<rootDir>/src/features', '<rootDir>/src/shared']
};
