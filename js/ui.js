export function initTheme() {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}

export function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

export function initAmbient() {
  const el = document.createElement('div');
  el.className = 'ambient';
  document.body.prepend(el);
  window.addEventListener('mousemove', (e) => {
    el.style.setProperty('--mx', e.clientX + 'px');
    el.style.setProperty('--my', e.clientY + 'px');
  });
}

export function magneticButton(btn) {
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width/2;
    const y = e.clientY - r.top - r.height/2;
    btn.style.transform = `translate(${x*0.2}px, ${y*0.2}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
}