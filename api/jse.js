// Tsoro: JSE market data, fetched on demand from Yahoo Finance and cached at Vercel's edge.
//   /api/jse?q=quotes   latest price and previous close for every listing in jse-listings.json
//   /api/jse?s=NPN      full daily closing-price history for one listing
//   /api/jse?fx=ZAR     rand per US dollar, daily
//   /api/jse?b=SPY      one benchmark (see BENCH): JSE indexes in rand, US funds in dollars with dividends reinvested
// Prices come back in whole rand (Yahoo quotes JSE in cents).
const LISTINGS = require('../jse-listings.json');
const KNOWN = new Set(LISTINGS.map(x => x.s));
const UA = 'Mozilla/5.0 (compatible; TsoroJournal/1.0)';
const HOSTS = ['https://query1.finance.yahoo.com', 'https://query2.finance.yahoo.com'];

async function yahoo(path) {
  let last;
  for (const h of HOSTS) {
    try {
      const r = await fetch(h + path, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
      if (r.ok) return await r.json();
      last = new Error('Yahoo ' + r.status);
    } catch (e) { last = e; }
  }
  throw last;
}
// Benchmarks: JSE indexes are price-only (Yahoo has no JSE total-return series); the US funds use
// Yahoo's adjusted close, which reinvests dividends.
const BENCH = {
  J203: { y: '^J203.JO', adj: false }, J200: { y: '^J200.JO', adj: false },
  SPY: { y: 'SPY', adj: true }, ACWI: { y: 'ACWI', adj: true }, EEM: { y: 'EEM', adj: true },
  GLD: { y: 'GLD', adj: true }, BIL: { y: 'BIL', adj: true },
};
const FROM_2008 = 1199145600;
const day = t => new Date(t * 1000).toISOString().slice(0, 10);
const scale = ccy => (ccy === 'ZAc' || ccy === 'ZAX' ? 100 : 1);

// [[date, close], ...] oldest first, one row per day, gaps and zero prints dropped
function series(res, adj) {
  const ts = res.timestamp || [], ind = res.indicators || {}, q = (ind.quote || [{}])[0] || {};
  const cl = (adj && ((ind.adjclose || [{}])[0] || {}).adjclose) || q.close || [], div = scale((res.meta || {}).currency), out = new Map();
  ts.forEach((t, i) => { const v = cl[i]; if (v != null && v > 0) out.set(day(t), +(v / div).toFixed(4)); });
  return [...out.entries()];
}

async function quotes() {
  const syms = LISTINGS.map(x => x.s), batches = [];
  for (let i = 0; i < syms.length; i += 20) batches.push(syms.slice(i, i + 20));
  const out = {};
  await Promise.all(batches.map(async b => {
    try {
      const j = await yahoo('/v7/finance/spark?range=5d&interval=1d&symbols=' + b.map(s => encodeURIComponent(s + '.JO')).join(','));
      ((j.spark || {}).result || []).forEach(r => {
        const res = (r.response || [])[0]; if (!res) return;
        const s = series(res), sym = r.symbol.replace(/\.JO$/, '');
        if (!s.length) return;
        const [d, p] = s[s.length - 1], prev = s.length > 1 ? s[s.length - 2] : null;
        out[sym] = { p, d, pp: prev ? prev[1] : null, pd: prev ? prev[0] : null };
      });
    } catch (_) { /* a failed batch leaves those listings without a quote */ }
  }));
  return { asOf: new Date().toISOString(), quotes: out };
}

module.exports = async (req, res) => {
  const q = req.query || {};
  try {
    if (q.q === 'quotes') {
      const body = await quotes();
      if (!Object.keys(body.quotes).length) throw new Error('No quotes returned');
      res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=86400');
      return res.status(200).json(body);
    }
    if (q.s) {
      const s = String(q.s).toUpperCase();
      if (!/^[A-Z0-9]{1,12}$/.test(s) || !KNOWN.has(s)) return res.status(404).json({ error: 'Unknown JSE listing' });
      const j = await yahoo('/v8/finance/chart/' + encodeURIComponent(s + '.JO') + '?period1=0&period2=' + Math.floor(Date.now() / 1000 + 86400) + '&interval=1d');
      const r = ((j.chart || {}).result || [])[0];
      if (!r) throw new Error('No history returned');
      res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
      return res.status(200).json({ s, ccy: 'ZAR', h: series(r) });
    }
    if (q.fx === 'ZAR') {
      const j = await yahoo('/v8/finance/chart/ZAR%3DX?period1=' + FROM_2008 + '&period2=' + Math.floor(Date.now() / 1000 + 86400) + '&interval=1d');
      const r = ((j.chart || {}).result || [])[0];
      if (!r) throw new Error('No rate history returned');
      res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
      return res.status(200).json({ ccy: 'ZAR', h: series(r) });
    }
    if (q.b) {
      const k = String(q.b).toUpperCase(), b = BENCH[k];
      if (!b) return res.status(404).json({ error: 'Unknown benchmark' });
      const j = await yahoo('/v8/finance/chart/' + encodeURIComponent(b.y) + '?period1=' + FROM_2008 + '&period2=' + Math.floor(Date.now() / 1000 + 86400) + '&interval=1d');
      const r = ((j.chart || {}).result || [])[0];
      if (!r) throw new Error('No benchmark history returned');
      res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
      return res.status(200).json({ b: k, ccy: r.meta && r.meta.currency === 'USD' ? 'USD' : 'ZAR', h: series(r, b.adj) });
    }
    return res.status(400).json({ error: 'Use ?q=quotes, ?s=SYMBOL, ?fx=ZAR or ?b=BENCHMARK' });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'JSE data is unavailable right now', detail: String(e.message || e) });
  }
};
