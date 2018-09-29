import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { HeaderFacade } from './header.facade';
import { Observable, of, ReplaySubject } from 'rxjs';
import { By } from '@angular/platform-browser';

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderComponent ],
      providers: [
        { provide: HeaderFacade, useClass: MockHeaderFacade }
      ]
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

  it('should render header at initial state', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should render header at 50%', () => {
    facade.progress.next(0.5);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render header at refreshing state', () => {
    facade.progress.next(1);
    facade.refreshing.next(true);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should refresh when "Refresh" button clicked', () => {
    let button = fixture.debugElement.query(By.css('button.refresh'));
    button.nativeElement.click();
    fixture.detectChanges();
    expect(facade.refresh).toHaveBeenCalled();
  });

});
