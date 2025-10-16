import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { HeaderFacade } from './header.facade';
import { ReplaySubject } from 'rxjs';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { RefreshButtonComponent } from '../../components/refresh-button/refresh-button.component';
import { AsyncPipe } from '@angular/common';

class MockHeaderFacade {
  public progress = new ReplaySubject<number>();
  public refreshing = new ReplaySubject<boolean>();

  constructor() {
    this.progress.next(0);
    this.refreshing.next(false);
  }

  public refresh = jest.fn();
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let facade: HeaderFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HeaderComponent, RefreshButtonComponent, AsyncPipe ],
      providers: [
        { provide: HeaderFacade, useClass: MockHeaderFacade },
        provideZonelessChangeDetection()
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .overrideComponent(HeaderComponent, { remove: { imports: [RefreshButtonComponent]}})
    .compileComponents()
    facade = TestBed.inject(HeaderFacade);
  });

  beforeEach(() => {
    fixture = TestBed
      .createComponent(HeaderComponent)
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render initial state', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should refresh when "Refresh" button clicked', () => {
    component.refresh();
    expect(facade.refresh).toHaveBeenCalled();
  });

});
