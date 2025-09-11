import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SnackbarComponent } from './snackbar.component';
import { Subject } from 'rxjs';
import { SnackbarService } from '../../services/snackbar.service';

class MockSnapshotService {
  messages = new Subject();
}

describe('SnackbarComponent', () => {
  let component: SnackbarComponent;
  let fixture: ComponentFixture<SnackbarComponent>;
  let service: MockSnapshotService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ SnackbarComponent ],
      providers: [
        { provide: SnackbarService, useClass: MockSnapshotService }
      ],
    })
      .compileComponents();

    service = TestBed.get(SnackbarService);
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
    let message = {
      message: 'Something is wrong',
    };
    service.messages.next(message);
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
