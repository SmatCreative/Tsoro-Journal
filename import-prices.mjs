/**
 * Tsoro Journal — Bulk Price History Importer
 *
 * Usage:
 *   node import-prices.mjs YOUR_SERVICE_ROLE_KEY
 *
 * Get the service role key from:
 *   Supabase dashboard → Project Settings → API → service_role (secret key)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://cdmieckdazpkunmmmcdy.supabase.co';
const SERVICE_ROLE_KEY = process.argv[2];

if (!SERVICE_ROLE_KEY) {
  console.error('Usage: node import-prices.mjs YOUR_SERVICE_ROLE_KEY');
  console.error('Get it from: Supabase → Project Settings → API → service_role');
  process.exit(1);
}

const BATCH_SIZE = 1000;

// Parse all SQL files from both import folders
function parseRows(dir) {
  const rows = [];
  if (!fs.existsSync(dir)) return rows;

  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    // Match: ('SYMBOL', 'EXCHANGE', 123.456, 'ZiG', '2024-01-15')
    const pattern = /\('([^']+)',\s*'([^']+)',\s*([\d.]+),\s*'([^']+)',\s*'(\d{4}-\d{2}-\d{2})'\)/g;
    let m;
    while ((m = pattern.exec(content)) !== null) {
      rows.push({
        symbol:        m[1],
        exchange:      m[2],
        price:         parseFloat(m[3]),
        currency:      m[4],
        recorded_date: m[5],
      });
    }
  }
  return rows;
}

async function insertBatch(rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/price_history?on_conflict=symbol,exchange,recorded_date`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey':        SERVICE_ROLE_KEY,
      'Prefer':        'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
}

async function main() {
  console.log('Reading import files...');

  const kwayisiRows = parseRows(path.join(__dirname, 'data-import-kwayisi'));
  const githubRows  = parseRows(path.join(__dirname, 'data-import'));

  // Merge, deduplicate by symbol+exchange+date
  const seen = new Set();
  const allRows = [];
  for (const row of [...kwayisiRows, ...githubRows]) {
    const key = `${row.symbol}|${row.exchange}|${row.recorded_date}`;
    if (!seen.has(key)) {
      seen.add(key);
      allRows.push(row);
    }
  }

  console.log(`Total unique rows: ${allRows.length.toLocaleString()}`);
  console.log(`Inserting in batches of ${BATCH_SIZE}...\n`);

  const total = allRows.length;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = allRows.slice(i, i + BATCH_SIZE);
    const pct = Math.round((i / total) * 100);
    process.stdout.write(`\r  ${pct}% — ${inserted.toLocaleString()} rows inserted, ${errors} errors`);

    try {
      await insertBatch(batch);
      inserted += batch.length;
    } catch (err) {
      errors++;
      console.error(`\n  Batch ${i}–${i + BATCH_SIZE} failed: ${err.message}`);
    }
  }

  console.log(`\r  100% — ${inserted.toLocaleString()} rows inserted, ${errors} errors\n`);
  console.log('Done!');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
