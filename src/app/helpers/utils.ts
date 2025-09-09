export function mapValuesWithKey<T, R>(
  record: Record<string, T>,
  iterator: (value: T, key: string) => R
): Record<string, R> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, iterator(value, key)])
  );
}


export function mapToObject<T>(arr: Array<any>, iterator: (v: any) => T): Record<string, T> {
  return Object.fromEntries(arr.map(key => [key.toString(), iterator(key)]));
}
