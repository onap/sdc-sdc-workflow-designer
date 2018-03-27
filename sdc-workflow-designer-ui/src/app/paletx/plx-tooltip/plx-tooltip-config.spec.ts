import {PlxTooltipConfig} from './plx-tooltip-config';

describe('plx-tooltip-config', () => {
    it('should have sensible default values', () => {
        const config = new PlxTooltipConfig();

        expect(config.placement).toBe('top');
        expect(config.triggers).toBe('hover');
        expect(config.container).toBeUndefined();
    });
});
