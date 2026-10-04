/**
 * upload_week2_videos.js
 * Uploads Day 9 to Day 14 videos to GitHub Releases CDN
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
const RELEASE_ID = process.env.RELEASE_ID || '402588972';
const MAP_PATH = path.join(__dirname, '../data/video_cloud_urls.json');

const map = fs.existsSync(MAP_PATH) ? JSON.parse(fs.readFileSync(MAP_PATH, 'utf8')) : {};

const targets = [
  { key: '33_design_and_css.mp4', file: path.join(__dirname, '../Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/33_Design_And_CSS/video (37)-cleaned.mp4') },
  { key: '37_vision_switch.mp4', file: path.join(__dirname, '../Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/37_Vision_Switch/Toolverse_Vision_Switch_product 20260930213255-cleaned.mp4') },
  { key: '41_watermark_eraser.mp4', file: path.join(__dirname, '../Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/41_Watermark_Eraser/Toolverse_Watermark_Eraser_remo-cleaned.mp4') },
  { key: '45_ai_hd_boost.mp4', file: path.join(__dirname, '../Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/45_AI_HD_Boost/Toolverse_AI_HD_Boost_showcase_20260930221247-cleaned.mp4') },
  { key: '53_color_palette_generator.mp4', file: path.join(__dirname, '../Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/53_Color_Palette_Generator/Extracting_colors_from_images_1080p_20260930231951-cleaned.mp4') },
  { key: '54_art_converters.mp4', file: path.join(__dirname, '../Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/54_Art_Converters/Transform_photos_into_pixel_art_20260930233103-cleaned.mp4') }
];

for (const t of targets) {
  if (map[t.key]) {
    console.log(`Already mapped: ${t.key}`);
    continue;
  }
  if (!fs.existsSync(t.file)) {
    console.warn(`File not found: ${t.file}`);
    continue;
  }
  console.log(`Uploading: ${t.key} (${(fs.statSync(t.file).size / (1024*1024)).toFixed(2)} MB)...`);
  try {
    const cmd = `curl.exe -4 -s -X POST -H "Authorization: token ${TOKEN}" -H "Content-Type: video/mp4" --data-binary "@${t.file}" "https://uploads.github.com/repos/imranah10/toolverse_automation/releases/${RELEASE_ID}/assets?name=${t.key}"`;
    const out = execSync(cmd).toString();
    const p = JSON.parse(out);
    if (p.browser_download_url) {
      map[t.key] = p.browser_download_url;
      console.log(`  ✅ Done: ${p.browser_download_url}`);
    } else {
      console.log(`  Notice:`, p.message || p);
    }
  } catch (e) {
    console.error(`  ❌ Failed:`, e.message);
  }
}

fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 2), 'utf8');
console.log(`Updated video_cloud_urls.json. Total entries: ${Object.keys(map).length}`);
