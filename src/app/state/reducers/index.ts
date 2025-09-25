import {
  // ActionReducer,
  ActionReducerMap,
  MetaReducer
} from '@ngrx/store';
import { environment } from 'environments/environment';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface State {

}

export const reducers: ActionReducerMap<State> = {

};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
