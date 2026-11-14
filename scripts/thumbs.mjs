// slide-motions site v1
// Captures slide 1 of each deck, fully revealed, as slide/<topic>/<variant>/thumbnail/cover.webp
// for the README and the site homepage. Usage: npm run thumbs [-- <topic>/<variant>]
// Runs locally after a deck build: the snapshot needs the Chrome that hyperframes manages, which CI never installs.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { hyperframesBin, listDecks, root } from "./decks.mjs";

const filter = process.argv[2];
const decks = listDecks(filter);
if (!decks.length) throw new Error(filter ? `no deck ${filter}` : "no deck under slide/");

for (const deck of decks) {
  // The first frame of a deck is empty; half a second before slide 1 ends every element of it has entered.
  const at = Math.round((deck.firstStart + deck.firstDuration - 0.5) * 100) / 100;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s4-thumb-"));
  try {
    execFileSync(process.execPath, [hyperframesBin, "snapshot", deck.dir, "--at", String(at), "--no-end", "-o", tmp], { stdio: ["ignore", "ignore", "inherit"] });
    const png = fs.readdirSync(tmp).find((f) => f.endsWith(".png"));
    if (!png) throw new Error(`${deck.topic}/${deck.variant}: snapshot wrote no PNG`);
    fs.mkdirSync(path.dirname(deck.cover), { recursive: true });
    await sharp(path.join(tmp, png)).resize(960, 540).webp({ quality: 82 }).toFile(deck.cover);
    console.log(`${path.relative(root, deck.cover)}  at ${at}s  ${Math.round(fs.statSync(deck.cover).size / 1024)} KB`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
