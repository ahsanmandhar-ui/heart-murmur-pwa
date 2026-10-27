// M2D mel pipeline placeholder part1
const SR = 16000;
const N_FFT = 400;
const WIN = 400;
const HOP = 160;
const N_MELS = 80;
const FMIN = 50;
const FMAX = 8000;
const N_FRAMES = 1001;
const N_SAMPLES = 160000;
const EPS = 1.1920929e-7;
const MEAN = -7.2617793;
const STD = 4.3511505;

function hzToMel(freqs, htk=false) {
  const f = Array.isArray(freqs) ? freqs : [freqs];
  const out = f.map(fr => {
    if (htk) return 2595.0 * Math.log10(1.0 + fr / 700.0);
    const fsp = 200.0/3;
    let mel = (fr - 0.0)/fsp;
    const minLogHz = 1000.0;
    const minLogMel = (minLogHz - 0.0)/fsp;
    const logstep = Math.log(6.4)/27.0;
    if (fr >= minLogHz) mel = minLogMel + Math.log(fr/minLogHz)/logstep;
    return mel;
  });
  return Array.isArray(freqs) ? out : out[0];
}

function melToHz(mels, htk=false) {
  const m = Array.isArray(mels) ? mels : [mels];
  const out = m.map(ml => {
    if (htk) return 700.0 * (Math.pow(10, ml/2595.0) - 1.0);
    const fsp = 200.0/3;
    let freq = 0.0 + fsp * ml;
    const minLogHz = 1000.0;
    const minLogMel = (minLogHz - 0.0)/fsp;
    const logstep = Math.log(6.4)/27.0;
    if (ml >= minLogMel) freq = minLogHz * Math.exp(logstep * (ml - minLogMel));
    return freq;
  });
  return Array.isArray(mels) ? out : out[0];
}

function melFrequencies(n, fmin, fmax, htk=false) {
  const minMel = hzToMel([fmin], htk)[0];
  const maxMel = hzToMel([fmax], htk)[0];
  const mels = new Float64Array(n);
  for (let i=0;i<n;i++) mels[i] = minMel + (maxMel-minMel)*i/(n-1);
  return melToHz(Array.from(mels), htk);
}

function fftFrequencies(sr, n_fft) {
  const out = [];
  const df = sr / n_fft;
  for (let i=0;i<=n_fft/2;i++) out.push(i*df);
  return out;
}

function buildMelBasis() {
  const nFreqs = N_FFT/2 + 1;
  const fftFreqs = fftFrequencies(SR, N_FFT);
  const melF = melFrequencies(N_MELS + 2, FMIN, FMAX, false);
  const weights = new Float64Array(N_MELS * nFreqs);
  for (let i=0;i<N_MELS;i++) {
    for (let j=0;j<nFreqs;j++) {
      const lower = -(melF[i] - fftFreqs[j]) / (melF[i+1]-melF[i]);
      const upper = (melF[i+2] - fftFreqs[j]) / (melF[i+2]-melF[i+1]);
      let w = Math.min(lower, upper);
      if (w < 0) w = 0;
      weights[i*nFreqs + j] = w;
    }
  }
  const enorm = new Float64Array(N_MELS);
  for (let i=0;i<N_MELS;i++) enorm[i] = 2.0 / (melF[i+2] - melF[i]);
  for (let i=0;i<N_MELS;i++) {
    for (let j=0;j<nFreqs;j++) {
      weights[i*nFreqs + j] *= enorm[i];
    }
  }
  return {weights, nFreqs};
}

const MEL_BASIS = buildMelBasis();

function hannWindow(n) {
  const w = new Float64Array(n);
  for (let i=0;i<n;i++) w[i] = 0.5 - 0.5*Math.cos(2*Math.PI*i/n);
  return w;
}
const HANN = hannWindow(WIN);

function reflectPad(x, pad) {
  const N = x.length;
  const out = new Float64Array(N + 2*pad);
  for (let i=0;i<pad;i++) out[i] = x[pad - i];
  for (let i=0;i<N;i++) out[pad+i] = x[i];
  for (let i=0;i<pad;i++) out[pad+N+i] = x[N-2-i];
  return out;
}
export function audioToMel(input) {
  let audio = new Float64Array(N_SAMPLES);
  const n = Math.min(input.length, N_SAMPLES);
  for (let i=0;i<n;i++) audio[i] = input[i];
  const padded = reflectPad(audio, N_FFT/2);

  const nFreqs = N_FFT/2 + 1;
  const mel = new Float64Array(N_MELS * N_FRAMES);

  for (let t=0;t<N_FRAMES;t++) {
    const start = t * HOP;
    const real = new Float64Array(nFreqs);
    const imag = new Float64Array(nFreqs);
    for (let nn=0;nn<N_FFT;nn++) {
      const sample = padded[start+nn] * HANN[nn];
      for (let k=0;k<nFreqs;k++) {
        const ang = 2*Math.PI*k*nn/N_FFT;
        real[k] += sample * Math.cos(ang);
        imag[k] -= sample * Math.sin(ang);
      }
    }
    const power = new Float64Array(nFreqs);
    for (let k=0;k<nFreqs;k++) power[k] = real[k]*real[k] + imag[k]*imag[k];
    for (let m=0;m<N_MELS;m++) {
      let sum = 0;
      const base = m*nFreqs;
      for (let k=0;k<nFreqs;k++) {
        sum += MEL_BASIS.weights[base + k] * power[k];
      }
      mel[m*N_FRAMES + t] = sum;
    }
  }

  for (let i=0;i<mel.length;i++) mel[i] = Math.log(mel[i] + EPS);
  for (let i=0;i<mel.length;i++) mel[i] = (mel[i] - MEAN) / STD;

  const out = new Float32Array(1*1*N_MELS*N_FRAMES);
  for (let i=0;i<mel.length;i++) out[i] = mel[i];
  return out;
}

export const M2D_DSP = { SR, N_FFT, WIN, HOP, N_MELS, FMIN, FMAX, N_FRAMES, N_SAMPLES, audioToMel };