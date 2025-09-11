import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RefreshButtonComponent } from './refresh-button.component';

describe('RefreshButtonComponent', () => {
  let component: RefreshButtonComponent;
  let fixture: ComponentFixture<RefreshButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ RefreshButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefreshButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render button at initial state', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should render button at 50%', () => {
    fixture.componentRef.setInput('progress', 0.5);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should render button at refreshing state', () => {
    fixture.componentRef.setInput('progress', 1);
    fixture.componentRef.setInput('refreshing', true);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
