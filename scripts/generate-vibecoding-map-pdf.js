/* eslint-env node */
const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, "..", "docs", "lokerin_vibecoding_mindmap_clean.pdf");

const page = { w: 1600, h: 1200 };

const palette = {
  bg: [0.969, 0.98, 0.953],
  white: [1, 1, 1],
  limeSoft: [0.91, 0.973, 0.847],
  lime: [0.561, 0.82, 0.31],
  limePressed: [0.431, 0.678, 0.208],
  tealSoft: [0.875, 0.973, 0.957],
  teal: [0.094, 0.718, 0.643],
  warningSoft: [1, 0.945, 0.839],
  warning: [0.941, 0.663, 0.231],
  coralSoft: [1, 0.91, 0.933],
  coral: [0.91, 0.365, 0.459],
  dark: [0.086, 0.125, 0.071],
  muted: [0.408, 0.455, 0.369],
  border: [0.835, 0.875, 0.788],
};

const boxes = [
  {
    id: "center",
    x: 600,
    y: 1030,
    w: 400,
    h: 110,
    title: "Lokerin",
    lines: ["Vibecoding Workflow", "Human taste + AI implementation"],
    fill: "limeSoft",
    stroke: "lime",
    titleSize: 34,
  },
  {
    id: "start",
    x: 70,
    y: 820,
    w: 300,
    h: 135,
    title: "1. Starting Point",
    lines: ["Broken Expo app", "SDK mismatch", "Missing deps", "Metro/runtime errors"],
    fill: "white",
    stroke: "border",
  },
  {
    id: "stable",
    x: 460,
    y: 820,
    w: 300,
    h: 150,
    title: "2. Stabilize",
    lines: ["Fix imports/deps", "Fix TypeScript", "Validate Expo Router", "typecheck / lint / export"],
    fill: "limeSoft",
    stroke: "lime",
  },
  {
    id: "identity",
    x: 850,
    y: 820,
    w: 310,
    h: 150,
    title: "3. Product Identity",
    lines: ["Lokerin", "Bright lime, compact", "Calm futuristic feel", "EN + Indonesian"],
    fill: "limeSoft",
    stroke: "lime",
  },
  {
    id: "ui",
    x: 1230,
    y: 820,
    w: 300,
    h: 145,
    title: "4. UI Iteration",
    lines: ["Spacing and cards", "Chips and dialogs", "Phone screenshot feedback", "Natural Indonesian copy"],
    fill: "white",
    stroke: "border",
  },
  {
    id: "data",
    x: 1230,
    y: 570,
    w: 310,
    h: 155,
    title: "5. Local-First Features",
    lines: ["SQLite storage", "Archive / restore", "JSON import", "CSV + PDF export"],
    fill: "tealSoft",
    stroke: "teal",
  },
  {
    id: "reminders",
    x: 850,
    y: 570,
    w: 310,
    h: 160,
    title: "6. Reminders + Calendar",
    lines: ["Follow-up notifications", "Backup reminders", "Calendar handoff", "Native rebuild required"],
    fill: "warningSoft",
    stroke: "warning",
  },
  {
    id: "native",
    x: 460,
    y: 570,
    w: 310,
    h: 155,
    title: "7. Native Build Reality",
    lines: ["JS-only: Metro reload", "Native deps: rebuild APK", "Icons/splash: reinstall", "EAS dev builds"],
    fill: "coralSoft",
    stroke: "coral",
  },
  {
    id: "qa",
    x: 70,
    y: 570,
    w: 300,
    h: 160,
    title: "8. QA Loop",
    lines: ["Real Android testing", "Light/dark + EN/ID", "Dates, exports, swipes", "typecheck / lint / export"],
    fill: "limeSoft",
    stroke: "lime",
  },
  {
    id: "polish",
    x: 600,
    y: 330,
    w: 320,
    h: 155,
    title: "9. Final Polish",
    lines: ["Templates", "Duplicate app", "Search + sort", "Accessibility", "Settings/About"],
    fill: "limeSoft",
    stroke: "lime",
  },
  {
    id: "current",
    x: 350,
    y: 95,
    w: 380,
    h: 120,
    title: "Current State",
    lines: ["Polished local-first Android app", "No account, no backend", "Ready for assets, policy, QA, store build"],
    fill: "dark",
    stroke: "lime",
    dark: true,
  },
  {
    id: "future",
    x: 840,
    y: 95,
    w: 420,
    h: 120,
    title: "Future",
    lines: ["Zero-cost polish first", "Costly later: cloud, AI, login, email parsing"],
    fill: "dark",
    stroke: "teal",
    dark: true,
  },
  {
    id: "human",
    x: 70,
    y: 330,
    w: 265,
    h: 105,
    title: "Human Role",
    lines: ["Taste", "Priorities", "Phone testing", "What to skip"],
    fill: "white",
    stroke: "teal",
  },
  {
    id: "ai",
    x: 1230,
    y: 330,
    w: 285,
    h: 105,
    title: "AI Role",
    lines: ["Inspect code", "Patch files", "Run checks", "Explain tradeoffs"],
    fill: "white",
    stroke: "teal",
  },
];

const edges = [
  ["center", "start"],
  ["start", "stable"],
  ["stable", "identity"],
  ["identity", "ui"],
  ["ui", "data"],
  ["data", "reminders"],
  ["reminders", "native"],
  ["native", "qa"],
  ["qa", "polish"],
  ["polish", "current"],
  ["polish", "future"],
  ["human", "polish", true],
  ["ai", "polish", true],
];

function rgb(name) {
  return palette[name].join(" ");
}

function escapeText(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(text, maxChars) {
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

function centerOf(box) {
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
}

function edgePoint(from, to) {
  const a = centerOf(from);
  const b = centerOf(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const scale = Math.min(Math.abs((from.w / 2) / dx || Infinity), Math.abs((from.h / 2) / dy || Infinity));
  return { x: a.x + dx * scale, y: a.y + dy * scale };
}

function commands() {
  const out = [];
  out.push(`q ${rgb("bg")} rg 0 0 ${page.w} ${page.h} re f Q`);

  out.push("BT /F1 18 Tf 1 0 0 1 60 1145 Tm");
  out.push(`0.086 0.125 0.071 rg (${escapeText("Lokerin Vibecoding Workflow Map")}) Tj ET`);
  out.push("BT /F1 10 Tf 1 0 0 1 60 1125 Tm");
  out.push(`0.408 0.455 0.369 rg (${escapeText("From broken Expo project to polished local-first app, with future roadmap.")}) Tj ET`);

  for (const [fromId, toId, dashed] of edges) {
    const from = boxes.find((box) => box.id === fromId);
    const to = boxes.find((box) => box.id === toId);
    const start = edgePoint(from, to);
    const end = edgePoint(to, from);
    out.push("q");
    out.push(`${rgb(dashed ? "teal" : "limePressed")} RG 3 w`);
    if (dashed) out.push("[9 8] 0 d");
    out.push(`${start.x.toFixed(1)} ${start.y.toFixed(1)} m ${end.x.toFixed(1)} ${end.y.toFixed(1)} l S`);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrow = 12;
    const left = {
      x: end.x - arrow * Math.cos(angle - Math.PI / 7),
      y: end.y - arrow * Math.sin(angle - Math.PI / 7),
    };
    const right = {
      x: end.x - arrow * Math.cos(angle + Math.PI / 7),
      y: end.y - arrow * Math.sin(angle + Math.PI / 7),
    };
    out.push(`${rgb(dashed ? "teal" : "limePressed")} rg`);
    out.push(`${end.x.toFixed(1)} ${end.y.toFixed(1)} m ${left.x.toFixed(1)} ${left.y.toFixed(1)} l ${right.x.toFixed(1)} ${right.y.toFixed(1)} l h f`);
    out.push("Q");
  }

  for (const box of boxes) {
    const titleColor = box.dark ? "1 1 1" : rgb("dark");
    const bodyColor = box.dark ? "0.961 0.98 0.937" : rgb("muted");
    out.push("q");
    out.push(`${rgb(box.fill)} rg ${rgb(box.stroke)} RG 2 w`);
    out.push(`${box.x} ${box.y} ${box.w} ${box.h} re B`);
    out.push("Q");

    let textY = box.y + box.h - 30;
    out.push(`BT /F1 ${box.titleSize || 18} Tf ${titleColor} rg 1 0 0 1 ${box.x + 18} ${textY} Tm (${escapeText(box.title)}) Tj ET`);
    textY -= box.titleSize ? 30 : 24;
    for (const line of box.lines) {
      for (const wrapped of wrap(line, Math.floor(box.w / 8.5))) {
        out.push(`BT /F1 12 Tf ${bodyColor} rg 1 0 0 1 ${box.x + 18} ${textY} Tm (${escapeText(wrapped)}) Tj ET`);
        textY -= 17;
      }
    }
  }

  return out.join("\n");
}

function makePdf() {
  const content = commands();
  const objects = [];
  function addObject(body) {
    objects.push(body);
    return objects.length;
  }
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const contentId = addObject(`<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`);
  const pageId = addObject(`<< /Type /Page /Parent 4 0 R /MediaBox [0 0 ${page.w} ${page.h}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
  const pagesId = addObject(`<< /Type /Pages /Kids [${pageId} 0 R] /Count 1 >>`);
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return pdf;
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, makePdf(), "binary");
console.log(outPath);
