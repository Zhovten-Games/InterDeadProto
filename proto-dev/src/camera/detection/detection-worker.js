/* TensorFlow and COCO-SSD execute only in this classic worker. */
const PROTOCOL = 1;
let model = null;
let initializing = null;
let busy = false;
const send = (message) => self.postMessage({ protocol: PROTOCOL, ...message });

async function initialize(options, id) {
  send({ type: 'state', id, state: 'LOADING_RUNTIME' });
  importScripts(options.tfUrl, options.cocoUrl);
  // COCO-SSD receives a Tensor3D: no HTML image/video, document or window shim.
  await self.tf.setBackend('cpu');
  await self.tf.ready();
  if (self.tf.getBackend() !== 'cpu') throw new Error('Required CPU worker backend unavailable');
  const originalFetch = self.fetch.bind(self);
  self.fetch = (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input.url, self.location.href);
    if (url.pathname.includes('/models/coco-ssd/') && options.buildId)
      url.searchParams.set('cache_build', options.buildId);
    return originalFetch(typeof input === 'string' ? url.href : new Request(url.href, input), init);
  };
  send({ type: 'state', id, state: 'LOADING_MODEL' });
  try {
    model = await self.cocoSsd.load({ modelUrl: options.modelUrl });
  } catch (error) {
    if (!options.fallbackUrl) throw error;
    model = await self.cocoSsd.load({ modelUrl: options.fallbackUrl });
  }
  send({ type: 'state', id, state: 'WARMUP' });
  const tensor = self.tf.zeros([2, 2, 3], 'int32');
  try {
    await model.detect(tensor);
  } finally {
    tensor.dispose();
  }
  send({ type: 'state', id, state: 'READY' });
  return { backend: self.tf.getBackend(), protocol: PROTOCOL };
}

async function detect(frame) {
  let bitmap = null;
  let tensor = null;
  try {
    if (frame?.data && frame.width && frame.height) {
      tensor = self.tf.tensor3d(frame.data, [frame.height, frame.width, 3], 'int32');
    } else {
      bitmap = await createImageBitmap(frame);
      if (typeof OffscreenCanvas !== 'function')
        throw new Error('OffscreenCanvas unavailable in detection worker');
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Detection canvas unavailable');
      context.drawImage(bitmap, 0, 0);
      const rgba = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
      const rgb = new Int32Array(bitmap.width * bitmap.height * 3);
      for (let i = 0, j = 0; i < rgba.length; i += 4) {
        rgb[j++] = rgba[i];
        rgb[j++] = rgba[i + 1];
        rgb[j++] = rgba[i + 2];
      }
      tensor = self.tf.tensor3d(rgb, [bitmap.height, bitmap.width, 3], 'int32');
    }
    return await model.detect(tensor);
  } finally {
    tensor?.dispose();
    bitmap?.close();
  }
}

self.onmessage = async ({ data }) => {
  if (data?.protocol !== PROTOCOL) return;
  const { id, type } = data;
  if (type === 'cancel') {
    // The public port rejects immediately and owns stale-response suppression.
    // Synchronous CPU work finishes in its occupied bounded slot; no unbounded
    // cancellation tombstones survive a cancel arriving after completion.
    return;
  }
  try {
    if (type === 'initialize') {
      initializing ||= initialize(data.options, id);
      send({ id, result: await initializing });
    } else if (type === 'detect') {
      if (busy) throw new Error('Worker frame queue is bounded to one');
      busy = true;
      try {
        await initializing;
        if (!model) throw new Error('Worker model unavailable');
        const predictions = await detect(data.frame);
        send({ id, result: { predictions, context: data.context } });
      } finally {
        busy = false;
      }
    }
  } catch (error) {
    send({ id, error: String(error.message || error) });
  }
};
