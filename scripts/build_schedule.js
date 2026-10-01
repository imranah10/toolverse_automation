/**
 * build_schedule.js
 * Compiles the 90-day Toolverse Master Content Schedule into data/schedule_90_days.json
 * Combines:
 * - Days 4 to 14 from Day-* folders (High-Res Infographics + Carousels + Video prompts)
 * - Days 15 to 90 from 53 Tool Video Demos + 7 Cinematic Brand Commercials
 * - Tier-1 High-CPC Hashtags & Global Formatting
 */

const fs = require('fs');
const path = require('path');

// Extract cloud mapping from n8n workflow
let cloudMap = {};
try {
  const n8n = JSON.parse(fs.readFileSync(path.join(__dirname, '../n8n/toolverse_n8n_workflow.json'), 'utf8'));
  const code = n8n.nodes.find(n => n.name.includes('Content Engine')).parameters.jsCode;
  const cloudMatch = code.match(/const CLOUD_URLS = ({[\s\S]*?});/);
  if (cloudMatch) {
    eval('cloudMap = ' + cloudMatch[1]);
  }
} catch (e) {
  console.log('Note: Using default cloud mapping fallback.');
}

const TIER1_HASHTAGS = "#WebDevelopment #JavaScript #DevTools #ProductivityTools #SaaS #SoloFounder #BuildInPublic #IndieHackers #PrivacyFirst #DataPrivacy #WebAssembly #Toolverse";

// Scan tool video folders
const toolsDir = path.join(__dirname, '../Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders');
const brandDir = path.join(__dirname, '../Toolverse_57_Tools_And_Brand_Videos/02_Brand_Marketing_07_Folders');

function getFolderData(folderPath) {
  const files = fs.readdirSync(folderPath);
  const captionFile = files.find(f => f.toLowerCase().includes('caption'));
  const videoFile = files.find(f => f.toLowerCase().endsWith('.mp4'));
  const promptFile = files.find(f => f.toLowerCase().includes('prompt'));
  
  let caption = '';
  if (captionFile) {
    caption = fs.readFileSync(path.join(folderPath, captionFile), 'utf8');
  }
  return {
    caption,
    videoFile: videoFile ? path.relative(path.join(__dirname, '..'), path.join(folderPath, videoFile)).replace(/\\/g, '/') : null,
    hasVideo: !!videoFile
  };
}

const toolFolders = fs.readdirSync(toolsDir)
  .filter(f => fs.statSync(path.join(toolsDir, f)).isDirectory())
  .map(f => {
    const data = getFolderData(path.join(toolsDir, f));
    const cleanName = f.replace(/^\d+_/, '').replace(/_/g, ' ');
    return { folder: f, name: cleanName, ...data };
  });

const brandFolders = fs.readdirSync(brandDir)
  .filter(f => fs.statSync(path.join(brandDir, f)).isDirectory())
  .map(f => {
    const data = getFolderData(path.join(brandDir, f));
    const cleanName = f.replace(/^\d+_/, '').replace(/_/g, ' ');
    return { folder: f, name: cleanName, isBrand: true, ...data };
  });

console.log(`Loaded ${toolFolders.length} tool video folders and ${brandFolders.length} brand video folders.`);

// Days 1 to 14 details from existing folders
const initialDays = [
  {
    day_num: 1,
    tool_name: "Toolverse Master Suite & PDF Viral Studio",
    suite: "Master Suite",
    media_path: "Day-1/Instagram_Toolverse/image/image.png",
    public_url: cloudMap["Day-1/Instagram_Toolverse/image/image.png"] || "https://files.catbox.moe/118wy5.png",
    media_type: "IMAGE",
    hook: "Toolverse: the browser shortcut nobody told you about",
    ig_caption: "57 free browser-side developer and productivity tools. 100% private, no signups, no uploads.\n\nExplore: https://toolverse-official.vercel.app\n\n" + TIER1_HASHTAGS,
    fb_caption: "Stop paying monthly subscriptions for basic web utilities! Toolverse gives you 57 free client-side tools running 100% locally in your browser.\n\nTry it now: https://toolverse-official.vercel.app",
    li_caption: "Why do so many web utilities force you to create an account, upload sensitive files, and hit a paywall on the 3rd use?\n\nI built Toolverse to challenge that model — 57 production tools running purely client-side via WebAssembly & Web APIs.\n\nTry it free: https://toolverse-official.vercel.app"
  },
  {
    day_num: 2,
    tool_name: "Financial Calculators & QR Viral Studio",
    suite: "Calculator Studio",
    media_path: "Day-2/Instagram_Financial_Calculators/image/image.png",
    public_url: cloudMap["Day-2/Instagram_Financial_Calculators/image/image.png"] || "https://files.catbox.moe/02x7fd.png",
    media_type: "IMAGE",
    hook: "Financial Calculators that don't steal your financial data",
    ig_caption: "Zero-server financial planning: calculate mortgages, loans, and ROI in real-time without logging in.\n\nhttps://toolverse-official.vercel.app\n\n" + TIER1_HASHTAGS,
    fb_caption: "Smart financial modeling right in your browser. Calculate loans, savings, and investments privately.\n\nhttps://toolverse-official.vercel.app",
    li_caption: "Financial privacy matters. We built Toolverse Financial Calculators with zero analytics, zero cookies, and zero server logging.\n\nExplore: https://toolverse-official.vercel.app"
  },
  {
    day_num: 3,
    tool_name: "Digital Shadow & PixelPress Compress",
    suite: "Shield Studio",
    media_path: "Day-3/Instagram_Digital_Shadow/image/image.png",
    public_url: cloudMap["Day-3/Instagram_Digital_Shadow/image/image.png"] || "https://files.catbox.moe/3q6qdn.png",
    media_type: "IMAGE",
    hook: "What does the internet really know about you?",
    ig_caption: "Discover your browser fingerprint, active trackers, and WebRTC leaks in 1 click with Digital Shadow.\n\nCheck your score: https://toolverse-official.vercel.app\n\n" + TIER1_HASHTAGS,
    fb_caption: "Are you being tracked across the web? Digital Shadow analyzes your browser privacy footprint in seconds.\n\nhttps://toolverse-official.vercel.app",
    li_caption: "Most people have no idea how much device metadata modern websites extract quietly in the background.\n\nDigital Shadow exposes this instantly. Run an audit on your browser: https://toolverse-official.vercel.app"
  },
  {
    day_num: 4,
    tool_name: "Time Machine & Speed Art Machine",
    suite: "PDF Studio",
    media_path: "Day-4/Instagram_Time_Machine/image/image.png",
    public_url: cloudMap["Day-4/Instagram_Time_Machine/image/image.png"] || "https://files.catbox.moe/3gsioo.png",
    video_path: "Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/13_Time_Machine/video (17)-cleaned.mp4",
    media_type: "IMAGE",
    hook: "Time Machine: the PDF Studio shortcut nobody told you about",
    ig_caption: "Quick one: Time Machine on Toolverse.\n\nMost PDF tools make you wait, sign up, or upload your files. Toolverse does the opposite — peel back a PDF's history, edits, and revisions locally.\n\n• Fast: results in seconds\n• Private: runs on your device\n• Free: no paywall surprises\n\nSee it live: https://toolverse-official.vercel.app\n\n" + TIER1_HASHTAGS,
    fb_caption: "Peel back PDF version history and hidden revisions safely inside your browser. No server uploads!\n\nTry Time Machine: https://toolverse-official.vercel.app",
    li_caption: "Ever wondered what hidden changes were made to a client contract or NDA before it was sent to you?\n\nToolverse Time Machine inspects revisions and metadata client-side.\n\nTest it: https://toolverse-official.vercel.app"
  },
  {
    day_num: 5,
    tool_name: "Business & Data / Theme Studio",
    suite: "Business Studio",
    media_path: "Day-5/Instagram_Business___Data/image/image.png",
    public_url: cloudMap["Day-5/Instagram_Business___Data/image/image.png"] || "https://files.catbox.moe/t2ifm5.png",
    video_path: "Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/17_Business_And_Data/video (21)-cleaned.mp4",
    media_type: "IMAGE",
    hook: "Modern Business & Data modeling without SaaS subscriptions",
    ig_caption: "Run scenario planning, profit margins, and cohort data in seconds. 100% private in your browser.\n\nhttps://toolverse-official.vercel.app\n\n" + TIER1_HASHTAGS,
    fb_caption: "Calculate business metrics, customer LTV, and break-even points without complex spreadsheets.\n\nhttps://toolverse-official.vercel.app",
    li_caption: "Why pay \$50/month for simple business calculator tools? Toolverse Business Studio handles unit economics, CAC/LTV, and margin analysis for free.\n\nCheck it out: https://toolverse-official.vercel.app"
  },
  {
    day_num: 6,
    tool_name: "Flipbook Studio & Living Photo",
    suite: "Creative Studio",
    media_path: "Day-6/Instagram_Flipbook/image/image.png",
    public_url: cloudMap["Day-6/Instagram_Flipbook/image/image.png"] || "https://files.catbox.moe/zd7nco.png",
    video_path: "Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/21_Flipbook_Studio/video (25)-cleaned.mp4",
    media_type: "IMAGE",
    hook: "Turn static documents and images into interactive flipbooks",
    ig_caption: "Turn your PDF presentations and photo collections into realistic, page-flipping digital experiences.\n\nhttps://toolverse-official.vercel.app\n\n" + TIER1_HASHTAGS,
    fb_caption: "Create beautiful interactive flipbooks in seconds with Toolverse. Zero watermarks!\n\nhttps://toolverse-official.vercel.app",
    li_caption: "Client presentations don't have to be boring PDF downloads. Turn them into interactive browser flipbooks with one click.\n\nhttps://toolverse-official.vercel.app"
  },
  {
    day_num: 7,
    tool_name: "Video Player Pro & Developer Icon Library",
    suite: "Media Studio",
    media_path: "Day-7/Instagram_Video_Player_Pro/image/image.png",
    public_url: cloudMap["Day-7/Instagram_Video_Player_Pro/image/image.png"] || "https://files.catbox.moe/c3ysxm.png",
    video_path: "Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/25_Video_Player_Pro/video (29)-cleaned.mp4",
    media_type: "IMAGE",
    hook: "The browser video player with audio boost & speed control",
    ig_caption: "Need to boost quiet audio, inspect frames, or capture timestamps? Video Player Pro handles any format locally.\n\nhttps://toolverse-official.vercel.app\n\n" + TIER1_HASHTAGS,
    fb_caption: "Inspect video frames, boost low audio, and transcribe media directly on your device.\n\nhttps://toolverse-official.vercel.app",
    li_caption: "Client sent a video with whispering audio or weird aspect ratios? Video Player Pro gives you instant browser-side controls without installing desktop software.\n\nhttps://toolverse-official.vercel.app"
  },
  {
    day_num: 8,
    tool_name: "Print Smart Pack & Puzzle Gift",
    suite: "Utility Studio",
    media_path: "Day-8/Instagram_Print_Smart_Pack/image/image.png",
    public_url: cloudMap["Day-8/Instagram_Print_Smart_Pack/image/image.png"] || "https://files.catbox.moe/yd73yd.png",
    video_path: "Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/29_Print_Smart_Pack/video (33)-cleaned.mp4",
    media_type: "IMAGE",
    hook: "Save 40% on ink and paper with Print Smart Pack",
    ig_caption: "Stop printing unwanted ads, banners, and useless backgrounds. Print Smart Pack formats web pages cleanly for print.\n\nhttps://toolverse-official.vercel.app\n\n" + TIER1_HASHTAGS,
    fb_caption: "Optimize documents for printing — strip background clutter and save money on toner!\n\nhttps://toolverse-official.vercel.app",
    li_caption: "How many times have you printed a recipe or article only to get 15 pages of ads? Print Smart Pack formats text and tables cleanly in your browser.\n\nhttps://toolverse-official.vercel.app"
  },
  {
    day_num: 9,
    tool_name: "Design & CSS Studio / AI Boardroom",
    suite: "Dev Studio",
    media_path: "Day-9/Instagram_Design___CSS/image/image.png",
    public_url: cloudMap["Day-9/Instagram_Design___CSS/image/image.png"] || "https://files.catbox.moe/eiehcr.png",
    video_path: "Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/33_Design_And_CSS/video (37)-cleaned.mp4",
    media_type: "IMAGE",
    hook: "Generate modern CSS glassmorphism, gradients, and shadows in seconds",
    ig_caption: "Visual CSS generators that spit out clean, production-ready code with cross-browser compatibility.\n\nhttps://toolverse-official.vercel.app\n\n" + TIER1_HASHTAGS,
    fb_caption: "Fast CSS generators for frontend engineers and designers. Zero bloat!\n\nhttps://toolverse-official.vercel.app",
    li_caption: "Frontend development speed is all about minimizing boilerplate. Toolverse Design & CSS Studio gives developers visual generators for modern UI tokens.\n\nhttps://toolverse-official.vercel.app"
  },
  {
    day_num: 10,
    tool_name: "Vision Switch & Text FX Studio",
    suite: "Creative Studio",
    media_path: "Day-10/Instagram_Vision_Switch/image/image.png",
    public_url: cloudMap["Day-10/Instagram_Vision_Switch/image/image.png"] || "https://files.catbox.moe/8kn4ax.png",
    video_path: "Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/37_Vision_Switch/Toolverse_Vision_Switch_product 20260930213255-cleaned.mp4",
    media_type: "IMAGE",
    hook: "Switch color palettes and contrast themes on the fly",
    ig_caption: "Simulate color blindness, test WCAG accessibility contrast, and generate dynamic palettes instantly.\n\nhttps://toolverse-official.vercel.app\n\n" + TIER1_HASHTAGS,
    fb_caption: "Make your web designs accessible for everyone with Vision Switch.\n\nhttps://toolverse-official.vercel.app",
    li_caption: "Over 8% of men and 0.5% of women have color vision deficiency. Vision Switch allows designers to test contrast and accessibility before shipping.\n\nhttps://toolverse-official.vercel.app"
  },
  {
    day_num: 11,
    tool_name: "Watermark Eraser & GitScope Pro",
    suite: "Creative & Dev Studio",
    media_path: "Day-11/Instagram_Watermark_Eraser/image/image.png",
    video_path: "Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/41_Watermark_Eraser/Toolverse_Watermark_Eraser_remo-cleaned.mp4",
    media_type: "IMAGE",
    hook: "Remove unwanted stamps and inspect git repo metrics locally",
    ig_caption: "Erase watermarks cleanly and analyze git repositories without cloning gigabytes of code.\n\nhttps://toolverse-official.vercel.app\n\n" + TIER1_HASHTAGS,
    fb_caption: "Clean up photos and analyze git project metrics effortlessly.\n\nhttps://toolverse-official.vercel.app",
    li_caption: "Analyzing a public GitHub repository usually requires cloning the entire codebase. GitScope Pro visualizes dependencies, commits, and activity directly in the browser.\n\nhttps://toolverse-official.vercel.app"
  },
  {
    day_num: 12,
    tool_name: "AI HD Boost & Metadata Stripper",
    suite: "Image & Privacy Studio",
    media_path: "Day-12/Instagram_AI_HD_Boost/image/image.png",
    video_path: "Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/45_AI_HD_Boost/Toolverse_AI_HD_Boost_showcase_20260930221247-cleaned.mp4",
    media_type: "IMAGE",
    hook: "Upscale low-res photos to 4K and strip GPS EXIF data",
    ig_caption: "Boost photo sharpness to 4K while wiping dangerous GPS location data before posting online.\n\nhttps://toolverse-official.vercel.app\n\n" + TIER1_HASHTAGS,
    fb_caption: "Enhance image clarity and protect your privacy by stripping EXIF metadata.\n\nhttps://toolverse-official.vercel.app",
    li_caption: "Every smartphone photo contains hidden metadata: GPS coordinates, device serial numbers, and camera timestamps. Strip it before uploading anywhere using Toolverse.\n\nhttps://toolverse-official.vercel.app"
  },
  {
    day_num: 13,
    tool_name: "Color Palette Generator & Photo to 3D",
    suite: "Creative Studio",
    media_path: "Day-13/Color_Palette_Generator/image/image.png",
    video_path: "Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/53_Color_Palette_Generator/Extracting_colors_from_images_1080p_20260930231951-cleaned.mp4",
    media_type: "IMAGE",
    hook: "Extract aesthetic hex codes and create depth maps from photos",
    ig_caption: "Drop any photo to generate harmonious color palettes and convert 2D images into interactive 3D parallax.\n\nhttps://toolverse-official.vercel.app\n\n" + TIER1_HASHTAGS,
    fb_caption: "Extract designer color palettes and 3D depth maps in 1 second!\n\nhttps://toolverse-official.vercel.app",
    li_caption: "Designers spend hours matching hex codes. Toolverse Color Palette Generator uses k-means clustering directly in WebAssembly to pull dominant color accents in 200ms.\n\nhttps://toolverse-official.vercel.app"
  },
  {
    day_num: 14,
    tool_name: "Art Converters & Butterfly Effect Blast Graph",
    suite: "Creative & Engineering Studio",
    media_path: "Day-14/Art_Converters/image/image.png",
    video_path: "Toolverse_57_Tools_And_Brand_Videos/01_Tools_57_Folders/54_Art_Converters/Transform_photos_into_pixel_art_20260930233103-cleaned.mp4",
    media_type: "IMAGE",
    hook: "Transform photos into pixel art and simulate cascade network blasts",
    ig_caption: "Convert photos into retro 8-bit pixel art and visualize complex network node graph explosions.\n\nhttps://toolverse-official.vercel.app\n\n" + TIER1_HASHTAGS,
    fb_caption: "Retro pixel art converter + interactive graph simulation right in your browser.\n\nhttps://toolverse-official.vercel.app",
    li_caption: "From retro image rendering to graph theory simulations, Toolverse shows what modern WebAssembly can achieve without backend server overhead.\n\nhttps://toolverse-official.vercel.app"
  }
];

// Now construct Days 15 to 90
// Rotation rhythm:
// Monday: Hero Tool (Image / Carousel)
// Tuesday: Tool Viral Video Demo
// Wednesday: Multi-Tool Combo / Stack
// Thursday: Brand Commercial Video (20s)
// Friday: Technical Dev & Privacy Cheat Sheet
// Saturday: Solo Founder Build-In-Public Story
// Sunday: Community Poll / Feature Showcase

const schedule = [...initialDays];

let toolIdx = 0;
let brandIdx = 0;

for (let day = 15; day <= 90; day++) {
  const dayOfWeek = (day - 1) % 7; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  
  if (dayOfWeek === 3) {
    // Thursday: Brand Commercial Video!
    const brand = brandFolders[brandIdx % brandFolders.length];
    brandIdx++;
    schedule.push({
      day_num: day,
      tool_name: `Brand Commercial: ${brand.name}`,
      suite: "Brand Commercial",
      media_type: "VIDEO",
      video_path: brand.videoFile,
      media_path: brand.videoFile,
      public_url: "", // will be raw github or catbox fallback
      hook: `Why the subscription software model is broken — and what we built instead`,
      ig_caption: brand.caption || `Stop paying monthly fees for basic web utilities! Toolverse gives you 57 professional client-side tools running 100% free.\n\nTry it now: https://toolverse-official.vercel.app\n\n` + TIER1_HASHTAGS,
      fb_caption: `Tired of subscriptions? Toolverse provides 57 free, client-side tools with zero paywalls.\n\nVisit: https://toolverse-official.vercel.app`,
      li_caption: `Software subscriptions have gotten out of hand. Why are developers and creators paying \$15-30/month for basic tools that can execute 100% inside modern web browsers?\n\nThat's why I built Toolverse — 57 free tools with complete client-side data privacy.\n\nExplore: https://toolverse-official.vercel.app`
    });
  } else if (dayOfWeek === 1 || dayOfWeek === 4) {
    // Tuesday / Friday: Tool Viral Video Demo!
    const tool = toolFolders[toolIdx % toolFolders.length];
    toolIdx++;
    schedule.push({
      day_num: day,
      tool_name: `${tool.name} Demo`,
      suite: "Tool Demo",
      media_type: "VIDEO",
      video_path: tool.videoFile,
      media_path: tool.videoFile,
      public_url: "",
      hook: `Watch ${tool.name} solve this workflow problem in 10 seconds`,
      ig_caption: tool.caption || `Solve your workflow in seconds with ${tool.name} on Toolverse.\n\nTry it free: https://toolverse-official.vercel.app\n\n` + TIER1_HASHTAGS,
      fb_caption: `Instant browser tool: ${tool.name}. Free, private, and runs directly on your device.\n\nhttps://toolverse-official.vercel.app`,
      li_caption: `Demoing ${tool.name} — built for engineers, creators, and freelancers who want zero-friction productivity without uploading sensitive files to cloud servers.\n\nCheck it out: https://toolverse-official.vercel.app`
    });
  } else if (dayOfWeek === 5) {
    // Saturday: Solo Founder Build-in-Public Story
    schedule.push({
      day_num: day,
      tool_name: `Solo Founder Story #${Math.ceil(day / 7)}`,
      suite: "Build In Public",
      media_type: "IMAGE",
      media_path: "Day-1/Instagram_Toolverse/image/image.png",
      public_url: "https://files.catbox.moe/118wy5.png",
      hook: `How I built 57 developer tools as a solo founder without venture capital`,
      ig_caption: `Building in public: 57 tools, 0 external funding, 100% browser-side code.\n\nHere is how WebAssembly and modern web APIs make heavy servers obsolete.\n\nExplore: https://toolverse-official.vercel.app\n\n` + TIER1_HASHTAGS,
      fb_caption: `Behind the scenes of Toolverse: Building 57 fast web utilities for developers worldwide.\n\nhttps://toolverse-official.vercel.app`,
      li_caption: `Lessons learned building 57 production tools solo:\n\n1. WebAssembly is massively underutilized for client-side processing.\n2. Users hate account walls for one-off tasks.\n3. Privacy-first architecture dramatically lowers cloud hosting costs.\n\nExplore Toolverse: https://toolverse-official.vercel.app`
    });
  } else if (dayOfWeek === 2) {
    // Wednesday: Multi-Tool Combo / Stack
    const toolA = toolFolders[toolIdx % toolFolders.length];
    toolIdx++;
    schedule.push({
      day_num: day,
      tool_name: `Workflow Stack: ${toolA.name} + PDF Studio`,
      suite: "Productivity Stack",
      media_type: "IMAGE",
      media_path: "Day-4/Instagram_Time_Machine/image/image.png",
      public_url: "https://files.catbox.moe/3gsioo.png",
      hook: `The ultimate zero-friction freelancer stack for contracts and privacy`,
      ig_caption: `Combine ${toolA.name} and Toolverse PDF Studio for a completely private document workflow.\n\nTest it: https://toolverse-official.vercel.app\n\n` + TIER1_HASHTAGS,
      fb_caption: `Streamline your client workflow with Toolverse utilities.\n\nhttps://toolverse-official.vercel.app`,
      li_caption: `Freelancers and agency owners spend too much time toggling between paywalled SaaS tools. Here's how to run your full contract and media workflow 100% locally.\n\nhttps://toolverse-official.vercel.app`
    });
  } else {
    // Sunday / Monday: Hero Tool Feature Spotlight
    const tool = toolFolders[toolIdx % toolFolders.length];
    toolIdx++;
    schedule.push({
      day_num: day,
      tool_name: `${tool.name} Spotlight`,
      suite: "Feature Spotlight",
      media_type: "IMAGE",
      media_path: "Day-2/Instagram_Financial_Calculators/image/image.png",
      public_url: "https://files.catbox.moe/02x7fd.png",
      hook: `Simplify your daily tasks with ${tool.name}`,
      ig_caption: `${tool.name} on Toolverse — fast, private, and free.\n\nTry it now: https://toolverse-official.vercel.app\n\n` + TIER1_HASHTAGS,
      fb_caption: `Discover ${tool.name} on Toolverse.\n\nhttps://toolverse-official.vercel.app`,
      li_caption: `High-performance browser tools: Introducing ${tool.name}. Built with zero dependencies on remote backend servers for maximum security.\n\nhttps://toolverse-official.vercel.app`
    });
  }
}

const outputPath = path.join(__dirname, '../data/schedule_90_days.json');
fs.writeFileSync(outputPath, JSON.stringify(schedule, null, 2), 'utf8');
console.log(`✅ Successfully generated complete 90-day master content schedule (${schedule.length} posts) at data/schedule_90_days.json`);
