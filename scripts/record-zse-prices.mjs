// Tsoro: save the day's official ZSE and VFEX closing prices into Supabase.
// Run by .github/workflows/daily-market.yml every weekday afternoon; safe to run more than once.
//
// Source: the official ZSE price sheet (the same closes zse.co.zw and vfex.exchange show).
// It is NOT the ZSE Direct / VFEX Direct "Market Data" page, whose "Closing" column is the
// previous trading day's close.
//
// Writes the same rows the Admin "Market Prices" form writes:
//   market_prices  (latest price per listing)   and   price_history (one row per listing per day)
// ZSE prices stay in ZWG cents as quoted; VFEX prices are US dollars under exchange 'VFSE'.
// Automatic rows have updated_by / recorded_by = null, which is how Admin tells them from hand entries.
//
// Env:
//   SUPABASE_SERVICE_ROLE_KEY  required unless DRY_RUN=1 (a GitHub secret; never commit it)
//   SUPABASE_URL               optional, defaults to Tsoro's project
//   FINAL=1                    last run of the day: fail loudly if today's sheet never appeared
//   DRY_RUN=1                  print what would be saved, write nothing
import fs from 'fs';

const URL_ = process.env.SUPABASE_URL || 'https://cdmieckdazpkunmmmcdy.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DRY = process.env.DRY_RUN === '1';
const FINAL = process.env.FINAL === '1';
const FEED = 'https://ds88jcmqc11je.cloudfront.net/api/fetch/';
const MAP = JSON.parse(fs.readFileSync(new URL('./zse-vfex-tickers.json', import.meta.url), 'utf8'));
const EXCHANGES = [
  { feed: 'ZSE', ex: 'ZSE', ccy: 'ZiG', label: 'ZSE' },
  { feed: 'VFEX', ex: 'VFSE', ccy: 'USD', label: 'VFEX' },
];

const norm = s => String(s || '').replace(/\s+/g, ' ').trim().toUpperCase();
const iso = d => Array.isArray(d) ? d.map((x, i) => String(x).padStart(i ? 2 : 4, '0')).join('-')
  : typeof d === 'number' ? new Date(d > 1e12 ? d : d * 1000).toLocaleDateString('en-CA', { timeZone: 'Africa/Harare' })
  : String(d || '').slice(0, 10);
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Harare' });

async function getJson(path) {
  const r = await fetch(FEED + path, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  const j = await r.json();
  if (!Array.isArray(j.data)) throw new Error(`${path}: unexpected reply (no data list)`);
  return j.data;
}

async function upsert(table, onConflict, rows) {
  const headers = { apikey: KEY, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' };
  if (KEY.startsWith('eyJ')) headers.Authorization = 'Bearer ' + KEY; // legacy service_role JWT
  const r = await fetch(`${URL_}/rest/v1/${table}?on_conflict=${onConflict}`, { method: 'POST', headers, body: JSON.stringify(rows) });
  if (!r.ok) throw new Error(`${table}: HTTP ${r.status} ${(await r.text()).slice(0, 300)}`);
}

if (!DRY && !KEY) {
  console.error('::error::SUPABASE_SERVICE_ROLE_KEY is not set. Add it under the repository\'s Settings → Secrets and variables → Actions.');
  process.exit(1);
}

const problems = [];
let saved = 0, waiting = 0;
for (const E of EXCHANGES) {
  let sheet;
  try { sheet = await getJson('price-sheet?exchange=' + E.feed); }
  catch (e) { problems.push(`${E.label} price sheet could not be read (${e.message})`); continue; }

  const dates = [...new Set(sheet.map(r => iso(r.statsDate)))];
  if (!dates.includes(today)) {
    waiting++;
    const msg = `${E.label} has not published ${today}'s closes yet (its sheet is for ${dates.join(', ') || 'no date'})`;
    if (FINAL) problems.push(msg + '. If today is a public holiday, ignore this.');
    else console.log(msg + '; the evening run will try again.');
    continue;
  }

  const known = MAP[E.feed] || {};
  let byName = null; // market-cap feed, only fetched if a name is new
  const rows = [];
  for (const r of sheet) {
    if (iso(r.statsDate) !== today) continue;
    const name = norm(r.name || r.symbol);
    if ((MAP.skip || []).includes(name)) continue;
    const price = Number(r.closePrice);
    if (!(price > 0)) { problems.push(`${E.label} ${name}: no closing price in the sheet`); continue; }
    let sym = known[name];
    if (!sym) {
      if (!byName) {
        byName = {};
        try { for (const m of await getJson('market-capitalisation?exchange=' + E.feed)) byName[norm(m.companyName)] = String(m.symbol || '').replace(/\.(ZW|VX)$/i, '').toUpperCase(); }
        catch (_) {}
      }
      sym = byName[name];
      if (!sym) { problems.push(`${E.label} new listing "${name}" has no ticker. Add it to scripts/zse-vfex-tickers.json`); continue; }
      console.log(`::notice::${E.label} new listing "${name}" saved as ${sym}. Add it to scripts/zse-vfex-tickers.json to make this permanent.`);
    }
    rows.push({ symbol: sym, price });
  }
  if (!rows.length) { problems.push(`${E.label}: no prices to save`); continue; }

  const now = new Date().toISOString();
  const hist = rows.map(x => ({ symbol: x.symbol, exchange: E.ex, price: x.price, currency: E.ccy, recorded_date: today, recorded_by: null }));
  const latest = rows.map(x => ({ symbol: x.symbol, exchange: E.ex, price: x.price, currency: E.ccy, price_date: today, updated_by: null, updated_at: now }));
  if (DRY) {
    console.log(`${E.label} ${today}: would save ${rows.length} closes`);
    for (const x of rows) console.log(`  ${x.symbol.padEnd(6)} ${x.price}`);
  } else {
    try {
      await upsert('price_history', 'symbol,exchange,recorded_date', hist);
      await upsert('market_prices', 'symbol,exchange', latest);
      console.log(`${E.label} ${today}: saved ${rows.length} official closes`);
    } catch (e) { problems.push(`${E.label}: saving failed (${e.message})`); continue; }
  }
  saved += rows.length;
}

for (const p of problems) console.log('::error::' + p);
if (problems.length) process.exit(1);
console.log(saved ? `Done: ${saved} prices for ${today}` : `Nothing saved yet for ${today}`);
