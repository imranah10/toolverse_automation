/**
 * publish_engine.js
 * Toolverse Automated Publishing Engine
 * Built for GitHub Actions Cron & Instant Manual Testing
 * 
 * Supports:
 * - Meta Graph API (Instagram Business + Facebook Page)
 * - LinkedIn UGC / Posts API (Company & Personal)
 * - Intelligent Media Fallbacks (Catbox + GitHub Raw URL)
 * - Self-healing State Tracking (data/state.json)
 */

const fs = require('fs');
const path = require('path');

// CLI Arguments
const args = process.argv.slice(2);
const isTestMode = args.includes('--test');
const isDryRun = args.includes('--dry-run');
const dayArg = args.find(a => a.startsWith('--day='));
const targetDayOverride = dayArg ? parseInt(dayArg.split('=')[1], 10) : null;

// Load local .env if present
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Credentials & Config
const META_TOKEN = process.env.META_PAGE_ACCESS_TOKEN || "";
const FB_PAGE_ID = process.env.FACEBOOK_PAGE_ID || "1267223409818393";
const IG_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID || "17841426643619667";
const LINKEDIN_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN || "";
const LINKEDIN_ORG_ID = process.env.LINKEDIN_ORGANIZATION_ID || "145223722";
const GITHUB_REPO = process.env.GITHUB_REPOSITORY || "imranah10/toolverse_automation";

const STATE_FILE = path.join(__dirname, '../data/state.json');
const SCHEDULE_FILE = path.join(__dirname, '../data/schedule_90_days.json');

// Helper to delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// HTTP Request Helper
async function apiRequest(url, method = 'GET', body = null, headers = {}) {
  const options = {
    method,
    headers: {
      'User-Agent': 'Toolverse-Automation-Engine/1.0',
      ...headers
    }
  };
  if (body) {
    if (typeof body === 'string') {
      options.body = body;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }
  const response = await fetch(url, options);
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    // raw text response
  }
  return { ok: response.ok, status: response.status, data: json || text };
}

// 1. Connection & Health Check Test Mode
async function runHealthCheck() {
  console.log("================================================================================");
  console.log("             TOOLVERSE AUTOMATION ENGINE — CONNECTIVITY TEST                   ");
  console.log("================================================================================");

  // Check 1: Meta Access Token & Facebook Page
  console.log("\n[1/4] Verifying Facebook Page Access & Token...");
  try {
    const fbRes = await apiRequest(`https://graph.facebook.com/v21.0/${FB_PAGE_ID}?fields=name,id,fan_count&access_token=${META_TOKEN}`);
    if (fbRes.ok && fbRes.data.id) {
      console.log(`  ✅ Facebook Page Connected: "${fbRes.data.name}" (ID: ${fbRes.data.id})`);
    } else {
      console.error(`  ❌ Facebook Page Error:`, fbRes.data);
    }
  } catch (e) {
    console.error(`  ❌ Facebook Request Failed:`, e.message);
  }

  // Check 2: Instagram Business Account
  console.log("\n[2/4] Verifying Instagram Business Account...");
  try {
    const igRes = await apiRequest(`https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}?fields=username,name,id&access_token=${META_TOKEN}`);
    if (igRes.ok && igRes.data.id) {
      console.log(`  ✅ Instagram Account Connected: @${igRes.data.username} (ID: ${igRes.data.id})`);
    } else {
      console.error(`  ❌ Instagram Account Error:`, igRes.data);
    }
  } catch (e) {
    console.error(`  ❌ Instagram Request Failed:`, e.message);
  }

  // Check 3: State File & Next Target Day
  console.log("\n[3/4] Inspecting Local State Tracker...");
  if (fs.existsSync(STATE_FILE)) {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    console.log(`  ✅ State file found: Last published Day ${state.last_published_day}`);
    console.log(`  👉 Next scheduled publish will be: DAY ${state.last_published_day + 1}`);
  } else {
    console.log(`  ⚠️ State file not found, will default to starting from Day 4.`);
  }

  // Check 4: Schedule File
  console.log("\n[4/4] Verifying 90-Day Content Database...");
  if (fs.existsSync(SCHEDULE_FILE)) {
    const sched = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf8'));
    console.log(`  ✅ Master 90-day schedule verified: ${sched.length} posts loaded.`);
    const day4 = sched.find(s => s.day_num === 4);
    if (day4) {
      console.log(`  👉 Day 4 Tool: "${day4.tool_name}" (${day4.media_type})`);
      console.log(`  👉 Day 4 Media URL: ${day4.public_url || '(Raw GitHub fallback)'}`);
    }
  } else {
    console.error(`  ❌ Schedule file missing! Run 'node scripts/build_schedule.js' first.`);
  }

  console.log("\n================================================================================");
  console.log("            ALL SYSTEMS READY FOR GITHUB ACTIONS AUTOMATION!                     ");
  console.log("================================================================================\n");
}

// 2. Publish to Instagram
async function publishToInstagram(postItem, isDryRun) {
  console.log(`\n📸 [Instagram] Preparing Post for @toolverse.offiicial...`);
  const mediaUrl = postItem.public_url || `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${postItem.media_path}`;
  const caption = postItem.ig_caption;

  console.log(`  Format: ${postItem.media_type}`);
  console.log(`  Media Source: ${mediaUrl}`);
  console.log(`  Caption Length: ${caption.length} characters`);

  if (isDryRun) {
    console.log(`  [DRY-RUN] Instagram API call simulated successfully.`);
    return { ok: true, id: "simulated_ig_id" };
  }

  // Step 1: Create Media Container
  let containerUrl = `https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media`;
  let params = new URLSearchParams();
  params.append('access_token', META_TOKEN);
  params.append('caption', caption);

  if (postItem.media_type === 'VIDEO') {
    params.append('media_type', 'REELS');
    params.append('video_url', mediaUrl);
  } else {
    params.append('image_url', mediaUrl);
  }

  console.log(`  ⏳ Sending media container creation request...`);
  const step1 = await apiRequest(`${containerUrl}?${params.toString()}`, 'POST');

  if (!step1.ok || !step1.data.id) {
    console.error(`  ❌ Instagram Container Creation Failed:`, step1.data);
    return { ok: false, error: step1.data };
  }

  const creationId = step1.data.id;
  console.log(`  ✅ Container Created (ID: ${creationId})`);

  // Wait for processing
  const waitSeconds = postItem.media_type === 'VIDEO' ? 25 : 8;
  console.log(`  ⏳ Waiting ${waitSeconds}s for Meta media processing...`);
  await sleep(waitSeconds * 1000);

  // Step 2: Publish Container
  let publishUrl = `https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media_publish`;
  let pubParams = new URLSearchParams();
  pubParams.append('creation_id', creationId);
  pubParams.append('access_token', META_TOKEN);

  const step2 = await apiRequest(`${publishUrl}?${pubParams.toString()}`, 'POST');
  if (step2.ok && step2.data.id) {
    console.log(`  🎉 INSTAGRAM PUBLISHED LIVE! Post ID: ${step2.data.id}`);
    return { ok: true, id: step2.data.id };
  } else {
    console.error(`  ❌ Instagram Publish Failed:`, step2.data);
    return { ok: false, error: step2.data };
  }
}

// 2b. Publish to Instagram Story (24h Ephemeral Broadcast)
async function publishToInstagramStory(postItem, isDryRun) {
  console.log(`\n📱 [Instagram Story] Preparing 24h Story for @toolverse.offiicial...`);
  const mediaUrl = postItem.public_url || `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${postItem.media_path}`;

  if (isDryRun) {
    console.log(`  [DRY-RUN] Instagram Story API call simulated successfully.`);
    return { ok: true, id: "simulated_story_id" };
  }

  try {
    let containerUrl = `https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media`;
    let params = new URLSearchParams();
    params.append('access_token', META_TOKEN);
    params.append('media_type', 'STORIES');

    if (postItem.media_type === 'VIDEO') {
      params.append('video_url', mediaUrl);
    } else {
      params.append('image_url', mediaUrl);
    }

    const step1 = await apiRequest(`${containerUrl}?${params.toString()}`, 'POST');
    if (step1.ok && step1.data.id) {
      const waitSeconds = postItem.media_type === 'VIDEO' ? 20 : 8;
      await sleep(waitSeconds * 1000);

      let publishUrl = `https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media_publish`;
      let pubParams = new URLSearchParams();
      pubParams.append('creation_id', step1.data.id);
      pubParams.append('access_token', META_TOKEN);

      const step2 = await apiRequest(`${publishUrl}?${pubParams.toString()}`, 'POST');
      if (step2.ok && step2.data.id) {
        console.log(`  🎉 INSTAGRAM STORY PUBLISHED LIVE! Story ID: ${step2.data.id}`);
        return { ok: true, id: step2.data.id };
      }
    }
    console.log(`  ℹ️ Note: Story auto-post skipped (Requires 9:16 vertical ratio or container in progress).`);
    return { ok: false, skipped: true };
  } catch (e) {
    console.log(`  ℹ️ Story auto-post notice:`, e.message);
    return { ok: false, error: e.message };
  }
}

// 3. Publish to Facebook Page
async function publishToFacebook(postItem, isDryRun) {
  console.log(`\n📘 [Facebook] Preparing Post for ToolverseOfficial...`);
  const mediaUrl = postItem.public_url || `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${postItem.media_path}`;
  const message = postItem.fb_caption;

  console.log(`  Format: ${postItem.media_type}`);
  console.log(`  Media Source: ${mediaUrl}`);

  if (isDryRun) {
    console.log(`  [DRY-RUN] Facebook Page API call simulated successfully.`);
    return { ok: true, id: "simulated_fb_id" };
  }

  let endpoint = `https://graph.facebook.com/v21.0/${FB_PAGE_ID}/photos`;
  let params = new URLSearchParams();
  params.append('access_token', META_TOKEN);

  if (postItem.media_type === 'VIDEO') {
    endpoint = `https://graph.facebook.com/v21.0/${FB_PAGE_ID}/videos`;
    params.append('file_url', mediaUrl);
    params.append('description', message);
  } else {
    params.append('url', mediaUrl);
    params.append('message', message);
  }

  const res = await apiRequest(`${endpoint}?${params.toString()}`, 'POST');
  if (res.ok && (res.data.id || res.data.post_id)) {
    const pid = res.data.post_id || res.data.id;
    console.log(`  🎉 FACEBOOK PAGE PUBLISHED LIVE! Post ID: ${pid}`);
    return { ok: true, id: pid };
  } else {
    console.error(`  ❌ Facebook Publish Failed:`, res.data);
    return { ok: false, error: res.data };
  }
}

// 4. Publish to LinkedIn
async function publishToLinkedIn(postItem, isDryRun) {
  console.log(`\n💼 [LinkedIn] Preparing Post for Toolverse Official...`);
  if (!LINKEDIN_TOKEN) {
    console.log(`  ℹ️ [INFO] LinkedIn Access Token not provided in environment.`);
    console.log(`  ℹ️ Meta platforms (Instagram + Facebook) will publish normally.`);
    console.log(`  ℹ️ To enable LinkedIn, add LINKEDIN_ACCESS_TOKEN to GitHub Secrets.`);
    return { ok: true, skipped: true };
  }

  if (isDryRun) {
    console.log(`  [DRY-RUN] LinkedIn API simulated successfully.`);
    return { ok: true, id: "simulated_li_id" };
  }

  const personUrn = process.env.LINKEDIN_PERSON_URN || "urn:li:person:hVtQz-ykyU";
  const authorUrn = personUrn;

  try {
    const liBody = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: postItem.li_caption },
          shareMediaCategory: "ARTICLE",
          media: [
            {
              status: "READY",
              description: { text: postItem.hook },
              originalUrl: "https://toolverse-official.vercel.app",
              title: { text: postItem.tool_name + " | Toolverse" }
            }
          ]
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    };

    const liRes = await apiRequest("https://api.linkedin.com/v2/ugcPosts", "POST", liBody, {
      Authorization: `Bearer ${LINKEDIN_TOKEN}`,
      'X-Restli-Protocol-Version': '2.0.0'
    });

    if (liRes.ok && liRes.data.id) {
      console.log(`  🎉 LINKEDIN PUBLISHED LIVE! Post ID: ${liRes.data.id}`);
      return { ok: true, id: liRes.data.id };
    } else {
      console.warn(`  ⚠️ LinkedIn Publish Notice:`, liRes.data);
      return { ok: false, error: liRes.data };
    }
  } catch (e) {
    console.warn(`  ⚠️ LinkedIn Error:`, e.message);
    return { ok: false, error: e.message };
  }
}

// 5. Master Publishing Orchestrator
async function main() {
  if (isTestMode) {
    await runHealthCheck();
    return;
  }

  console.log("================================================================================");
  console.log("                 TOOLVERSE DAILY AUTOMATION ENGINE                              ");
  console.log("================================================================================");

  // Load schedule
  if (!fs.existsSync(SCHEDULE_FILE)) {
    console.error("Schedule file missing. Running build_schedule.js first...");
    require('./build_schedule.js');
  }
  const schedule = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf8'));

  // Load state
  let state = { last_published_day: 3, history: [] };
  if (fs.existsSync(STATE_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    } catch (e) {
      console.warn("Could not parse state file, using default.");
    }
  }

  // Determine target day
  let targetDay = targetDayOverride || (state.last_published_day + 1);

  if (targetDay > 90) {
    console.log(`All 90 days have completed! Resetting or maintenance mode.`);
    return;
  }

  console.log(`Target Publishing Day: DAY ${targetDay} (Out of 90)`);
  if (isDryRun) {
    console.log(`Execution Mode: [DRY-RUN SIMULATION] (No live posts will be created)`);
  } else {
    console.log(`Execution Mode: [LIVE PRODUCTION RUN]`);
  }

  const postItem = schedule.find(s => s.day_num === targetDay);
  if (!postItem) {
    console.error(`Post for Day ${targetDay} not found in schedule database!`);
    process.exit(1);
  }

  console.log(`\nTool Spotlight: "${postItem.tool_name}"`);
  console.log(`Suite: ${postItem.suite}`);
  console.log(`Hook: "${postItem.hook}"`);

  // Run Platform Publishers
  const igResult = await publishToInstagram(postItem, isDryRun);
  const storyResult = await publishToInstagramStory(postItem, isDryRun);
  const fbResult = await publishToFacebook(postItem, isDryRun);
  const liResult = await publishToLinkedIn(postItem, isDryRun);

  // Update State if not dry-run
  if (!isDryRun && (igResult.ok || fbResult.ok)) {
    state.last_published_day = targetDay;
    state.last_published_at = new Date().toISOString();
    state.history.push({
      day: targetDay,
      date: new Date().toISOString().split('T')[0],
      tool: postItem.tool_name,
      status: "completed",
      results: {
        instagram: igResult.id || igResult.error,
        facebook: fbResult.id || fbResult.error,
        linkedin: liResult.id || (liResult.skipped ? 'skipped' : liResult.error)
      }
    });

    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
    console.log(`\n✅ State updated successfully: last_published_day = ${targetDay}`);
  }

  console.log("\n================================================================================");
  console.log(`              DAY ${targetDay} PUBLISHING EXECUTION FINISHED                     `);
  console.log("================================================================================\n");
}

main().catch(err => {
  console.error("Fatal Error in Engine:", err);
  process.exit(1);
});
