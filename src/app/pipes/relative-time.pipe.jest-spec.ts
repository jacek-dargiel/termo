import { TestBed } from '@angular/core/testing';
import { RelativeTimePipe } from './relative-time.pipe';
import { TERMO_CURRENT_TIME_FACTORY } from './current-time.injection-token';

describe('RelativeTimePipe', () => {
  let since = new Date('2018-09-19T15:25:00');
  let pipe: RelativeTimePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RelativeTimePipe,
        { provide: TERMO_CURRENT_TIME_FACTORY, useValue: () => since }
      ]
    });
    pipe = TestBed.inject(RelativeTimePipe);
  });
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('should display days if relative time is >= 48h', () => {
    let targetTime = new Date('2018-09-15T12:00:00');
    let result = pipe.transform(targetTime);
    expect(result).toBe('4 dni');
  });
  it('should display hours if relative time is >= 120 minutes', () => {
    let targetTime = new Date('2018-09-19T12:00:00');
    let result = pipe.transform(targetTime);
    expect(result).toBe('3 godz.');
  });
  it('should display minutes if relative time is < 120 minutes', () => {
    let targetTime = new Date('2018-09-19T15:00:00');
    let result = pipe.transform(targetTime);
    expect(result).toBe('25 min.');
  });
});
