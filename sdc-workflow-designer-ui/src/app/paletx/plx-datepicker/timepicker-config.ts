import { Injectable } from '@angular/core';

/**
 * Configuration service for the NgbTimepicker component.
 * You can inject this service, typically in your root component, and customize the values of its properties in
 * order to provide default values for all the timepickers used in the application.
 */
@Injectable()
export class NgbTimepickerConfig {
  public meridian = false;
  public spinners = true;
  public seconds = false;
  public hourStep = 1;
  public minuteStep = 1;
  public secondStep = 1;
  public disabled = false;
  public readonlyInputs = false;
  public size: 'small' | 'medium' | 'large' = 'medium';
}
