const fs = require("fs");
const path = require("path");

const META_TOKEN = process.env.META_PAGE_ACCESS_TOKEN || "";
const FB_PAGE_ID = process.env.FACEBOOK_PAGE_ID || "1267223409818393";
const IG_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID || "17841426643619667";
const LI_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN || "";
const LI_ORG_ID = process.env.LINKEDIN_ORGANIZATION_ID || "145223722";
const LI_PERSON_URN = process.env.LINKEDIN_PERSON_URN || "";

const SCHED_FILE = path.join(__dirname, "..", "data", "schedule_90_days.json");
const STATE_FILE = path.join(__dirname, "..", "data", "state.json");

async function main() {
  const schedule = JSON.parse(fs.readFileSync(SCHED_FILE, "utf8"));
  const state = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) : { current_day: 1, history: [] };
  const args = process.argv.slice(2);
  const dayArg = args.find(a => a.startsWith("--day="));
  const targetDay = dayArg ? parseInt(dayArg.split("=")[1], 10) : (state.current_day || 1);
  const item = schedule.find(x => x.day_num === targetDay) || schedule[0];

  console.log(`Publishing Day ${item.day_num}: ${item.tool_name} (${item.suite})`);
  console.log(`4K PNG URL: ${item.public_url}`);
  console.log(`Tool Link in Copy: ${item.tool_url_in_content}`);

  if (META_TOKEN) {
    // Instagram 4K PNG Post
    const igCreate = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: item.public_url, caption: item.ig_caption, access_token: META_TOKEN })
    }).then(r => r.json());
    if (igCreate.id) {
      await new Promise(r => setTimeout(r, 5000));
      const igPub = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creation_id: igCreate.id, access_token: META_TOKEN })
      }).then(r => r.json());
      console.log("Instagram Published:", igPub);
    }

    // Facebook Page 4K PNG Post
    const fbPub = await fetch(`https://graph.facebook.com/v21.0/${FB_PAGE_ID}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: item.public_url, caption: item.fb_caption, access_token: META_TOKEN })
    }).then(r => r.json());
    console.log("Facebook Published:", fbPub);
  }

  state.current_day = targetDay < 90 ? targetDay + 1 : 1;
  state.last_published_date = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}
main();
