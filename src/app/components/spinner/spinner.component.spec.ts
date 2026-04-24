import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [SpinnerComponent],
      providers: [provideZonelessChangeDetection()],
    });

    const fixture = TestBed.createComponent(SpinnerComponent);

    return { fixture };
  }

  it('creates the component', () => {
    const { fixture } = setup();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the spinner container with five rect divs', () => {
    const { fixture } = setup();

    const el = fixture.nativeElement as HTMLElement;
    const container = el.querySelector('.spinner');

    expect(container).toBeTruthy();
    expect(container!.children).toHaveLength(5);

    const expectedClasses = ['rect1', 'rect2', 'rect3', 'rect4', 'rect5'];
    for (let i = 0; i < expectedClasses.length; i++) {
      expect(container!.children[i].classList.contains(expectedClasses[i])).toBe(true);
    }
  });
});
