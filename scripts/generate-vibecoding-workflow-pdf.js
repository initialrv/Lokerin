/* eslint-env node */
const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, "..", "docs", "lokerin_vibecoding_workflow.pdf");

const sections = [
  {
    title: "Lokerin Vibecoding Workflow",
    body: [
      "Prepared for Ravenduck",
      "Date: 2026-05-18",
      "",
      "This document explains how Lokerin evolved through a practical AI-assisted workflow: rough idea, debugging, UI iteration, native builds, QA, product decisions, and future roadmap. It is written as something you can show a friend to explain what vibecoding looked like in this project.",
    ],
  },
  {
    title: "What Vibecoding Meant Here",
    body: [
      "The process was not just typing one prompt and getting an app. It was closer to pair-building with an AI coding partner: you gave taste, product direction, real phone feedback, screenshots, errors, and priorities; the assistant inspected the codebase, made scoped changes, verified builds, and explained tradeoffs.",
      "The strongest part of the workflow was fast iteration. You could say something like 'this gap feels too big' or 'this text wraps in Indonesian' and the implementation could immediately move from feeling to code.",
    ],
  },
  {
    title: "Starting Point",
    body: [
      "The project began as an Expo React Native job application tracker with build/runtime problems.",
      "- Expo SDK mismatch from 52 to 54.",
      "- Missing dependencies.",
      "- Invalid TypeScript syntax.",
      "- Missing React hook imports.",
      "- Metro bundling/runtime failures.",
      "- Expo Router structure needed validation.",
      "",
      "The first goal was stability: make the app compile, bundle, and run before product polish.",
    ],
  },
  {
    title: "Phase 1: Stabilize The App",
    body: [
      "The assistant inspected package.json, route files, models, repositories, and current errors.",
      "Fixes focused on compatibility with Expo SDK 54 and removing Metro blockers.",
      "- Aligned dependencies using Expo-compatible packages.",
      "- Fixed invalid TypeScript structures.",
      "- Added missing imports such as React hooks.",
      "- Checked Expo Router layout and route naming.",
      "- Repeated typecheck, lint, and Android export checks.",
      "",
      "This phase made the project safe to iterate on.",
    ],
  },
  {
    title: "Phase 2: Define Product Identity",
    body: [
      "The app moved from a generic tracker into Lokerin: a calm, compact, bright, local-first job search companion.",
      "Brand direction chosen by the user:",
      "- Not dark-only.",
      "- Bright, positive lime/coral style.",
      "- Minimalist but compact.",
      "- Futuristic but still practical.",
      "- English and Indonesian support.",
      "- Friendly tone: 'A friend for your job search journey.'",
      "",
      "This was where product taste started guiding engineering decisions.",
    ],
  },
  {
    title: "Phase 3: UI And Localization Iteration",
    body: [
      "The UI was tightened over many small passes based on live phone testing.",
      "- Reduced top spacing across screens.",
      "- Fixed search text wrapping in Indonesian.",
      "- Aligned cards, chips, and containers.",
      "- Made bottom tabs sit higher from the phone edge.",
      "- Reworked application status chips into a compact two-row grid.",
      "- Replaced stiff Indonesian copy with more natural phrasing.",
      "- Fixed labels like Role/Title, Follow-up Date, Salary Range, Job Posting Link.",
      "- Made recently updated items clickable.",
      "- Themed save/archive dialogs instead of default system-looking popups.",
      "",
      "This phase shows a key vibecoding pattern: the user describes what feels wrong, and the assistant translates that into layout, copy, and component changes.",
    ],
  },
  {
    title: "Phase 4: Data And Local-First Features",
    body: [
      "The app stayed fully local-first, avoiding operational cost.",
      "Implemented features:",
      "- SQLite-backed application tracking.",
      "- Interview logs with editable date/time.",
      "- Follow-up dates using native date/time picker.",
      "- Archive and restore applications.",
      "- JSON import/restore.",
      "- CSV export.",
      "- PDF export.",
      "- Backup reminders.",
      "- Follow-up notifications.",
      "- Calendar handoff for follow-ups and interviews.",
      "",
      "The app does not need a backend server for these features. Data remains on the device unless the user exports or shares it.",
    ],
  },
  {
    title: "Phase 5: Native Build Reality",
    body: [
      "A major lesson: not all Expo changes behave the same.",
      "- JS-only changes can usually be tested by reloading Metro/dev-client.",
      "- Native modules such as expo-notifications, react-native-pager-view, expo-dev-client, and expo-calendar require a rebuilt APK.",
      "- App icon, adaptive icon, and splash changes also require rebuilding and reinstalling.",
      "",
      "Real example: expo-calendar caused 'Cannot find native module ExpoCalendar' until a new development APK was built and installed. The real fix was not hiding the error; it was running an EAS development build so the native module existed in the app binary.",
    ],
  },
  {
    title: "Phase 6: Navigation And Motion",
    body: [
      "The app moved from tab-only navigation to swipeable page navigation.",
      "- First version used gesture detection and had clunky snap/flash behavior.",
      "- Then it moved to react-native-pager-view for actual adjacent-page swiping.",
      "- The user tested on device and reported overlap, flashing, and no-page-change issues.",
      "- The implementation was adjusted until swiping felt polished.",
      "",
      "This phase is a good example of using device feedback. Some UI behavior cannot be judged properly from code alone.",
    ],
  },
  {
    title: "Phase 7: Product Polish",
    body: [
      "After the core app worked, the workflow shifted into final-product polish.",
      "- Real Android package namespace: dev.ravenduck.lokerin.",
      "- Placeholder asset pipeline for icon, adaptive icon, splash, and favicon.",
      "- Store listing notes and screenshot checklist.",
      "- Accessibility polish: screen reader labels, larger text safeguards, reduced motion support.",
      "- Better empty states.",
      "- Better analytics on Overview.",
      "- Manual sorting: newest, follow-up soon, company A-Z.",
      "- Search matching company, role, notes, location, job link, salary, and status labels.",
      "- Duplicate application action.",
      "- Onboarding reset.",
      "- Privacy policy link and About section.",
      "- Application templates with friendly EN/ID tone.",
    ],
  },
  {
    title: "Phase 8: QA Loop",
    body: [
      "The QA loop mixed automated checks with real phone testing.",
      "Automated checks used repeatedly:",
      "- npm run typecheck",
      "- npm run lint",
      "- npx expo export --platform android",
      "- expo-doctor when useful",
      "",
      "Manual phone QA covered:",
      "- Android dev build install.",
      "- Light/dark mode.",
      "- English/Indonesian language switching.",
      "- Date/time picker.",
      "- Notifications.",
      "- Calendar handoff.",
      "- JSON import/restore.",
      "- CSV/PDF export.",
      "- Swipe navigation.",
      "- App icon/splash after rebuild.",
    ],
  },
  {
    title: "Important Decisions",
    body: [
      "Several features were intentionally skipped to avoid bloat:",
      "- Custom statuses.",
      "- Kanban board.",
      "- Contacts/source tracking.",
      "- Local attachments.",
      "",
      "This was a product maturity step. A complete app is not the app with every feature; it is the app with the right features working cleanly.",
    ],
  },
  {
    title: "Current State",
    body: [
      "Lokerin is now a polished local-first job search tracker.",
      "Core strengths:",
      "- Calm compact UI.",
      "- English and Indonesian.",
      "- Offline local data.",
      "- No account required.",
      "- Follow-up and backup reminders.",
      "- Calendar handoff.",
      "- Import/restore backup flow.",
      "- Multiple export formats.",
      "- Overview analytics.",
      "- Templates and duplicate action.",
      "- Store prep docs and asset guidance.",
      "",
      "Remaining launch items are mostly outside code: final privacy policy, final screenshots, final assets, QA pass, production build, Play Store setup.",
    ],
  },
  {
    title: "Future Roadmap",
    body: [
      "Near future, zero operational cost:",
      "- More PDF theme polish.",
      "- More templates.",
      "- More Indonesian copy refinement.",
      "- More screenshot/store copy polish.",
      "- Additional QA across Android screen sizes.",
      "- Better user guide and privacy copy.",
      "",
      "Future with operational cost or bigger complexity:",
      "- Cloud sync.",
      "- Login/accounts.",
      "- AI suggestions.",
      "- Email parsing.",
      "- Job board integrations.",
      "- Remote analytics.",
      "- Subscription/pro features.",
    ],
  },
  {
    title: "How To Explain The Workflow To A Friend",
    body: [
      "A simple explanation:",
      "1. I started with a rough Expo app and real errors.",
      "2. I used AI like a coding partner, not a magic button.",
      "3. I gave it bugs, screenshots, UI feelings, and product direction.",
      "4. It inspected the code, changed files, and ran checks.",
      "5. I tested on my phone and reported what felt wrong.",
      "6. We repeated until it felt like a real app.",
      "7. Native features still needed real builds, installs, and QA.",
      "8. The final product came from taste plus iteration, not one giant prompt.",
    ],
  },
  {
    title: "Main Lesson",
    body: [
      "Vibecoding worked best when the user stayed involved as product owner, tester, and taste-maker.",
      "The assistant was strongest at fast implementation, debugging, consistency checks, and explaining tradeoffs.",
      "The user was strongest at deciding what felt good, what felt unnecessary, and what the app should become.",
      "",
      "That combination is the real workflow: human judgment steering AI implementation.",
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
    const isTitle = section.title === "Lokerin Vibecoding Workflow";
    addText(section.title, isTitle ? 22 : 15, isTitle ? 28 : 21);
    y -= 4;
    for (const raw of section.body) {
      if (raw === "") {
        y -= 8;
        continue;
      }
      const isBullet = raw.startsWith("- ");
      const isNumbered = /^\d+\./.test(raw);
      addText(raw, 11, 15, isBullet || isNumbered ? 12 : 0);
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
    const commands = ["BT", "/F1 11 Tf"];
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
