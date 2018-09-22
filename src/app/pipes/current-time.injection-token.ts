import { InjectionToken } from '@angular/core';

export type timeFactory = () => Date;

export const TERMO_CURRENT_TIME_FACTORY = new InjectionToken<timeFactory>('termo-current-time-factory');
