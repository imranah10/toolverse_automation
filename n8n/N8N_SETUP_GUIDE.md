# 🚀 Toolverse 10-Day `n8n` Complete Automation Guide

Aapki ready-to-import **`n8n` Workflow File** yahan taiyaar hai:
👉 **[`toolverse_n8n_workflow.json`](file:///c:/Users/Imran%20ahamad/Desktop/toolverse_automation/toolverse_n8n_workflow.json)**

Is single `.json` file ke andar aapke **`Day-1` se `Day-10` ke poore 40 Posts (Instagram, LinkedIn, Twitter/X, aur Anti-Ban Reddit)** pehle se embedded hain!

---

## 1. Kya Instagram Auto-Post Ke Liye Facebook Page Banana Padega?
**Haan (100% Zaroori Hai).**  
Meta (Instagram) ki Official API ka rule hai ki koi bhi automation (`n8n`, Make, Zapier, Buffer) Personal Instagram account par post nahi kar sakta. Aapko ye **2 minute ka free setup** karna hoga:
1. Apne Instagram App mein **`Settings` -> `Account type and tools` -> `Switch to professional account`** (`Creator` ya `Business`) karein *(100% Free hai)*.
2. Apne Facebook account se ek simple **Facebook Page** (`Toolverse` naam se) banayein.
3. Instagram settings mein **`Linked Accounts` / `Page`** mein jaakar us Facebook Page ko Instagram se **Connect** kar dein.
4. Iske baad [Meta for Developers (developers.facebook.com)](https://developers.facebook.com/) se aapko `IG_BUSINESS_ACCOUNT_ID` aur `IG_ACCESS_TOKEN` mil jayega jo `n8n` ke Instagram node mein dalta hai.

---

## 2. Reddit Par Post Block / Ban Kyun Hota Hai Aur Humne Kya Fix Kiya Hai?
Reddit ke `AutoModerator` bots aapki post ko turant block kar dete hain agar:
* ❌ Post mein `#Hashtags` lage hon (`#Toolverse` wagairah Reddit par spam maana jata hai).
* ❌ Title sales/marketing jaisa ho (*"Best free tool! Click now!"*).
* ❌ Sirf promotional photo + link daal diya gaya ho bina technical explanation ke.

### ✅ Humne Aapke Sabhi 10 Days (`Day-1` to `Day-10`) Ke Reddit Posts Mein Kya Kiya Hai:
1. **`r/SideProject` / Developer Maker Format:** Sabhi 10 Reddit posts ([Day-1/Reddit_Mind_Reader/image/post_ready_to_publish.txt](file:///c:/Users/Imran%20ahamad/Desktop/toolverse_automation/Day-1/Reddit_Mind_Reader/image/post_ready_to_publish.txt) se `Day-10` tak) aur `n8n` ke **`Reddit: Publish Anti-Ban Maker Post`** node ko **Humble Developer / Open-Feedback Self-Post Format** mein rewrite kar diya gaya hai.
2. **Zero Hashtags:** Sabhi Reddit posts se `#Hashtags` 100% hata diye gaye hain.
3. **Subreddit Selection:** Har post ko sabse safe subreddit **`r/SideProject`** (aur backup `r/webdev`, `r/indiehackers`, `r/productivity`) ke rules ke hisaab se set kiya gaya hai jahan "I built this client-side tool, looking for feedback" posts allow hote hain aur block nahi hote!

---

## 3. `n8n` Kaise Chalu Karein Aur Workflow Kaise Import Karein? (Step-by-Step)

### Option A: Agar Aap Chahte Hain Ki Laptop Band (OFF) Rehne Par Bhi 10 Din Tak Chale (24×7 Cloud)
1. **[n8n.io](https://n8n.io/)** (14-Day Free Cloud Trial — aapka 10-day plan poora free trial mein hi nikal jayega!) ya **Render / Railway Free n8n Hosting** par account banayein.
2. Apne `n8n` dashboard mein **`Add Workflow` -> `...` (Top Right Menu) -> `Import from File...`** par click karein.
3. Apne computer se **[`toolverse_n8n_workflow.json`](file:///c:/Users/Imran%20ahamad/Desktop/toolverse_automation/toolverse_n8n_workflow.json)** select karein.

### Option B: Agar Apne Computer Par Free `n8n` Chalana Hai
Terminal/PowerShell mein bas ye command chalayein:
```powershell
npx n8n
```
Phir `http://localhost:5678` khol kar **`Import from File...`** se `toolverse_n8n_workflow.json` import kar lein.

---

## 4. `n8n` Import Karne Ke Baad Bas Ye 4 Credentials Connect Karein:
Workflow import hote hi aapko screen par **5 Nodes** dikhenge:
1. **`1. Daily Schedule (9AM, 1PM, 6:30PM, 8PM)`** — Ye apne aap roz 4 baar trigger hoga.
2. **`2. 10-Day Content Engine (All 40 Posts Included)`** — Iske andar aapke `Day-1` se `Day-10` ke saare 40 posts ka Title, Caption, aur Image Path pehle se bhara hua hai! Ye khud `Day-1` se shuru karke roz agle din (`Day-2`, `Day-3`... `Day-10`) par badhta jayega.
3. **Platform Nodes Par Double-Click Karke Account Connect Karein:**
   * **LinkedIn Node:** Double click karein -> `Create New Credential` -> Sign in with LinkedIn.
   * **Twitter / X Node:** Double click karein -> `Create New Credential` -> `developer.x.com` se Free API Key & Secret dalein.
   * **Reddit Node:** Double click karein -> `Create New Credential` -> `reddit.com/prefs/apps` par `script` app banakar `Client ID` aur `Client Secret` dalein.
   * **Instagram Node:** Apna `IG_BUSINESS_ACCOUNT_ID` aur `IG_ACCESS_TOKEN` dalein.
4. Upar Right Corner mein **`Active` (Toggle ON)** kar dein! Done! 🎉
