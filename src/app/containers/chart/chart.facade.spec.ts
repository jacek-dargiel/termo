import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ChartFacade } from './chart.facade';
import { SelectLocation } from '../../state/location/location.actions';

describe('ChartFacade', () => {
  let facade: ChartFacade;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChartFacade,
        provideMockStore()
      ]
    });

    facade = TestBed.inject(ChartFacade);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  describe('closeChart', () => {
    it('should dispatch SelectLocation action with undefined location', () => {
      const spy = jest.spyOn(store, 'dispatch');

      facade.closeChart();

      expect(spy).toHaveBeenCalledWith(new SelectLocation({ location: undefined }));
    });
  });
});
