const MODEL_HASH = 'int8-dynamic-v1';
const MODEL_URL = 'models/Eheart_sound_by_Ahsan_Mandhar.onnx';
const CACHE_NAME = 'm2d-models-v1';

export async function getCachedModel() {
  const EXPECTED_SIZE = 87085683;
  // 1) OPFS
  try {
    const root = await navigator.storage?.getDirectory?.();
    if (root) {
      const fh = await root.getFileHandle(`${MODEL_HASH}.onnx`);
      const file = await fh.getFile();
      if (file.size === EXPECTED_SIZE) {
        return new Uint8Array(await file.arrayBuffer());
      }
      // remove invalid/partial
      try { await root.removeEntry(`${MODEL_HASH}.onnx`); } catch {}
    }
  } catch {}
  // 2) Cache API
  try {
    const cache = await caches.open(CACHE_NAME);
    const res = await cache.match(MODEL_URL);
    if (res) {
      const buf = new Uint8Array(await res.arrayBuffer());
      if (buf.length === EXPECTED_SIZE) return buf;
      await cache.delete(MODEL_URL);
    }
  } catch {}
  return null;
}

export async function setCachedModel(bytes) {
  // OPFS
  try {
    const root = await navigator.storage?.getDirectory?.();
    if (root) {
      const fh = await root.getFileHandle(`${MODEL_HASH}.onnx`, { create: true });
      const w = await fh.createWritable();
      await w.write(bytes);
      await w.close();
      // remove older hashes best-effort
      for await (const [name] of root.entries()) {
        if (name.endsWith('.onnx') && name !== `${MODEL_HASH}.onnx`) {
          try { await root.removeEntry(name); } catch {}
        }
      }
      return;
    }
  } catch {}
  // Cache API fallback
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(MODEL_URL, new Response(bytes, { headers: { 'Content-Type': 'application/octet-stream' } }));
  } catch {}
}

export async function fetchModelWithProgress(onProgress) {
  const res = await fetch(MODEL_URL);
  if (!res.ok) throw new Error(`model fetch failed: ${res.status}`);
  const total = Number(res.headers.get('content-length') || 0);
  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (onProgress) onProgress(received, total);
  }
  const buf = new Uint8Array(received);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.length; }
  return buf;
}

export async function getModel(onProgress) {
  let bytes = await getCachedModel();
  if (!bytes) {
    bytes = await fetchModelWithProgress(onProgress);
    await setCachedModel(bytes);
  }
  return bytes;
}
