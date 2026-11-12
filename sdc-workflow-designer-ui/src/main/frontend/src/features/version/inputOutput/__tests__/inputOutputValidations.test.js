/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import { getValidationsError } from '../inputOutputValidations';

[
    [
        'no parameters',
        [],
        { alreadyExists: [], emptyName: [], invalidCharacters: [] }
    ],
    [
        'valid identifiers',
        ['vm_name', 'VM2', '_', '123'],
        { alreadyExists: [], emptyName: [], invalidCharacters: [] }
    ],
    [
        'case insensitive duplicates',
        ['Name', 'unique', 'name', 'NAME'],
        { alreadyExists: [0, 2, 3], emptyName: [], invalidCharacters: [] }
    ],
    [
        'empty names',
        ['', 'valid', ''],
        { alreadyExists: [], emptyName: [0, 2], invalidCharacters: [] }
    ],
    [
        'invalid punctuation and whitespace',
        ['two words', 'dash-name', 'dot.name', ' ', 'café'],
        { alreadyExists: [], emptyName: [], invalidCharacters: [0, 1, 2, 3, 4] }
    ]
].forEach(([description, names, expected]) => {
    it(`validates ${description} without changing rows`, () => {
        const rows = names.map(name => Object.freeze({ name }));
        expect(getValidationsError(Object.freeze(rows))).toEqual(expected);
    });
});

it('validates identifiers that overlap object prototype property names', () => {
    expect(
        getValidationsError([
            { name: 'hasOwnProperty' },
            { name: 'hasOwnProperty' },
            { name: '__proto__' },
            { name: '__proto__' },
            { name: 'constructor' },
            { name: 'constructor' }
        ])
    ).toEqual({
        alreadyExists: [0, 1, 2, 3, 4, 5],
        emptyName: [],
        invalidCharacters: []
    });
});
