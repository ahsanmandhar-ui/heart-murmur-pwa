export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export async function decodeFileTo16k(file) {
  const arr = await file.arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const buf = await ctx.decodeAudioData(arr);
  const offline = new OfflineAudioContext(1, Math.ceil(buf.duration * 16000), 16000);
  const src = offline.createBufferSource();
  src.buffer = buf;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  const samples = rendered.getChannelData(0);
  // pad/truncate
  const out = new Float32Array(160000);
  const n = Math.min(samples.length, 160000);
  for (let i = 0; i < n; i++) out[i] = samples[i];
  return out;
}

export function rejectIfUnsupported(file) {
  const type = file.type || '';
  if (isIOS() && (type.includes('ogg') || file.name.toLowerCase().endsWith('.ogg'))) {
    throw new Error('OGG not supported on iOS. Use WAV/MP3/AAC.');
  }
}

export async function startMicCapture(onWav) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  await audioCtx.audioWorklet.addModule('/processors/recorder-worklet.js');
  const source = audioCtx.createMediaStreamSource(stream);
  const worklet = new AudioWorkletNode(audioCtx, 'recorder-worklet');
  source.connect(worklet);
  worklet.port.onmessage = (e) => {
    if (e.data && e.data.type === 'wav') onWav(e.data.buffer);
  };
  worklet.port.postMessage('start');
  return { stream, audioCtx, worklet, stop: () => { worklet.port.postMessage('stop'); stream.getTracks().forEach(t=>t.stop()); } };
}

export function bleSupported() {
  return !!navigator.bluetooth;
}