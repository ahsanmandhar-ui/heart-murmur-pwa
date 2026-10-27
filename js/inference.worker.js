import * as ort from 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js';
import { createBestSession } from './ort_backend_picker.js';

let session = null;

self.onmessage = async (e) => {
  const { type, input } = e.data;
  if (type === 'load') {
    try {
      const res = await fetch('models/Eheart_sound_by_Ahsan_Mandhar.onnx');
      const buf = await res.arrayBuffer();
      const { session: s, ep } = await createBestSession(buf, {
        key: 'ast-heart-murmur', inputName: 'input', dims: [1, 1, 80, 1001],
      });
      session = s;
      // warm-up
      const dummy = new ort.Tensor('float32', new Float32Array(1 * 1 * 80 * 1001), [1, 1, 80, 1001]);
      await session.run({ input: dummy });
      self.postMessage({ type: 'loaded', ep });
    } catch (err) {
      self.postMessage({ type: 'error', error: String(err) });
    }
  } else if (type === 'run' && session && input) {
    try {
      const x = new Float32Array(input.data);
      const tensor = new ort.Tensor('float32', x, input.dims);
      const out = await session.run({ input: tensor });
      const data = out.output.data;
      const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
      self.postMessage({ type: 'result', data: buf, dims: out.output.dims }, [buf]);
    } catch (err) {
      self.postMessage({ type: 'error', error: String(err) });
    }
  }
};
