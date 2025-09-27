import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SnackbarComponent } from './snackbar.component';
import { Subject } from 'rxjs';
import { SnackbarData, SnackbarService } from '../../services/snackbar.service';

class MockSnapshotService {
  messages = new Subject<SnackbarData>();
}

describe('SnackbarComponent', () => {
  let component: SnackbarComponent;
  let fixture: ComponentFixture<SnackbarComponent>;
  let service: MockSnapshotService;

  beforeEach(waitForAsync(() => {
    service = new MockSnapshotService();
    TestBed.configureTestingModule({
      imports: [ SnackbarComponent ],
      providers: [
        { provide: SnackbarService, useValue: service }
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the snackbar component', () => {
    expect(fixture).toMatchSnapshot();
  });

  it('should render a snackbar when message recived', () => {
    let message: SnackbarData = {
      message: 'Something is wrong',
      timeout: 3000,
    };
    service.messages.next(message);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
