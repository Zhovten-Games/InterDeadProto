// Node's built-in navigator is not the browser navigator supplied by fixtures.
Object.defineProperty(globalThis, 'navigator', {
  value: undefined,
  configurable: true,
  writable: true,
});
