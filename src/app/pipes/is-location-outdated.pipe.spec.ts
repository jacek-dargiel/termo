import { IsLocationOutdatedPipe } from './is-location-outdated.pipe';

describe('IsLocationOutdatedPipe', () => {
  let pipe = new IsLocationOutdatedPipe();
  let since = new Date('2018-09-19T15:40:00');
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('should return `true` if provided date is outdated', () => {
    let targetDate = new Date('2018-09-19T15:20:00');
    let result = pipe.transform(targetDate, since);
    expect(result).toBe(true);
  });
  it('should return `false` if provided date is not outdated', () => {
    let targetDate = new Date('2018-09-19T15:35:00');
    let result = pipe.transform(targetDate, since);
    expect(result).toBe(false);
  });
});
