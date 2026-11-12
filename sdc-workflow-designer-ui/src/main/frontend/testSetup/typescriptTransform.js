/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
const ts = require('typescript');
const crypto = require('crypto');
const fs = require('fs');

module.exports = {
    getCacheKey(source, filename, config, options = {}) {
        return crypto
            .createHash('md5')
            .update(source)
            .update(filename)
            .update(config)
            .update(options.instrument ? 'instrument' : 'plain')
            .update(ts.version)
            .update(fs.readFileSync(__filename))
            .digest('hex');
    },
    process(source, filename) {
        const result = ts.transpileModule(source, {
            fileName: filename,
            compilerOptions: {
                module: ts.ModuleKind.CommonJS,
                target: ts.ScriptTarget.ES2015,
                sourceMap: true,
                inlineSources: true
            }
        });
        const map = JSON.parse(result.sourceMapText);
        map.sources = [filename];
        map.file = filename;
        return { code: result.outputText, map };
    }
};
