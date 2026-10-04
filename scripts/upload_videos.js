/**
 * upload_videos.js
 * Automatically uploads MP4 videos to GitHub Releases CDN
 * and generates data/video_cloud_urls.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
const RELEASE_ID = process.env.RELEASE_ID || '402588972';

async function main() {
  console.log('Fetching existing assets from GitHub Release...');
  const res = await fetch(`https://api.github.com/repos/imranah10/toolverse_automation/releases/${RELEASE_ID}/assets`, {
    headers: {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'Node'
    }
  });
  const currentAssets = await res.json();
  const assetMap = {};
  if (Array.isArray(currentAssets)) {
    currentAssets.forEach(a => {
      assetMap[a.name] = a.browser_download_url;
    });
  }
  console.log(`Already uploaded assets: ${Object.keys(assetMap).length}`);

  const tDir = path.join(__dirname, '../Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders');
  const bDir = path.join(__dirname, '../Toolverse_57_Tools_And_Brand_Videos/02_Brand_Marketing_07_Folders');

  function scan(dir, isBrand = false) {
    if (!fs.existsSync(dir)) return [];
    const folders = fs.readdirSync(dir);
    const list = [];
    for (const f of folders) {
      const full = path.join(dir, f);
      if (!fs.statSync(full).isDirectory()) continue;
      const files = fs.readdirSync(full);
      const mp4 = files.find(x => x.endsWith('.mp4'));
      if (mp4) {
        list.push({
          folder: f,
          name: f.replace(/^\d+_/, '').replace(/_/g, ' '),
          file: path.join(full, mp4),
          filename: mp4,
          isBrand
        });
      }
    }
    return list;
  }

  const allVideos = [...scan(tDir), ...scan(bDir, true)];
  console.log(`Found ${allVideos.length} total videos on local disk.`);

  let uploadedCount = 0;
  // Upload in manageable batches (e.g. 10 at a time)
  for (const v of allVideos) {
    const safeName = (v.folder.toLowerCase().replace(/[^a-z0-9_]/g, '_') + '.mp4').replace(/_+/g, '_');
    
    if (assetMap[safeName]) {
      v.cloudUrl = assetMap[safeName];
      continue;
    }

    if (uploadedCount >= 10) {
      console.log(`Batch limit of 10 reached for this step. Continuing...`);
      break;
    }

    console.log(`[${uploadedCount + 1}] Uploading ${safeName}... (${(fs.statSync(v.file).size / (1024*1024)).toFixed(2)} MB)`);
    try {
      const cmd = `curl.exe -s -X POST -H "Authorization: token ${TOKEN}" -H "Content-Type: video/mp4" --data-binary "@${v.file}" "https://uploads.github.com/repos/imranah10/toolverse_automation/releases/${RELEASE_ID}/assets?name=${safeName}"`;
      const out = execSync(cmd).toString();
      const parsed = JSON.parse(out);
      if (parsed.browser_download_url) {
        assetMap[safeName] = parsed.browser_download_url;
        console.log(`  ✅ Done: ${parsed.browser_download_url}`);
        uploadedCount++;
      } else {
        console.log(`  ⚠️ Notice:`, parsed.message || parsed);
      }
    } catch (e) {
      console.error(`  ❌ Failed:`, e.message);
    }
  }

  const outMapPath = path.join(__dirname, '../data/video_cloud_urls.json');
  fs.writeFileSync(outMapPath, JSON.stringify(assetMap, null, 2), 'utf8');
  console.log(`Updated ${outMapPath} with ${Object.keys(assetMap).length} URLs.`);
}

main().catch(console.error);
