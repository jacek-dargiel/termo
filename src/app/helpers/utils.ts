import {
  flow,
  fromPairs,
  map,
} from './lodash';

import { Dictionary } from '@ngrx/entity/src/models';

export function mapToObject<T>(iteratee: ((v: any) => T), arr: Array<any>): Dictionary<T> {
  return flow(
    list => map(key => ([key.toString(), iteratee(key)]), list),
    fromPairs,
  )(arr);
}
