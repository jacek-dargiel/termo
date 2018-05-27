import { Point } from '../../interfaces';

export interface Location {
  id: number;
  name: string;
  mapPosition: Point;
  feedKey: string;
  updatedAt: Date;
}
