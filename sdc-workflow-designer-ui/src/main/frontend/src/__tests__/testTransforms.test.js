/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
const vm = require('vm');
const typescript = require('../../testSetup/typescriptTransform');
const assets = require('../../testSetup/fileTransform');

[typescript, assets].forEach((transformer, index) => {
    it(`keeps instrumented and plain transformer cache entries separate (${index})`, () => {
        const plain = transformer.getCacheKey(
            'source',
            '/example.ts',
            'config',
            { instrument: false }
        );
        const covered = transformer.getCacheKey(
            'source',
            '/example.ts',
            'config',
            { instrument: true }
        );
        expect(covered).not.toBe(plain);
    });
});

it('compiles TypeScript exports and maps them to the original source', () => {
    const source = 'export const answer: number = 42;';
    const result = typescript.process(source, '/example.ts');
    const exports = {};
    vm.runInNewContext(result.code, { exports });
    expect(exports.answer).toBe(42);
    expect(result.map.sources).toEqual(['/example.ts']);
    expect(result.map.sourcesContent).toEqual([source]);
});
