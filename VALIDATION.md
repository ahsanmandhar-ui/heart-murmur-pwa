# Cross-platform & offline validation checklist

## Browsers
- Chrome desktop, Edge, Firefox, Safari desktop
- Chrome Android, Safari iOS

## Checks
- Lighthouse PWA >= 90
- Offline after first load (disable network, reload)
- Mel diff < 1e-3 on device vs Python reference
- p95 latency measured (single-thread and threaded) recorded, not hypothesized
- Reduced motion removes transforms
- Contrast >= 4.5:1 both themes
- Zero critical axe violations
- Keyboard-only navigation works
- History persists across reloads
- CSV/PDF export opens correctly