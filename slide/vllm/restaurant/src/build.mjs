// Builds slide/vllm/restaurant/index.html: one HyperFrames composition holding every slide as a top-level scene.
// Speaker notes come from content/vllm/restaurant.md so the script has a single source.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const deckDir = path.resolve(here, "..");
const brainstorm = fs.readFileSync(path.resolve(deckDir, "../../../content/vllm/restaurant.md"), "utf8");

// ---------- notes ----------
function notesFor(key) {
  const re = new RegExp(`^### Slide ${key} - .*$\\n\\n([\\s\\S]*?)(?=\\n### |\\n## |$)`, "m");
  const m = brainstorm.match(re);
  if (!m) throw new Error(`no script for slide ${key}`);
  return m[1].trim();
}

// ---------- palette ----------
const G = ["#fb7185", "#a78bfa", "#38bdf8", "#fbbf24", "#a3e635", "#2dd4bf", "#f472b6", "#fb923c", "#818cf8"];

// ---------- svg helpers ----------
const person = (x, y, c, cls = "", s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><g class="${cls}"><circle cx="0" cy="-30" r="15" fill="${c}"/><path d="M-24 22 Q-24 -10 0 -10 Q24 -10 24 22 Z" fill="${c}"/></g></g>`;

// a small table = 4x4 seats (16 tokens per block)
function miniTable(x, y, color, filled = 16, cls = "", seat = 20, gap = 4) {
  let out = `<g transform="translate(${x} ${y})"><g class="${cls}">`;
  const w = seat * 4 + gap * 3;
  out += `<rect x="-8" y="-8" width="${w + 16}" height="${w + 16}" rx="12" fill="#0d1428" stroke="${color}" stroke-width="3"/>`;
  for (let i = 0; i < 16; i++) {
    const cx = (i % 4) * (seat + gap), cy = Math.floor(i / 4) * (seat + gap);
    out += `<rect class="seat" x="${cx}" y="${cy}" width="${seat}" height="${seat}" rx="5" fill="${i < filled ? color : "#1c2742"}"/>`;
  }
  return out + `</g></g>`;
}

function gearPath(r, n, depth = 26) {
  const pts = [];
  const steps = n * 4;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const phase = i % 4;
    const rr = phase === 0 || phase === 1 ? r + depth / 2 : r - depth / 2;
    const a2 = a + (Math.PI * 2) / steps;
    pts.push([rr * Math.cos(a), rr * Math.sin(a)], [rr * Math.cos(a2), rr * Math.sin(a2)]);
  }
  return "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L") + " Z";
}

const icon = {
  door: `<g fill="none" stroke="#eef2ff" stroke-width="7" stroke-linejoin="round"><rect x="-30" y="-44" width="60" height="88" rx="6"/><circle cx="16" cy="2" r="4" fill="#eef2ff"/></g>`,
  clip: `<g fill="none" stroke="#eef2ff" stroke-width="7" stroke-linejoin="round"><rect x="-32" y="-40" width="64" height="84" rx="8"/><path d="M-14 -46 h28 v14 h-28 z" fill="#eef2ff"/><path d="M-18 -8 h36 M-18 10 h36 M-18 28 h22"/></g>`,
  table: `<g fill="#eef2ff">${[0, 1, 2, 3].map((i) => `<rect x="${-34 + (i % 2) * 38}" y="${-34 + Math.floor(i / 2) * 38}" width="30" height="30" rx="6"/>`).join("")}</g>`,
  tokens: `<g fill="none" stroke="#eef2ff" stroke-width="6"><rect x="-44" y="-30" width="40" height="26" rx="8"/><rect x="4" y="-30" width="40" height="26" rx="8"/><rect x="-44" y="6" width="56" height="26" rx="8" fill="#eef2ff"/></g>`,
  recycle: `<g fill="none" stroke="#eef2ff" stroke-width="7" stroke-linecap="round"><path d="M-30 6 A32 32 0 0 1 22 -24"/><path d="M30 -6 A32 32 0 0 1 -22 24"/><path d="M10 -36 L24 -24 L8 -12" /><path d="M-10 36 L-24 24 L-8 12"/></g>`,
};

// ---------- slides ----------
// Each slide: id, key (script heading), dur, frags (local seconds), html, js (builds `tl` using $)
const slides = [];
const add = (s) => slides.push(s);

// S01 title
{
  const toks = ["Phục", " vụ", " AI", " nhanh", " hơn,", " rẻ", " hơn"];
  add({
    id: "s01", key: "1", dur: 8,
    html: `
<div class="glow" style="left:560px;top:180px;background:radial-gradient(circle,#7c3aed55,transparent 65%)"></div>
<div class="tokrow" id="s01-stream">${Array.from({ length: 2 }, () => ["Xin", " chào", "!", " Mình", " là", " AI", ".", " Bạn", " cần", " gì", "?", " Bầu", " trời", " màu", " xanh", " vì"].map((t, i) => `<span style="border-color:${G[i % 9]}55">${t}</span>`).join("")).join("")}</div>
<div class="logo" id="s01-logo">vLLM</div>
<div class="center-sub" id="s01-sub">${toks.map((t, i) => `<span class="tk" style="color:${i === 2 ? "#38bdf8" : "#eef2ff"}">${t}</span>`).join("")}</div>
<div class="center-foot" id="s01-foot">Hai mẹo nhỏ phía sau những chatbot bạn dùng mỗi ngày</div>`,
    js: `
tl.fromTo($("#s01-logo"),{opacity:0,scale:.8,filter:"blur(18px)"},{opacity:1,scale:1,filter:"blur(0px)",duration:1.1,ease:"expo.out"},.3);
tl.fromTo($("#s01-sub .tk"),{opacity:0,y:30},{opacity:1,y:0,duration:.35,stagger:.14,ease:"back.out(2)"},1.0);
tl.fromTo($("#s01-foot"),{opacity:0},{opacity:1,duration:.6},2.4);`,
  });
}

// S02 hook
{
  const flock = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 22; i++) {
    const x = 760 + rnd() * 520, y = 300 + rnd() * 560;
    flock.push(`<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><g class="fb"><rect x="-34" y="-20" width="68" height="40" rx="14" fill="${G[i % 9]}"/><path d="M-14 20 l-10 14 l22 -14z" fill="${G[i % 9]}"/></g></g>`);
  }
  const ans = ["Vì", " ánh", " sáng", " xanh", " bị", " tán", " xạ", " nhiều", " hơn..."];
  add({
    id: "s02", key: "2", dur: 8,
    html: `
<div class="kicker"><i style="background:#38bdf8"></i>Phần 1 · vLLM là gì?</div>
<div class="title" id="s02-t">Khi bạn bấm <span class="hl">Gửi</span>...</div>
<svg class="full" viewBox="0 0 1920 1080">
  <g transform="translate(120 330)"><g id="s02-phone">
    <rect width="520" height="600" rx="40" fill="#10172b" stroke="#2a3a60" stroke-width="4"/>
    <rect x="200" y="22" width="120" height="12" rx="6" fill="#2a3a60"/>
  </g></g>
  <g id="s02-flock">${flock.join("")}</g>
  <g transform="translate(1440 330)"><g id="s02-rack">
    <rect width="360" height="560" rx="28" fill="#10172b" stroke="#38bdf8" stroke-width="4"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="36" y="${40 + i * 84}" width="288" height="60" rx="12" fill="#16213d"/><circle cx="72" cy="${70 + i * 84}" r="9" fill="#34d399"/><circle cx="104" cy="${70 + i * 84}" r="9" fill="#38bdf8"/><rect x="140" y="${62 + i * 84}" width="150" height="16" rx="8" fill="#23304f"/>`).join("")}
  </g></g>
</svg>
<div class="bubble user" id="s02-q">Vì sao bầu trời màu xanh?</div>
<div class="bubble ai" id="s02-a">${ans.map((t) => `<span class="tk">${t}</span>`).join("")}</div>
<div class="label" style="left:1440px;top:910px;width:360px;text-align:center" id="s02-rl">Máy chủ GPU</div>
<div class="caption" id="s02-c">...hàng nghìn người khác cũng đang bấm Gửi.</div>`,
    js: `
tl.fromTo($("#s02-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($("#s02-phone"),{opacity:0,y:40},{opacity:1,y:0,duration:.6,ease:"power3.out"},.2);
tl.fromTo($("#s02-q"),{opacity:0,scale:.6},{opacity:1,scale:1,duration:.45,ease:"back.out(2)"},.6);
tl.fromTo($("#s02-a .tk"),{opacity:0},{opacity:1,duration:.12,stagger:.12},1.1);
tl.fromTo($("#s02-rack"),{opacity:0,x:60},{opacity:1,x:0,duration:.6,ease:"power3.out"},1.4);
tl.fromTo($("#s02-rl"),{opacity:0},{opacity:1,duration:.4},1.8);
tl.fromTo($("#s02-flock .fb"),{opacity:0,x:-260,scale:.4},{opacity:1,x:0,scale:1,duration:.8,stagger:.04,ease:"power2.out"},2.0);
tl.fromTo($("#s02-c"),{opacity:0,y:20},{opacity:1,y:0,duration:.5},3.0);`,
    amb: `gsap.to($("#s02-flock"),{x:30,duration:2.4,yoyo:true,ease:"sine.inOut",repeat:9999});`,
  });
}

// S03 what is vLLM
{
  const nodes = [
    { x: 90, t: "Người dùng", s: "các câu hỏi", c: G[0], ic: `${person(-60, 20, G[0])}${person(0, 4, G[1])}${person(60, 20, G[2])}` },
    { x: 557, t: "vLLM", s: "người quản lý", c: "#38bdf8", ic: icon.clip },
    { x: 1023, t: "GPU", s: "cái bếp", c: "#fbbf24", ic: `<g fill="none" stroke="#eef2ff" stroke-width="7"><rect x="-40" y="-40" width="80" height="80" rx="10"/><rect x="-18" y="-18" width="36" height="36" rx="4" fill="#fbbf24" stroke="none"/>${[-24, 0, 24].map((v) => `<path d="M${v} -40 v-14 M${v} 40 v14 M-40 ${v} h-14 M40 ${v} h14"/>`).join("")}</g>` },
    { x: 1490, t: "Câu trả lời", s: "từng chữ một", c: "#34d399", ic: icon.tokens },
  ];
  add({
    id: "s03", key: "3", dur: 9,
    html: `
<div class="kicker"><i style="background:#38bdf8"></i>Phần 1 · vLLM là gì?</div>
<div class="title" id="s03-t">vLLM là <span class="hl">người quản lý</span> của nhà hàng AI</div>
<svg class="full" viewBox="0 0 1920 1080">
  ${[0, 1, 2].map((i) => `<path class="s03-ar" d="M${nodes[i].x + 345} 560 H${nodes[i + 1].x - 15}" stroke="#3b4c78" stroke-width="6" fill="none" marker-end="url(#arrow)"/><path class="flow amb" d="M${nodes[i].x + 345} 560 H${nodes[i + 1].x - 25}" stroke="${nodes[i + 1].c}" stroke-width="6" stroke-dasharray="14 24" fill="none"/>`).join("")}
  ${nodes.map((n, i) => `<g transform="translate(${n.x} 400)"><g class="s03-n">
    <rect width="330" height="320" rx="32" fill="#10172b" stroke="${n.c}" stroke-width="4"/>
    <g transform="translate(165 110)">${n.ic}</g>
  </g></g>`).join("")}
</svg>
${nodes.map((n) => `<div class="node-lbl s03-l" style="left:${n.x}px;top:572px"><b>${n.t}</b><span>${n.s}</span></div>`).join("")}
<div class="chips" id="s03-chips" style="top:820px"><span class="chip" style="--c:#34d399">Miễn phí, mã nguồn mở</span><span class="chip" style="--c:#a78bfa">UC Berkeley · 2023</span><span class="chip" style="--c:#38bdf8">Nói chuyện giống OpenAI</span></div>
<div class="src">Nguồn: vLLM blog, 2023-06-20</div>`,
    js: `
tl.fromTo($("#s03-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($(".s03-n"),{opacity:0,y:40},{opacity:1,y:0,duration:.5,stagger:.35,ease:"back.out(1.6)"},.5);
tl.fromTo($(".s03-l"),{opacity:0},{opacity:1,duration:.4,stagger:.35},.7);
tl.fromTo($(".s03-ar"),{opacity:0},{opacity:1,duration:.3,stagger:.35},.8);
tl.fromTo($("#s03-chips .chip"),{opacity:0,y:24},{opacity:1,y:0,duration:.4,stagger:.18,ease:"back.out(2)"},2.6);`,
  });
}

// S04 tokens
{
  const toks = ["Bầu", " trời", " có", " màu", " xanh", " vì", " ánh", " sáng", " xanh", " bị", " tán", " xạ", " nhiều", " hơn", "."];
  add({
    id: "s04", key: "4", dur: 8,
    html: `
<div class="kicker"><i style="background:#38bdf8"></i>Phần 1 · vLLM là gì?</div>
<div class="title" id="s04-t">AI viết <span class="hl">từng mẩu chữ</span> một</div>
<div class="writer" id="s04-w"><div class="writer-h"><i></i><i></i><i></i><span>AI đang viết...</span></div>
<div class="pills">${toks.map((t, i) => `<span class="pill" style="--c:${G[i % 9]}">${t.trim()}<sup>${i + 1}</sup></span>`).join("")}</div></div>
<div class="chips" style="top:840px" id="s04-c"><span class="chip" style="--c:#fbbf24">1 token ≈ một từ, nửa từ hoặc một dấu câu</span></div>`,
    js: `
tl.fromTo($("#s04-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($("#s04-w"),{opacity:0,y:30},{opacity:1,y:0,duration:.5},.3);
tl.fromTo($("#s04 .pill"),{opacity:0,scale:.3,y:20},{opacity:1,scale:1,y:0,duration:.3,stagger:.16,ease:"back.out(2.4)"},.8);
tl.fromTo($("#s04-c"),{opacity:0,y:20},{opacity:1,y:0,duration:.5},3.3);`,
  });
}

// S05 notebook
{
  const toks = ["Bầu", "trời", "có", "màu", "xanh", "vì", "ánh", "sáng"];
  add({
    id: "s05", key: "5", dur: 8,
    html: `
<div class="kicker"><i style="background:#38bdf8"></i>Phần 1 · vLLM là gì?</div>
<div class="title" id="s05-t">Cuốn <span class="hl">sổ nháp</span> của AI</div>
<div class="list" style="left:120px;top:380px;width:900px" id="s05-l">
  <div class="li"><b style="--c:#38bdf8">KV cache</b> = cuốn sổ nháp của AI</div>
  <div class="li"><b style="--c:#fbbf24">Mỗi mẩu chữ</b> = thêm một dòng</div>
  <div class="li"><b style="--c:#fb7185">Mỗi người</b> = một cuốn sổ riêng</div>
</div>
<svg class="full" viewBox="0 0 1920 1080">
  <g transform="translate(1150 330)"><g id="s05-book">
    ${[3, 2, 1].map((k) => `<rect class="pg" x="${k * 10}" y="${k * 10}" width="560" height="620" rx="24" fill="#141d36" stroke="#2a3a60" stroke-width="3"/>`).join("")}
    <rect width="560" height="620" rx="24" fill="#f7f3e8"/>
    <rect x="0" y="0" width="56" height="620" rx="24" fill="#e2dccb"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M80 ${92 + i * 60} H520" stroke="#d8cfb8" stroke-width="3"/>`).join("")}
    ${toks.map((t, i) => `<g class="ln"><rect x="88" y="${50 + i * 60}" width="${120 + ((i * 53) % 220)}" height="34" rx="10" fill="${G[i % 9]}"/><text x="100" y="${78 + i * 60}" font-size="28" font-weight="700" fill="#0b1020">${t}</text></g>`).join("")}
  </g></g>
</svg>`,
    js: `
tl.fromTo($("#s05-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($("#s05-book"),{opacity:0,x:80},{opacity:1,x:0,duration:.6,ease:"power3.out"},.3);
tl.fromTo($("#s05 .ln"),{opacity:0,x:-40},{opacity:1,x:0,duration:.25,stagger:.22,ease:"power2.out"},.9);
tl.fromTo($("#s05 .pg"),{x:0,y:0},{x:function(i){return [16,10,4][i]},y:function(i){return [16,10,4][i]},duration:1.8,ease:"none"},.9);
tl.fromTo($("#s05-l .li"),{opacity:0,x:-30},{opacity:1,x:0,duration:.45,stagger:.5,ease:"power3.out"},1.2);`,
  });
}

// S06 floor plan
{
  const x0 = 160, y0 = 330, W = 1600, H = 500;
  const kw = W * 0.65, cw = W * 0.30;
  let stoves = "";
  for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) stoves += `<g class="stv"><circle cx="${x0 + 90 + c * 160}" cy="${y0 + 110 + r * 140}" r="44" fill="none" stroke="#fbbf24" stroke-width="6" opacity=".55"/><circle cx="${x0 + 90 + c * 160}" cy="${y0 + 110 + r * 140}" r="18" fill="#fbbf24" opacity=".35"/></g>`;
  let tables = "";
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) tables += `<g class="tb"><rect x="${x0 + kw + 70 + c * 190}" y="${y0 + 60 + r * 140}" width="120" height="90" rx="14" fill="#16213d" stroke="#34d399" stroke-width="4"/></g>`;
  add({
    id: "s06", key: "6", dur: 8,
    html: `
<div class="kicker"><i style="background:#fb7185"></i>Phần 2 · Vấn đề bộ nhớ</div>
<div class="title" id="s06-t">Bếp rất mạnh, nhưng <span class="hl">ít bàn</span></div>
<div class="chip-abs" id="s06-chip" style="left:160px;top:250px;--c:#38bdf8">GPU A100 · 40 GB</div>
<svg class="full" viewBox="0 0 1920 1080">
  <defs><pattern id="hatchK" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="22" height="22" fill="#2a1f0a"/><rect width="8" height="22" fill="#3a2b0e"/></pattern></defs>
  <rect id="s06-floor" x="${x0}" y="${y0}" width="${W}" height="${H}" rx="24" fill="none" stroke="#3b4c78" stroke-width="5" pathLength="1" stroke-dasharray="1" />
  <g id="s06-k"><rect x="${x0}" y="${y0}" width="${kw}" height="${H}" rx="24" fill="url(#hatchK)"/>${stoves}</g>
  <g id="s06-c"><rect x="${x0 + kw}" y="${y0}" width="${cw}" height="${H}" fill="#0f2a22"/>${tables}</g>
  <rect id="s06-o" x="${x0 + kw + cw}" y="${y0}" width="${W - kw - cw}" height="${H}" rx="0" fill="#1a2238"/>
</svg>
<div class="area-lbl" id="s06-kl" style="left:${x0 + 40}px;top:${y0 + H + 30}px;--c:#fbbf24"><b>65%</b> Bếp = bản thân mô hình AI</div>
<div class="area-lbl" id="s06-cl" style="left:${x0 + kw}px;top:${y0 + H + 30}px;--c:#34d399"><b>~30%</b> Chỗ cho khách</div>
<div class="src">Ví dụ mô hình 13 tỷ tham số trên GPU A100 40 GB · Kwon et al., SOSP 2023</div>`,
    js: `
tl.fromTo($("#s06-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($("#s06-chip"),{opacity:0},{opacity:1,duration:.4},.4);
tl.fromTo($("#s06-floor"),{strokeDashoffset:1},{strokeDashoffset:0,duration:.9,ease:"power2.inOut"},.4);
tl.fromTo($("#s06-k"),{opacity:0,scaleX:0,transformOrigin:"0% 50%"},{opacity:1,scaleX:1,duration:.9,ease:"power3.out"},1.1);
tl.fromTo($("#s06-kl"),{opacity:0,y:20},{opacity:1,y:0,duration:.4},1.7);
tl.fromTo($("#s06-c"),{opacity:0},{opacity:1,duration:.4},2.0);
tl.fromTo($("#s06 .tb"),{opacity:0,scale:0,transformOrigin:"50% 50%"},{opacity:1,scale:1,duration:.3,stagger:.08,ease:"back.out(2)"},2.1);
tl.fromTo($("#s06-o"),{opacity:0},{opacity:1,duration:.4},2.3);
tl.fromTo($("#s06-cl"),{opacity:0,y:20},{opacity:1,y:0,duration:.4},2.6);`,
  });
}

// S07 KV cache grows
{
  const bx = 1000, by = 340, bw = 780, bh = 460;
  const n = 7, gap = 10, h = (bh - 40 - gap * (n - 1)) / 7.5;
  let blocks = "";
  for (let i = 0; i < n; i++) blocks += `<rect class="cv" x="${bx + 20}" y="${by + bh - 20 - (i + 1) * h - i * gap}" width="${bw - 40}" height="${h}" rx="10" fill="${G[i % 9]}"/>`;
  add({
    id: "s07", key: "7", dur: 10,
    html: `
<div class="kicker"><i style="background:#fb7185"></i>Phần 2 · Vấn đề bộ nhớ</div>
<div class="title" id="s07-t">Sổ nháp <span class="hl">phình to</span> rất nhanh</div>
<div class="stat" id="s07-s1" style="left:120px;top:340px;--c:#38bdf8"><b>≈ 800 KB</b><span>cho mỗi mẩu chữ</span></div>
<div class="stat" id="s07-s2" style="left:120px;top:570px;--c:#fbbf24"><b>≈ 1,6 GB</b><span>cho một cuộc trò chuyện dài</span></div>
<svg class="full" viewBox="0 0 1920 1080">
  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="24" fill="#0f2a22" stroke="#34d399" stroke-width="4"/>
  ${blocks}
  <g transform="translate(${bx + bw / 2} ${by + bh / 2})"><g id="s07-stamp"><rect x="-200" y="-62" width="400" height="124" rx="16" fill="#0b1020" stroke="#f87171" stroke-width="8"/><text x="0" y="24" text-anchor="middle" font-size="64" font-weight="800" fill="#f87171">HẾT CHỖ</text></g></g>
</svg>
<div class="label" id="s07-bl" style="left:${bx}px;top:${by - 70}px">Chỗ cho khách ≈ 12 GB</div>
<div class="label" id="s07-cap" style="left:${bx}px;top:${by + bh + 20}px;color:#9aa6c7">≈ 7 cuộc trò chuyện dài là kín</div>
<div class="src">Kwon et al., SOSP 2023</div>`,
    js: `
tl.fromTo($("#s07-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($("#s07-s1"),{opacity:0,x:-40},{opacity:1,x:0,duration:.5,ease:"power3.out"},.5);
tl.fromTo($("#s07-s2"),{opacity:0,x:-40},{opacity:1,x:0,duration:.5,ease:"power3.out"},1.0);
tl.fromTo($("#s07-bl"),{opacity:0},{opacity:1,duration:.4},.8);
tl.fromTo($("#s07 .cv"),{opacity:0,y:-60},{opacity:1,y:0,duration:.3,stagger:.22,ease:"bounce.out"},1.3);
tl.fromTo($("#s07-cap"),{opacity:0},{opacity:1,duration:.4},2.9);
tl.fromTo($("#s07-stamp"),{opacity:0,scale:2.2,rotation:-8,transformOrigin:"50% 50%"},{opacity:1,scale:1,rotation:-8,duration:.4,ease:"power4.in"},3.2);`,
  });
}

// S07b 1,6 GB compared with an HD movie
add({
  id: "s07b", key: "7b", dur: 6,
  html: `
<div class="kicker"><i style="background:#fb7185"></i>Phần 2 · Vấn đề bộ nhớ</div>
<div class="title" id="s07b-t">1,6 GB lớn cỡ nào?</div>
<svg class="full" viewBox="0 0 1920 1080">
  <path d="M960 380 V760" stroke="#3b4c78" stroke-width="10"/><path d="M860 770 H1060" stroke="#3b4c78" stroke-width="12" stroke-linecap="round"/>
  <g id="s07b-beam"><path d="M520 400 H1400" stroke="#9aa6c7" stroke-width="10" stroke-linecap="round"/>
    <g transform="translate(560 400)"><path d="M0 0 L-90 160 H90 Z" fill="none" stroke="#9aa6c7" stroke-width="4"/>
      <g transform="translate(0 220)"><rect x="-150" y="-70" width="300" height="190" rx="18" fill="#10172b" stroke="#38bdf8" stroke-width="5"/><text x="0" y="0" text-anchor="middle" font-size="44" font-weight="700" fill="#eef2ff">Trò chuyện</text><text x="0" y="70" text-anchor="middle" font-size="44" fill="#38bdf8">dài</text></g></g>
    <g transform="translate(1360 400)"><path d="M0 0 L-90 160 H90 Z" fill="none" stroke="#9aa6c7" stroke-width="4"/>
      <g transform="translate(0 220)"><rect x="-150" y="-70" width="300" height="190" rx="18" fill="#10172b" stroke="#fbbf24" stroke-width="5"/><text x="0" y="0" text-anchor="middle" font-size="44" font-weight="700" fill="#eef2ff">Phim HD</text><text x="0" y="70" text-anchor="middle" font-size="44" fill="#fbbf24">tải về</text></g></g>
  </g>
  <text x="960" y="360" text-anchor="middle" font-size="72" font-weight="800" fill="#eef2ff" id="s07b-eq">≈</text>
</svg>
<div class="caption" id="s07b-c">Máy phải giữ nhiều "bộ phim" như vậy cùng lúc</div>`,
  js: `
tl.fromTo($("#s07b-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.5},.1);
tl.fromTo($("#s07b-beam"),{rotation:-7,svgOrigin:"960 400"},{rotation:0,svgOrigin:"960 400",duration:1.4,ease:"elastic.out(1,.4)"},.4);
tl.fromTo($("#s07b-eq"),{opacity:0},{opacity:1,duration:.4},1.4);
tl.fromTo($("#s07b-c"),{opacity:0,y:20},{opacity:1,y:0,duration:.4},1.8);`,
});

// shared restaurant rows for S08 / S19
function longRows(x0, y0, seats, occ, seat, gap, rowGap, cls) {
  let out = "";
  occ.forEach((o, r) => {
    const y = y0 + r * rowGap;
    out += `<rect x="${x0 - 12}" y="${y - 12}" width="${seats * (seat + gap) - gap + 24}" height="${seat + 24}" rx="14" fill="#0d1428" stroke="${G[r]}" stroke-width="3" class="${cls}-tbl"/>`;
    for (let i = 0; i < seats; i++) {
      const x = x0 + i * (seat + gap);
      if (i < o) out += `<rect class="${cls}-occ" x="${x}" y="${y}" width="${seat}" height="${seat}" rx="8" fill="${G[r]}"/>`;
      else out += `<g class="${cls}-emp"><rect x="${x}" y="${y}" width="${seat}" height="${seat}" rx="8" fill="#1c2742"/><rect class="${cls}-waste" x="${x}" y="${y}" width="${seat}" height="${seat}" rx="8" fill="url(#${cls}-w)"/></g>`;
    }
  });
  return out;
}
const wasteDefs = (id) => `<defs><pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="#3a1520"/><rect width="5" height="14" fill="#f87171"/></pattern></defs>`;

// S08 old reservation
add({
  id: "s08", key: "8", dur: 13, frags: [3.6, 7.2, 10.8],
  html: `
<div class="kicker"><i style="background:#fb7185"></i>Phần 2 · Vấn đề bộ nhớ</div>
<div class="title" id="s08-t">Đặt chỗ <span class="hl">kiểu cũ</span></div>
<div class="meter" id="s08-m"><b>60-80%</b><span>chỗ bị bỏ phí</span></div>
<svg class="full" viewBox="0 0 1920 1080">${wasteDefs("s08-w")}
  ${["A", "B", "C", "D"].map((g, r) => `<text class="s08-gl" x="120" y="${374 + r * 108}" font-size="40" font-weight="700" fill="${G[r]}">Nhóm ${g}</text>`).join("")}
  ${longRows(340, 330, 22, [6, 3, 9, 2], 52, 10, 108, "s08")}
  <g id="s08-wait">${person(400, 820, "#9aa6c7")}${person(470, 820, "#9aa6c7")}${person(540, 820, "#9aa6c7")}</g>
</svg>
<div class="label" id="s08-wl" style="left:600px;top:770px;color:#f87171">Khách mới: "Hết chỗ rồi!"</div>
<div class="chips" id="s08-types" style="top:880px"><span class="chip" style="--c:#f87171">Giữ chỗ trước</span><span class="chip" style="--c:#f87171">Giữ dư, không dùng tới</span><span class="chip" style="--c:#f87171">Khe hở lẻ tẻ</span></div>
<div class="src">vLLM blog 2023; Kwon et al., SOSP 2023</div>`,
  js: `
tl.fromTo($("#s08-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($(".s08-gl"),{opacity:0},{opacity:1,duration:.3,stagger:.15},.4);
tl.fromTo($(".s08-tbl"),{opacity:0,scaleX:0,transformOrigin:"0% 50%"},{opacity:1,scaleX:1,duration:.6,stagger:.15,ease:"power3.out"},.5);
tl.fromTo($(".s08-occ"),{opacity:0,scale:0,transformOrigin:"50% 50%"},{opacity:1,scale:1,duration:.2,stagger:.04,ease:"back.out(2)"},1.3);
tl.fromTo($(".s08-emp"),{opacity:0},{opacity:1,duration:.4},1.3);
tl.fromTo($(".s08-waste"),{opacity:0},{opacity:0,duration:.01},0);
tl.fromTo($("#s08-wait"),{opacity:0,x:-40},{opacity:1,x:0,duration:.5},2.6);
tl.fromTo($("#s08-wl"),{opacity:0},{opacity:1,duration:.4},3.0);
tl.fromTo($(".s08-waste"),{opacity:0},{opacity:1,duration:.15,stagger:.012},4.4);
tl.fromTo($("#s08-m"),{opacity:0,scale:.6,transformOrigin:"100% 0%"},{opacity:1,scale:1,duration:.5,ease:"back.out(2)"},5.8);
tl.fromTo($("#s08-types .chip"),{opacity:0,y:24},{opacity:1,y:0,duration:.4,stagger:.3,ease:"back.out(2)"},8.4);`,
});

// S09 puzzle
add({
  id: "s09", key: "9", dur: 8, frags: [2.6, 6],
  html: `
<div class="kicker"><i style="background:#fbbf24"></i>Câu đố</div>
<div class="qmark-wrap"><div class="qmark" id="s09-q">?</div></div>
<div class="title" style="left:700px;top:300px;max-width:1100px" id="s09-t">Nếu bạn là<br><span class="hl">chủ nhà hàng</span> này?</div>
<div class="hints" id="s09-h">
  <div class="hint" style="--c:#38bdf8">Dùng bàn nhỏ hơn?</div>
  <div class="hint" style="--c:#34d399">Đông thêm mới kê thêm?</div>
  <div class="hint" style="--c:#a78bfa">Ai ghi lại chỗ ngồi?</div>
</div>`,
  js: `
tl.fromTo($("#s09-q"),{opacity:0,scale:.3,rotation:-30},{opacity:1,scale:1,rotation:0,duration:.9,ease:"elastic.out(1,.5)"},.2);
tl.fromTo($("#s09-t"),{opacity:0,x:40},{opacity:1,x:0,duration:.6,ease:"power3.out"},.8);
tl.fromTo($("#s09-h .hint"),{opacity:0,y:30},{opacity:1,y:0,duration:.5,stagger:.6,ease:"power3.out"},3.2);`,
  amb: `gsap.to($(".qmark-wrap"),{scale:1.06,duration:1.2,yoyo:true,ease:"sine.inOut",repeat:9999,transformOrigin:"50% 50%"});`,
});

// S10 PagedAttention
{
  const cols = 7, rows = 4, sx = 150, sy = 300, dx = 142, dy = 142;
  const own = { 0: 0, 5: 0, 17: 0, 2: 1, 11: 1, 8: 2, 13: 2, 22: 2, 26: 2, 19: 3 };
  const groups = [[], [], [], []];
  let slots = "", tables = "";
  for (let i = 0; i < cols * rows; i++) {
    const x = sx + (i % cols) * dx, y = sy + Math.floor(i / cols) * dy;
    slots += `<rect x="${x - 8}" y="${y - 8}" width="108" height="108" rx="12" fill="none" stroke="#2a3a60" stroke-width="2" stroke-dasharray="8 8"/>`;
    if (own[i] !== undefined) {
      groups[own[i]].push(i + 1);
      tables += miniTable(x, y, G[own[i]], 16, "s10-tb");
    }
  }
  const names = ["A", "B", "C", "D"];
  const listY = (r) => 480 + r * 100;
  let lines = "";
  Object.entries(own).forEach(([i, g]) => {
    const x = sx + (i % cols) * dx + 46, y = sy + Math.floor(i / cols) * dy + 46;
    const ty = listY(g) - 14;
    lines += `<path class="s10-ln" d="M1215 ${ty} C1120 ${ty}, ${x + 160} ${y}, ${x + 50} ${y}" stroke="${G[g]}" stroke-width="3" fill="none" opacity=".7" pathLength="1" stroke-dasharray="1"/>`;
  });
  add({
    id: "s10", key: "10", dur: 10,
    html: `
<div class="kicker"><i style="background:#34d399"></i>Phần 3 · Giải pháp 1: PagedAttention</div>
<div class="title" id="s10-t">Bàn nhỏ + <span class="hl">sơ đồ chỗ ngồi</span></div>
<svg class="full" viewBox="0 0 1920 1080">${slots}${lines}${tables}
  <g transform="translate(1200 330)"><g id="s10-clip"><rect width="630" height="560" rx="28" fill="#f7f3e8"/><rect x="235" y="-18" width="160" height="40" rx="10" fill="#9aa6c7"/></g></g>
</svg>
<div class="clip-h" id="s10-ch">Sơ đồ: nhóm → số bàn</div>
${groups.map((g, r) => `<div class="clip-row s10-row" style="top:${listY(r) - 44}px"><i style="background:${G[r]}"></i>Nhóm ${names[r]} → ${g.join(", ")}</div>`).join("")}
<div class="chips" style="top:910px;left:150px;justify-content:flex-start" id="s10-c"><span class="chip" style="--c:#34d399">1 bàn nhỏ = 16 mẩu chữ</span><span class="chip" style="--c:#9aa6c7">Ý tưởng "phân trang" của hệ điều hành</span></div>`,
    js: `
tl.fromTo($("#s10-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($(".s10-tb"),{opacity:0,x:-500,y:200,rotation:-40,transformOrigin:"50% 50%"},{opacity:1,x:0,y:0,rotation:0,duration:.7,stagger:.12,ease:"power3.out"},.4);
tl.fromTo($("#s10-clip"),{opacity:0,y:40},{opacity:1,y:0,duration:.5},1.4);
tl.fromTo($("#s10-ch"),{opacity:0},{opacity:1,duration:.3},1.7);
tl.fromTo($(".s10-row"),{opacity:0,x:20},{opacity:1,x:0,duration:.35,stagger:.2},1.8);
tl.fromTo($(".s10-ln"),{strokeDashoffset:1},{strokeDashoffset:0,duration:.8,stagger:.08,ease:"power2.inOut"},2.4);
tl.fromTo($("#s10-c .chip"),{opacity:0,y:20},{opacity:1,y:0,duration:.4,stagger:.25},3.6);`,
  });
}

// S11 on demand + sharing
{
  const t1 = miniTable(150, 470, G[2], 16, "s11-a s11-a1", 26, 6);
  const t2 = miniTable(330, 470, G[2], 16, "s11-a s11-a2", 26, 6);
  const t3 = miniTable(510, 470, G[2], 5, "s11-a s11-a3", 26, 6);
  add({
    id: "s11", key: "11", dur: 10, frags: [4.4, 8.6],
    html: `
<div class="kicker"><i style="background:#34d399"></i>Phần 3 · Giải pháp 1: PagedAttention</div>
<div class="title" id="s11-t">Hai cái lợi đi kèm</div>
<div class="panel" id="s11-pa" style="left:110px;top:290px;width:820px;height:640px"><h3>Cần đến đâu, cấp đến đó</h3></div>
<div class="panel" id="s11-pb" style="left:990px;top:290px;width:820px;height:640px"><h3>Dùng chung phần giống nhau</h3></div>
<svg class="full" viewBox="0 0 1920 1080">
  ${t1}${t2}${t3}
  <g transform="translate(1060 520)"><g id="s11-pr">${miniTable(0, 0, "#9aa6c7", 16, "", 22, 5)}${miniTable(0, 140, "#9aa6c7", 10, "", 22, 5)}</g></g>
  <path class="s11-br" d="M1200 600 C1320 600, 1340 470, 1450 470" stroke="${G[0]}" stroke-width="6" fill="none" pathLength="1" stroke-dasharray="1"/>
  <path class="s11-br" d="M1200 640 C1320 640, 1340 770, 1450 770" stroke="${G[1]}" stroke-width="6" fill="none" pathLength="1" stroke-dasharray="1"/>
  <g class="s11-bt">${miniTable(1470, 410, G[0], 9, "", 22, 5)}</g>
  <g class="s11-bt">${miniTable(1470, 710, G[1], 12, "", 22, 5)}</g>
</svg>
<div class="label s11-al" style="left:150px;top:690px;width:740px;font-size:40px;color:#9aa6c7">Đầy bàn mới kê thêm. Chỗ trống chỉ còn ở bàn cuối.</div>
<div class="label s11-bl" style="left:1030px;top:830px;width:740px;font-size:40px;color:#9aa6c7">Câu hỏi lưu một lần, hai câu trả lời dùng chung.</div>
<div class="tag s11-bl" style="left:1040px;top:445px">Câu hỏi</div>
<div class="tag s11-bl" style="left:1600px;top:420px;color:${G[0]}">Bản 1</div>
<div class="tag s11-bl" style="left:1600px;top:720px;color:${G[1]}">Bản 2</div>
<div class="src">Chia sẻ giúp giảm tới 55% bộ nhớ · vLLM blog 2023</div>`,
    js: `
tl.fromTo($("#s11-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($("#s11-pa"),{opacity:0,y:30},{opacity:1,y:0,duration:.5},.3);
tl.fromTo($("#s11-pb"),{opacity:.25},{opacity:.25,duration:.01},.3);
tl.fromTo($(".s11-a1"),{opacity:0,scale:.4,transformOrigin:"50% 50%"},{opacity:1,scale:1,duration:.35,ease:"back.out(2)"},.8);
tl.fromTo($(".s11-a1 .seat"),{fill:"#1c2742"},{fill:"${G[2]}",duration:.05,stagger:.06},1.1);
tl.fromTo($(".s11-a2"),{opacity:0,scale:.4,transformOrigin:"50% 50%"},{opacity:1,scale:1,duration:.35,ease:"back.out(2)"},2.1);
tl.fromTo($(".s11-a2 .seat"),{fill:"#1c2742"},{fill:"${G[2]}",duration:.05,stagger:.06},2.4);
tl.fromTo($(".s11-a3"),{opacity:0,scale:.4,transformOrigin:"50% 50%"},{opacity:1,scale:1,duration:.35,ease:"back.out(2)"},3.4);
tl.fromTo($(".s11-al"),{opacity:0},{opacity:1,duration:.4},3.7);
tl.fromTo($("#s11-pb"),{opacity:.25},{opacity:1,duration:.4},4.8);
tl.fromTo($("#s11-pr"),{opacity:0,x:-30},{opacity:1,x:0,duration:.5},5.0);
tl.fromTo($(".s11-br"),{strokeDashoffset:1},{strokeDashoffset:0,duration:.7,stagger:.2},5.6);
tl.fromTo($(".s11-bt"),{opacity:0,scale:.5,transformOrigin:"50% 50%"},{opacity:1,scale:1,duration:.4,stagger:.2,ease:"back.out(2)"},6.2);
tl.fromTo($(".s11-bl"),{opacity:0},{opacity:1,duration:.4,stagger:.1},6.8);`,
  });
}

// S12 result 1
{
  const cols = 7, sx = 150, sy = 340, dx = 132, dy = 132;
  let tb = "";
  for (let i = 0; i < 21; i++) tb += miniTable(sx + (i % cols) * dx, sy + Math.floor(i / cols) * dy, G[i % 9], i === 20 ? 6 : 16, "s12-tb", 20, 4);
  add({
    id: "s12", key: "12", dur: 9,
    html: `
<div class="kicker"><i style="background:#34d399"></i>Phần 3 · Kết quả</div>
<div class="title" id="s12-t">Gần như <span class="hl">không phí chỗ</span></div>
<svg class="full" viewBox="0 0 1920 1080">${tb}</svg>
<div class="cards" style="left:1090px;top:330px;width:730px" id="s12-cards">
  <div class="card" style="--c:#34d399"><b>60-80% → dưới 4%</b><span>chỗ bị bỏ phí</span></div>
  <div class="card" style="--c:#38bdf8"><b>gấp 2-4 lần</b><span>số khách phục vụ được</span></div>
  <div class="card" style="--c:#a78bfa"><b>tới 55%</b><span>tiết kiệm khi dùng chung</span></div>
</div>
<div class="src">Kwon et al., SOSP 2023; vLLM blog 2023 (so với FasterTransformer, Orca)</div>`,
    js: `
tl.fromTo($("#s12-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($(".s12-tb"),{opacity:0,scale:.3,transformOrigin:"50% 50%"},{opacity:1,scale:1,duration:.3,stagger:.05,ease:"back.out(2)"},.4);
tl.fromTo($("#s12-cards .card"),{opacity:0,x:50},{opacity:1,x:0,duration:.5,stagger:.45,ease:"power3.out"},1.4);`,
  });
}

// Gantt for S13 / S14 / S15
const GX = 330, GW = 1440, U = GW / 9, LY = 330, LH = 92, LG = 30;
const laneY = (l) => LY + l * (LH + LG);
function gantt(prefix, bars, idle, opts = {}) {
  let o = "";
  for (let l = 0; l < 4; l++) {
    o += `<text x="120" y="${laneY(l) + 60}" font-size="40" font-weight="600" fill="#9aa6c7">Bàn ${l + 1}</text>`;
    o += `<rect x="${GX}" y="${laneY(l)}" width="${GW}" height="${LH}" rx="14" fill="#0d1428" stroke="#23304f" stroke-width="2"/>`;
  }
  bars.forEach((b, i) => {
    o += `<rect class="${prefix}-bar" data-i="${i}" x="${GX + b.s * U + 3}" y="${laneY(b.l) + 6}" width="${b.d * U - 6}" height="${LH - 12}" rx="12" fill="${G[b.g]}"/>`;
  });
  if (idle) bars.filter((b) => b.s + b.d < 9).forEach((b) => {
    const x = GX + (b.s + b.d) * U + 3;
    o += `<rect class="${prefix}-idle" x="${x}" y="${laneY(b.l) + 6}" width="${(9 - b.s - b.d) * U - 6}" height="${LH - 12}" rx="12" fill="url(#${prefix}-idle-p)"/>`;
  });
  o += `<path d="M${GX} ${laneY(4) + 10} H${GX + GW}" stroke="#3b4c78" stroke-width="4" marker-end="url(#arrow)"/>`;
  if (opts.head) o += `<g id="${prefix}-head"><path d="M${GX} ${LY - 20} V${laneY(4)}" stroke="#eef2ff" stroke-width="4" stroke-dasharray="10 8"/></g>`;
  return o;
}
const idleDefs = (id) => `<defs><pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="#1e2638"/><rect width="6" height="16" fill="#475569"/></pattern></defs>`;
const staticBars = [{ l: 0, s: 0, d: 3, g: 0 }, { l: 1, s: 0, d: 9, g: 1 }, { l: 2, s: 0, d: 5, g: 2 }, { l: 3, s: 0, d: 2, g: 3 }];
const contBars = [
  { l: 0, s: 0, d: 3, g: 0 }, { l: 1, s: 0, d: 9, g: 1 }, { l: 2, s: 0, d: 5, g: 2 }, { l: 3, s: 0, d: 2, g: 3 },
  { l: 3, s: 2, d: 3, g: 4 }, { l: 0, s: 3, d: 4, g: 5 }, { l: 2, s: 5, d: 4, g: 6 }, { l: 3, s: 5, d: 4, g: 7 }, { l: 0, s: 7, d: 2, g: 8 },
];
const growJs = (prefix, bars, t0, k) =>
  bars.map((b, i) => `tl.fromTo($('.${prefix}-bar[data-i="${i}"]'),{scaleX:0,transformOrigin:"0% 50%"},{scaleX:1,duration:${(b.d * k).toFixed(2)},ease:"none"},${(t0 + b.s * k).toFixed(2)});`).join("\n");

// S13 static batching
add({
  id: "s13", key: "13", dur: 10, frags: [5.6, 8.4],
  html: `
<div class="kicker"><i style="background:#fbbf24"></i>Phần 4 · Vấn đề xếp hàng</div>
<div class="title" id="s13-t">Phải đợi <span class="hl">người ăn chậm nhất</span></div>
<svg class="full" viewBox="0 0 1920 1080">${idleDefs("s13-idle-p")}${gantt("s13", staticBars, true, { head: true })}
  <g id="s13-q">${[0, 1, 2, 3, 4].map((i) => person(380 + i * 70, 900, "#9aa6c7")).join("")}</g>
</svg>
<div class="label" style="left:${GX + GW - 220}px;top:${laneY(4) + 26}px;color:#9aa6c7" id="s13-ax">thời gian</div>
<div class="label" id="s13-ql" style="left:740px;top:860px">Lượt sau đứng chờ ở cửa</div>
<div class="tag" id="s13-il" style="left:${GX + 3.3 * U}px;top:${laneY(0) + 18}px;color:#cbd5e1">Bàn trống, bếp ngồi chơi</div>`,
  js: `
tl.fromTo($("#s13-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($("#s13-head"),{x:0},{x:${GW},duration:4.5,ease:"none"},.6);
${growJs("s13", staticBars, 0.6, 0.5)}
${staticBars.map((b, i) => b.d < 9 ? `tl.fromTo($(".s13-idle")[${[0, 2, 3].indexOf(i)}],{scaleX:0,transformOrigin:"0% 50%"},{scaleX:1,duration:${((9 - b.d) * 0.5).toFixed(2)},ease:"none"},${(0.6 + b.d * 0.5).toFixed(2)});` : "").join("\n")}
tl.fromTo($("#s13-q"),{opacity:0,x:-40},{opacity:1,x:0,duration:.5},1.0);
tl.fromTo($("#s13-ql"),{opacity:0},{opacity:1,duration:.4},1.4);
tl.fromTo($("#s13-il"),{opacity:0,scale:.8},{opacity:1,scale:1,duration:.4,ease:"back.out(2)"},6.2);
tl.fromTo($("#s13-q"),{y:0},{y:-14,duration:.25,yoyo:true,repeat:3,ease:"sine.inOut"},6.6);`,
});

// S14 cost of waiting
add({
  id: "s14", key: "14", dur: 8,
  html: `
<div class="kicker"><i style="background:#fbbf24"></i>Phần 4 · Vấn đề xếp hàng</div>
<div class="title" id="s14-t">Cái giá của việc chờ</div>
<svg class="full" viewBox="0 0 1920 1080">${idleDefs("s14-idle-p")}<g id="s14-g" opacity=".3">${gantt("s14", staticBars, true)}</g></svg>
<div class="cost" id="s14-c1" style="left:240px;top:400px;--c:#94a3b8"><b>≈ 47%</b><span>thời gian bàn bỏ trống (trong ví dụ này)</span></div>
<div class="cost" id="s14-c2" style="left:1010px;top:400px;--c:#fb7185">
  <svg viewBox="-60 -60 120 120" class="clock"><circle r="52" fill="none" stroke="#fb7185" stroke-width="8"/><g class="hand"><path d="M0 0 V-38" stroke="#eef2ff" stroke-width="8" stroke-linecap="round"/></g><path d="M0 0 H26" stroke="#eef2ff" stroke-width="8" stroke-linecap="round"/></svg>
  <span>Câu hỏi ngắn vẫn phải chờ cả lượt trước xong</span></div>`,
  js: `
tl.fromTo($("#s14-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($("#s14-c1"),{opacity:0,y:40},{opacity:1,y:0,duration:.5,ease:"power3.out"},.6);
tl.fromTo($("#s14-c2"),{opacity:0,y:40},{opacity:1,y:0,duration:.5,ease:"power3.out"},1.2);
tl.fromTo($("#s14-c2 .hand"),{rotation:0,svgOrigin:"0 0"},{rotation:360,svgOrigin:"0 0",duration:2,ease:"power1.inOut"},1.4);`,
  amb: `gsap.to($("#s14-c2 .clock"),{rotation:8,duration:.12,yoyo:true,repeat:9999,ease:"sine.inOut"});`,
});

// S15 continuous batching
add({
  id: "s15", key: "15", dur: 10, frags: [3.4, 7.6],
  html: `
<div class="kicker"><i style="background:#34d399"></i>Phần 5 · Giải pháp 2: Continuous batching</div>
<div class="title" id="s15-t">Có bàn trống là <span class="hl">mời ngay</span></div>
<svg class="full" viewBox="0 0 1920 1080">${gantt("s15", contBars, false, { head: true })}
  <g id="s15-q">${[4, 5, 6, 7, 8].map((g, i) => person(380 + i * 70, 900, G[g], "s15-p")).join("")}</g>
</svg>
<div class="label" style="left:${GX + GW - 220}px;top:${laneY(4) + 26}px;color:#9aa6c7">thời gian</div>
<div class="label" id="s15-ql" style="left:740px;top:860px">Hàng chờ vơi dần</div>
<div class="badge" id="s15-b">Bàn trống: 0%</div>`,
  js: `
tl.fromTo($("#s15-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($("#s15-q"),{opacity:0},{opacity:1,duration:.4},.3);
tl.fromTo($("#s15-ql"),{opacity:0},{opacity:1,duration:.4},.5);
tl.fromTo($("#s15-head"),{x:0},{x:${GW},duration:5.4,ease:"none"},.8);
${growJs("s15", contBars, 0.8, 0.6)}
${contBars.slice(4).map((b, i) => `tl.fromTo($(".s15-p")[${i}],{opacity:1,y:0},{opacity:0,y:-60,duration:.3},${(0.8 + b.s * 0.6 - 0.3).toFixed(2)});`).join("\n")}
tl.fromTo($("#s15-b"),{opacity:0,scale:.6},{opacity:1,scale:1,duration:.5,ease:"back.out(2)"},6.6);`,
});

// S16 result 2
add({
  id: "s16", key: "16", dur: 8,
  html: `
<div class="kicker"><i style="background:#34d399"></i>Phần 5 · Kết quả</div>
<div class="title" id="s16-t">Phục vụ <span class="hl">gấp nhiều lần</span></div>
${[["Kiểu cũ: phục vụ theo lượt", 1, "#64748b"], ["Mời khách liên tục", 8, "#38bdf8"], ["Mời liên tục + xếp chỗ của vLLM", 23, "#34d399"]].map(([l, v, c], i) => `
<div class="bar-lbl" style="top:${330 + i * 200}px">${l}</div>
<div class="bar" style="top:${395 + i * 200}px;width:${Math.max(70, (v / 23) * 1300)}px;--c:${c}"></div>
<div class="bar-v" style="top:${380 + i * 200}px;left:${130 + Math.max(70, (v / 23) * 1300) + 24}px;color:${c}">${v}×</div>`).join("")}
<div class="src">Anyscale, "How continuous batching enables 23x throughput in LLM inference", 2023</div>`,
  js: `
tl.fromTo($("#s16-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($("#s16 .bar-lbl"),{opacity:0},{opacity:1,duration:.3,stagger:.6},.4);
tl.fromTo($("#s16 .bar"),{scaleX:0,transformOrigin:"0% 50%"},{scaleX:1,duration:.9,stagger:.6,ease:"power3.out"},.5);
tl.fromTo($("#s16 .bar-v"),{opacity:0,x:-20},{opacity:1,x:0,duration:.3,stagger:.6},1.2);`,
});

// S17 gears
{
  const r1 = 220, n1 = 16, r2 = 165, n2 = 12;
  const c1 = [760, 560], c2 = [760 + r1 + r2, 560];
  add({
    id: "s17", key: "17", dur: 9,
    html: `
<div class="kicker"><i style="background:#a78bfa"></i>Phần 6 · Kết hợp</div>
<div class="title" id="s17-t">Hai bánh răng <span class="hl">ăn khớp</span></div>
<svg class="full" viewBox="0 0 1920 1080">
  <g transform="translate(${c1[0]} ${c1[1]})"><g id="s17-g1"><g class="spin1"><path d="${gearPath(r1, n1)}" fill="#1e3a5f" stroke="#38bdf8" stroke-width="5"/><circle r="150" fill="#10223b"/></g></g></g>
  <g transform="translate(${c2[0]} ${c2[1]}) rotate(${180 / n2})"><g id="s17-g2"><g class="spin2"><path d="${gearPath(r2, n2)}" fill="#2a1f4d" stroke="#a78bfa" stroke-width="5"/><circle r="105" fill="#1c1636"/></g></g></g>
</svg>
<div class="gear-lbl" id="s17-l1" style="left:${c1[0] - 150}px;top:${c1[1] - 60}px;width:300px"><b>Xếp chỗ</b><span>PagedAttention</span></div>
<div class="gear-lbl" id="s17-l2" style="left:${c2[0] - 120}px;top:${c2[1] - 60}px;width:240px"><b>Mời khách</b><span>Continuous batching</span></div>
<div class="loop" id="s17-loop"><span class="chip" style="--c:#38bdf8">Trả bàn ngay</span><em>→</em><span class="chip" style="--c:#34d399">Có chỗ trống</span><em>→</em><span class="chip" style="--c:#a78bfa">Mời người mới</span><em>→</em><span class="chip" style="--c:#fbbf24">Bếp luôn bận</span><em>↺</em></div>`,
    js: `
tl.fromTo($("#s17-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($("#s17-g1"),{opacity:0,scale:.5,rotation:-90,svgOrigin:"0 0"},{opacity:1,scale:1,rotation:0,svgOrigin:"0 0",duration:1.2,ease:"power3.out"},.3);
tl.fromTo($("#s17-g2"),{opacity:0,scale:.5,rotation:${90 * n1 / n2},svgOrigin:"0 0"},{opacity:1,scale:1,rotation:0,svgOrigin:"0 0",duration:1.2,ease:"power3.out"},.3);
tl.fromTo($("#s17-l1, #s17-l2"),{opacity:0},{opacity:1,duration:.4,stagger:.2},1.2);
tl.fromTo($("#s17-loop > *"),{opacity:0,y:20},{opacity:1,y:0,duration:.35,stagger:.2,ease:"back.out(2)"},2.0);`,
    amb: `gsap.to($("#s17 .spin1"),{rotation:360,svgOrigin:"0 0",duration:16,ease:"none",repeat:9999});
gsap.to($("#s17 .spin2"),{rotation:-360,svgOrigin:"0 0",duration:12,ease:"none",repeat:9999});`,
  });
}

// S18 journey
{
  const st = [
    ["Cửa", icon.door, "Bạn bấm Gửi, câu hỏi chờ ở cửa"],
    ["Quản lý", icon.clip, "Có chỗ là được mời vào ngay"],
    ["Bàn nhỏ", icon.table, "Lễ tân cấp vài bàn nhỏ, vừa đủ"],
    ["Món ra", icon.tokens, "Viết từng mẩu chữ, đầy bàn thì kê thêm"],
    ["Trả bàn", icon.recycle, "Xong thì trả bàn, người sau dùng ngay"],
  ];
  const X = (i) => 260 + i * 350, Y = 520;
  const fr = [1.6, 3.6, 5.6, 7.6, 9.6];
  add({
    id: "s18", key: "18", dur: 11, frags: fr,
    html: `
<div class="kicker"><i style="background:#a78bfa"></i>Phần 6 · Kết hợp</div>
<div class="title" id="s18-t">Hành trình của <span class="hl">một câu hỏi</span></div>
<svg class="full" viewBox="0 0 1920 1080">
  <path d="M${X(0)} ${Y} H${X(4)}" stroke="#23304f" stroke-width="10" stroke-linecap="round"/>
  <path id="s18-trail" d="M${X(0)} ${Y} H${X(4)}" stroke="#a78bfa" stroke-width="10" stroke-linecap="round" pathLength="1" stroke-dasharray="1"/>
  ${st.map((s, i) => `<g transform="translate(${X(i)} ${Y})"><g class="s18-st"><circle r="100" fill="#10172b" stroke="#3b4c78" stroke-width="5"/><circle class="s18-ring" r="100" fill="none" stroke="${G[i]}" stroke-width="8"/>${s[1]}</g></g>`).join("")}
  <g id="s18-dot"><circle cx="${X(0)}" cy="${Y - 140}" r="22" fill="#fbbf24"/><circle cx="${X(0)}" cy="${Y - 140}" r="38" fill="#fbbf24" opacity=".25"/></g>
</svg>
${st.map((s, i) => `<div class="st-lbl" style="left:${X(i) - 150}px;top:${Y + 120}px">${s[0]}</div>`).join("")}
${st.map((s, i) => `<div class="st-desc s18-d" style="--c:${G[i]}">${s[2]}</div>`).join("")}`,
    js: `
tl.fromTo($("#s18-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($(".s18-st"),{opacity:0,scale:.5,transformOrigin:"50% 50%"},{opacity:1,scale:1,duration:.35,stagger:.1,ease:"back.out(2)"},.2);
tl.fromTo($(".s18-ring"),{opacity:0},{opacity:0,duration:.01},0);
tl.fromTo($("#s18-trail"),{strokeDashoffset:1},{strokeDashoffset:1,duration:.01},0);
tl.fromTo($(".s18-d"),{opacity:0},{opacity:0,duration:.01},0);
tl.fromTo($("#s18-dot"),{opacity:0},{opacity:1,duration:.3},.8);
${fr.map((f, i) => `${i ? `tl.fromTo($("#s18-dot"),{x:${(i - 1) * 350}},{x:${i * 350},duration:.9,ease:"power2.inOut"},${(f - 1.1).toFixed(1)});
tl.fromTo($("#s18-trail"),{strokeDashoffset:${(1 - (i - 1) / 4).toFixed(2)}},{strokeDashoffset:${(1 - i / 4).toFixed(2)},duration:.9,ease:"power2.inOut"},${(f - 1.1).toFixed(1)});
tl.fromTo($(".s18-d")[${i - 1}],{opacity:1},{opacity:0,duration:.25},${(f - 1.1).toFixed(1)});` : ""}
tl.fromTo($(".s18-ring")[${i}],{opacity:0,scale:1.3,transformOrigin:"50% 50%"},{opacity:1,scale:1,duration:.3},${(f - 0.3).toFixed(1)});
tl.fromTo($(".s18-d")[${i}],{opacity:0,y:20},{opacity:1,y:0,duration:.3},${(f - 0.3).toFixed(1)});`).join("\n")}`,
  });
}

// S19 before / after
{
  let before = "", after = "";
  [3, 1, 4, 2].forEach((o, r) => {
    for (let i = 0; i < 12; i++) before += `<rect x="${170 + i * 56}" y="${400 + r * 90}" width="46" height="46" rx="8" fill="${i < o ? G[r] : "url(#s19-w)"}"/>`;
  });
  for (let i = 0; i < 15; i++) after += miniTable(1080 + (i % 5) * 140, 390 + Math.floor(i / 5) * 128, G[i % 9], i === 14 ? 7 : 16, "", 22, 4);
  add({
    id: "s19", key: "19", dur: 8,
    html: `
<div class="kicker"><i style="background:#a78bfa"></i>Phần 6 · Kết hợp</div>
<div class="title" id="s19-t">Trước và sau vLLM</div>
<div class="panel s19-p" style="left:110px;top:270px;width:800px;height:700px;--b:#f87171"><h3 style="color:#f87171">Trước</h3></div>
<div class="panel s19-p" style="left:1010px;top:270px;width:800px;height:700px;--b:#34d399"><h3 style="color:#34d399">Sau: có vLLM</h3></div>
<svg class="full" viewBox="0 0 1920 1080">${wasteDefs("s19-w")}
  <g id="s19-b">${before}${[0, 1, 2, 3, 4, 5].map((i) => person(200 + i * 64, 870, "#9aa6c7", "", 0.9)).join("")}</g>
  <g id="s19-a">${after}</g>
</svg>
<div class="label" id="s19-bl" style="left:600px;top:840px;color:#f87171">Hàng dài</div>
<div class="label" id="s19-al" style="left:1080px;top:840px;color:#34d399">Không ai phải chờ</div>`,
    js: `
tl.fromTo($("#s19-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($(".s19-p"),{opacity:0,y:40},{opacity:1,y:0,duration:.5,stagger:.4,ease:"power3.out"},.3);
tl.fromTo($("#s19-b"),{opacity:0},{opacity:1,duration:.5},.7);
tl.fromTo($("#s19-bl"),{opacity:0},{opacity:1,duration:.4},1.1);
tl.fromTo($("#s19-a"),{opacity:0,scale:.9,transformOrigin:"50% 50%"},{opacity:1,scale:1,duration:.6,ease:"back.out(1.6)"},1.5);
tl.fromTo($("#s19-al"),{opacity:0},{opacity:1,duration:.4},2.1);`,
  });
}

// S20 when to use
add({
  id: "s20", key: "20", dur: 10, frags: [3, 6, 8.6],
  html: `
<div class="kicker"><i style="background:#38bdf8"></i>Phần 7 · Khi nào dùng?</div>
<div class="title" id="s20-t">Khi nào nên dùng vLLM?</div>
<div class="col" id="s20-y" style="left:110px;--c:#34d399"><h3>Nên dùng</h3><ul><li>Tự chạy AI trên máy của công ty</li><li>Nhiều người dùng cùng lúc</li><li>Dữ liệu nhạy cảm, không muốn gửi ra ngoài</li></ul></div>
<div class="col" id="s20-n" style="left:990px;--c:#fbbf24"><h3>Chưa cần</h3><ul><li>Chỉ dùng một mình trên laptop</li><li>Không có GPU</li><li>Dùng ChatGPT hay dịch vụ có sẵn là đủ</li></ul></div>
<div class="chips" id="s20-c" style="top:900px"><span class="chip" style="--c:#38bdf8">Chatbot nội bộ</span><span class="chip" style="--c:#a78bfa">Hỏi đáp tài liệu</span><span class="chip" style="--c:#fb7185">Trợ lý lập trình</span><span class="chip" style="--c:#34d399">AI dùng chung</span></div>`,
  js: `
tl.fromTo($("#s20-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
tl.fromTo($("#s20-y"),{opacity:0,y:40},{opacity:1,y:0,duration:.5,ease:"power3.out"},.6);
tl.fromTo($("#s20-y li"),{opacity:0,x:-20},{opacity:1,x:0,duration:.3,stagger:.3},1.0);
tl.fromTo($("#s20-n"),{opacity:0,y:40},{opacity:1,y:0,duration:.5,ease:"power3.out"},3.6);
tl.fromTo($("#s20-n li"),{opacity:0,x:-20},{opacity:1,x:0,duration:.3,stagger:.3},4.0);
tl.fromTo($("#s20-c .chip"),{opacity:0,y:24},{opacity:1,y:0,duration:.35,stagger:.2,ease:"back.out(2)"},6.6);`,
});

// S21 takeaways
{
  const cmd = "$ vllm serve <tên-mô-hình>";
  add({
    id: "s21", key: "21", dur: 11, frags: [2.6, 4.8, 7, 9.6],
    html: `
<div class="kicker"><i style="background:#38bdf8"></i>Phần 7 · Kết luận</div>
<div class="title" id="s21-t">Ba điều mang về</div>
<div class="tk3">
  <div class="tcard" style="--c:#fb7185"><em>1</em><p>Nghẽn vì thiếu chỗ nhớ, không phải vì máy chậm</p></div>
  <div class="tcard" style="--c:#34d399"><em>2</em><p>PagedAttention: bàn nhỏ, cần đến đâu cấp đến đó</p></div>
  <div class="tcard" style="--c:#a78bfa"><em>3</em><p>Continuous batching: có chỗ là mời ngay</p></div>
</div>
<div class="term" id="s21-term"><div class="term-h"><i></i><i></i><i></i></div><code>${[...cmd].map((c) => `<span class="ch">${c.replace("<", "&lt;").replace(">", "&gt;")}</span>`).join("")}<span class="cur">▍</span></code></div>`,
    js: `
tl.fromTo($("#s21-t"),{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.1);
${[0, 1, 2].map((i) => `tl.fromTo($("#s21 .tcard")[${i}],{opacity:0,rotationY:-90,transformPerspective:900},{opacity:1,rotationY:0,duration:.7,ease:"back.out(1.4)"},${[1.6, 3.9, 6.1][i]});`).join("\n")}
tl.fromTo($("#s21-term"),{opacity:0,y:30},{opacity:1,y:0,duration:.4},7.6);
tl.fromTo($("#s21 .ch"),{opacity:0},{opacity:1,duration:.01,stagger:.06},8.0);`,
  });
}

// S22 thanks
add({
  id: "s22", key: "22", dur: 8,
  html: `
<div class="glow" style="left:560px;top:160px;background:radial-gradient(circle,#0ea5e955,transparent 65%)"></div>
<div class="tokrow" id="s22-stream" style="top:820px">${Array.from({ length: 2 }, () => ["Cảm", " ơn", " mọi", " người", "!", " Hỏi", " gì", " cũng", " được", ".", " vLLM", " xin", " chào", "!"].map((t, i) => `<span style="border-color:${G[i % 9]}55">${t}</span>`).join("")).join("")}</div>
<div class="logo" id="s22-l" style="font-size:220px;top:300px">Cảm ơn!</div>
<div class="center-sub" id="s22-s" style="top:600px"><span class="chip" style="--c:#fbbf24">Hỏi đáp</span></div>`,
  js: `
tl.fromTo($("#s22-l"),{opacity:0,scale:.8,filter:"blur(16px)"},{opacity:1,scale:1,filter:"blur(0px)",duration:1,ease:"expo.out"},.2);
tl.fromTo($("#s22-s"),{opacity:0,y:20},{opacity:1,y:0,duration:.5},1.2);`,
});

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
  `@font-face{font-family:"Be Vietnam Pro";font-style:normal;font-weight:${w};font-display:block;src:url('assets/fonts/be-vietnam-pro-${sub}-${w}-normal.woff2') format('woff2');unicode-range:${r}}`)).join("\n") +
  `\n@font-face{font-family:"JetBrains Mono";font-weight:500;font-display:block;src:url('assets/fonts/jetbrains-mono-latin-500-normal.woff2') format('woff2')}`;

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
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1920, height=1080">
<title>vLLM - Phục vụ AI nhanh hơn, rẻ hơn</title>
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
    gsap.to(".tokrow", { xPercent: -50, duration: 30, ease: "none", repeat: 9999 });
    gsap.to(".flow", { strokeDashoffset: -38, duration: 0.9, ease: "none", repeat: 9999 });
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
