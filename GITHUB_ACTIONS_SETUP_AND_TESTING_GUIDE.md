# 🚀 Toolverse 90-Day Automation Engine — GitHub Actions Setup & Testing Guide

Ab aapka complete **90-Day Multi-Platform Automation Engine** GitHub Actions ke liye 100% ready hai!

---

## 🌟 1. Ye Automation Engine Kaise Kaam Karta Hai?

1. **100% Free Forever:** GitHub Actions har mahine **2,000 free minutes** deta hai. Hamara daily post sirf 30 seconds leta hai (mahine ka mushkil se 15 minutes lagega). Zero cost!
2. **24×7 Cloud Execution:** Aapka laptop/PC band bhi rahega tab bhi ye roz automatically run hoga.
3. **Tier-1 Prime Time Schedule:** Har roz **Shaam 7:00 PM IST** (1:30 PM UTC / 9:30 AM New York / 2:30 PM London Peak) par automatically post karega.
4. **Smart State Tracking (`data/state.json`):** 
   - Days 1, 2, aur 3 pehle hi post ho chuke hain, isliye state **Day 3** par set hai.
   - Agla automated post **Day 4** se hi shuru hoga. Koi purana post repeat nahi hoga!
   - Roz post hone ke baad state automatically agle din (`Day 5`, `Day 6`, ... `Day 90`) par update ho jata hai.
5. **Multi-Platform Support:**
   - 📸 **Instagram Business:** `@toolverse.offiicial` (High-Res Images, Carousels, & Video Reels)
   - 📘 **Facebook Page:** `ToolverseOfficial` (Photos & Videos with Direct CTA Links)
   - 💼 **LinkedIn Company & Profile:** `Toolverse Official` (Founder & SaaS B2B audience)

---

## ⚡ 2. Turant Test Kaise Karein Ki Kaam Kar Raha Hai Ya Nahi? (Testing Protocol)

Aap do tarike se abhi test kar sakte hain:

### METHOD A: Local PC Par Instant Test (Terminal se 5 Seconds mein)
Apne terminal ya VS Code mein `toolverse_automation` folder ke andar ye commands chalayein:

1. **Connection & Account Verification Test:**
   ```bash
   npm run test:conn
   ```
   *Ye Meta Graph API ko ping karke Instagram aur Facebook Page ka live connection check karega.*
   
   Output aayega:
   ```text
   ✅ Facebook Page Connected: "ToolverseOfficial" (ID: 1267223409818393)
   ✅ Instagram Account Connected: @toolverse.offiicial (ID: 17841426643619667)
   ✅ State file found: Last published Day 3 -> Next: DAY 4
   ✅ Master 90-day schedule verified: 90 posts loaded.
   ```

2. **Day 4 Post Simulation (Dry Run — Without Posting Live):**
   ```bash
   npm run test:dry
   ```
   *Ye Day 4 ka poora caption, hashtag, media URL load karke preview dikhayega.*

3. **Day 4 Real Post (LIVE Instagram + Facebook):**
   ```bash
   npm run publish:day4
   ```
   *Ye Day 4 ko turant LIVE publish kar dega aur post IDs return karega!*

---

### METHOD B: GitHub Actions Par "Run workflow" Button Se Test Karna (One-Click)

Jab aap code GitHub par push kar denge:

1. Apne GitHub Repo par jaakar **"Actions"** tab par click karein.
2. Left sidebar mein **"Toolverse 90-Day Automation Engine"** par click karein.
3. Right side mein **"Run workflow"** button par click karein:
   - Agar sirf test karna hai: `test_connection` checkbox par tick karein ya `dry_run` par tick karein.
   - Agar real post karna hai: Seedhe **"Run workflow"** green button daba dein!
4. Workflow start ho jayega. Uspe click karke aap **Live Console Logs** dekh sakte hain jahan green checkmarks dikhenge:
   ```text
   📸 [Instagram] Container Created (ID: ...) -> INSTAGRAM PUBLISHED LIVE!
   📘 [Facebook] FACEBOOK PAGE PUBLISHED LIVE! Post ID: ...
   ✅ State updated successfully: last_published_day = 4
   ```
5. Apne Instagram app (`@toolverse.offiicial`) aur Facebook Page par jaakar fresh post verify karein! 🎉

---

## 🛠️ 3. GitHub Repo Setup & Push (Step-by-Step)

Agar aapne GitHub repository nahi banayi hai, to bas 2 minute ka step hai:

### Step 1: GitHub.com par new repo banayein
1. [github.com/new](https://github.com/new) par jaakar repo ka naam rakhein: `toolverse_automation` (Private ya Public).

### Step 2: Terminal se push karein
```bash
cd "c:\Users\Imran ahamad\Desktop\toolverse_automation"
git init
git add .
git commit -m "feat: Toolverse 90-day multi-platform automation engine"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/toolverse_automation.git
git push -u origin main
```

---

## 🔑 4. GitHub Secrets Kaise Dalein (Bas 1 Baar Karna Hai)

1. Apne GitHub Repo mein **Settings** -> **Secrets and variables** -> **Actions** par jayein.
2. **"New repository secret"** button par click karein aur ye Secrets add karein:

| Secret Name | Value | Description |
|---|---|---|
| `META_PAGE_ACCESS_TOKEN` | `YOUR_META_PAGE_ACCESS_TOKEN (Already configured in repo secrets)` | Active Long-lived Meta Token (Valid till Nov 2026) |
| `FACEBOOK_PAGE_ID` | `1267223409818393` | ToolverseOfficial Page ID |
| `INSTAGRAM_ACCOUNT_ID` | `17841426643619667` | @toolverse.offiicial Account ID |
| `LINKEDIN_ACCESS_TOKEN` | *(Optional - apna token dalein)* | LinkedIn auto-publish ke liye |
| `LINKEDIN_ORGANIZATION_ID` | `145223722` | Toolverse Official Organization URN |

*Note: Code ke andar pehle se safe fallbacks configured hain, par repository secrets best security practice hai.*

---

## 📅 5. Schedule & File Structure Summary

```text
toolverse_automation/
├── .github/
│   └── workflows/
│       └── toolverse_daily_publish.yml    # Daily 7:00 PM IST Cron + Manual Trigger
├── data/
│   ├── schedule_90_days.json              # Complete 90-Day Content Database (90 Posts)
│   └── state.json                         # Tracks last published day (Starts at Day 3 -> Day 4)
├── scripts/
│   ├── publish_engine.js                  # Pure Node.js Meta & LinkedIn Multi-Platform Publisher
│   └── build_schedule.js                  # Database Generator
├── Toolverse_57_Tools_And_Brand_Videos/   # 60 Cleaned MP4 Videos (53 Tools + 7 Brand Commercials)
├── Day-1 to Day-14/                       # High-Res Infographics, Carousels, & Video Prompts
├── package.json                           # CLI scripts (npm run test:conn, etc.)
└── .gitignore                             # Clean git repo rules
```

Sab kuch ready aur tested hai!
