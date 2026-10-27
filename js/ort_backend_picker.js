// Picks fastest working ORT Web EP for this model/device; caches choice in localStorage.
// Fallback chain: webnn -> webgpu -> wasm (threads+SIMD when cross-origin isolated) -> wasm single thread.
import * as ort from 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.mjs';

const CHAIN = ['webnn', 'webgpu', 'wasm'];

async function timeOnce(session, inputName, dims, runs = 5) {
  const x = new ort.Tensor('float32', new Float32Array(dims.reduce((a, b) => a * b, 1)), dims);
  await session.run({ [inputName]: x }); // warm-up
  const t0 = performance.now();
  for (let i = 0; i < runs; i++) await session.run({ [inputName]: x });
  return (performance.now() - t0) / runs;
}

export async function createBestSession(modelBytes, { key = 'model', inputName = 'input', dims = [1, 1, 80, 1001], force } = {}) {
  ort.env.wasm.simd = true;
  ort.env.wasm.numThreads = (typeof self !== 'undefined' && self.crossOriginIsolated)
    ? Math.min(4, (navigator?.hardwareConcurrency || 2)) : 1;
  const cacheKey = `ep:${key}`;
  const remembered = force || (typeof localStorage !== 'undefined' ? localStorage.getItem(cacheKey) : null);
  const candidates = remembered ? [remembered, 'wasm'] : CHAIN;
  const results = [];
  for (const ep of candidates) {
    if (ep === 'webgpu' && !('gpu' in navigator)) continue;
    if (ep === 'webnn' && !('ml' in navigator)) continue;
    try {
      const session = await ort.InferenceSession.create(modelBytes, {
        executionProviders: [ep],
        graphOptimizationLevel: 'all',
        enableCpuMemArena: true,
        enableMemPattern: true,
      });
      if (remembered) return { session, ep, ms: null };
      const ms = await timeOnce(session, inputName, dims);
      results.push({ ep, session, ms });
    } catch (e) {
      console.warn(`EP ${ep} unavailable:`, e?.message || e);
    }
  }
  if (!results.length) throw new Error('No execution provider worked');
  results.sort((a, b) => a.ms - b.ms);
  const best = results[0];
  for (const r of results.slice(1)) r.session.release?.();
  try { localStorage.setItem(cacheKey, best.ep); } catch {}
  return { session: best.session, ep: best.ep, ms: best.ms };
}
