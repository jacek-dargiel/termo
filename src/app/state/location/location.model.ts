import { Point } from '../../interfaces';

export interface Location {
  id: string;
  name: string;
  mapPosition: Point;
  updatedAt: Date;
}

export interface LocationWithKeyMeasurementValues extends Location {
  lastMeasurementValue: number | null;
  minimalMeasurementValue: number | null;
}
