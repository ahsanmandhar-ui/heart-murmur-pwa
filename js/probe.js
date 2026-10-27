export function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

export function classifyProbe(embedding, probe) {
  const n = embedding.length;
  let logit = probe.intercept;
  for (let i = 0; i < n; i++) {
    const z = (embedding[i] - probe.mean[i]) / probe.std[i];
    logit += probe.coef[i] * z;
  }
  const p = sigmoid(logit);
  const abstain = Math.abs(p - 0.5) < (probe.abstain ?? 0.05);
  const label = abstain ? 'uncertain' : (p >= 0.5 ? 'Present' : 'Absent');
  return { p, logit, label, abstain, embedding };
}

export function projectPCA(embedding, pca) {
  const n = embedding.length;
  let x = 0, y = 0;
  for (let i = 0; i < n; i++) {
    const v = embedding[i] - pca.mean[i];
    x += pca.components[0][i] * v;
    y += pca.components[1][i] * v;
  }
  return [x, y];
}

export const PROBE_UTILS = { sigmoid, classifyProbe, projectPCA };