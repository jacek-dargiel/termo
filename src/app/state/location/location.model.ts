import { Point } from '../../interfaces';

export interface Location {
  id: string;
  name: string;
  mapPosition: Point;
  updatedAt: Date;
}

export interface LocationWithKeyMeasurmentValues extends Location {
  lastMeasurmentValue: number | null;
  minimalMeasurmentValue: number | null;
}
