import { Component } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { AppComponent } from './app.component';

@Component({ selector: 'termo-map', template: '' })
class MapStub {}

@Component({ selector: 'termo-chart', template: '' })
class ChartStub {}

describe('AppComponent', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideZonelessChangeDetection()],
    });

    TestBed.overrideComponent(AppComponent, {
      set: { imports: [MapStub, ChartStub] },
    });

    const fixture = TestBed.createComponent(AppComponent);

    return { fixture };
  }

  it('creates the component', () => {
    const { fixture } = setup();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('has title set to "termo"', () => {
    const { fixture } = setup();

    expect(fixture.componentInstance.title).toBe('termo');
  });

  it('renders child component selectors', () => {
    const { fixture } = setup();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('termo-map')).toBeTruthy();
    expect(el.querySelector('termo-chart')).toBeTruthy();
  });
});
