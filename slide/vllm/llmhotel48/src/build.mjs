// Builds slide/vllm/llmhotel48/index.html: one HyperFrames composition holding every slide as a top-level scene.
// Speaker notes come from content/vllm/llmhotel48.md so the script has a single source.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const deckDir = path.resolve(here, "..");
const content = fs.readFileSync(path.resolve(deckDir, "../../../content/vllm/llmhotel48.md"), "utf8");

// ---------- notes ----------
function notesFor(key) {
  const re = new RegExp(`^### Slide ${key} - .*$\\n\\n([\\s\\S]*?)(?=\\n### |\\n## |$)`, "m");
  const m = content.match(re);
  if (!m) throw new Error(`no script for slide ${key}`);
  return m[1].trim();
}

// ---------- palette: one colour per tour ----------
const A = "#fb7185", B = "#a78bfa", C = "#fbbf24", D = "#38bdf8", FREE = "#34d399";

// ---------- room grid: 8 x 6 = 48 rooms ----------
const RS = 84, RG = 10, GX = 120, GY = 280;
const pos = (i) => ({ x: GX + (i % 8) * (RS + RG), y: GY + Math.floor(i / 8) * (RS + RG) });
const room = (i, cls, fill, stroke, dash = "") => {
  const { x, y } = pos(i);
  return `<rect class="${cls}" x="${x}" y="${y}" width="${RS}" height="${RS}" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="4"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
};
const range = (a, b) => Array.from({ length: b - a }, (_, k) => a + k);
const kick = (c, t) => `<div class="kicker"><i style="background:${c}"></i>${t}</div>`;
const IN = (id) => `tl.fromTo($("#${id}"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);`;

const slides = [];
const add = (s) => slides.push(s);

// S01 scenario
add({
  id: "s01", key: "1", dur: 10, frags: [5, 8.5],
  html: `
${kick("#38bdf8", "Scenario")}
<div class="title" id="s01-t">The <span class="hl">48-Room</span> Hotel</div>
<div class="chip-abs" id="s01-chip" style="left:1250px;top:150px;--c:#38bdf8">Illustrative example</div>
<svg class="full" viewBox="0 0 1920 1080">${range(0, 48).map((i) => room(i, "r1", "#10172b", "#2a3a60")).join("")}</svg>
<div class="tour" id="s01-a" style="left:960px;top:280px;--c:${A}"><b>Tour A</b><span>needs 10 rooms, arrives at 5 PM</span></div>
<div class="tour" id="s01-b" style="left:960px;top:450px;--c:${B}"><b>Tour B</b><span>needs 5 rooms, arrives at midnight</span></div>
<div class="tour" id="s01-c" style="left:960px;top:620px;--c:${C}"><b>Tour C</b><span>needs 7 rooms, never shows up</span></div>
<div class="question hl" id="s01-q" style="top:880px">How can we serve more guests with the same 48 rooms?</div>`,
  js: `
${IN("s01-t")}
tl.fromTo($("#s01-chip"),{opacity:0},{opacity:1,duration:.4},.4);
tl.fromTo($(".r1"),{opacity:0,scale:.6,transformOrigin:"50% 50%"},{opacity:1,scale:1,duration:.3,stagger:.025,ease:"back.out(1.6)"},.4);
tl.fromTo($("#s01-a"),{opacity:0,x:80},{opacity:1,x:0,duration:.5,ease:"power3.out"},2.0);
tl.fromTo($("#s01-b"),{opacity:0,x:80},{opacity:1,x:0,duration:.5,ease:"power3.out"},3.0);
tl.fromTo($("#s01-c"),{opacity:0,x:80},{opacity:1,x:0,duration:.5,ease:"power3.out"},4.0);
tl.fromTo($("#s01-q"),{opacity:0,y:30},{opacity:1,y:0,duration:.7,ease:"power3.out"},6.2);`,
});

// S02 problem 1: reserved vs occupied
{
  const occ = (r) => r.map((i) => room(i, "", "", ""));
  const grp = (cls, c, idx, used) => idx.map((i, k) => k < used ? room(i, cls, `${c}`, c) : room(i, cls, `${c}22`, c, "10 8")).join("");
  add({
    id: "s02", key: "2", dur: 12, frags: [2.6, 4.4, 6.2, 8.6],
    html: `
${kick("#fb7185", "Problem 1")}
<div class="title" id="s02-t">48 Rooms, But <span class="hl">Fully Booked?</span></div>
<svg class="full" viewBox="0 0 1920 1080">
  ${range(0, 48).map((i) => room(i, "base", "#10172b", FREE)).join("")}
  <g id="s02-ga">${grp("ra", A, range(0, 10), 6)}</g>
  <g id="s02-gb">${grp("rb", B, range(10, 18), 3)}</g>
  <g id="s02-gc">${grp("rc", C, range(18, 25), 0)}</g>
</svg>
<div class="legend" style="top:280px">
  <div class="lg" id="s02-la" style="--c:${A}"><b>Tour A</b> reserves up to 10, uses only 6</div>
  <div class="lg" id="s02-lb" style="--c:${B}"><b>Tour B</b> reserves up to 8, uses only 3</div>
  <div class="lg" id="s02-lc" style="--c:${C}"><b>Tour C</b> reserves up to 7, not arrived yet</div>
</div>
<div class="legend" id="s02-tab" style="top:520px">
  <div class="row"><span class="dot" style="border:3px solid ${FREE}"></span>Total rooms<span class="n">48</span></div>
  <div class="row"><span class="dot" style="background:#eef2ff"></span>Currently occupied<span class="n">9</span></div>
  <div class="row"><span class="dot" style="border:3px dashed #eef2ff"></span>Reserved but unused<span class="n">16</span></div>
  <div class="row"><span class="dot" style="background:${FREE}"></span>Completely available<span class="n">23</span></div>
</div>
<div class="chips" id="s02-ch" style="top:890px"><span class="chip" style="--c:${A}">KV Cache</span><span class="chip" style="--c:${C}">Max sequence length</span><span class="chip" style="--c:${B}">Memory fragmentation</span></div>
<div class="src">Illustrative example</div>`,
    js: `
${IN("s02-t")}
tl.fromTo($("#s02 .base"),{opacity:0},{opacity:1,duration:.3,stagger:.015},.3);
${[["ga", "la", 1.4], ["gb", "lb", 3.2], ["gc", "lc", 5.0]].map(([g, l, t]) => `tl.fromTo($("#s02-${l}"),{opacity:0,x:30},{opacity:1,x:0,duration:.4},${t});
tl.fromTo($("#s02-${g} rect"),{opacity:0,scale:.5,transformOrigin:"50% 50%"},{opacity:1,scale:1,duration:.3,stagger:.06,ease:"back.out(2)"},${t + 0.2});`).join("\n")}
tl.fromTo($("#s02-tab .row"),{opacity:0,x:30},{opacity:1,x:0,duration:.35,stagger:.4},6.8);
tl.fromTo($("#s02-ch .chip"),{opacity:0,y:24},{opacity:1,y:0,duration:.35,stagger:.2,ease:"back.out(2)"},9.2);`,
  });
}

// S03 solution 1: three rules
{
  const cards = [
    { c: A, no: "Rule 1", h: "Allocate Rooms on Demand", body: `<p><b>Old:</b> Reserve all expected rooms in advance.</p><p><b>New:</b> Assign rooms only when guests actually arrive.</p>`, chip: "On-demand KV Cache Allocation" },
    { c: B, no: "Rule 2", h: "Any Available Room Can Be Assigned", body: `<p><b>Old:</b> A group must occupy adjacent rooms.</p><p><b>New:</b> Any available room can be assigned.</p>`, chip: "Non-contiguous Memory Allocation" },
    { c: D, no: "Rule 3", h: "Keep a Room Mapping Record", body: `<p>Maintain a record of which group occupies which room.</p>`, chip: "Block Table" },
  ];
  add({
    id: "s03", key: "3", dur: 10, frags: [2.6, 4.8, 7.0],
    html: `
${kick("#34d399", "Solution 1")}
<div class="title" id="s03-t" style="font-size:64px"><span class="hl">PagedAttention:</span> Rethinking Memory Allocation</div>
${cards.map((k, i) => `<div class="card s03-c" style="left:${120 + i * 570}px;--c:${k.c}"><span class="no">${k.no}</span><h3>${k.h}</h3>${k.body}<span class="chip wrap" style="--c:${k.c}">${k.chip}</span></div>`).join("")}`,
    js: `
${IN("s03-t")}
${[0, 1, 2].map((i) => `tl.fromTo($(".s03-c")[${i}],{opacity:0,y:50},{opacity:1,y:0,duration:.6,ease:"back.out(1.4)"},${1.2 + i * 2.2});`).join("\n")}`,
  });
}

// generic before/after table
const compare = (id, h1, h2, rows, c1, c2) => `
<div class="col-h" style="left:120px;--c:${c1}">${h1}</div>
<div class="col-h" style="left:1000px;--c:${c2}">${h2}</div>
<svg class="full" viewBox="0 0 1920 1080"><path d="M935 329 H985 M970 314 L985 329 L970 344" stroke="#8190b5" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
${rows.map((r, i) => `<div class="cell ${id}-r" style="left:120px;top:${390 + i * 108}px;--c:${c1}">${r[0]}</div><div class="cell ${id}-r" style="left:1000px;top:${390 + i * 108}px;--c:${c2}">${r[1]}</div>`).join("")}`;
const compareJs = (id, n) => `
tl.fromTo($(".col-h"),{opacity:0,y:20},{opacity:1,y:0,duration:.45},.5);
${Array.from({ length: n }, (_, i) => `tl.fromTo([$(".${id}-r")[${i * 2}],$(".${id}-r")[${i * 2 + 1}]],{opacity:0,x:-30},{opacity:1,x:0,duration:.4},${1.0 + i * 0.7});`).join("\n")}`;

// S04 result 1
add({
  id: "s04", key: "4", dur: 9, frags: [4.2, 7.0],
  html: `
${kick("#fbbf24", "Result 1")}
<div class="title" id="s04-t">More Usable Memory, <span class="hl">Less Waste</span></div>
${compare("s04", "Traditional Allocation", "PagedAttention", [
    ["Reserve memory in advance", "Allocate memory on demand"],
    ["Require contiguous memory", "Allow non-contiguous blocks"],
    ["Waste reserved capacity", "Reduce unused allocated capacity"],
    ["Difficult to manage fragmented space", "Flexible block allocation"],
  ], "#fb7185", "#34d399")}
<div class="chips" id="s04-o" style="top:852px"><span class="chip" style="--c:#34d399">Better KV Cache memory utilization</span><span class="chip" style="--c:#38bdf8">Reduced memory fragmentation</span><span class="chip" style="--c:#a78bfa">More room for concurrent requests</span><span class="chip" style="--c:#fbbf24">More efficient GPU memory usage</span></div>`,
  js: `
${IN("s04-t")}${compareJs("s04", 4)}
tl.fromTo($("#s04-o .chip"),{opacity:0,y:24},{opacity:1,y:0,duration:.4,stagger:.3,ease:"back.out(2)"},4.6);`,
});

// S05 problem 2: static batching timeline
{
  const X0 = 380, XA = 860, XB = 1330, XC = 1580, XE = 1800;
  const ys = [330, 450, 570, 690];
  add({
    id: "s05", key: "5", dur: 11, frags: [2.4, 4.2, 6.0, 8.0],
    html: `
${kick("#fb7185", "Problem 2")}
<div class="title" id="s05-t">Available Rooms, But <span class="hl">Guests Still Wait</span></div>
<div class="lane" style="top:${ys[0]}px;--c:${A}">Tour A</div><div class="lane" style="top:${ys[1]}px;--c:${B}">Tour B</div><div class="lane" style="top:${ys[2]}px;--c:${C}">Tour C</div><div class="lane" style="top:${ys[3]}px;--c:${D}">Tour D</div>
<svg class="full" viewBox="0 0 1920 1080">
  <defs><pattern id="hatch-s05" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="22" height="22" fill="#1a1020"/><rect width="8" height="22" fill="#3a1d2a"/></pattern></defs>
  <g id="s05-br"><path d="M${X0} 292 V280 H${XC} V292" stroke="#8190b5" stroke-width="4" fill="none"/></g>
  <g id="s05-idle"><rect x="${XA}" y="${ys[0] + 10}" width="${XC - XA}" height="70" rx="12" fill="url(#hatch-s05)" stroke="#fb7185" stroke-width="3" stroke-dasharray="10 8"/></g>
  <g id="s05-ba"><rect x="${X0}" y="${ys[0] + 10}" width="${XA - X0}" height="70" rx="12" fill="${A}"/></g>
  <g id="s05-bb"><rect x="${X0}" y="${ys[1] + 10}" width="${XB - X0}" height="70" rx="12" fill="${B}"/></g>
  <g id="s05-bc"><rect x="${X0}" y="${ys[2] + 10}" width="${XC - X0}" height="70" rx="12" fill="${C}"/></g>
  <g id="s05-wait"><rect x="${X0}" y="${ys[3] + 10}" width="${XC - X0}" height="70" rx="12" fill="#38bdf81a" stroke="${D}" stroke-width="4" stroke-dasharray="14 10"/><rect class="amb s05-pulse" x="${X0}" y="${ys[3] + 10}" width="${XC - X0}" height="70" rx="12" fill="#38bdf833"/></g>
  <g id="s05-bd"><rect x="${XC}" y="${ys[3] + 10}" width="${XE - XC}" height="70" rx="12" fill="${D}"/></g>
  <g id="s05-end"><path d="M${XC} 300 V790" stroke="#eef2ff" stroke-width="4" stroke-dasharray="12 10"/></g>
</svg>
<div class="bar-t" id="s05-ta" style="left:${X0}px;top:${ys[0] + 10}px;height:70px">Completed at 6 PM</div>
<div class="bar-t" id="s05-tb" style="left:${X0}px;top:${ys[1] + 10}px;height:70px">Still staying</div>
<div class="bar-t" id="s05-tc" style="left:${X0}px;top:${ys[2] + 10}px;height:70px">Still staying</div>
<div class="bar-t" id="s05-tw" style="left:${X0}px;top:${ys[3] + 10}px;height:70px;color:${D}">Waiting to check in</div>
<div class="bar-t" id="s05-td" style="left:${XC}px;top:${ys[3] + 10}px;height:70px;width:${XE - XC}px;box-sizing:border-box">Tour D</div>
<div class="bar-t" id="s05-ti" style="left:${XA + 30}px;top:${ys[0] + 10}px;height:70px;color:#fda4af">Idle capacity</div>
<div class="bar-t" id="s05-bl" style="left:${X0}px;top:222px;height:50px;color:#cbd5e1;font-size:40px;padding-left:0">One batch: A + B + C</div>
<div class="chips" id="s05-ch" style="top:850px"><span class="chip" style="--c:#fb7185">Static Batching</span><span class="chip" style="--c:#38bdf8">Request Queue</span><span class="chip" style="--c:#fbbf24">GPU Utilization</span></div>
<div class="caption-q hl" id="s05-q" style="position:absolute;left:120px;right:120px;top:940px;text-align:center;font-size:44px;font-weight:800">Can a finished request be replaced without waiting for the whole batch?</div>`,
    js: `
${IN("s05-t")}
tl.fromTo($("#s05-bl,#s05-br"),{opacity:0},{opacity:1,duration:.4},.5);
${[["ba", "ta", 1.0], ["bb", "tb", 1.3], ["bc", "tc", 1.6]].map(([g, t, s]) => `tl.fromTo($("#s05-${g}"),{opacity:0,scaleX:0,transformOrigin:"${X0}px 50%"},{opacity:1,scaleX:1,duration:.9,ease:"power2.out"},${s});
tl.fromTo($("#s05-${t}"),{opacity:0},{opacity:1,duration:.3},${s + 0.5});`).join("\n")}
tl.fromTo($("#s05-idle,#s05-ti"),{opacity:0},{opacity:1,duration:.5},3.2);
tl.fromTo($("#s05-wait,#s05-tw"),{opacity:0,x:-30},{opacity:1,x:0,duration:.5},4.8);
tl.fromTo($("#s05-end"),{opacity:0},{opacity:1,duration:.4},6.6);
tl.fromTo($("#s05-bd,#s05-td"),{opacity:0,x:-40},{opacity:1,x:0,duration:.5},7.0);
tl.fromTo($("#s05-ch .chip"),{opacity:0,y:24},{opacity:1,y:0,duration:.35,stagger:.2,ease:"back.out(2)"},8.0);
tl.fromTo($("#s05-q"),{opacity:0,y:20},{opacity:1,y:0,duration:.5},9.2);`,
    amb: `gsap.to(".s05-pulse",{opacity:.2,duration:.9,yoyo:true,ease:"sine.inOut",repeat:9999});`,
  });
}

// S06 solution 2: continuous batching
{
  const bx = [470, 790, 1110], by = [290, 430, 570];
  const box = (x, y, l, c, cls, extra = "") => `<g class="${cls}"><rect x="${x}" y="${y}" width="270" height="100" rx="20" fill="${c}22" stroke="${c}" stroke-width="4" ${extra}/><text x="${x + 135}" y="${y + 68}" text-anchor="middle" font-size="56" font-weight="800" fill="${c}">${l}</text></g>`;
  add({
    id: "s06", key: "6", dur: 12, frags: [2.0, 4.2, 6.4, 8.8],
    html: `
${kick("#34d399", "Solution 2")}
<div class="title" id="s06-t"><span class="hl">Continuous</span> Batching</div>
<div class="it" id="s06-i1" style="top:${by[0] + 25}px">Iteration 1</div><div class="it" id="s06-i2" style="top:${by[1] + 25}px">Iteration 2</div><div class="it" id="s06-i3" style="top:${by[2] + 25}px">Iteration 3</div>
<svg class="full" viewBox="0 0 1920 1080">
  <g id="s06-r1">${box(bx[0], by[0], "A", A, "")}${box(bx[1], by[0], "B", B, "")}${box(bx[2], by[0], "C", C, "")}</g>
  <g id="s06-r2">${box(bx[0], by[1], "A", A, "s06-adone")}${box(bx[1], by[1], "B", B, "")}${box(bx[2], by[1], "C", C, "")}
    <g id="s06-done"><text x="${bx[0] + 135}" y="${by[1] + 66}" text-anchor="middle" font-size="48" font-weight="800" fill="${A}" transform="rotate(-8 ${bx[0] + 135} ${by[1] + 50})">Done</text></g></g>
  <g id="s06-r3">${box(bx[0], by[2], "D", D, "s06-d")}${box(bx[1], by[2], "B", B, "")}${box(bx[2], by[2], "C", C, "")}</g>
</svg>
<div class="ev" id="s06-e1" style="top:${by[0] + 28}px">All requests are running</div>
<div class="ev" id="s06-e2" style="top:${by[1] + 28}px;color:${A}">A finishes</div>
<div class="ev" id="s06-e3" style="top:${by[2] + 28}px;color:${D}">D joins the batch</div>
<div class="chips" id="s06-h" style="top:730px;gap:20px">
  <span class="chip wrap" style="--c:${A};width:820px">Completed requests leave the batch</span>
  <span class="chip wrap" style="--c:${D};width:820px">New requests enter at the next scheduling opportunity</span>
  <span class="chip wrap" style="--c:${B};width:820px">Remaining requests continue generating tokens</span>
  <span class="chip wrap" style="--c:${FREE};width:820px">The scheduler manages request admission</span>
</div>`,
    js: `
${IN("s06-t")}
tl.fromTo($("#s06-r1,#s06-i1,#s06-e1"),{opacity:0,x:-30},{opacity:1,x:0,duration:.5},.6);
tl.fromTo($("#s06-r2,#s06-i2,#s06-e2"),{opacity:0,x:-30},{opacity:1,x:0,duration:.5},2.4);
tl.fromTo($("#s06-done"),{opacity:0},{opacity:1,duration:.4},3.0);
tl.to($(".s06-adone"),{opacity:.35,duration:.4},3.0);
tl.fromTo($("#s06-r3,#s06-i3,#s06-e3"),{opacity:0,x:-30},{opacity:1,x:0,duration:.5},4.6);
tl.fromTo($(".s06-d"),{scale:.6,transformOrigin:"50% 50%"},{scale:1,duration:.6,ease:"back.out(2)"},5.0);
tl.fromTo($("#s06-h .chip"),{opacity:0,y:24},{opacity:1,y:0,duration:.4,stagger:.45,ease:"back.out(2)"},6.8);`,
  });
}

// S07 result 2
add({
  id: "s07", key: "7", dur: 8, frags: [4.0, 6.0],
  html: `
${kick("#fbbf24", "Result 2")}
<div class="title" id="s07-t">Keep the <span class="hl">GPU Busy</span></div>
${compare("s07", "Static Batching", "Continuous Batching", [
    ["Fixed batch membership", "Dynamic batch membership"],
    ["Wait for batch completion", "Replace completed requests"],
    ["Potential GPU idle time", "Better resource utilization"],
    ["New requests may wait longer", "More flexible request admission"],
  ], "#fb7185", "#34d399")}
<div class="key hl" id="s07-k" style="top:850px">Continuous Batching improves request scheduling and GPU utilization.</div>`,
  js: `
${IN("s07-t")}${compareJs("s07", 4)}
tl.fromTo($("#s07-k"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},4.4);`,
});

// S08 combination
{
  const ny = [270, 400, 560, 690, 830], nh = [90, 110, 90, 110, 90];
  const nodes = [
    ["Incoming Requests", "", D], ["Request Scheduler", "Continuous Batching", FREE], ["Model Execution", "", "#cbd5e1"],
    ["PagedAttention", "KV Cache Blocks", B], ["GPU Memory", "", C],
  ];
  add({
    id: "s08", key: "8", dur: 12, frags: [2.6, 5.0, 8.6],
    html: `
${kick("#a78bfa", "Integration")}
<div class="title" id="s08-t" style="font-size:56px">The Combination: <span class="hl">PagedAttention + Continuous Batching</span></div>
<div id="s08-pn">
<div class="pn" id="s08-p1" style="top:${ny[0] + 10}px;--c:${B}"><h3>PagedAttention - Memory Management</h3><ul><li>Divides KV Cache into blocks.</li><li>Allocates blocks dynamically.</li><li>Maps logical blocks to physical blocks.</li><li>Reduces memory waste.</li></ul></div>
<div class="pn" id="s08-p2" style="top:${ny[0] + 330}px;--c:${FREE}"><h3>Continuous Batching - Request Scheduling</h3><ul><li>Tracks active requests.</li><li>Removes completed requests.</li><li>Admits new requests.</li><li>Keeps the batch dynamically populated.</li></ul></div>
</div>
<div id="s08-tk">
<div class="tk" style="top:290px;--c:${B}"><b>PagedAttention</b><span>Efficient KV Cache management</span></div>
<div class="tk" style="top:510px;--c:${FREE}"><b>Continuous Batching</b><span>Efficient request scheduling</span></div>
<div class="tk" style="top:730px;--c:${D}"><b>vLLM</b><span>High-performance LLM serving engine</span></div>
</div>
<svg class="full" viewBox="0 0 1920 1080">
  ${[0, 1, 2, 3].map((i) => `<g class="s08-ar"><path d="M1440 ${ny[i] + nh[i] + 2} V${ny[i + 1] - 4}" stroke="#3b4c78" stroke-width="6" fill="none" marker-end="url(#arrow)"/><path class="flow amb" d="M1440 ${ny[i] + nh[i] + 2} V${ny[i + 1] - 12}" stroke="#eef2ff" stroke-width="4" stroke-dasharray="8 14" fill="none"/></g>`).join("")}
</svg>
${nodes.map((n, i) => `<div class="node s08-n" style="top:${ny[i]}px;height:${nh[i]}px;--c:${n[2]}">${n[0]}${n[1] ? `<span>${n[1]}</span>` : ""}</div>`).join("")}`,
    js: `
${IN("s08-t")}
tl.fromTo($("#s08-p1"),{opacity:0,x:-40},{opacity:1,x:0,duration:.5,ease:"power3.out"},.6);
tl.fromTo($("#s08-p2"),{opacity:0,x:-40},{opacity:1,x:0,duration:.5,ease:"power3.out"},1.6);
tl.fromTo($(".s08-n"),{opacity:0,y:30},{opacity:1,y:0,duration:.4,stagger:.5,ease:"power3.out"},3.0);
tl.fromTo($(".s08-ar"),{opacity:0},{opacity:1,duration:.3,stagger:.5},3.3);
tl.to($("#s08-pn"),{opacity:0,x:-60,duration:.5},6.4);
tl.fromTo($("#s08-tk .tk"),{opacity:0,x:-40},{opacity:1,x:0,duration:.5,stagger:.5,ease:"power3.out"},6.9);`,
    amb: ``,
  });
}

// S09 real-world impact
{
  const cards = [
    { c: D, h: "Production LLM APIs", li: ["Multiple users access the same model.", "High request concurrency.", "Centralized inference serving."] },
    { c: B, h: "AI Agent Backend", li: ["Multiple agents send inference requests.", "Shared model serving infrastructure.", "Dynamic request workloads."] },
    { c: FREE, h: "Enterprise LLM Deployment", li: ["Self-hosted LLMs.", "GPU infrastructure management.", "Cost and resource optimization."] },
  ];
  add({
    id: "s09", key: "9", dur: 9, frags: [2.4, 4.6, 6.8],
    html: `
${kick("#38bdf8", "Real-world Impact")}
<div class="title" id="s09-t">When Should We Use <span class="hl">vLLM?</span></div>
${cards.map((k, i) => `<div class="card s09-c" style="left:${120 + i * 570}px;top:260px;height:560px;--c:${k.c}"><span class="no">${i + 1}</span><h3>${k.h}</h3><ul>${k.li.map((l) => `<li>${l}</li>`).join("")}</ul></div>`).join("")}
<div class="chips" id="s09-ch" style="top:850px"><span class="chip" style="--c:${C}">GPU Server</span><span class="chip" style="--c:${D}">Docker Deployment</span><span class="chip" style="--c:${FREE}">OpenAI-compatible API</span><span class="chip" style="--c:${B}">Multi-GPU Serving</span><span class="chip" style="--c:${A}">Tensor Parallelism</span></div>`,
    js: `
${IN("s09-t")}
${[0, 1, 2].map((i) => `tl.fromTo($(".s09-c")[${i}],{opacity:0,y:50},{opacity:1,y:0,duration:.6,ease:"back.out(1.4)"},${1.0 + i * 1.8});`).join("\n")}
tl.fromTo($("#s09-ch .chip"),{opacity:0,y:24},{opacity:1,y:0,duration:.35,stagger:.2,ease:"back.out(2)"},6.4);`,
  });
}

// S10 conclusion
{
  const fill = [A, A, A, A, A, A, B, B, B, B, B, C, C, C, C, C, C, C, D, D, D, D, D, D, A, A, A, A, B, B, B, B, B, B, C, C, C, D, D, D, D, D, A, A, A, B, B, B];
  add({
    id: "s10", key: "10", dur: 10, frags: [3.4, 6.2],
    html: `
${kick("#fbbf24", "Conclusion")}
<div class="title" id="s10-t">More Requests, <span class="hl">Same GPU Resources</span></div>
<svg class="full" viewBox="0 0 1920 1080">${range(0, 48).map((i) => room(i, "r10", `${fill[i]}33`, fill[i])).join("")}</svg>
<div class="out s10-o" style="top:280px;--c:${B}"><b>PagedAttention</b><span>Efficient Memory Management</span></div>
<div class="out s10-o" style="top:450px;--c:${FREE}"><b>Continuous Batching</b><span>Efficient Request Scheduling</span></div>
<div class="out s10-o" style="top:620px;--c:${D}"><b>Combined in vLLM</b><span>High-throughput LLM Serving</span></div>
<div class="question hl" id="s10-q" style="top:890px">Serve more requests with the same GPU resources.</div>`,
    js: `
${IN("s10-t")}
tl.fromTo($(".r10"),{opacity:0,scale:.6,transformOrigin:"50% 50%"},{opacity:1,scale:1,duration:.3,stagger:.03,ease:"back.out(1.6)"},.4);
${[0, 1, 2].map((i) => `tl.fromTo($(".s10-o")[${i}],{opacity:0,x:60},{opacity:1,x:0,duration:.5,ease:"power3.out"},${2.2 + i * 1.5});`).join("\n")}
tl.fromTo($("#s10-q"),{opacity:0,y:30},{opacity:1,y:0,duration:.7,ease:"power3.out"},6.6);`,
  });
}

// ---------- timing ----------
let t = 0;
for (const s of slides) { s.start = t; t += s.dur; }
const total = t;
const r2 = (v) => Math.round(v * 100) / 100;

const island = {
  slides: slides.map((s) => {
    const o = { sceneId: s.id, notes: notesFor(s.key) };
    if (s.frags) o.fragments = s.frags.map((f) => r2(s.start + f));
    return o;
  }),
};

// ---------- fonts ----------
const ranges = {
  vietnamese: "U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB",
  "latin-ext": "U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
  latin: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
};
const fontCss = [400, 600, 800].flatMap((w) => Object.entries(ranges).map(([sub, r]) =>
  `@font-face{font-family:"Be Vietnam Pro";font-style:normal;font-weight:${w};font-display:block;src:url('assets/fonts/be-vietnam-pro-${sub}-${w}-normal.woff2') format('woff2');unicode-range:${r}}`)).join("\n");

const css = fs.readFileSync(path.join(here, "deck.css"), "utf8");

const sceneHtml = slides.map((s) => `
<div id="${s.id}" class="slide" data-composition-id="${s.id}" data-label="${s.id}" data-start="${s.start}" data-duration="${s.dur}" data-width="1920" data-height="1080">${s.html}
</div>`).join("\n");

const sceneJs = slides.map((s) => `
<script>
(function () {
  var $ = scope("${s.id}");
  var tl = gsap.timeline({ paused: true });
  tl.to({}, { duration: ${s.dur} }, 0);
${s.js.trim()}
  window.__timelines["${s.id}"] = tl;
  register("${s.id}", tl);
${s.amb ? `  if (live) setTimeout(function () { ${s.amb} }, 0);` : ""}
})();
</script>`).join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1920, height=1080">
<title>vLLM - From Memory Bottlenecks to Efficient LLM Serving</title>
<style>
${fontCss}
${css}
</style>
<script src="assets/vendor/gsap.min.js"></script>
</head>
<body>
<script type="application/hyperframes-slideshow+json">
${JSON.stringify(island, null, 2)}
</script>
<div id="deck" data-composition-id="deck" data-root="true" data-start="0" data-duration="${total}" data-width="1920" data-height="1080"></div>
<div id="bg-grid"></div>
<svg width="0" height="0" style="position:absolute"><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#3b4c78"/></marker></defs></svg>
${sceneHtml}
<script>
window.__timelines = window.__timelines || {};
// Presented deck only: the composition runs inside the slideshow's player iframe.
var live = (function () {
  try { return window.top !== window && !!window.top.document.querySelector("hyperframes-slideshow"); } catch (e) { return false; }
})();
if (live) document.documentElement.classList.add("live");
function scope(id) {
  var root = document.getElementById(id);
  return function (sel) { return root.querySelectorAll(sel); };
}
// Navigation only seeks; in the presented deck a stand-in clock is registered and the visible
// timeline is tweened to the seeked time so entrances play at real speed.
var current = null;
function follow(id, tl, t) {
  var entering = current !== id;
  var back = entering && current !== null &&
    +document.getElementById(id).dataset.start < +document.getElementById(current).dataset.start;
  current = id;
  gsap.killTweensOf(tl);
  var from = entering ? 0 : tl.time();
  if (back || t <= from) { tl.time(t); return; }
  tl.time(from);
  gsap.to(tl, { time: t, duration: t - from, ease: "none" });
}
function register(id, tl) {
  if (!live) { window.__timelines[id] = tl; return; }
  var clock = gsap.timeline({ paused: true });
  clock.to({}, { duration: +document.getElementById(id).dataset.duration });
  var seek = clock.totalTime;
  clock.totalTime = function (t) {
    var r = seek.apply(clock, arguments);
    if (arguments.length) follow(id, tl, clock.time());
    return r;
  };
  window.__timelines[id] = clock;
}
(function () {
  var tl = gsap.timeline({ paused: true });
  tl.to({}, { duration: ${total} });
  window.__timelines["deck"] = tl;
  if (live) setTimeout(function () {
    gsap.to(document.documentElement, { "--pan": "96px", duration: 24, ease: "none", repeat: 9999 });
    gsap.to(".flow", { strokeDashoffset: -44, duration: 0.9, ease: "none", repeat: 9999 });
  }, 0);
})();
</script>
${sceneJs}
<script src="assets/vendor/hyperframe.runtime.min.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(deckDir, "index.html"), html);
console.log(`slides=${slides.length} total=${total}s`);
