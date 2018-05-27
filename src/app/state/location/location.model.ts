import { Point } from '../../interfaces';

export interface Location {
  id: string;
  name: string;
  mapPosition: Point;
  updatedAt: Date;
}
