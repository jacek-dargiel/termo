import flow from 'lodash/fp/flow';
import fromPairs from 'lodash/fp/fromPairs';
import map from 'lodash/fp/map';
import { Dictionary } from '@ngrx/entity/src/models';

export function mapToObject<T>(iteratee: ((v: any) => T), arr: Array<any>): Dictionary<T> {
  return flow(
    list => map(key => ([key.toString(), iteratee(key)]), list),
    fromPairs,
  )(arr);
}
