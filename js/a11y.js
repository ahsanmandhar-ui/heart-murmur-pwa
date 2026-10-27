export function initA11y() {
  // skip link
  const skip = document.createElement('a');
  skip.href = '#main';
  skip.textContent = 'Skip to content';
  skip.style.cssText = 'position:absolute;left:-9999px;top:0;z-index:1000;';
  skip.addEventListener('focus', () => { skip.style.left = '0'; });
  skip.addEventListener('blur', () => { skip.style.left = '-9999px'; });
  document.body.prepend(skip);

  // aria-live status region
  const live = document.createElement('div');
  live.id = 'status-live';
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');
  live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);';
  document.body.appendChild(live);
}

export function announce(msg) {
  const el = document.getElementById('status-live');
  if (el) el.textContent = msg;
}