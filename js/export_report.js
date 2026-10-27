export function exportCSV(records) {
  const header = 'id,timestamp,label,probability,abstain\n';
  const rows = records.map(r => `${r.id},${r.ts},${r.label},${r.p},${r.abstain}`).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'm2d-history.csv'; a.click();
  URL.revokeObjectURL(url);
}

export function exportPrintableReport(records) {
  const win = window.open('', '_blank');
  const html = `<!DOCTYPE html><html><head><title>M2D Report</title></head><body>
    <h1>M2D Heart-Murmur Report</h1>
    <table border="1" cellpadding="4"><tr><th>ID</th><th>Time</th><th>Label</th><th>p</th><th>Abstain</th></tr>
    ${records.map(r=>`<tr><td>${r.id}</td><td>${new Date(r.ts).toISOString()}</td><td>${r.label}</td><td>${r.p?.toFixed(4)}</td><td>${r.abstain}</td></tr>`).join('')}
    </table>
  </body></html>`;
  win.document.write(html);
  win.document.close();
  win.print();
}