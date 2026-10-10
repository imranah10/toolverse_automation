/**
 * fb_probe.js - READ-ONLY FB audit: verify deleted burst videos are gone + list everything on the Page since Oct 9.
 * Env: META_PAGE_ACCESS_TOKEN
 */
const TOKEN = process.env.META_PAGE_ACCESS_TOKEN;
const PAGE = '1267223409818393';
const VER = 'v21.0';

if (!TOKEN) { console.error('META_PAGE_ACCESS_TOKEN missing'); process.exit(1); }

async function g(path) {
  const url = `https://graph.facebook.com/${VER}/${path}&access_token=${encodeURIComponent(TOKEN)}`;
  try {
    const r = await fetch(url);
    let j; try { j = await r.json(); } catch (e) { j = { raw: 'nonjson' }; }
    return { status: r.status, j };
  } catch (e) { return { status: 0, j: { error: { message: e.message } } }; }
}

(async () => {
  console.log('=== 1) BURST VIDEOS (should be GONE) ===');
  const DEL = ['1063297016520183','2164446390774154','1046319361759225','1712522264215170','977252532089504','1442080127989168'];
  for (const id of DEL) {
    const { status, j } = await g(`${id}?fields=id,created_time`);
    const err = j && j.error ? (j.error.code + ' ' + (j.error.message || '').slice(0, 80)) : '';
    console.log(`DELCHK ${id} :: http=${status} ${j && j.id ? 'STILL-EXISTS!!' : 'gone'} ${err}`);
  }

  console.log('=== 2) KEEP posts (Day 14 + Day 15 should be LIVE) ===');
  for (const id of ['1089098700494686', '1686893719568566']) {
    const { status, j } = await g(`${id}?fields=id,created_time,permalink_url`);
    console.log(`KEEPCHK ${id} :: http=${status} ${JSON.stringify(j).slice(0, 200)}`);
  }

  console.log('=== 3) PAGE VIDEOS since Oct 9 ===');
  let { status, j } = await g(`${PAGE}/videos?fields=id,created_time,permalink_url,description&limit=50&since=2026-10-08T00:00:00Z`);
  console.log(`videos http=${status} :: ${JSON.stringify(j).slice(0, 2500)}`);

  console.log('=== 4) PAGE REELS edge ===');
  ({ status, j } = await g(`${PAGE}/video_reels?fields=id,created_time,permalink_url,description&limit=50`));
  console.log(`video_reels http=${status} :: ${JSON.stringify(j).slice(0, 2500)}`);

  console.log('=== 5) PAGE POSTS since Oct 9 ===');
  ({ status, j } = await g(`${PAGE}/posts?fields=id,created_time,permalink_url,message&limit=50&since=2026-10-08T00:00:00Z`));
  const posts = (j.data || []).map(p => ({ id: p.id, t: p.created_time, u: p.permalink_url, m: (p.message || '').replace(/\s+/g, ' ').slice(0, 60) }));
  console.log(`posts http=${status} count=${posts.length}`);
  for (const p of posts) console.log(`  POST ${p.id} ${p.t} ${p.u} "${p.m}"`);
  console.log('Probe done.');
})();
