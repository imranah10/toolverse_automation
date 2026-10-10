/**
 * ig_probe.js - READ-ONLY: fetch permalink + caption for IG media ids (no writes).
 * Env: META_PAGE_ACCESS_TOKEN, IG_MEDIA_IDS (comma-separated)
 */
const IDS = (process.env.IG_MEDIA_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
const VER = 'v21.0';

if (!TOKEN) { console.error('META_PAGE_ACCESS_TOKEN missing'); process.exit(1); }

(async () => {
  console.log(`Probing ${IDS.length} IG media ids (read-only)...`);
  for (const id of IDS) {
    const url = `https://graph.facebook.com/${VER}/${id}?fields=permalink,caption,media_type,timestamp&access_token=${encodeURIComponent(TOKEN)}`;
    try {
      const r = await fetch(url);
      const j = await r.json();
      const cap = (j.caption || '').replace(/\s+/g, ' ').slice(0, 80);
      console.log(`PROBE ${id} :: http=${r.status} permalink=${j.permalink || 'N/A'} type=${j.media_type || 'N/A'} ts=${j.timestamp || 'N/A'} caption="${cap}"`);
    } catch (e) {
      console.log(`PROBE ${id} :: ERROR ${e.message}`);
    }
  }
  console.log('Probe done.');
})();
