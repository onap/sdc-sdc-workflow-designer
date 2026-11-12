/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import Configuration from '../Configuration';

const keys = ['restPrefix', 'restCatalogPrefix', 'CatalogApiHeaders', 'UserID'];
let previous;
beforeEach(() => {
    previous = keys.map(key => Configuration.get(key));
});
afterEach(() =>
    keys.forEach((key, index) => Configuration.set(key, previous[index])));

it('returns the previous value when overriding configuration', () => {
    const previous = Configuration.get('restPrefix');
    expect(Configuration.set('restPrefix', '/custom')).toBe(previous);
    expect(Configuration.get('restPrefix')).toBe('/custom');
});

it('derives the onboarding proxy root while preserving the catalog root', () => {
    Configuration.setCatalogApiRoot('https://sdc.example/feProxy/rest/v1');
    expect(Configuration.get('restCatalogPrefix')).toBe(
        'https://sdc.example/feProxy/rest/v1'
    );
    expect(Configuration.get('restPrefix')).toBe(
        'https://sdc.example/feProxy/onboarding-api'
    );
});

it('retains a root outside the SDC proxy and supports missing user headers', () => {
    Configuration.setCatalogApiRoot('/api');
    expect(Configuration.get('restPrefix')).toBe('/api');
    Configuration.setCatalogApiHeaders({
        userId: { name: 'USER_ID', value: 'designer' }
    });
    expect(Configuration.get('UserID')).toBe('designer');
    Configuration.setCatalogApiHeaders({});
    expect(Configuration.get('UserID')).toBeUndefined();
    expect(Configuration.get('CatalogApiHeaders')).toEqual({});
});
