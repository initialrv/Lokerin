/* eslint-env node */
const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, "..", "docs", "lokerin_future_strategy.pdf");

const sections = [
  {
    title: "Lokerin Future Strategy",
    body: [
      "Prepared for Ravenduck / Lokerin",
      "Date: 2026-05-17",
      "",
      "This document summarizes practical future improvements, operational-cost tradeoffs, promotion ideas, monetization options, and what a future Pro version could include while keeping the core app calm, offline-first, and useful.",
    ],
  },
  {
    title: "Product Direction",
    body: [
      "Lokerin is strongest when it stays local-first, calm, compact, and trustworthy. The best positioning is not another heavy recruiting CRM. It is a personal job-search command center for people who want clarity without spreadsheets, accounts, or noisy dashboards.",
      "The app should keep its free core generous. Avoid making basic job tracking painful just to push payment. Monetization should add convenience, polish, or power-user tools rather than blocking the main workflow.",
    ],
  },
  {
    title: "Already Implemented Zero-Cost Improvements",
    body: [
      "- Offline SQLite storage with no backend requirement.",
      "- English and Indonesian localization.",
      "- Light and dark mode.",
      "- Application tracking, status filters, search, and detail pages.",
      "- Interview logs with editable date and time.",
      "- Follow-up date and local notification reminders.",
      "- Notifications On/Off control in Settings.",
      "- Archive and restore for applications.",
      "- Overview analytics and next-action summary.",
      "- JSON import/restore, CSV export, and PDF export.",
      "- Placeholder assets, store listing notes, and screenshot guidance.",
      "- Real pager-style swipe navigation between main pages.",
    ],
  },
  {
    title: "Future Improvements With Zero Operational Cost",
    body: [
      "These features can be built without servers, paid APIs, cloud databases, or recurring infrastructure.",
      "- Application templates: prefilled notes, follow-up cadence, interview checklist, and salary questions.",
      "- Custom statuses stored locally, for example Assessment, HR, Final Interview, Waiting, or Accepted.",
      "- Better analytics: response rate, offer rate, average time in pipeline, weekly activity, and stale applications.",
      "- Kanban board view: a visual status board powered by the existing local database.",
      "- Contacts and source tracking: recruiter name, email, phone, referral, LinkedIn, job board, or company site.",
      "- Local attachments: allow users to attach resume version names, cover letter notes, or local file references. Be careful with storage permissions.",
      "- Calendar handoff: add interview/follow-up to device calendar. This may need device permissions but no server.",
      "- More export formats: cleaner PDF themes, CSV variants, and printable interview prep sheets.",
      "- Backup reminders: local prompts that remind users to export JSON weekly.",
      "- Better onboarding: a short first-run flow explaining local-only data and export backups.",
      "- Accessibility polish: larger text testing, better screen reader labels, and reduced-motion behavior.",
    ],
  },
  {
    title: "Improvements With Operational Cost Or External Dependency",
    body: [
      "These may be valuable later, but they add cost, privacy work, maintenance, or vendor dependency.",
      "- Cloud sync and account login: needs auth, database, security rules, backup policy, and support burden.",
      "- Cross-device backup: usually needs storage such as Supabase, Firebase, iCloud, Google Drive integration, or a custom backend.",
      "- AI resume/job matching: needs paid AI API calls unless fully on-device, and requires careful privacy disclosure.",
      "- Email parsing: requires Gmail/Outlook integration, OAuth review, privacy policy detail, and support complexity.",
      "- Job board scraping: often violates site terms, breaks frequently, and can create legal/maintenance risk.",
      "- Push notifications from a server: local notifications are free, but remote push scheduling usually needs backend logic.",
      "- Remote analytics/crash reporting: useful, but must be disclosed in privacy forms and may have usage limits.",
      "- Ads: no server required from you, but it adds ad network dependency, privacy disclosure, and UX risk.",
      "- Subscriptions/IAP: store revenue share applies and purchase restore logic must be tested.",
    ],
  },
  {
    title: "Recommended Roadmap",
    body: [
      "Phase 1: Ship the polished offline app.",
      "- Finish app icon, adaptive icon, splash, screenshots, privacy policy, Play Store listing, and production build.",
      "- QA on a real Android phone across light/dark mode, English/Indonesian, export/import, PDF/CSV, pager swipe, date/time picker, archive, and notifications.",
      "",
      "Phase 2: Add local power-user features.",
      "- Templates, custom statuses, better analytics, contacts/source tracking, and Kanban view.",
      "",
      "Phase 3: Consider optional monetization.",
      "- One-time Pro unlock is the most natural first option because it avoids monthly infrastructure and feels fair for a utility app.",
      "",
      "Phase 4: Only add cloud/AI if demand proves it.",
      "- Treat cloud sync and AI as later experiments, not launch blockers.",
    ],
  },
  {
    title: "Promotion Strategy",
    body: [
      "Start with zero-budget promotion. The goal is to make the app discoverable to job seekers who already feel spreadsheet fatigue.",
      "- App Store Optimization: include words like job application tracker, job search organizer, interview tracker, follow-up reminder, offline job tracker, and Indonesian terms such as lamaran kerja and loker.",
      "- Screenshots: show Overview, Applications, Add Application, Application Detail, Settings, dark mode, and Indonesian language.",
      "- Short demo video: record a 20-30 second flow: add job, set follow-up, log interview, swipe pages, export data.",
      "- Content angles: calm job search, stop losing follow-ups, offline private tracker, simple job application log, job search without spreadsheet chaos.",
      "- Launch channels: personal LinkedIn, relevant job seeker communities, Reddit where allowed, Indonesian tech/job communities, Product Hunt if you create a small landing page, and short-form video.",
      "- Trust message: emphasize local-first storage, no account required, offline use, and export control.",
      "- Avoid spam: share as a useful tool you built, not as aggressive marketing.",
    ],
  },
  {
    title: "Monetization Strategy",
    body: [
      "Recommended first path: keep Lokerin free at launch. Build trust and usage before charging.",
      "",
      "Best low-ops monetization options:",
      "- One-time Pro unlock: simplest paid path. No backend required, but store billing integration is needed.",
      "- Paid template pack: sell interview prep templates, follow-up message templates, and job-search checklists outside the app or through IAP.",
      "- Donation/support link: low pressure, but store rules must be checked if it is inside the app.",
      "- Paid companion PDF or job search bundle: can be sold through Gumroad, Lemon Squeezy, or similar platforms.",
      "",
      "Options to be careful with:",
      "- Ads can hurt the calm premium feel and require privacy disclosures.",
      "- Subscriptions are hard to justify unless there is cloud sync, AI, or ongoing value.",
      "- Affiliate links can create trust issues in an employment app if not disclosed clearly.",
    ],
  },
  {
    title: "If A Pro Version Is Built",
    body: [
      "Do not cripple the free app. Keep free users able to track unlimited applications locally. Pro should add polish, customization, and power tools.",
      "",
      "Good Pro candidates:",
      "- Custom statuses and custom pipeline order.",
      "- Application and interview templates.",
      "- Advanced analytics dashboard.",
      "- Multiple job-search profiles, for example Full-time, Freelance, Internship, Remote.",
      "- Premium export themes for PDF.",
      "- Encrypted local backup file option.",
      "- Extra color themes and app icon variants.",
      "- Kanban board view if it feels premium enough.",
      "- Bulk actions such as archive all rejected, mark stale, or batch export.",
      "",
      "Avoid putting these behind Pro:",
      "- Basic add/edit/delete application.",
      "- Basic interview logs.",
      "- Basic follow-up reminders.",
      "- Basic JSON backup/restore, because this protects user data.",
    ],
  },
  {
    title: "Other Important Notes",
    body: [
      "- Privacy policy is still needed even if all data is local. Say clearly that records are stored on-device unless the user exports/shares them.",
      "- Play Store Data Safety should match reality. If there is no remote collection, do not overclaim data collection.",
      "- Local-only apps need backup education. Users can lose data if they uninstall without exporting JSON.",
      "- Development APK size is not production size. Judge final size from production AAB and Play delivery.",
      "- Keep a small QA checklist for every release: create app, edit app, archive, restore, add interview, edit interview, follow-up reminder, export JSON/CSV/PDF, import JSON, language switch, dark mode, pager swipe.",
      "- Save screenshots after final assets are replaced. Placeholder icons are fine for testing, not for store launch.",
      "- If native dependencies are added later, rebuild the dev APK. JS-only changes usually only need Metro reload.",
    ],
  },
  {
    title: "Bottom Line",
    body: [
      "Lokerin is strongest as a free, offline-first, private job search tracker. The cleanest path is to launch the polished free version, learn what users actually ask for, then add local-first Pro features that do not force you into backend maintenance.",
      "The safest paid direction is a one-time Pro unlock focused on customization, templates, analytics, and premium exports. Avoid cloud, AI, ads, and subscriptions until there is proven demand.",
    ],
  },
];

function escapePdfText(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapLine(text, maxChars) {
  if (!text) return [""];
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function buildPages() {
  const pages = [];
  let current = [];
  let y = 742;

  function newPage() {
    pages.push(current);
    current = [];
    y = 742;
  }

  function addText(text, size = 11, leading = 15, indent = 0) {
    const maxChars = Math.max(28, Math.floor((520 - indent) / (size * 0.52)));
    for (const line of wrapLine(text, maxChars)) {
      if (y < 58) newPage();
      current.push({ text: line, size, x: 46 + indent, y });
      y -= leading;
    }
  }

  for (const section of sections) {
    if (y < 150) newPage();
    addText(section.title, section.title === "Lokerin Future Strategy" ? 22 : 15, section.title === "Lokerin Future Strategy" ? 28 : 21);
    y -= 4;
    for (const raw of section.body) {
      if (raw === "") {
        y -= 8;
        continue;
      }
      const isBullet = raw.startsWith("- ");
      addText(raw, 11, 15, isBullet ? 12 : 0);
    }
    y -= 16;
  }
  if (current.length) pages.push(current);
  return pages;
}

function makePdf() {
  const pages = buildPages();
  const objects = [];

  function addObject(body) {
    objects.push(body);
    return objects.length;
  }

  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pageIds = [];

  for (const page of pages) {
    const commands = [
      "BT",
      "/F1 11 Tf",
    ];
    for (const item of page) {
      commands.push(`/F1 ${item.size} Tf`);
      commands.push(`1 0 0 1 ${item.x} ${item.y} Tm`);
      commands.push(`(${escapePdfText(item.text)}) Tj`);
    }
    commands.push("ET");
    const stream = commands.join("\n");
    const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent PAGES_PLACEHOLDER 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  }

  const pagesId = addObject(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  for (const pageId of pageIds) {
    objects[pageId - 1] = objects[pageId - 1].replace("PAGES_PLACEHOLDER", String(pagesId));
  }

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return pdf;
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, makePdf(), "binary");
console.log(outPath);
