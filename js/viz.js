export class WaveformCanvas {
  constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.data = null; this.raf = null; this.visible = true; document.addEventListener('visibilitychange', ()=>{ this.visible = !document.hidden; if(this.visible) this.draw(); }); }
  setData(samples) { this.data = samples; this.draw(); }
  draw() {
    const c = this.canvas, ctx = this.ctx;
    const w = c.width, h = c.height;
    ctx.clearRect(0,0,w,h);
    if (!this.data) return;
    ctx.beginPath();
    ctx.strokeStyle = '#4f46e5';
    const step = this.data.length / w;
    for (let x=0;x<w;x++) {
      const i = Math.floor(x*step);
      const y = (1 - (this.data[i]+1)/2) * h;
      if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
}

export class MelHeatmap {
  constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.data = null; this.tooltip = null; canvas.addEventListener('mousemove', (e)=>this.onHover(e)); }
  setData(melFlat) { this.data = melFlat; this.draw(); }
  draw() {
    const c = this.canvas, ctx = this.ctx;
    const w = c.width, h = c.height;
    const cols = 1001, rows = 80;
    const cw = w/cols, ch = h/rows;
    if (!this.data) return;
    for (let m=0;m<rows;m++) for (let t=0;t<cols;t++) {
      const v = this.data[m*cols + t];
      const norm = Math.max(0, Math.min(1, (v+2)/4));
      ctx.fillStyle = `rgb(${Math.round(norm*255)}, ${Math.round(norm*100)}, ${Math.round((1-norm)*255)})`;
      ctx.fillRect(t*cw, m*ch, cw+1, ch+1);
    }
  }
  onHover(e) {
    // placeholder tooltip
    const rect = this.canvas.getBoundingClientRect();
    const t = Math.floor((e.clientX-rect.left)/rect.width*1001);
    const m = Math.floor((e.clientY-rect.top)/rect.height*80);
    this.canvas.title = `mel bin ${m}, frame ${t}`;
  }
}

export class SpectrumBars {
  constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.data = null; }
  setData(power) { this.data = power; this.draw(); }
  draw() {
    const c = this.canvas, ctx = this.ctx;
    const w = c.width, h = c.height;
    ctx.clearRect(0,0,w,h);
    if (!this.data) return;
    const n = this.data.length;
    const bw = w/n;
    for (let i=0;i<n;i++) {
      const bh = this.data[i]*h;
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(i*bw, h-bh, bw-1, bh);
    }
  }
}

export class ConfidenceGauge {
  constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); }
  setValue(p) {
    const c = this.canvas, ctx = this.ctx;
    const w = c.width, h = c.height;
    ctx.clearRect(0,0,w,h);
    ctx.beginPath();
    ctx.arc(w/2, h/2, Math.min(w,h)/2-4, Math.PI, Math.PI*(1+p));
    ctx.strokeStyle = p>=0.5 ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${(p*100).toFixed(1)}%`, w/2, h/2+6);
  }
}

export class EmbeddingScatter {
  constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.points = []; this.current = null; }
  setTraining(points) { this.points = points; this.draw(); }
  setCurrent(xy) { this.current = xy; this.draw(); }
  draw() {
    const c = this.canvas, ctx = this.ctx;
    const w = c.width, h = c.height;
    ctx.clearRect(0,0,w,h);
    for (const pt of this.points) {
      ctx.fillStyle = pt.label ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)';
      ctx.beginPath();
      ctx.arc((pt.x+5)*w/10, (pt.y+5)*h/10, 2, 0, Math.PI*2);
      ctx.fill();
    }
    if (this.current) {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc((this.current[0]+5)*w/10, (this.current[1]+5)*h/10, 5, 0, Math.PI*2);
      ctx.fill();
    }
  }
}