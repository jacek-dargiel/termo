import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { BehaviorSubject } from 'rxjs';
import { cold, schedule, Scheduler } from '@granito/vitest-marbles';

import { HeaderFacade } from './header.facade';
import { RefreshSignalService } from '../../services/refresh-signal.service';
import { selectMeasurmentsLoading } from '../../state/selectors';
import { RefreshButtonClick } from '../../state/location/location.actions';

const REFRESH_TIMEOUT = 300000;

const initialState = {
  measurment: {
    ids: [],
    entities: {},
    loading: false,
  },
};

describe('HeaderFacade', () => {
  let facade: HeaderFacade;
  let store: MockStore;
  let counterSubject: BehaviorSubject<number>;

  beforeEach(() => {
    Scheduler.init();
    counterSubject = new BehaviorSubject<number>(300);

    const mockRefreshSignal = {
      counter: counterSubject.asObservable(),
    };

    TestBed.configureTestingModule({
      providers: [
        HeaderFacade,
        provideMockStore({ initialState }),
        { provide: RefreshSignalService, useValue: mockRefreshSignal },
      ],
    });

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'select');
    facade = TestBed.inject(HeaderFacade);
  });

  it('creates an instance', () => {
    expect(facade).toBeTruthy();
  });

  it('sets up refreshing from store.select using selectMeasurmentsLoading', () => {
    expect(store.select).toHaveBeenCalledWith(selectMeasurmentsLoading);
  });

  it('refreshing emits the store loading state', () => {
    store.overrideSelector(selectMeasurmentsLoading, true);
    store.refreshState();

    const values: boolean[] = [];
    const sub = facade.refreshing.subscribe(v => values.push(v));

    expect(values).toContain(true);
    sub.unsubscribe();
  });

  it('refresh dispatches RefreshButtonClick action', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    facade.refresh();
    expect(dispatchSpy).toHaveBeenCalledWith(new RefreshButtonClick());
  });

  it('progress maps counter values to 0→1 progress', () => {
    const expected = cold('a-b-c', {
      a: 0,
      b: 1000 / REFRESH_TIMEOUT,
      c: 1,
    });

    schedule(() => counterSubject.next(299), 20);
    schedule(() => counterSubject.next(0), 40);

    expect(facade.progress).toBeObservable(expected);
  });
});
