// slide-motions site v1
// Builds the static site in _site/ for GitHub Pages: a homepage listing every deck, and per deck the same
// presenter page `hyperframes present` serves, so View, Present (P) and ?mode=audience work without a server.
// Everything specific to this repository (title, language, topic names, theme, font) comes from slide/site.json;
// this file stays identical across repositories. Usage: npm run site
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { hyperframesBin, listDecks, listUnbuilt, root } from "./decks.mjs";

const out = path.join(root, "_site");

// ---------- config ----------
const strings = {
  en: {
    intro: "Open a deck to view it. To present, click Present (or press <kbd>P</kbd>) inside the deck: this tab becomes the presenter view with notes, and an audience tab opens for screen sharing.",
    open: "Open deck",
    audience: "Audience",
    slides: (n) => `${n} slides`,
    notBuilt: "not built",
    audienceNote: "<b>Audience</b> reopens a deck's audience screen. It follows the deck tab open in the <b>same browser</b>; it does not sync to another device.",
    source: "Source",
  },
  vi: {
    intro: "Bấm <b>Mở deck</b> để xem. Muốn trình chiếu, bấm Present (hoặc phím <kbd>P</kbd>) trong deck: tab hiện tại thành màn Presenter có ghi chú, tab Audience mở ra để chia sẻ.",
    open: "Mở deck",
    audience: "Audience",
    slides: (n) => `${n} slide`,
    notBuilt: "chưa dựng",
    audienceNote: "<b>Audience</b> mở lại màn khán giả của deck. Nó đi theo tab deck đang mở trong <b>cùng trình duyệt</b>, không đồng bộ sang máy khác.",
    source: "Mã nguồn",
  },
};
// Neutral dark theme for a repository whose site.json sets none.
const defaultTheme = { bg: "#0b0d12", panel: "#151922", line: "#2a3040", ink: "#eef1f6", muted: "#9aa3b5", accent: "#7c8cff", accentEnd: "#b18cff" };

const configPath = path.join(root, "slide", "site.json");
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf8")) : {};
const lang = strings[config.lang] ? config.lang : "en";
const t = { ...strings[lang], ...(config.strings || {}) };
const theme = { ...defaultTheme, ...(config.theme || {}) };
const topicName = (topic) => (config.topics && config.topics[topic]) || topic;

// CI exposes the repository as owner/name; locally the origin remote gives the same.
function repoUrl() {
  if (process.env.GITHUB_REPOSITORY) return `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  try {
    const remote = execFileSync("git", ["remote", "get-url", "origin"], { cwd: root, encoding: "utf8" }).trim();
    const m = remote.match(/github\.com[:/](.+?)(?:\.git)?$/);
    return m ? `https://github.com/${m[1]}` : "";
  } catch {
    return "";
  }
}
const repo = repoUrl();
const title = config.title || (repo ? repo.split("/").pop() : "Slide decks");

// The words of the title named by titleHighlight take the gradient; without it the whole title does.
function titleHtml() {
  const h = config.titleHighlight;
  if (!h || !title.includes(h)) return `<span class="grad">${esc(title)}</span>`;
  const i = title.indexOf(h);
  return `${esc(title.slice(0, i))}<span class="grad">${esc(h)}</span>${esc(title.slice(i + h.length))}`;
}

// ---------- presenter page ----------
// `present` builds its page in memory and serves it at "/", with absolute paths to its own routes. The site lives
// under /<repo>/ on Pages, so each absolute path becomes relative to slide/<topic>/<variant>/. The counts pin the
// page of the installed hyperframes: when an upgrade changes them the build stops instead of shipping a page with
// paths that 404.
const rewrites = [
  { from: '"/player.js"', to: '"../../hf/player.js"', count: 1 },
  { from: '"/slideshow.js"', to: '"../../hf/slideshow.js"', count: 1 },
  { from: '"/composition/', to: '"composition/', count: 5 },
];

function startPresent(dir) {
  return new Promise((resolve, reject) => {
    // Port 0 is not accepted, so start high; `present` moves to the next free port and prints the one it took.
    const child = spawn(process.execPath, [hyperframesBin, "present", dir, "--no-open", "--port", "4310"], { stdio: ["ignore", "pipe", "pipe"] });
    let log = "";
    const timer = setTimeout(() => { child.kill(); reject(new Error(`present did not start for ${dir}\n${log}`)); }, 30000);
    const onData = (buf) => {
      log += buf;
      const m = log.match(/http:\/\/localhost:(\d+)/);
      if (m) { clearTimeout(timer); resolve({ child, base: `http://localhost:${m[1]}` }); }
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("exit", (code) => { clearTimeout(timer); reject(new Error(`present exited with ${code} for ${dir}\n${log}`)); });
  });
}

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.text();
}

function relativize(page, name) {
  for (const r of rewrites) {
    const found = page.split(r.from).length - 1;
    if (found !== r.count) throw new Error(`${name}: expected ${r.count} x ${r.from} in the present page, found ${found}; check the hyperframes upgrade`);
    page = page.replaceAll(r.from, r.to);
  }
  const leftover = page.match(/["'(]\/[a-z_]/i);
  if (leftover) throw new Error(`${name}: absolute path left in the present page near ${JSON.stringify(page.slice(leftover.index, leftover.index + 40))}`);
  return page;
}

// ---------- homepage ----------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Copies the configured @fontsource files into hf/fonts/ and returns their @font-face rules. Without a font in
// site.json the homepage uses the system stack and needs no package.
function fontFaces() {
  const f = config.font;
  if (!f || !f.package) return "";
  const require = createRequire(path.join(root, "package.json"));
  const filesDir = path.join(path.dirname(require.resolve(`${f.package}/package.json`)), "files");
  const base = f.package.split("/").pop();
  const rules = [];
  for (const w of f.weights || [400, 700]) {
    for (const s of f.subsets || ["latin"]) {
      const file = `${base}-${s}-${w}-normal.woff2`;
      fs.copyFileSync(path.join(filesDir, file), path.join(out, "hf", "fonts", file));
      rules.push(`@font-face{font-family:"${f.family}";font-weight:${w};font-display:swap;src:url("hf/fonts/${file}") format("woff2")}`);
    }
  }
  return rules.join("\n");
}

function homepage(decks, unbuilt) {
  const topics = [...new Set([...decks, ...unbuilt].map((d) => d.topic))].sort();
  const card = (d) => {
    const href = `${d.topic}/${d.variant}/`;
    const cover = fs.existsSync(d.cover)
      ? `<img src="${href}thumbnail/cover.webp" width="960" height="540" alt="" loading="lazy">`
      : `<span class="nocover">${esc(d.variant)}</span>`;
    return `
      <article class="card">
        <a class="thumb" href="${href}" aria-label="${esc(t.open)}: ${esc(d.title)}">${cover}</a>
        <div class="body">
          <h3>${esc(d.title)}</h3>
          <div class="chips"><span>${esc(t.slides(d.slides))}</span>${d.lang ? `<span>${esc(d.lang.toUpperCase())}</span>` : ""}<span class="mono">${esc(d.variant)}</span></div>
          <div class="actions">
            <a class="btn primary" href="${href}">${esc(t.open)}</a>
            <a class="btn" href="${href}?mode=audience">${esc(t.audience)}</a>
          </div>
        </div>
      </article>`;
  };
  const pending = (u) => {
    const file = repo ? `<a class="mono" href="${repo}/blob/main/${u.content}">${esc(u.content)}</a>` : `<span class="mono">${esc(u.content)}</span>`;
    return `
      <article class="card pending">
        <div class="thumb"><span class="nocover">${esc(t.notBuilt)}</span></div>
        <div class="body">
          <h3>${esc(u.title)}</h3>
          <div class="chips"><span>${esc(t.notBuilt)}</span>${file}</div>
        </div>
      </article>`;
  };
  const sections = topics.map((topic) => `
    <section>
      <h2>${esc(topicName(topic))}</h2>
      <div class="grid">${decks.filter((d) => d.topic === topic).map(card).join("")}${unbuilt.filter((u) => u.topic === topic).map(pending).join("")}
      </div>
    </section>`).join("");
  const family = config.font && config.font.family ? `"${config.font.family}", ` : "";
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
${fontFaces()}
:root { --bg: ${theme.bg}; --panel: ${theme.panel}; --line: ${theme.line}; --ink: ${theme.ink}; --muted: ${theme.muted}; --accent: ${theme.accent}; --accent-end: ${theme.accentEnd}; --title-gradient: ${theme.titleGradient || "linear-gradient(90deg, var(--accent), var(--accent-end))"}; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: ${family}system-ui, sans-serif; }
main { max-width: 1180px; margin: 0 auto; padding: 48px 16px 64px; }
header h1 { margin: 0; font-size: clamp(32px, 6vw, 52px); font-weight: 800; letter-spacing: -.02em; }
header h1 .grad { background: var(--title-gradient); -webkit-background-clip: text; background-clip: text; color: transparent; }
header p { margin: 12px 0 0; color: var(--muted); font-size: 17px; line-height: 1.5; max-width: 680px; }
kbd { font-family: inherit; font-weight: 600; border: 1px solid var(--line); border-bottom-width: 2px; border-radius: 6px; padding: 0 6px; color: var(--ink); }
h2 { margin: 48px 0 16px; font-size: 18px; font-weight: 600; color: var(--muted); }
.mono { font-family: ui-monospace, "JetBrains Mono", Consolas, monospace; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: 20px; }
.card { background: var(--panel); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
.thumb { display: block; aspect-ratio: 16 / 9; background: var(--bg); border-bottom: 1px solid var(--line); }
.thumb img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .25s ease; }
a.thumb:hover img { transform: scale(1.03); }
.nocover { display: grid; place-items: center; height: 100%; color: var(--muted); font-weight: 600; }
.body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
h3 { margin: 0; font-size: 18px; font-weight: 700; line-height: 1.35; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chips > * { font-size: 13px; padding: 3px 10px; border-radius: 999px; border: 1px solid var(--line); color: var(--muted); text-decoration: none; overflow-wrap: anywhere; }
.actions { display: flex; gap: 10px; margin-top: auto; }
.btn { flex: 1; text-align: center; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--line); color: var(--ink); text-decoration: none; font-weight: 600; font-size: 15px; }
.btn:hover { border-color: var(--accent); }
.btn.primary { background: linear-gradient(90deg, var(--accent), var(--accent-end)); border-color: transparent; }
.pending { opacity: .7; }
footer { margin-top: 56px; color: var(--muted); font-size: 14px; line-height: 1.6; }
footer a { color: var(--ink); }
</style>
</head>
<body>
<main>
  <header>
    <h1>${titleHtml()}</h1>
    <p>${config.intro || t.intro}</p>
  </header>${sections}
  <footer>
    <p>${t.audienceNote}</p>${repo ? `
    <p>${esc(t.source)}: <a href="${repo}">${esc(repo.replace("https://", ""))}</a></p>` : ""}
  </footer>
</main>
</body>
</html>
`;
}

// ---------- build ----------
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "hf", "fonts"), { recursive: true });

const decks = listDecks();
let bundlesWritten = false;
for (const deck of decks) {
  const name = `${deck.topic}/${deck.variant}`;
  const dest = path.join(out, deck.topic, deck.variant);
  const { child, base } = await startPresent(deck.dir);
  try {
    fs.mkdirSync(path.join(dest, "composition"), { recursive: true });
    fs.writeFileSync(path.join(dest, "index.html"), relativize(await get(`${base}/`), name));
    if (!bundlesWritten) {
      fs.writeFileSync(path.join(out, "hf", "player.js"), await get(`${base}/player.js`));
      fs.writeFileSync(path.join(out, "hf", "slideshow.js"), await get(`${base}/slideshow.js`));
      bundlesWritten = true;
    }
  } finally {
    child.kill();
  }
  // Only what the composition loads at run time; src/ holds the generator and stays in the repository.
  fs.copyFileSync(path.join(deck.dir, "index.html"), path.join(dest, "composition", "index.html"));
  fs.cpSync(path.join(deck.dir, "assets"), path.join(dest, "composition", "assets"), { recursive: true });
  if (fs.existsSync(deck.cover)) fs.cpSync(path.dirname(deck.cover), path.join(dest, "thumbnail"), { recursive: true });
  console.log(`${name}  ${deck.slides} slides${fs.existsSync(deck.cover) ? "" : "  (no thumbnail, run npm run thumbs)"}`);
}

const unbuilt = listUnbuilt(decks);
fs.writeFileSync(path.join(out, "index.html"), homepage(decks, unbuilt));
console.log(`_site/index.html  ${decks.length} decks, ${unbuilt.length} not built${fs.existsSync(configPath) ? "" : ", no slide/site.json (defaults)"}`);
