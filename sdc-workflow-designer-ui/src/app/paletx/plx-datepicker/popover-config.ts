import { Injectable } from '@angular/core';

/**
 * Configuration service for the OesDaterangePopover directive.
 * You can inject this service, typically in your root component, and customize the values of its properties in
 * order to provide default values for all the popovers used in the application.
 */
@Injectable()
export class OesDaterangePopoverConfig {
    public placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
    public triggers = 'click';
    public container: string;
}
