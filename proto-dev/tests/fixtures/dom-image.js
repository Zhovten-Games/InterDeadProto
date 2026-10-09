/** A real DOM image with controlled network completion, never a non-Node shim. */
export function ImmediateImage() {
  const image = document.createElement('img');
  Object.defineProperty(image, 'src', {
    configurable: true,
    get: () => image.getAttribute('src') || '',
    set: (value) => {
      image.setAttribute('src', value);
      queueMicrotask(() => image.dispatchEvent(new window.Event('load')));
    },
  });
  return image;
}
