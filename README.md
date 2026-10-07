# 🚀 Toolverse 90-Day Automation Engine

**Toolverse** (https://toolverse-official.vercel.app) ke 90-din ke social media campaign ka **fully automatic posting engine** — Instagram, Facebook aur LinkedIn par rozana 2 posts (Image + Video Reel), bina kisi server ke, 100% free GitHub Actions par.

---

## ✨ Features

- **90 din ka ready-made content calendar** — captions, hashtags, images, videos sab included
- **Daily 2 slots (IST):**
  - 🌆 **7:00 PM** — High-Res Image post (IG + FB + LinkedIn)
  - 🌙 **11:00 PM** — Viral Video Reel (IG Reels + FB Video)
- **Multi-platform:** Instagram Business, Facebook Page, LinkedIn
- **Zero server cost:** GitHub Actions free tier par chalta hai
- **Fail-safe:** Koi slot fail ho to retry crons chalte hain; engine kabhi rukta nahi (anti-stuck guard)
- **Smart state tracking:** Kaunsa day publish hua, `data/state.json` me automatically save hota hai — koi post repeat nahi hota

## 🎬 Video System

Videos GitHub Releases CDN par hosted hain (`v1.0-assets` release). Engine har day ka video `data/video_cloud_urls.json` map se ya direct CDN URL se fetch karke Instagram/Facebook par upload karta hai.

## 📁 Structure

```text
├── .github/workflows/toolverse_daily_publish.yml   # Daily cron engine
├── data/
│   ├── schedule_90_days.json    # 90-day content database (90 posts)
│   ├── video_cloud_urls.json    # Video CDN map
│   └── state.json               # Publish tracking
├── scripts/
│   └── publish_engine.js        # Multi-platform publisher (Node.js)
├── Toolverse_57_Tools_And_Brand_Videos/   # 60 MP4 videos (source folders)
└── Day-1 ... Day-14/            # Infographics, carousels, prompts
```

## ⚙️ Setup (1 baar)

1. Repo **Settings → Secrets and variables → Actions** me ye secrets dalein:
   - `META_PAGE_ACCESS_TOKEN`, `FACEBOOK_PAGE_ID`, `INSTAGRAM_ACCOUNT_ID`, `LINKEDIN_ACCESS_TOKEN` (optional), `LINKEDIN_ORGANIZATION_ID`
   - ⚠️ Token/IDs ki values sirf Secrets me rakhein — kisi file me likhein nahi.
2. Bas. Crons automatically roz chalenge.

## 🧪 Manual Test

Repo ke **Actions** tab → **Toolverse 90-Day Automation Engine** → **Run workflow**:
- `dry_run` ✅ = bina post kiye preview
- `test_connection` ✅ = accounts health check
- Kuch tick mat karo = real post turant

## 🔗 Links

- 🌐 Website: https://toolverse-official.vercel.app
- 📸 Instagram: https://instagram.com/toolverse.offiicial
- 📘 Facebook: https://facebook.com/ToolverseOfficial
- 💼 LinkedIn: Toolverse Official
