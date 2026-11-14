// slide-motions site v1
// Finds every HyperFrames deck under slide/<topic>/<variant>/ and every content file under content/<topic>/,
// and reads from each what the thumbnails and the site need.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const hyperframesBin = path.join(root, "node_modules/hyperframes/bin/hyperframes.mjs");

const islandRe = /<script type="application\/hyperframes-slideshow\+json">([\s\S]*?)<\/script>/i;
const dirs = (p) => (fs.existsSync(p) ? fs.readdirSync(p, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort() : []);
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];

// A folder counts as a deck only when its index.html carries a slideshow island, the same test `present` applies.
export function listDecks(filter) {
  const decks = [];
  for (const topic of dirs(path.join(root, "slide"))) {
    for (const variant of dirs(path.join(root, "slide", topic))) {
      if (filter && filter !== `${topic}/${variant}`) continue;
      const dir = path.join(root, "slide", topic, variant);
      const indexPath = path.join(dir, "index.html");
      if (!fs.existsSync(indexPath)) continue;
      const html = fs.readFileSync(indexPath, "utf8");
      const m = html.match(islandRe);
      if (!m) continue;
      const island = JSON.parse(m[1]);
      const first = island.slides[0];
      const sceneTag = (html.match(new RegExp(`<[^>]*data-composition-id="${first.sceneId}"[^>]*>`)) || [])[0];
      if (!sceneTag) throw new Error(`${topic}/${variant}: no scene for slide 1 (${first.sceneId})`);
      decks.push({
        topic,
        variant,
        dir,
        title: (html.match(/<title>([^<]*)<\/title>/) || [])[1] || `${topic}/${variant}`,
        lang: (html.match(/<html[^>]*\slang="([^"]*)"/) || [])[1] || "",
        slides: island.slides.length,
        firstStart: Number(attr(sceneTag, "data-start")),
        firstDuration: Number(attr(sceneTag, "data-duration")),
        cover: path.join(dir, "thumbnail", "cover.webp"),
        content: `content/${topic}/${variant}.md`,
      });
    }
  }
  return decks;
}

// Content files with no deck folder yet, so the homepage can list them as not built.
export function listUnbuilt(decks) {
  const built = new Set(decks.map((d) => d.content));
  const out = [];
  for (const topic of dirs(path.join(root, "content"))) {
    for (const file of fs.readdirSync(path.join(root, "content", topic)).filter((f) => f.endsWith(".md")).sort()) {
      const rel = `content/${topic}/${file}`;
      if (built.has(rel)) continue;
      const text = fs.readFileSync(path.join(root, rel), "utf8");
      out.push({ topic, variant: file.slice(0, -3), title: (text.match(/^# (.+)$/m) || [])[1] || file, content: rel });
    }
  }
  return out;
}
