import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { HeaderFacade } from './header.facade';
import { ReplaySubject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

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
  let facade: MockHeaderFacade;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderComponent ],
      providers: [
        { provide: HeaderFacade, useClass: MockHeaderFacade }
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
    facade = TestBed.get(HeaderFacade);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
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
