import { createBestSession } from './ort_backend_picker.js';
import { getModel } from './model_cache.js';

export async function loadModel(onProgress) {
  const bytes = await getModel(onProgress);
  const { session, ep, ms } = await createBestSession(bytes.buffer, {
    key: 'ast-heart-murmur',
    inputName: 'input',
    dims: [1, 1, 80, 1001],
  });
  console.log('loaded model with', ep, ms ? `${ms.toFixed(1)} ms/run` : '');
  if (typeof navigator !== 'undefined') navigator.storage?.persist?.();
  return session;
}
