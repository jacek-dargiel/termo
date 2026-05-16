import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { ChartFacade } from './chart.facade';
import { SelectLocation } from '../../state/location/location.actions';
import { selectSelectedLocation, selectSelectedLocationMeasurments } from '../../state/selectors';

describe('ChartFacade', () => {
  let facade: ChartFacade;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChartFacade,
        provideMockStore(),
      ],
    });

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'select');
    facade = TestBed.inject(ChartFacade);
  });

  it('creates an instance', () => {
    expect(facade).toBeTruthy();
  });

  it('sets up selectedLocation$ from store.select using selectSelectedLocation', () => {
    expect(store.select).toHaveBeenCalledWith(selectSelectedLocation);
  });

  it('sets up selectedLocationMeasurments$ from store.select using selectSelectedLocationMeasurments', () => {
    expect(store.select).toHaveBeenCalledWith(selectSelectedLocationMeasurments);
  });

  it('closeChart dispatches SelectLocation action with undefined location', () => {
    let dispatchSpy = vi.spyOn(store, 'dispatch');
    facade.closeChart();
    expect(dispatchSpy).toHaveBeenCalledOnce();
    expect(dispatchSpy).toHaveBeenCalledWith(new SelectLocation({ location: undefined }));
  });
});
