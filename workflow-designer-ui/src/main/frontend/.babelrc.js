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
            'Using `babel-preset-react-app` requires that you specify `NODE_ENV` or ' +
                '`BABEL_ENV` environment variables. Valid values are "development", ' +
                '"test", and "production". Instead, received: ' +
                JSON.stringify(env) +
                '.'
        );
    }

    api.cache.invalidate(() => isEnvProduction);

    return {
        presets: [
            isEnvTest && [
                // ES features necessary for user's Node version
                require('@babel/preset-env').default,
                {
                    targets: {
                        node: '6.12'
                    }
                }
            ],
            (isEnvProduction || isEnvDevelopment) && [
                // Latest stable ECMAScript features
                require('@babel/preset-env').default,
                {
                    // Do not transform modules to CJS
                    modules: false
                }
            ],
            [
                require('@babel/preset-react').default,
                {
                    // Adds component stack to warning messages
                    // Adds __self attribute to JSX which React will use for some warnings
                    development: isEnvDevelopment || isEnvTest
                }
            ]
        ].filter(Boolean),
        plugins: [
            // Experimental macros support. Will be documented after it's had some time
            // in the wild.
            require('babel-plugin-macros'),
            // Necessary to include regardless of the environment because
            // in practice some other transforms (such as object-rest-spread)
            // don't work without it: https://github.com/babel/babel/issues/7215
            require('@babel/plugin-transform-destructuring').default,
            // class { handleClick = () => { } }
            // Enable loose mode to use assignment instead of defineProperty
            // See discussion in https://github.com/facebook/create-react-app/issues/4263
            [
                require('@babel/plugin-proposal-class-properties').default,
                {
                    loose: true
                }
            ],
            // The following two plugins use Object.assign directly, instead of Babel's
            // extends helper. Note that this assumes `Object.assign` is available.
            // { ...todo, completed: true }
            [require('@babel/plugin-proposal-object-rest-spread').default],
            // Polyfills the runtime needed for async/await and generators
            [
                require('@babel/plugin-transform-runtime').default,
                {
                    helpers: false
                }
            ],
            isEnvProduction && [
                // Remove PropTypes from production build
                require('babel-plugin-transform-react-remove-prop-types')
                    .default,
                {
                    removeImport: true
                }
            ],
            // function* () { yield 42; yield 43; }
            !isEnvTest && [
                require('@babel/plugin-transform-regenerator').default,
                {
                    // Async functions are converted to generators by @babel/preset-env
                    async: false
                }
            ],
            // Adds syntax support for import()
            require('@babel/plugin-syntax-dynamic-import').default,
            isEnvTest &&
                // Transform dynamic import to require
                require('babel-plugin-transform-dynamic-import').default
        ].filter(Boolean)
    };
};
