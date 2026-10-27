import * as ort from 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.mjs';
import { audioToMel } from './dsp_m2d.js';
import { classifyProbe } from './probe.js';

export async function analyzeAudio(audioSamples, session, probe) {
  const mel = audioToMel(audioSamples); // Float32Array
  const tensor = new ort.Tensor('float32', mel, [1, 1, 80, 1001]);
  const out = await session.run({ input: tensor });
  const emb = Array.from(out.output.data);
  // mean-pool if output is [1,311,768]
  let embedding;
  if (out.output.dims.length === 3) {
    const [b, t, d] = out.output.dims;
    embedding = new Array(d).fill(0);
    for (let ti = 0; ti < t; ti++)
      for (let di = 0; di < d; di++)
        embedding[di] += out.output.data[ti * d + di];
    for (let di = 0; di < d; di++) embedding[di] /= t;
  } else {
    embedding = emb;
  }
  return classifyProbe(embedding, probe);
}