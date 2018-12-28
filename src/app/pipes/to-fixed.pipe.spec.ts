import { ToFixedPipe } from './to-fixed.pipe';

describe('ToFixedPipe', () => {
  let locale = 'en-GB';
  let pipe = new ToFixedPipe();
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('should transform to "–" when value is null', () => {
    let result = pipe.transform(null, 2, locale);
    expect(result).toEqual('–');
  });
  it('should convert a fraction to a fixed string', () => {
    let result = pipe.transform(Math.PI, 2, locale);
    expect(result).toEqual('3.14');
  });
  it('should allow negative numbers', () => {
    let result = pipe.transform(-1 * Math.PI, 2, locale);
    expect(result).toEqual('-3.14');
  });
  it('should pad round numbers to fixed number of decimals', () => {
    let result = pipe.transform(3, 2, locale);
    expect(result).toEqual('3.00');
  });
  it('can use any precision', () => {
    let result = pipe.transform(Math.PI, 5, locale);
    expect(result).toEqual('3.14159');
  });
  it('should use 2 if `precision` argument is not supplied', () => {
    let result = pipe.transform(Math.PI, undefined, locale);
    expect(result).toEqual('3.14');
  });
});
