import { ToFixedPipe } from './to-fixed.pipe';

describe('ToFixedPipe', () => {
  let locale = 'en-GB';
  it('create an instance', () => {
    let pipe = new ToFixedPipe();
    expect(pipe).toBeTruthy();
  });
  it('should convert a fraction to a fixed string', () => {
    let pipe = new ToFixedPipe();
    let result = pipe.transform(Math.PI, 2, locale);
    expect(result).toEqual('3.14');
  });
  it('should pad round numbers to fixed number of decimals', () => {
    let pipe = new ToFixedPipe();
    let result = pipe.transform(3, 2, locale);
    expect(result).toEqual('3.00');
  });
  it('can use any precision', () => {
    let pipe = new ToFixedPipe();
    let result = pipe.transform(Math.PI, 5, locale);
    expect(result).toEqual('3.14159');
  });
  it('should use 2 if `precision` argument is not supplied', () => {
    let pipe = new ToFixedPipe();
    let result = pipe.transform(Math.PI, undefined, locale);
    expect(result).toEqual('3.14');
  });
});
