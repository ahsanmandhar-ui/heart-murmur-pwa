class RecorderWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.chunks = [];
    this.recording = false;
    this.port.onmessage = (e) => {
      if (e.data === 'start') { this.chunks = []; this.recording = true; }
      if (e.data === 'stop') { this.recording = false; this.finish(); }
    };
  }
  process(inputs) {
    if (!this.recording) return true;
    const input = inputs[0];
    if (input && input[0]) this.chunks.push(new Float32Array(input[0]));
    return true;
  }
  finish() {
    const total = this.chunks.reduce((a,c)=>a+c.length,0);
    const native = new Float32Array(total);
    let off=0; for (const c of this.chunks) { native.set(c, off); off+=c.length; }
    // downsample to 16000 via linear interpolation
    const targetRate = 16000;
    const ratio = sampleRate / targetRate;
    const outLen = Math.floor(native.length / ratio);
    const out = new Float32Array(outLen);
    for (let i=0;i<outLen;i++) {
      const src = i*ratio;
      const i0 = Math.floor(src);
      const i1 = Math.min(i0+1, native.length-1);
      const frac = src - i0;
      out[i] = native[i0]*(1-frac) + native[i1]*frac;
    }
    // encode WAV 16-bit PCM
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = targetRate * numChannels * bitsPerSample/8;
    const blockAlign = numChannels * bitsPerSample/8;
    const dataSize = out.length * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    const writeStr = (off, s) => { for (let i=0;i<s.length;i++) view.setUint8(off+i, s.charCodeAt(i)); };
    writeStr(0,'RIFF'); view.setUint32(4,36+dataSize,true); writeStr(8,'WAVE');
    writeStr(12,'fmt '); view.setUint32(16,16,true); view.setUint16(20,1,true);
    view.setUint16(22,numChannels,true); view.setUint32(24,targetRate,true);
    view.setUint32(28,byteRate,true); view.setUint16(32,blockAlign,true);
    view.setUint16(34,bitsPerSample,true); writeStr(36,'data'); view.setUint32(40,dataSize,true);
    let idx=44;
    for (let i=0;i<out.length;i++) {
      let s = Math.max(-1, Math.min(1, out[i]));
      view.setInt16(idx, s<0 ? s*0x8000 : s*0x7FFF, true);
      idx += 2;
    }
    this.port.postMessage({ type:'wav', buffer }, [buffer]);
  }
}
registerProcessor('recorder-worklet', RecorderWorklet);