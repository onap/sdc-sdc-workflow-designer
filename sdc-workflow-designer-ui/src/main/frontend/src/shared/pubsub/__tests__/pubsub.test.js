/* Copyright © 2026 Deutsche Telekom AG. Licensed under the Apache License, Version 2.0. */
import { BasePubSub } from '../base-pubsub';
import { PluginPubSub } from '../plugin-pubsub';

let clients;
const message = (originId, type, data) =>
    window.dispatchEvent(
        new MessageEvent('message', { data: { originId, type, data } })
    );
const client = () => {
    const value = new BasePubSub('workflow-plugin');
    clients.push(value);
    return value;
};
beforeEach(() => {
    clients = [];
});
afterEach(() =>
    clients.forEach(value =>
        window.removeEventListener('message', value.onMessage)
    ));

it('sends events to registered windows and stops after unregistering', () => {
    const bus = client();
    const target = {
        postMessage: jest.fn(),
        location: { href: 'https://host.example' }
    };
    bus.register('hub', target);
    bus.notify('READY', { version: 'v1' });
    expect(target.postMessage).toHaveBeenCalledWith(
        { type: 'READY', data: { version: 'v1' }, originId: 'workflow-plugin' },
        'https://host.example'
    );
    expect(bus.lastEventNotified).toBe('READY');
    bus.unregister('hub');
    bus.notify('CLOSE');
    expect(target.postMessage).toHaveBeenCalledTimes(1);
});

it('delivers messages only from registered subscriber IDs and removes callbacks', () => {
    const bus = client();
    bus.register('hub', { postMessage() {} }, 'https://host.example');
    const received = [];
    const callback = event => received.push(event.type);
    bus.on(callback);
    bus.on(callback);
    message('unknown', 'IGNORED');
    message('hub', 'OPEN');
    bus.off(callback);
    message('hub', 'CLOSE');
    expect(received).toEqual(['OPEN']);
});

it('does not unsubscribe a different callback when removing an unknown callback', () => {
    const bus = client();
    bus.register('hub', { postMessage() {} }, 'https://host.example');
    const callback = jest.fn();
    bus.on(callback);
    bus.off(() => {});
    message('hub', 'OPEN');
    expect(callback).toHaveBeenCalledTimes(1);
});

it('completes notifications immediately when there are no waiting subscribers', () => {
    const bus = client();
    const complete = jest.fn();
    bus.notify('READY').subscribe(complete);
    bus.register('hub', { postMessage() {} }, 'https://host.example');
    bus.notify('CLOSE').subscribe(complete);
    expect(complete).toHaveBeenCalledTimes(2);
    expect(bus.isWaitingForEvent('CLOSE')).toBe(false);
});

it('waits for the matching subscriber acknowledgement and ignores unrelated events', () => {
    const bus = client();
    bus.register('hub', { postMessage() {} }, 'https://host.example');
    bus.register('other', { postMessage() {} }, 'https://other.example');
    bus.eventsToWait.set('hub', ['SAVE']);
    expect(bus.isWaitingForEvent('SAVE')).toBe(true);
    const complete = jest.fn();
    bus.notify('SAVE').subscribe(complete);
    message('other', 'ACTION_COMPLETED');
    expect(complete).not.toHaveBeenCalled();
    message('hub', 'PROGRESS');
    message('hub', 'ACTION_COMPLETED');
    expect(complete).toHaveBeenCalledTimes(1);
    message('hub', 'ACTION_COMPLETED');
    expect(complete).toHaveBeenCalledTimes(1);
});

it('registers and unregisters the plugin with its parent', () => {
    const post = jest
        .spyOn(window.parent, 'postMessage')
        .mockImplementation(() => {});
    const bus = new PluginPubSub('workflow-plugin', 'https://host.example', [
        'SAVE'
    ]);
    clients.push(bus);
    expect(post).toHaveBeenLastCalledWith(
        {
            originId: 'workflow-plugin',
            type: 'PLUGIN_REGISTER',
            data: { pluginId: 'workflow-plugin', eventsToWait: ['SAVE'] }
        },
        'https://host.example'
    );
    bus.subscribe();
    expect(post.mock.calls[1][0].data.eventsToWait).toEqual([]);
    bus.unsubscribe();
    expect(post).toHaveBeenLastCalledWith(
        {
            originId: 'workflow-plugin',
            type: 'PLUGIN_UNREGISTER',
            data: { pluginId: 'workflow-plugin' }
        },
        'https://host.example'
    );
});

it('requires acknowledgement from every waiting subscriber', () => {
    const bus = client();
    ['one', 'two'].forEach(id => {
        bus.register(id, { postMessage() {} }, `https://${id}.example`);
        bus.eventsToWait.set(id, ['SAVE']);
    });
    const complete = jest.fn();
    bus.notify('SAVE').subscribe(complete);
    message('one', 'ACTION_COMPLETED');
    expect(complete).not.toHaveBeenCalled();
    message('two', 'ACTION_COMPLETED');
    expect(complete).toHaveBeenCalledTimes(1);
});
