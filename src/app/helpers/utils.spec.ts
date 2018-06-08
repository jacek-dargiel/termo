import { mapToObject } from './utils';

describe('mapToObject', () => {
  it('Should map provided array using the iteratee', () => {
    let arr = ['abc', 'xyz', '123'];
    let iteratee = (key: string) => key.split('');
    let mapped = mapToObject(iteratee, arr);
    let expected = {
      abc: ['a', 'b', 'c'],
      xyz: ['x', 'y', 'z'],
      123: ['1', '2', '3'],
    };
    expect(mapped).toEqual(expected);
  });
});
