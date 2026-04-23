import { IsLocationOutdatedPipe } from './is-location-outdated.pipe';
import { TestBed } from '@angular/core/testing';
import { TERMO_CURRENT_TIME_FACTORY } from './current-time.injection-token';

describe('IsLocationOutdatedPipe', () => {
  let since = new Date('2018-09-19T15:40:00');
  let pipe: IsLocationOutdatedPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IsLocationOutdatedPipe,
        { provide: TERMO_CURRENT_TIME_FACTORY, useValue: () => since }
      ]
    });
    pipe = TestBed.inject(IsLocationOutdatedPipe);
  });
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('should return `true` if provided date is outdated', () => {
    let targetDate = new Date('2018-09-19T15:20:00');
    let result = pipe.transform(targetDate);
    expect(result).toBe(true);
  });
  it('should return `false` if provided date is not outdated', () => {
    let targetDate = new Date('2018-09-19T15:35:00');
    let result = pipe.transform(targetDate);
    expect(result).toBe(false);
  });
});
