// Tsoro: save the day's official ZSE and VFEX closing prices into Supabase.
// Run by .github/workflows/daily-market.yml every weekday afternoon; safe to run more than once.
//
// Source: the official ZSE price sheet (the same closes zse.co.zw and vfex.exchange show).
// It is NOT the ZSE Direct / VFEX Direct "Market Data" page, whose "Closing" column is the
// previous trading day's close.
//
// GitHub often starts scheduled runs hours late, so the job never assumes "today": it saves the
// closes for whatever trading day the official sheet is for. The sheet keeps the last trading day's
// closes until the next one is published (~15:00 CAT), so a run any time before then still gets them.
// It fails (GitHub emails the owner) only when the sheet is older than the last weekday whose 20:00 CAT
// has passed, i.e. a day's closes never appeared.
//
// Writes the same rows the Admin "Market Prices" form writes:
//   market_prices  (latest price per listing)   and   price_history (one row per listing per day)
// ZSE prices stay in ZWG cents as quoted; VFEX prices are US dollars under exchange 'VFSE'.
// Automatic rows have updated_by / recorded_by = null, which is how Admin tells them from hand entries.
//
// Env:
//   SUPABASE_SERVICE_ROLE_KEY  required unless DRY_RUN=1 (a GitHub secret; never commit it)
//   SUPABASE_URL               optional, defaults to Tsoro's project
//   DRY_RUN=1                  print what would be saved, write nothing
import fs from 'fs';

const URL_ = process.env.SUPABASE_URL || 'https://cdmieckdazpkunmmmcdy.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DRY = process.env.DRY_RUN === '1';
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
// Latest weekday whose 20:00 CAT has passed: by then that day's closes should be out.
function dueDate() {
  const h = new Date(Date.now() + 2 * 3600e3); // Harare is UTC+2 all year
  const d = new Date(Date.UTC(h.getUTCFullYear(), h.getUTCMonth(), h.getUTCDate()));
  const wd = d.getUTCDay();
  if (!(wd >= 1 && wd <= 5 && h.getUTCHours() >= 20)) {
    do d.setUTCDate(d.getUTCDate() - 1); while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
  }
  return d.toISOString().slice(0, 10);
}
const due = dueDate();

async function getJson(path) {
  const r = await fetch(FEED + path, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  const j = await r.json();
  if (!Array.isArray(j.data)) throw new Error(`${path}: unexpected reply (no data list)`);
  return j.data;
}

function headers() {
  const h = { apikey: KEY, 'Content-Type': 'application/json' };
  if (KEY.startsWith('eyJ')) h.Authorization = 'Bearer ' + KEY; // legacy service_role JWT
  return h;
}
async function upsert(table, onConflict, rows) {
  const r = await fetch(`${URL_}/rest/v1/${table}?on_conflict=${onConflict}`, { method: 'POST', headers: { ...headers(), Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) });
  if (!r.ok) throw new Error(`${table}: HTTP ${r.status} ${(await r.text()).slice(0, 300)}`);
}

if (!DRY && !KEY) {
  console.error('::error::SUPABASE_SERVICE_ROLE_KEY is not set. Add it under the repository\'s Settings → Secrets and variables → Actions.');
  process.exit(1);
}

// Latest price per listing already in market_prices, so an older sheet never replaces a newer price
const newest = {};
if (!DRY) {
  const r = await fetch(`${URL_}/rest/v1/market_prices?select=symbol,exchange,price_date&exchange=in.(ZSE,VFSE)`, { headers: headers() });
  if (!r.ok) { console.error(`::error::market_prices could not be read: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`); process.exit(1); }
  for (const x of await r.json()) newest[x.symbol + '|' + x.exchange] = x.price_date;
}

const problems = [];
const days = [];
let saved = 0;
for (const E of EXCHANGES) {
  let sheet;
  try { sheet = await getJson('price-sheet?exchange=' + E.feed); }
  catch (e) { problems.push(`${E.label} price sheet could not be read (${e.message})`); continue; }

  const day = sheet.map(r => iso(r.statsDate)).filter(Boolean).sort().pop();
  if (!day) { problems.push(`${E.label} price sheet has no date`); continue; }
  if (day < due) problems.push(`${E.label} has not published closes for ${due} (its latest sheet is for ${day}). If ${due} was a public holiday, ignore this; otherwise add the prices by hand in Tsoro Admin.`);

  const known = MAP[E.feed] || {};
  let byName = null; // market-cap feed, only fetched if a name is new
  const rows = [];
  for (const r of sheet) {
    if (iso(r.statsDate) !== day) continue;
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
  const hist = rows.map(x => ({ symbol: x.symbol, exchange: E.ex, price: x.price, currency: E.ccy, recorded_date: day, recorded_by: null }));
  const latest = rows.filter(x => !(newest[x.symbol + '|' + E.ex] > day))
    .map(x => ({ symbol: x.symbol, exchange: E.ex, price: x.price, currency: E.ccy, price_date: day, updated_by: null, updated_at: now }));
  days.push(E.label + ' ' + day);
  if (DRY) {
    console.log(`${E.label} ${day}: would save ${rows.length} closes`);
    for (const x of rows) console.log(`  ${x.symbol.padEnd(6)} ${x.price}`);
  } else {
    try {
      await upsert('price_history', 'symbol,exchange,recorded_date', hist);
      if (latest.length) await upsert('market_prices', 'symbol,exchange', latest);
      console.log(`${E.label} ${day}: saved ${rows.length} official closes`);
    } catch (e) { problems.push(`${E.label}: saving failed (${e.message})`); continue; }
  }
  saved += rows.length;
}

for (const p of problems) console.log('::error::' + p);
if (problems.length) process.exit(1);
console.log(`Done: ${saved} prices (${days.join(', ')})`);
