const mockStorage = () => {
  let storage: Record<string, string> = {};

  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => {
      storage[key] = value || '';
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      storage = {};
    }
  };
};

Object.defineProperty(globalThis, 'CSS', { value: null, configurable: true });
Object.defineProperty(window, 'localStorage', { value: mockStorage(), configurable: true });
Object.defineProperty(window, 'sessionStorage', { value: mockStorage(), configurable: true });
Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
  configurable: true
});
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    display: 'none',
    appearance: ['-webkit-appearance']
  }),
  configurable: true
});
Object.defineProperty(document.body.style, 'transform', {
  value: () => ({
    enumerable: true,
    configurable: true
  })
});
