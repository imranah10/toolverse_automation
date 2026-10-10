/**
 * delete_posts.js - Maintenance tool: delete published posts from platforms.
 * Used to clean up the accidental overnight burst (Oct 9-10, 2026).
 *
 * Env:
 *   META_PAGE_ACCESS_TOKEN  (required - same token used for publishing)
 *   IG_MEDIA_IDS            comma-separated IG media ids to delete
 *   FB_POST_IDS             comma-separated FB page post/video ids to delete
 *
 * Exit 0 if every id deleted (or already gone). Exit 1 if any hard failure.
 */
const IG_IDS = (process.env.IG_MEDIA_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const FB_IDS = (process.env.FB_POST_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
const VER = 'v21.0';

if (!TOKEN) {
  console.error('❌ META_PAGE_ACCESS_TOKEN missing');
  process.exit(1);
}
if (!IG_IDS.length && !FB_IDS.length) {
  console.log('ℹ️ No ids supplied - nothing to delete.');
  process.exit(0);
}

async function del(id) {
  const url = `https://graph.facebook.com/${VER}/${encodeURIComponent(id)}?access_token=${encodeURIComponent(TOKEN)}`;
  try {
    const r = await fetch(url, { method: 'DELETE' });
    let body = {};
    try { body = await r.json(); } catch (_) { body = { raw: 'non-json' }; }
    return { status: r.status, body };
  } catch (e) {
    return { status: 0, body: { error: { message: e.message } } };
  }
}

function ok(res) {
  if (res.status === 200 && res.body && res.body.success === true) return 'DELETED';
  // Already deleted / not found = treat as done (idempotent)
  const msg = (res.body && res.body.error && res.body.error.message) || '';
  if (res.status === 404 || /does not exist|not found|has been deleted|unsupported delete/i.test(msg)) return 'ALREADY-GONE';
  return 'FAIL';
}

(async () => {
  console.log(`🧹 Toolverse post cleanup - ${IG_IDS.length} IG media + ${FB_IDS.length} FB posts`);
  let fail = 0, done = 0;

  for (const id of IG_IDS) {
    const res = await del(id);
    const verdict = ok(res);
    console.log(`  [IG ${id}] ${verdict}  http=${res.status} ${JSON.stringify(res.body).slice(0, 160)}`);
    if (verdict === 'FAIL') fail++;
    else done++;
  }
  for (const id of FB_IDS) {
    const res = await del(id);
    const verdict = ok(res);
    console.log(`  [FB ${id}] ${verdict}  http=${res.status} ${JSON.stringify(res.body).slice(0, 160)}`);
    if (verdict === 'FAIL') fail++;
    else done++;
  }

  console.log(`\n📊 Cleanup result: ${done} removed/cleared, ${fail} failed`);
  if (fail > 0) {
    console.error(`❌ ${fail} ids could NOT be deleted - inspect above and re-run.`);
    process.exit(1);
  }
  console.log('✅ Cleanup complete.');
})();
