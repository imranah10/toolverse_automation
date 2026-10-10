/**
 * daily_health_check.js - Daily self-audit of Toolverse published posts.
 * Reads data/state.json, live-checks every published object of the last 8 days
 * on IG + FB (LinkedIn not checkable with current token scopes).
 * Exit 1 only if an EXPECTED-LIVE object is missing (silent deletion / broken post).
 */
const fs = require('fs');
const TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
const VER = 'v21.0';

if (!TOKEN) { console.error('HEALTH: META_PAGE_ACCESS_TOKEN missing'); process.exit(1); }

const state = JSON.parse(fs.readFileSync('data/state.json', 'utf8'));
const slots = state.day_slots || {};
const cur = state.current_day || 0;
const days = [];
for (let d = Math.max(1, cur - 8); d <= Math.min(90, cur + 1); d++) days.push(String(d));

async function alive(id) {
  try {
    const r = await fetch(`https://graph.facebook.com/${VER}/${encodeURIComponent(id)}?fields=id&access_token=${encodeURIComponent(TOKEN)}`);
    if (r.status === 200) return true;
    return false;
  } catch (e) { return false; }
}

(async () => {
  console.log(`HEALTH CHECK v1 | current_day=${cur} | checking days ${days[0]}-${days[days.length - 1]}`);
  let problems = 0;

  for (const d of days) {
    const slot = slots[d];
    if (!slot) continue;
    for (const kind of ['image', 'video']) {
      const rec = slot[kind];
      if (!rec || rec.published !== true) continue;
      const res = rec.results || {};
      for (const plat of ['instagram', 'facebook']) {
        const id = res[plat];
        if (!id || id === 'deleted-in-cleanup-oct10') continue; // intentionally deleted
        const ok = await alive(id);
        const flag = rec.ig_delete_pending && plat === 'instagram';
        if (ok) {
          console.log(`  Day ${d} ${kind} ${plat.padEnd(9)} ${id}  LIVE${flag ? '  (pending-manual-delete: burst leftover)' : ''}`);
        } else if (flag) {
          console.log(`  Day ${d} ${kind} ${plat.padEnd(9)} ${id}  GONE  (burst leftover cleaned - OK)`);
        } else {
          console.log(`  Day ${d} ${kind} ${plat.padEnd(9)} ${id}  *** MISSING (expected LIVE!) ***`);
          problems++;
        }
      }
    }
  }

  const pending = days.filter(d => slots[d] && ['image', 'video'].some(k => slots[d][k] && slots[d][k].ig_delete_pending));
  if (pending.length) console.log(`NOTE: IG manual-delete still pending for Day ${pending.join(', ')} reels (user action).`);
  console.log(`HEALTH RESULT: ${problems === 0 ? 'ALL GOOD - every expected post is live' : problems + ' PROBLEM(S) FOUND'}`);
  process.exit(problems === 0 ? 0 : 1);
})();
