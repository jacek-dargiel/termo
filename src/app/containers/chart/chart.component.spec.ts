import { Component, input, provideZonelessChangeDetection, signal, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { ChartComponent } from './chart.component';
import { LocationFacade } from '../../services/location.facade';
import { Location, Measurement } from '../../interfaces';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'ng-charts-line-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

function createMeasurements(overrides: Measurement[] = []): Measurement[] {
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
    const selectedLocation = signal<Location | null>(null);
    const selectedLocationMeasurements = signal<Measurement[]>([]);
    const closeChart = vi.fn();

    const mockFacade = {
      selectedLocation: selectedLocation,
      selectedLocationMeasurements: selectedLocationMeasurements,
      closeChart,
    };

    TestBed.configureTestingModule({
      imports: [ChartComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: LocationFacade, useValue: mockFacade },
      ],
    });

    TestBed.overrideComponent(ChartComponent, {
      set: { imports: [LineChartStub] },
    });

    const fixture = TestBed.createComponent(ChartComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    return { fixture, component, selectedLocation, selectedLocationMeasurements, closeChart };
  }

  it('creates the component', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('shows chart when location is selected', () => {
    const { fixture, selectedLocation } = setup();
    const location = createLocation();

    selectedLocation.set(location);
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('chart--visible');
  });

  it('hides chart when location is deselected', () => {
    const { fixture, selectedLocation } = setup();

    selectedLocation.set(createLocation());
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain('chart--visible');

    selectedLocation.set(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).not.toContain('chart--visible');
  });

  it('computes chartData from selectedLocation and selectedLocationMeasurements', () => {
    const { component, selectedLocation, selectedLocationMeasurements, fixture } = setup();
    const location = createLocation({ name: 'Living Room' });
    const measurements = createMeasurements();

    selectedLocation.set(location);
    selectedLocationMeasurements.set(measurements);
    fixture.detectChanges();

    const data = component.chartData();
    expect(data).toEqual([{
      name: 'Living Room',
      series: measurements.map(m => ({ name: m.created_at, value: m.value })),
    }]);
  });

  it('chartData is undefined when no location selected', () => {
    const { component, selectedLocationMeasurements, fixture } = setup();

    selectedLocationMeasurements.set(createMeasurements());
    fixture.detectChanges();

    expect(component.chartData()).toBeUndefined();
  });

  it('close() calls locationFacade.closeChart()', () => {
    const { component, closeChart } = setup();
    component.close();
    expect(closeChart).toHaveBeenCalledOnce();
  });

  describe('mapMeasurementToChartDataPoint', () => {
    it('returns chart data with location name and measurement series', () => {
      const { component } = setup();
      const location = createLocation({ name: 'Kitchen' });
      const measurements = createMeasurements();
      const result = component.mapMeasurementToChartDataPoint(location, measurements);
      expect(result).toEqual([{
        name: 'Kitchen',
        series: measurements.map(m => ({ name: m.created_at, value: m.value })),
      }]);
    });

    it('handles empty measurements array', () => {
      const { component } = setup();
      const location = createLocation({ name: 'EmptyRoom' });
      const result = component.mapMeasurementToChartDataPoint(location, []);
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
});
