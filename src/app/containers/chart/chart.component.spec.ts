import { Component, input, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { ChartComponent } from './chart.component';
import { ChartFacade } from './chart.facade';
import { Location } from '../../state/location/location.model';
import { Measurment } from '../../state/measurment/measurment.model';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'ng-charts-line-chart',
  template: '',
})
class LineChartStub {
  results = input<unknown>();
  xAxis = input<boolean>();
  yAxis = input<boolean>();
  roundDomains = input<boolean>();
  xAxisTickFormatting = input<(date: Date) => string>();
}

function createLocation(overrides?: Partial<Location>): Location {
  return {
    id: 'loc-1',
    name: 'Living Room',
    mapPosition: { x: 100, y: 200 },
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMeasurments(overrides: Measurment[] = []): Measurment[] {
  return [
    {
      id: 'm1',
      value: 22.5,
      created_at: new Date('2024-01-01T10:00:00Z'),
      feed_id: 1,
      feed_key: 'temp',
    },
    {
      id: 'm2',
      value: 23.1,
      created_at: new Date('2024-01-01T10:05:00Z'),
      feed_id: 1,
      feed_key: 'temp',
    },
    ...overrides,
  ];
}

describe('ChartComponent', () => {
  function setup() {
    const selectedLocation$ = new BehaviorSubject<Location | undefined>(undefined);
    const selectedLocationMeasurments$ = new BehaviorSubject<Measurment[] | undefined>(undefined);
    const closeChart = vi.fn();

    const mockFacade = {
      selectedLocation$: selectedLocation$.asObservable(),
      selectedLocationMeasurments$: selectedLocationMeasurments$.asObservable(),
      closeChart,
    };

    TestBed.configureTestingModule({
      imports: [ChartComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ChartFacade, useValue: mockFacade },
      ],
    });

    TestBed.overrideComponent(ChartComponent, {
      set: { imports: [LineChartStub] },
    });

    const fixture = TestBed.createComponent(ChartComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      selectedLocation$,
      selectedLocationMeasurments$,
      closeChart,
    };
  }

  it('creates the component', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('updates location and sets visible to true when selectedLocation$ emits a location', () => {
    const { fixture, component, selectedLocation$ } = setup();
    const location = createLocation();

    selectedLocation$.next(location);
    fixture.detectChanges();

    expect(component.location).toEqual(location);
    expect(component.visible).toBe(true);
    expect(fixture.nativeElement.classList).toContain('chart--visible');
  });

  it('sets visible to false when selectedLocation$ emits undefined', () => {
    const { fixture, component, selectedLocation$ } = setup();

    selectedLocation$.next(undefined);
    fixture.detectChanges();

    expect(component.visible).toBe(false);
    expect(fixture.nativeElement.classList).not.toContain('chart--visible');
  });

  it('maps measurements to chart data when selectedLocationMeasurments$ emits', () => {
    const { fixture, component, selectedLocation$, selectedLocationMeasurments$ } = setup();
    const location = createLocation({ name: 'Living Room' });
    const measurments = createMeasurments();

    selectedLocation$.next(location);
    selectedLocationMeasurments$.next(measurments);
    fixture.detectChanges();

    expect(component.chartData).toEqual([
      {
        name: 'Living Room',
        series: measurments.map(m => ({ name: m.created_at, value: m.value })),
      },
    ]);
  });

  it('filters out undefined measurement emissions', () => {
    const { fixture, component, selectedLocation$, selectedLocationMeasurments$ } = setup();
    const measurments = createMeasurments();

    selectedLocation$.next(createLocation());
    selectedLocationMeasurments$.next(measurments);
    fixture.detectChanges();

    const chartDataAfterEmit = component.chartData;

    selectedLocationMeasurments$.next(undefined);
    fixture.detectChanges();

    expect(component.chartData).toBe(chartDataAfterEmit);
  });

  it('close() calls chartFacade.closeChart()', () => {
    const { component, closeChart } = setup();

    component.close();

    expect(closeChart).toHaveBeenCalledOnce();
  });

  describe('mapMeasurmentToChartDataPoint', () => {
    it('returns chart data with location name and measurement series', () => {
      const { component } = setup();
      component.location = createLocation({ name: 'Kitchen' });

      const measurments = createMeasurments();
      const result = component.mapMeasurmentToChartDataPoint(measurments);

      expect(result).toEqual([
        {
          name: 'Kitchen',
          series: measurments.map(m => ({ name: m.created_at, value: m.value })),
        },
      ]);
    });

    it('handles empty measurements array', () => {
      const { component } = setup();
      component.location = createLocation({ name: 'EmptyRoom' });

      const result = component.mapMeasurmentToChartDataPoint([]);

      expect(result).toEqual([{ name: 'EmptyRoom', series: [] }]);
    });
  });

  describe('formatTime', () => {
    it('returns a HH:mm formatted string', () => {
      const { component } = setup();
      const date = new Date('2024-01-01T14:30:00Z');

      const result = component.formatTime(date);

      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('ngOnDestroy', () => {
    it('unsubscribes from observables so component state is not updated after destroy', () => {
      const { component, fixture, selectedLocation$, selectedLocationMeasurments$ } = setup();
      const location = createLocation({ name: 'Before destroy' });
      const measurments = createMeasurments();

      selectedLocation$.next(location);
      selectedLocationMeasurments$.next(measurments);

      expect(component.location).toEqual(location);

      fixture.destroy();

      selectedLocation$.next(createLocation({ name: 'After destroy' }));
      selectedLocationMeasurments$.next([]);

      expect(component.location).toEqual(location);
    });
  });
});
