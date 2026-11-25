// Tsoro: official market indexes for ZSE, VFEX and JSE, with their daily history.
//   /api/indices   every index below as {k, ex, ccy, h:[[date, close], ...]}
// ZSE and VFEX: zse-indices.json (recorded daily by a GitHub Action) plus the ZSE feed's latest close.
// JSE: Yahoo Finance index levels (prices only, no dividends), from 2020.
const DB = require('../zse-indices.json');
const UA = 'Mozilla/5.0 (compatible; TsoroJournal/1.0)';
const ZSE_FEED = 'https://ds88jcmqc11je.cloudfront.net/api/fetch/indices?exchange=';
const ZW = {
  'ZSE:ASI': 'ZSE:ALL SHARE', 'ZSE:T10': 'ZSE:ZSE TOP 10', 'ZSE:T15': 'ZSE:ZSE TOP 15', 'ZSE:T25': 'ZSE:ZSE TOP 25',
  'ZSE:MID': 'ZSE:MID CAP INDEX', 'ZSE:SML': 'ZSE:SMALL CAP INDEX', 'VFEX:ASI': 'VFEX:VFEX ALLSHARE',
};
const JSE = { 'JSE:J203': 'J203', 'JSE:J200': 'J200', 'JSE:J205': 'J205', 'JSE:J201': 'J201', 'JSE:J258': 'J258', 'JSE:J212': 'J212', 'JSE:J211': 'J211', 'JSE:J253': 'J253' };
const FROM = 1577836800; // 1 Jan 2020
const day = t => new Date(t * 1000).toISOString().slice(0, 10);
const iso = d => Array.isArray(d) ? d.map((x, i) => String(x).padStart(i ? 2 : 4, '0')).join('-') : null;

async function json(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
async function yahoo(code) {
  for (const h of ['https://query1.finance.yahoo.com', 'https://query2.finance.yahoo.com']) {
    try {
      const j = await json(h + '/v8/finance/chart/' + encodeURIComponent('^' + code + '.JO') + '?period1=' + FROM + '&period2=' + Math.floor(Date.now() / 1000 + 86400) + '&interval=1d');
      const r = ((j.chart || {}).result || [])[0]; if (!r) continue;
      const cl = (((r.indicators || {}).quote || [{}])[0] || {}).close || [], m = new Map();
      (r.timestamp || []).forEach((t, i) => { if (cl[i] > 0) m.set(day(t), +cl[i].toFixed(2)); });
      return [...m.entries()];
    } catch (_) { /* try the other host */ }
  }
  return [];
}
// Today's closes from the ZSE feed, keyed like zse-indices.json
async function zseLatest() {
  const out = {};
  await Promise.all(['ZSE', 'VFEX'].map(async ex => {
    try {
      ((await json(ZSE_FEED + ex)).data || []).forEach(x => {
        const d = iso(x.latestDate), v = Number(x.close);
        if (d && v > 0) out[(ex === 'VFEX' ? 'VFEX' : 'ZSE') + ':' + String(x.index || '').trim().toUpperCase()] = [d, v, Number(x.percentageChange)];
      });
    } catch (_) { /* the recorded file still answers */ }
  }));
  return out;
}

module.exports = async (req, res) => {
  try {
    const [live, ...jse] = await Promise.all([zseLatest(), ...Object.values(JSE).map(yahoo)]);
    const list = [];
    Object.entries(ZW).forEach(([k, src]) => {
      const h = ((DB.i[src] || {}).h || []).slice(), l = live[src];
      if (l) { const p = [l[0], l[1]], i = h.findIndex(q => q[0] === l[0]); if (i >= 0) h[i] = p; else if (!h.length || l[0] > h[h.length - 1][0]) h.push(p); }
      // The day's % change as the ZSE reports it, for indexes without yesterday on record
      const pct = l && isFinite(l[2]) && h.length && h[h.length - 1][0] === l[0] ? +(l[2] / 100).toFixed(6) : null;
      list.push({ k, ex: k.split(':')[0] === 'VFEX' ? 'VFSE' : 'ZSE', ccy: k.startsWith('VFEX') ? 'USD' : 'ZiG', pct, h });
    });
    Object.keys(JSE).forEach((k, i) => list.push({ k, ex: 'JSE', ccy: 'ZAR', h: jse[i] }));
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
    return res.status(200).json({ asOf: new Date().toISOString(), list });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Index data is unavailable right now', detail: String(e.message || e) });
  }
};
