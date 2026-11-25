// Tsoro: append today's official ZSE and VFEX index closes to zse-indices.json.
// Run by .github/workflows/zse-indices.yml after each trading day; safe to run more than once.
// Source: the ZSE website's public market-data feed (the same numbers zse.co.zw shows).
import fs from 'fs';

const FILE = new URL('../zse-indices.json', import.meta.url);
const FEED = 'https://ds88jcmqc11je.cloudfront.net/api/fetch/indices?exchange=';
const iso = d => Array.isArray(d) ? d.map((x, i) => String(x).padStart(i ? 2 : 4, '0')).join('-') : null;

const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
let added = 0;
for (const ex of ['ZSE', 'VFEX']) {
  const r = await fetch(FEED + ex, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(ex + ' feed HTTP ' + r.status);
  const rows = (await r.json()).data || [];
  for (const x of rows) {
    const d = iso(x.latestDate), v = Number(x.close), name = String(x.index || '').trim().toUpperCase();
    if (!d || !name || !(v > 0)) continue;
    const key = (ex === 'VFEX' ? 'VFEX' : 'ZSE') + ':' + name;
    const s = (db.i[key] ||= { h: [] });
    const at = s.h.findIndex(p => p[0] === d);
    if (at >= 0) { if (s.h[at][1] !== v) { s.h[at][1] = v; added++; } }
    else { s.h.push([d, v]); s.h.sort((a, b) => a[0].localeCompare(b[0])); added++; }
  }
}
if (added) {
  db.updated = new Date().toISOString();
  fs.writeFileSync(FILE, JSON.stringify(db));
}
console.log(added ? `Recorded ${added} index value(s)` : 'No new index values');
