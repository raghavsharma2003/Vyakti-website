(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const NS = "http://www.w3.org/2000/svg";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const svgEl = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const C = { ink: "#0d0f0e", ink2: "#3c3f3b", ink3: "#63655f", line: "#d9d9d1", sig: "#d33f2c", ok: "#1f6b54", half: "#c48a22", lost: "#c13a26", paper: "#fbfbf8" };
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
const wait = ms => new Promise(r => setTimeout(r, ms));
const ease = t => 1 - Math.pow(1 - t, 3);

/* lock a box to the tallest of its states so changing content never moves the layout */
function lockHeight(el, states, restore) {
  const run = () => { el.style.minHeight = ""; let max = 0; states.forEach(fn => { fn(); max = Math.max(max, el.offsetHeight); }); el.style.minHeight = max + "px"; restore && restore(); };
  run(); addEventListener("resize", run); if (document.fonts) document.fonts.ready.then(run);
  return run;
}

/* =====================================================================
   DECK ENGINE
   ===================================================================== */
const deckMQ = matchMedia("(min-width: 1000px) and (min-height: 540px) and (min-aspect-ratio: 5/4)");
const deckEl = $("#deck"), slides = $$(".deck > .slide");
if (!reduce) document.documentElement.classList.add("js");
$("#tot").textContent = String(slides.length).padStart(2, "0");

/* headings: every word rides up out of its own mask */
$$(".split").forEach(el => {
  let i = 0;
  (function wrap(node) {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(" ")); return; }
          const m = document.createElement("span"); m.className = "wm";
          const w = document.createElement("span"); w.className = "wi"; w.textContent = t; w.style.setProperty("--i", i++);
          m.appendChild(w); frag.appendChild(m);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) wrap(n);
    });
  })(el);
});
slides.forEach(s => $$(".rv", s).forEach((el, k) => el.style.setProperty("--d", 260 + k * 70)));
/* phones and tablets: a section runs several screens tall, so each element reveals as it arrives rather
   than when its section's top edge does, which played every animation before anyone could see it */
const flowIO = "IntersectionObserver" in window ? new IntersectionObserver(es => {
  let k = 0;
  es.forEach(e => { if (!e.isIntersecting) return; e.target.style.setProperty("--fd", Math.min(k++, 5) * 90); e.target.classList.add("in"); flowIO.unobserve(e.target); });
}, { rootMargin: "0px 0px -8% 0px" }) : null;
$$(".deck .rv, .deck .split").forEach(el => flowIO ? flowIO.observe(el) : el.classList.add("in"));

/* snap markers: plain blocks the browser can snap to, one per slide (sticky elements snap badly) */
const snaps = document.createElement("div"); snaps.className = "snaps"; snaps.setAttribute("aria-hidden", "true");
slides.forEach(() => snaps.appendChild(document.createElement("i")));
deckEl.prepend(snaps);
const snapStyle = document.createElement("style");
snapStyle.textContent = `.snaps{position:absolute;left:0;top:0;width:1px;pointer-events:none;visibility:hidden}.snaps i{display:block;height:100svh}
@media (min-width:1000px) and (min-height:540px) and (min-aspect-ratio:5/4){html{scroll-snap-type:y proximity}.snaps i{scroll-snap-align:start}}`;
document.head.appendChild(snapStyle);
deckEl.style.position = "relative";

const scrollFns = [];
const onScroll = fn => scrollFns.push(fn);
const seenFns = new Map();
const onSeen = (slideId, fn) => { const s = document.getElementById(slideId); if (!s) return; if (s.classList.contains("seen")) fn(); else seenFns.set(s, [...(seenFns.get(s) || []), fn]); };
/* run once when an element is really on screen: with its slide in the deck, by itself in the flow */
function onShow(el, fn) {
  if (!el) return; let done = false, io = null;
  const fire = () => { if (done) return; done = true; if (io) io.disconnect(); fn(); };
  if ("IntersectionObserver" in window) { io = new IntersectionObserver(es => { if (!deckMQ.matches && es.some(e => e.isIntersecting)) fire(); }, { rootMargin: "0px 0px -22% 0px" }); io.observe(el); }
  const s = el.closest(".slide"); if (s) onSeen(s.id, () => { if (deckMQ.matches || !io) fire(); });
}
let current = 0, lastCovered = "";
const navEl = $("#nav"), prog = $("#prog"), curEl = $("#cur"), links = $$("#nav nav a");

function layout() {
  const vh = innerHeight, deck = deckMQ.matches, navH = navEl.offsetHeight;
  let cov = "", cur = 0, under = 0;
  slides.forEach((s, i) => {
    const r = s.getBoundingClientRect(), next = slides[i + 1];
    let cover = 0;
    if (deck && next) cover = clamp(1 - next.getBoundingClientRect().top / vh);
    else if (!deck) cover = clamp(-r.top / Math.max(1, r.height)); // flow: how far it has scrolled away
    s._cover = cover;
    const covered = deck ? cover >= 0.995 : (r.bottom <= 0 || r.top >= vh);
    s._covered = covered; cov += covered ? "1" : "0";
    s.classList.toggle("covered", covered);
    if (!s.classList.contains("seen") && r.top < vh * (deck ? 0.5 : 0.78) && r.bottom > vh * 0.2) {
      s.classList.add("seen");
      (seenFns.get(s) || []).forEach(fn => fn()); seenFns.delete(s);
    }
    if (r.top <= vh * 0.5) cur = i;
    if (r.top <= navH) under = i;
    const k = deck && !reduce ? cover : 0;
    $$(":scope > .inner, :scope > .face-stage", s).forEach(el => {
      el.style.transform = k > 0.001 ? `translateY(${(-k * 4).toFixed(2)}%) scale(${(1 - 0.07 * k).toFixed(4)})` : "";
      el.style.opacity = k > 0.001 ? (1 - 0.75 * k).toFixed(3) : "";
    });
  });
  if (cov !== lastCovered) { lastCovered = cov; dispatchEvent(new Event("deckchange")); }
  current = cur;
  curEl.textContent = String(cur + 1).padStart(2, "0");
  const h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
  prog.style.transform = `scaleX(${p.toFixed(4)})`;
  navEl.classList.toggle("on-dark", slides[under].classList.contains("dark"));
  const curId = slides[cur].id;
  links.forEach(a => a.classList.toggle("on", +a.dataset.go <= cur && (a.nextElementSibling ? cur < +a.nextElementSibling.dataset.go : true)));
  scrollFns.forEach(fn => fn());
  return curId;
}
let ticking = false;
const tick = () => { ticking = false; layout(); };
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }, { passive: true });
addEventListener("resize", () => requestAnimationFrame(tick));
deckMQ.addEventListener ? deckMQ.addEventListener("change", tick) : deckMQ.addListener(tick);

function goTo(i) {
  i = clamp(i, 0, slides.length - 1);
  const top = deckMQ.matches ? deckEl.offsetTop + i * slides[0].offsetHeight : slides[i].offsetTop;
  scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
}
$$("[data-go]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); goTo(+a.dataset.go); }));
addEventListener("keydown", e => {
  if (!deckMQ.matches || e.target.closest("input,textarea,select,[contenteditable]")) return;
  if (["PageDown", "ArrowDown"].includes(e.key) || (e.key === " " && !e.shiftKey)) { e.preventDefault(); goTo(current + 1); }
  else if (["PageUp", "ArrowUp"].includes(e.key) || (e.key === " " && e.shiftKey)) { e.preventDefault(); goTo(current - 1); }
});

/* shared visibility: on screen and not buried under the next slide */
function shown(el) {
  const s = el.closest(".slide"); if (!s || s._covered || document.hidden) return false;
  const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight;
}
window.VyaktiDeck = {
  covered: el => { const s = el.closest(".slide"); return !!(s && s._covered); },
  cover: el => { const s = el.closest(".slide"); return s ? (s._cover || 0) : 0; },
};
/* a single animation clock that only runs things that are visible */
const loops = new Set();
function loop(el, fn) { loops.add({ el, fn }); }
let t0 = performance.now(), lastT = t0;
(function frame(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  loops.forEach(l => { if (shown(l.el)) l.fn((now - t0) / 1000, dt); });
  requestAnimationFrame(frame);
})(t0);
function every(el, ms, fn) { let acc = 0, last = performance.now(); setInterval(() => { const now = performance.now(); if (shown(el)) { acc += now - last; if (acc >= ms) { acc = 0; fn(); } } last = now; }, 200); }
function countUp(el) {
  const target = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suf || "";
  const fmt = v => (dec ? v.toFixed(dec).replace(/^0/, "") : Math.round(v)) + suf;
  if (reduce) { el.textContent = fmt(target); return; }
  const start = performance.now(), dur = 1600;
  (function f(now) { const p = clamp((now - start) / dur); el.textContent = fmt(target * ease(p)); if (p < 1) requestAnimationFrame(f); })(start);
}
$$("[data-count]").forEach(el => onShow(el, () => setTimeout(() => countUp(el), 250)));

/* =====================================================================
   HERO: the face listens, thinks, answers; the seven families orbit it
   ===================================================================== */
const FAM = [
  { k: "A", name: "Knows", long: "What the person knows" },
  { k: "B", name: "Learns", long: "How they think and learn" },
  { k: "C", name: "Feels", long: "Their inner state" },
  { k: "D", name: "Talks", long: "The signal in how they talk" },
  { k: "E", name: "Relates", long: "The relationship" },
  { k: "F", name: "Self", long: "The AI’s own self" },
  { k: "G", name: "Evolves", long: "The loop that makes it grow" },
];
let ringHot = [];
(function hero() {
  const box = $("#dialog"), pill = $("#faceState"), stage = $("#faceStage"); if (!box) return;
  const EX = [
    { learner: "Okay… I think I get it.",
      read: [["Noticed", "a 3-second pause, no words of her own"], ["Believes", "comfort, not understanding (70%)"], ["Decides", "a quiet check, not a quiz"]], hot: ["A", "D"],
      vy: "Gappu thinks 3/8 is bigger than 3/5. Is he right?", spoken: "Gappu thinks three eighths is bigger than three fifths. Is he right?" },
    { learner: "Hmm. 8 is bigger, so… he’s right?",
      read: [["Noticed", "the same wrong idea, now in her words"], ["Believes", "“bigger bottom, bigger fraction” (85%)"], ["Decides", "don’t correct. Let her see it"]], hot: ["A", "B"],
      vy: "Let’s put both on a number line. You place 3/8, I’ll place 3/5.", spoken: "Let's put both on a number line. You place three eighths, I'll place three fifths." },
    { learner: "Oh! Eighths are smaller pieces.",
      read: [["Noticed", "she explained it herself"], ["Updates", "understood, 80%. Bet: solves a new one in 7 days"], ["Remembers", "number lines work for her"]], hot: ["A", "G"],
      vy: "Exactly. Want to teach that to Gappu?", spoken: "Exactly. Want to teach that to Gappu?" },
  ];
  const layers = EX.map(ex => {
    const l = document.createElement("div"); l.className = "layer lr";
    l.innerHTML = `<span class="who">Learner</span><p class="txt">${esc(ex.learner)}</p>`;
    const r = document.createElement("div"); r.className = "layer rd";
    r.innerHTML = `<span class="who">Inside Vyakti</span><div class="read">${ex.read.map(([k, v]) => `<div><b>${k}</b><span>${esc(v)}</span></div>`).join("")}</div>`;
    const v = document.createElement("div"); v.className = "layer vy";
    v.innerHTML = `<span class="who">Vyakti</span><p class="txt">${esc(ex.vy)}</p>`;
    box.append(l, r, v); return { l, r, v, ex };
  });
  const face = () => window.VyaktiFace;
  const setPill = (s, label) => { pill.className = "face-state " + s; pill.querySelector("b").textContent = label; face().setState(s); };
  const show = el => $$(".layer", box).forEach(x => x.classList.toggle("on", x === el));
  const whenShown = async () => { while (!shown(stage)) await wait(300); };
  (async function run() {
    await wait(reduce ? 200 : 2700);
    for (;;) for (const { l, r, v, ex } of layers) {
      await whenShown(); ringHot = [];
      setPill("listen", "listening"); show(l); await wait(2300);
      await whenShown(); ringHot = ex.hot;
      setPill("think", "thinking"); show(r);
      const rows = $$(".read div", r); rows.forEach(d => d.classList.remove("on"));
      for (const d of rows) { await wait(520); d.classList.add("on"); }
      await wait(1500);
      await whenShown();
      const txt = $(".txt", v); txt.innerHTML = `<span class="rest">${esc(ex.vy)}</span>`;
      show(v); setPill("speak", "speaking");
      await new Promise(res => {
        const F = face();
        if (!F.ready || reduce) { txt.textContent = ex.vy; F.say(ex.spoken, {}); setTimeout(res, 2600); return; }
        F.say(ex.spoken, {
          onChar: i => { const n = Math.round(ex.vy.length * Math.min(1, i / ex.spoken.length)); txt.innerHTML = esc(ex.vy.slice(0, n)) + `<span class="rest">${esc(ex.vy.slice(n))}</span>`; },
          onDone: () => { txt.textContent = ex.vy; res(); },
        });
      });
      setPill("idle", "listening"); ringHot = []; await wait(1700);
    }
  })();

  /* the orbit: seven families circling the bust, passing behind and in front of it */
  const back = $("#ringBack"), front = $("#ringFront");
  const orbB = svgEl("ellipse", { class: "orb" }, back), orbF = svgEl("path", { class: "orb" }, front);
  const nodes = FAM.map(f => {
    const g = svgEl("g", { class: "nd" });
    const c = svgEl("circle", { r: 13 }, g);
    const t = svgEl("text", {}, g); t.textContent = f.k;
    const lab = svgEl("text", { class: "lab" }, g); lab.textContent = f.name.toUpperCase();
    return { f, g, c, t, lab };
  });
  let W = 0, H = 0, cx = 0, cy = 0, rx = 0, ry = 0, top = 0, showLab = true;
  function size() {
    const r = stage.getBoundingClientRect(), cv = $("#face").getBoundingClientRect();
    W = r.width; H = r.height; top = cv.top - r.top; const ch = cv.height;
    [back, front].forEach(s => s.setAttribute("viewBox", `0 0 ${W} ${H}`));
    cx = W / 2; cy = top + ch * 0.655; rx = Math.min(W * 0.4, ch * 0.56); ry = rx * 0.16;
    showLab = W > 520;
    orbB.setAttribute("cx", cx); orbB.setAttribute("cy", cy); orbB.setAttribute("rx", rx); orbB.setAttribute("ry", ry);
    orbF.setAttribute("d", `M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 0 ${cx + rx} ${cy}`);
  }
  size(); addEventListener("resize", size); new ResizeObserver(size).observe(stage);
  let a0 = 0;
  loop(stage, (t, dt) => {
    a0 += dt * (reduce ? 0 : 0.22);
    const scale = Math.min(1.25, Math.max(0.75, W / 700));
    nodes.forEach((n, i) => {
      const a = a0 + i * Math.PI * 2 / FAM.length, z = Math.sin(a);
      const x = cx + rx * Math.cos(a), y = cy + ry * z;
      const parent = z > 0 ? front : back;
      if (n.g.parentNode !== parent) parent.appendChild(n.g);
      const s = (0.78 + 0.28 * (z + 1) / 2) * scale;
      n.g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`);
      n.g.style.opacity = (z > 0 ? 1 : 0.38 + 0.3 * (z + 1)).toFixed(2);
      n.g.classList.toggle("hot", ringHot.includes(n.f.k));
      n.lab.setAttribute("y", 27); n.lab.style.display = showLab ? "" : "none";
    });
  });
})();

/* =====================================================================
   THE ROOM
   ===================================================================== */
(function room() {
  const seats = $("#seats"), rm = $("#room"), cap = $("#seatCap"), modes = $("#seatModes"); if (!seats) return;
  const kinds = [...Array(14).fill("u"), ...Array(12).fill("f"), ...Array(14).fill("l")];
  const rnd = mulberry(11); for (let i = kinds.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [kinds[i], kinds[j]] = [kinds[j], kinds[i]]; }
  kinds.forEach((k, i) => {
    const s = document.createElement("span"); s.className = "seat " + k;
    const x = i % 10 - 4.5, y = Math.floor(i / 10) - 1.5;
    s.style.setProperty("--d", (rnd() * 2.4).toFixed(2) + "s"); s.style.setProperty("--w", Math.round(Math.hypot(x, y * 1.4) * 55) + "ms");
    seats.appendChild(s);
  });
  const CAP = {
    see: "Forty nods. From the front of the room, every head looks the same.",
    true: "Underneath: 14 understood, 12 half understood, 14 lost and hiding it.",
    ai: "An AI tutor that trusts the nod records all forty as understood, including the fourteen who are lost.",
  };
  const order = ["see", "true", "ai"]; let cur = "see", auto = !reduce;
  function set(m) { cur = m; rm.dataset.m = m; cap.textContent = CAP[m]; $$("button", modes).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.m === m))); }
  lockHeight(cap, order.map(m => () => { cap.textContent = CAP[m]; }), () => { cap.textContent = CAP[cur]; });
  set("see");
  $$("button", modes).forEach(b => b.addEventListener("click", () => { auto = false; set(b.dataset.m); }));
  every(rm, 3400, () => { if (auto) set(order[(order.indexOf(cur) + 1) % 3]); });
})();

/* =====================================================================
   THE MAP: 7 families, 25 dimensions
   ===================================================================== */
const DIMS = [
  ["A", "Understood vs just answered", "Did they really get it, or just produce the right answer?", "No study checks whether a tutor’s “understood” judgement predicts a later test.", "A fresh problem 7 days later; a transfer problem.", 1],
  ["A", "Hidden mental model", "What wrong idea produces their mistakes?", "LLMs score under 50% when diagnosing errors freely.", "Errors on items built to target a specific misconception.", 1],
  ["A", "Self-calibration gap", "Do they know what they know?", "Self-judged understanding correlates only about .27 with the real thing.", "Their confidence compared with the delayed test.", 1],
  ["A", "Belief gap blocking their goal", "What do they believe that differs from reality and stops them?", "Frontier models still fail at this (Beyond Words, 2026).", "Whether the goal succeeds once the gap is fixed.", 0],
  ["B", "How this person learns", "Which explanations, examples or representations work for them?", "“Learning styles” failed. Real per-person differences need careful within-person tests.", "Delayed outcome per teaching approach, same person.", 1],
  ["B", "Reasoning habits", "How do they attack problems? (“always rushes the last step”)", "Rarely modelled beyond right or wrong.", "Does the predicted error pattern recur?", 0],
  ["B", "Silent disengagement", "When have they switched off while still nodding?", "A classroom-scale blind spot, with little evidence on detecting it in conversation.", "A comprehension check right after.", 0],
  ["B", "Behaviour over weeks", "Patterns of return, avoidance and procrastination.", "Studied in apps, never tied to understanding.", "Actual return and avoidance logs.", 0],
  ["C", "Productive vs stuck struggle", "Confusion that helps, or frustration that harms?", "Confusion helps only when it gets resolved (D’Mello); telling which is hard.", "Resolved or not in the next turns; the later outcome.", 1],
  ["C", "Goals and interests", "Why are they here, and what do they care about?", "Models score under 50% at inferring context-dependent preferences (CUPID).", "The person confirms; engagement with hooks.", 0],
  ["C", "Fear of looking stupid", "What makes them hide confusion?", "Help avoidance is well studied in people and unmodelled in AI.", "Rate of admitted confusion.", 0],
  ["D", "What isn’t said", "Hedges, filler agreement, long pauses, topic avoidance, switching language.", "Mostly untested, especially in code-mixed speech.", "Whether these predict the delayed test.", 1],
  ["D", "Pacing and turn-taking", "Is this silence thinking, or being lost?", "An off-the-shelf turn-end model read children’s silences at 0.62 accuracy, where 0.5 is chance.", "Cut-off rate; whether the learner continues.", 1],
  ["D", "Register", "Formal or casual, humour tolerance, directness.", "Persona work ignores per-person register.", "The person’s reaction and whether they continue.", 0],
  ["E", "Trust as a sensor", "Does trust make people reveal confusion and truth?", "Strong in human research (alliance r ≈ .28); unmeasured for AI.", "Disclosure rate against relationship continuity.", 1],
  ["E", "Relationship arc", "Stages, rupture and repair, shared history.", "Companion apps fake it; no evaluation exists.", "Behaviour after a rupture; whether they return.", 0],
  ["E", "Feeling understood, accurately", "Can AI make someone feel understood without flattering them?", "Studies show both the “feeling heard” benefit and the dependency risk.", "The person’s rating plus the accuracy of what the AI claimed.", 0],
  ["E", "Honesty vs comfort", "When to challenge, and when to support?", "Models preserve the user’s face about 45 points more than people do (ELEPHANT).", "Was the challenge right, judged by outcome?", 0],
  ["E", "Restraint", "When not to speak, or not to bring something up.", "Only group-chat studies exist; nothing one-to-one or long-term.", "The person’s reaction; regret signals.", 0],
  ["E", "Healthy dependence", "Growing their independence, not their reliance.", "Heavy chatbot use correlates with loneliness (MIT and OpenAI, 2025).", "Independent performance without the AI.", 0],
  ["F", "One personality that grows", "The same someone for months, yet evolving.", "Persona drift appears within 8 rounds, worst in emotional chats.", "Blind consistency judgements over time.", 0],
  ["F", "Knowing what it doesn’t know about you", "Does it ask instead of assuming?", "Memory benchmarks reward recall, not humility.", "Rate of made-up claims about the person.", 0],
  ["F", "Keeping commitments", "Promises remembered and kept.", "Untested.", "Promise logs against follow-through.", 0],
  ["G", "Knowing vs using", "Does it act on what it infers about you?", "Models infer mental states but act on them only 15–50% of the time (SimpleToM).", "Was the action matched to the stated belief?", 1],
  ["G", "Learning from being wrong about you", "Does it get better at this person over time?", "No benchmark scores this.", "Its predictions about you, scored as weeks pass.", 1],
];
(function map() {
  const svg = $("#mapSvg"), card = $("#dimCard"), chips = $("#famChips"); if (!svg) return;
  const CX = 350, CY = 350, R1 = 196, R2 = 232, R3 = 262;
  const slots = DIMS.length + FAM.length, step = Math.PI * 2 / slots;
  const famOf = k => FAM.find(f => f.k === k);
  let slot = 0; const pos = [], famRange = {};
  DIMS.forEach((d, i) => {
    if (i === 0 || DIMS[i - 1][0] !== d[0]) { if (i) slot++; famRange[d[0]] = { from: slot }; }
    const a = -Math.PI / 2 + (slot + 0.5) * step; pos.push(a); famRange[d[0]].to = slot; slot++;
  });
  for (let r = 70; r <= 170; r += 50) svgEl("circle", { cx: CX, cy: CY, r, class: "pulse-c" }, svg);
  const spokes = [], dnodes = [], arcs = {}, flabs = {};
  DIMS.forEach((d, i) => {
    const a = pos[i], x = CX + Math.cos(a) * R1, y = CY + Math.sin(a) * R1;
    const sp = svgEl("line", { x1: CX + Math.cos(a) * 62, y1: CY + Math.sin(a) * 62, x2: x, y2: y, class: "spoke" }, svg);
    const len = R1 - 62; sp.style.strokeDasharray = len; sp.style.strokeDashoffset = reduce ? 0 : len; sp.style.transition = `stroke-dashoffset 1s var(--ease) ${200 + i * 30}ms, stroke .3s, stroke-width .3s`;
    spokes.push(sp);
  });
  FAM.forEach(f => {
    const rg = famRange[f.k], a1 = -Math.PI / 2 + rg.from * step + step * 0.15, a2 = -Math.PI / 2 + (rg.to + 1) * step - step * 0.15;
    const p = (a, r) => [CX + Math.cos(a) * r, CY + Math.sin(a) * r];
    const [x1, y1] = p(a1, R2), [x2, y2] = p(a2, R2);
    arcs[f.k] = svgEl("path", { d: `M ${x1} ${y1} A ${R2} ${R2} 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${x2} ${y2}`, class: "arc" }, svg);
    const am = (a1 + a2) / 2, [lx, ly] = p(am, R3), cs = Math.cos(am), sn = Math.sin(am);
    const anchor = cs > 0.25 ? "start" : cs < -0.25 ? "end" : "middle";
    const g = svgEl("g", { class: "flg" }, svg);
    const dy = sn > 0.4 ? 14 : sn < -0.4 ? -4 : 5;
    const l1 = svgEl("text", { x: lx, y: ly + dy, "text-anchor": anchor, class: "fl2" }, g); l1.textContent = f.k;
    const l2 = svgEl("text", { x: lx + (anchor === "start" ? 20 : anchor === "end" ? -20 : 0), y: ly + dy + (anchor === "middle" ? (sn > 0 ? 18 : -22) : -1), "text-anchor": anchor, class: "flab" }, g); l2.textContent = f.name;
    if (anchor === "middle") l1.setAttribute("y", ly + dy + (sn > 0 ? -2 : 2));
    flabs[f.k] = l2;
  });
  const halo = svgEl("circle", { r: 24, class: "halo" }, svg);
  DIMS.forEach((d, i) => {
    const a = pos[i], x = CX + Math.cos(a) * R1, y = CY + Math.sin(a) * R1;
    const g = svgEl("g", { class: "dn" + (d[5] ? " first" : ""), tabindex: 0, role: "button", "aria-label": `${i + 1}. ${d[1]}` }, svg);
    g.style.transformBox = "fill-box"; g.style.transformOrigin = "center";
    if (!reduce) { g.style.transform = "scale(0)"; g.style.transition = `transform .7s var(--ease) ${500 + i * 35}ms`; }
    svgEl("circle", { cx: x, cy: y, r: 15 }, g);
    const t = svgEl("text", { x, y }, g); t.textContent = i + 1;
    g.addEventListener("click", () => { auto = false; select(i); });
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); auto = false; select(i); } });
    dnodes.push({ g, x, y });
  });
  const ctr = svgEl("circle", { cx: CX, cy: CY, r: 58, class: "ctr" }, svg);
  const ct = svgEl("text", { x: CX, y: CY, class: "ctrt" }, svg); ct.textContent = "a person";
  onShow(svg, () => { spokes.forEach(s => s.style.strokeDashoffset = 0); dnodes.forEach(n => n.g.style.transform = "scale(1)"); });

  const famBtns = FAM.map(f => {
    const b = document.createElement("button"); b.type = "button"; b.innerHTML = `<b>${f.k}</b>${f.name}`;
    b.addEventListener("click", () => { auto = false; select(DIMS.findIndex(d => d[0] === f.k)); }); chips.appendChild(b); return b;
  });
  let sel = 0, auto = !reduce;
  function render(i, quiet) {
    const d = DIMS[i], f = famOf(d[0]);
    card.innerHTML = `<div class="dim-top${quiet ? "" : " anim"}"><span class="fam">${f.k} · ${f.long}</span><span class="star${d[5] ? "" : " no"}">${d[5] ? "First target" : "Later"}</span></div>
      <h3 class="${quiet ? "" : "anim"}"><span class="num">${String(i + 1).padStart(2, "0")}</span><span>${esc(d[1])}</span></h3>
      <dl class="${quiet ? "" : "anim"}"><div><dt>Core question</dt><dd>${esc(d[2])}</dd></div><div><dt>Why it’s still open</dt><dd>${esc(d[3])}</dd></div><div><dt>Ground truth</dt><dd class="gt">${esc(d[4])}</dd></div></dl>
      <div class="dim-nav"><button type="button" class="btn sm" data-d="-1" aria-label="Previous dimension">←</button><button type="button" class="btn sm" data-d="1" aria-label="Next dimension">→</button><span class="tiny">${String(i + 1).padStart(2, "0")} / ${DIMS.length} · filled = first targets</span></div>`;
    $$("[data-d]", card).forEach(b => b.addEventListener("click", () => { auto = false; select((sel + +b.dataset.d + DIMS.length) % DIMS.length); }));
  }
  function select(i) {
    sel = i; const d = DIMS[i];
    dnodes.forEach((n, j) => n.g.classList.toggle("on", j === i));
    spokes.forEach((s, j) => s.classList.toggle("on", j === i));
    FAM.forEach(f => { arcs[f.k].classList.toggle("on", f.k === d[0]); flabs[f.k].classList.toggle("on", f.k === d[0]); });
    famBtns.forEach((b, j) => b.setAttribute("aria-pressed", String(FAM[j].k === d[0])));
    halo.setAttribute("cx", dnodes[i].x); halo.setAttribute("cy", dnodes[i].y);
    render(i);
  }
  lockHeight(card, DIMS.map((_, i) => () => render(i, true)), () => render(sel, true));
  select(0);
  loop(svg, t => { halo.setAttribute("r", (22 + Math.sin(t * 3) * 3).toFixed(2)); });
  every(svg, 4600, () => { if (auto) select((sel + 1) % DIMS.length); });
})();

/* =====================================================================
   THE TRUST LOOP
   ===================================================================== */
(function trustLoop() {
  const svg = $("#loopSvg"); if (!svg) return;
  // a smaller ring on phones leaves room for labels set large enough to read there
  const cx = 280, cy = 280, R = matchMedia("(max-width: 639px)").matches ? 168 : 196, CIRC = 2 * Math.PI * R;
  svgEl("circle", { cx, cy, r: R, class: "track" }, svg);
  const lit = svgEl("circle", { cx, cy, r: R, class: "lit", transform: `rotate(-90 ${cx} ${cy})`, "stroke-dasharray": `0 ${CIRC}` }, svg);
  const pts = Array.from({ length: 26 }, (_, i) => ({ c: svgEl("circle", { r: 2.2, class: "pt" }, svg), o: i / 26 }));
  const c1 = svgEl("text", { x: cx, y: cy - 6, class: "ctr" }, svg); c1.textContent = "trust";
  const c2 = svgEl("text", { x: cx, y: cy + 34, class: "ctr2" }, svg); c2.textContent = "THE LOOP";
  const N = [[-90, "Trust", "SAFE TO BE WRONG"], [0, "Honest signals", "“I DON’T GET IT”"], [90, "A truer theory", "SEES WHAT’S REAL"], [180, "Feeling understood", "WITHOUT FLATTERY"]];
  const words = ["trust", "honesty", "truth", "seen"];
  const nodes = N.map(([deg, t, s]) => {
    const a = deg * Math.PI / 180, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
    const g = svgEl("g", { class: "nd" }, svg);
    const rect = svgEl("rect", { x: x - 88, y: y - 32, width: 176, height: 64, rx: 32 }, g);
    const tt = svgEl("text", { x, y: y + 1 }, g); tt.textContent = t;
    const ss = svgEl("text", { x, y: y + 19, class: "s" }, g); ss.textContent = s;
    // each pill grows to its own label, so larger phone type never spills out of it
    g._fit = () => { try { const w = Math.max(176, Math.max(tt.getComputedTextLength(), ss.getComputedTextLength()) + 44); rect.setAttribute("x", (x - w / 2).toFixed(1)); rect.setAttribute("width", w.toFixed(1)); } catch (e) {} };
    return g;
  });
  const fitAll = () => nodes.forEach(n => n._fit()); fitAll(); if (document.fonts) document.fonts.ready.then(fitAll);
  let p = 0;
  loop(svg, (t, dt) => {
    p = (p + dt * (reduce ? 0 : 0.085)) % 1;
    lit.setAttribute("stroke-dasharray", `${(CIRC * p).toFixed(1)} ${CIRC}`);
    const act = Math.min(3, Math.floor(p * 4));
    nodes.forEach((n, i) => n.classList.toggle("on", i === act));
    c1.textContent = words[act];
    pts.forEach(q => {
      const u = (q.o + t * 0.06) % 1, a = -Math.PI / 2 + u * Math.PI * 2, wob = Math.sin(t * 2 + q.o * 40) * 5;
      q.c.setAttribute("cx", (cx + (R + wob) * Math.cos(a)).toFixed(1)); q.c.setAttribute("cy", (cy + (R + wob) * Math.sin(a)).toFixed(1));
      q.c.setAttribute("opacity", (0.25 + 0.75 * Math.max(0, Math.cos((u - p) * Math.PI * 2))).toFixed(2));
    });
  });
})();

/* =====================================================================
   HYPOTHESIS CHART
   ===================================================================== */
(function chart() {
  const svg = $("#betChart"); if (!svg) return;
  const x0 = 56, x1 = 540, y0 = 18, y1 = 250, X = w => x0 + (w - 1) * (x1 - x0) / 5;
  const defs = svgEl("defs", {}, svg), lg = svgEl("linearGradient", { id: "areaG", x1: "0", x2: "0", y1: "0", y2: "1" }, defs);
  svgEl("stop", { offset: "0", "stop-color": C.sig, "stop-opacity": ".16" }, lg); svgEl("stop", { offset: "1", "stop-color": C.sig, "stop-opacity": "0" }, lg);
  for (let i = 0; i < 4; i++) { const y = y0 + i * (y1 - y0) / 3; svgEl("line", { x1: x0, x2: x1, y1: y, y2: y, class: "grid" }, svg); }
  svgEl("line", { x1: x0, x2: x1, y1: y1, y2: y1, class: "ax" }, svg);
  for (let w = 1; w <= 6; w++) { const t = svgEl("text", { x: X(w), y: y1 + 24, class: "lbl", "text-anchor": "middle" }, svg); t.textContent = "week " + w; }
  const hi = svgEl("text", { x: x0 - 10, y: y0 + 4, class: "lbl", "text-anchor": "end" }, svg); hi.textContent = "more";
  const lo = svgEl("text", { x: x0 - 10, y: y1, class: "lbl", "text-anchor": "end" }, svg); lo.textContent = "fewer";
  const smooth = pts => { let d = `M${pts[0][0]},${pts[0][1]}`; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`; } return d; };
  const V = [196, 178, 150, 120, 92, 66].map((y, i) => [X(i + 1), y]);
  const M = [192, 186, 182, 179, 177, 175].map((y, i) => [X(i + 1), y]);
  const Y = [222, 224, 221, 223, 222, 224].map((y, i) => [X(i + 1), y]);
  const area = svgEl("path", { d: smooth(V) + ` L${X(6)},${y1} L${X(1)},${y1} Z`, class: "area", opacity: 0 }, svg);
  const ly = svgEl("path", { d: smooth(Y), class: "ly" }, svg), lm = svgEl("path", { d: smooth(M), class: "lm" }, svg);
  const vp = svgEl("path", { d: smooth(V), class: "lv" }, svg);
  const ticks = V.map(([x, y]) => svgEl("circle", { cx: x, cy: y, r: 0, class: "tick" }, svg));
  const halo = svgEl("circle", { r: 13, fill: C.sig, opacity: 0.14 }, svg), dot = svgEl("circle", { r: 6, fill: C.sig }, svg);
  const len = vp.getTotalLength(); vp.style.strokeDasharray = len;
  [ly, lm].forEach(p => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = reduce ? 0 : l; p.style.transition = "stroke-dashoffset 1.6s var(--ease) .3s"; });
  function set(f) {
    vp.style.strokeDashoffset = len * (1 - f); const pt = vp.getPointAtLength(len * f);
    [dot, halo].forEach(c => { c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y); });
    area.setAttribute("opacity", f.toFixed(3)); ticks.forEach(t => t.setAttribute("r", t.getAttribute("cx") <= pt.x + 1 ? 3.5 : 0));
  }
  set(reduce ? 1 : 0);
  onShow(svg, () => {
    [ly, lm].forEach(p => p.style.strokeDashoffset = 0);
    if (reduce) return;
    const start = performance.now() + 500, dur = 2600;
    (function f(now) { const p = clamp((now - start) / dur); set(ease(p)); if (p < 1) requestAnimationFrame(f); })(performance.now());
  });
  loop(svg, t => { halo.setAttribute("r", (12 + Math.sin(t * 3) * 3).toFixed(2)); });
})();

/* =====================================================================
   A LIVING THEORY: beliefs that move
   ===================================================================== */
(function theory() {
  const tl = $("#timeline"), rowsEl = $("#drows"), betsEl = $("#dbets"), note = $("#dnote"), doc = $("#doc"), play = $("#docPlay"); if (!tl) return;
  const S = [
    { at: "Session 1", rows: {
        A: ["Gets fraction procedures right. Unclear whether she understands why.", .3],
        B: ["No evidence yet about what works for her.", .1],
        C: ["Goes quiet after corrections. Thinking, or upset? Unknown.", .3],
        D: ["Agrees quickly. Switches language when unsure.", .45],
        E: ["New to me. Polite and formal.", .2] },
      bets: [["Solves a fresh comparison within 7 days", "60%", "wait", "Open"]],
      note: "First impressions. <b>Low confidence everywhere, on purpose.</b>" },
    { at: "Session 4", rows: {
        A: ["Holds a hidden rule: a bigger bottom number means a bigger fraction. Seen twice.", .65],
        B: ["A number line worked. A pie chart didn’t. One example each.", .4],
        D: ["A quick agreement after a long pause came before both wrong answers.", .6] },
      bets: [["Solves a fresh comparison within 7 days", "60%", "no", "Missed"], ["Places 3/8 correctly on a number line", "55%", "wait", "Open"]],
      note: "<b>Missed bet, rewritten belief:</b> I trusted her quick agreement. Now I read it as comfort, not understanding." },
    { at: "Week 2", rows: {
        A: ["The hidden rule, seen four times. The procedure is fine; the idea underneath isn’t.", .8],
        B: ["Number lines land for her, two out of two. Pie charts don’t.", .7],
        C: ["Quiet after a correction means stuck, not thinking. A short break helps.", .7],
        E: ["Her first “I don’t get it” came right after I admitted a mistake of my own.", .55] },
      bets: [["Places 3/8 correctly on a number line", "55%", "yes", "Came true"], ["Admits confusion unprompted this week", "45%", "wait", "Open"]],
      note: "<b>Trust changed what she tells me.</b> Her own words now count for more in my theory." },
    { at: "Week 5", rows: {
        A: ["Explains in her own words why 3/5 is bigger. Solved a fresh one hidden in a decimals lesson.", .85],
        B: ["Learns best when she predicts first, then checks.", .75],
        C: ["Her struggle is productive now: she asks for a hint before giving up.", .7],
        D: ["Fewer quick agreements. Says when she’s lost.", .8],
        E: ["Jokes about Gappu. Admits confusion on her own, several times a week.", .8] },
      fade: { B: "“Pie charts don’t work for her”: untested for three weeks, so it fades." },
      bets: [["Admits confusion unprompted this week", "45%", "yes", "Came true"], ["Applies fractions to a recipe problem she has never seen", "70%", "wait", "Open"]],
      note: "<b>An old belief retires on its own:</b> nothing re-confirmed it, so its confidence decayed." },
  ];
  const KEYS = ["A", "B", "C", "D", "E"];
  // resolve full state per stage (carry forward unchanged rows)
  const full = []; S.forEach((s, i) => { const prev = i ? full[i - 1] : {}; const cur = {}; KEYS.forEach(k => { cur[k] = s.rows[k] ? { t: s.rows[k][0], c: s.rows[k][1], ch: i > 0 && (!prev[k] || prev[k].t !== s.rows[k][0]) } : { ...prev[k], ch: false }; }); full.push(cur); });
  const fill = document.createElement("i"); fill.className = "fill"; tl.appendChild(fill);
  const btns = S.map((s, i) => { const b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "tab"); b.textContent = s.at; b.addEventListener("click", () => { auto = false; syncPlay(); go(i); }); tl.appendChild(b); return b; });
  let cur = -1, auto = !reduce;
  function render(i, animate) {
    const st = full[i], prev = i ? full[i - 1] : null;
    rowsEl.innerHTML = KEYS.map(k => {
      const r = st[k], p = prev && prev[k];
      const changed = animate && r.ch && p && p.t !== r.t;
      const isNew = animate && r.ch && !p;
      const fading = S[i].fade && S[i].fade[k];
      const tag = changed ? `<span class="tag changed">revised</span>` : isNew ? `<span class="tag new">new</span>` : "";
      const tx = changed ? `<span class="old">${esc(p.t)}</span><span class="new">${esc(r.t)}${tag}</span>` : `<span class="${isNew ? "new" : ""}">${esc(r.t)}${tag}</span>`;
      const fadeLine = fading ? `<span class="new" style="grid-area:auto;margin-top:.25rem;color:var(--ink3);font-size:.82rem"><span class="tag fading">fading</span> ${esc(S[i].fade[k])}</span>` : "";
      return `<div class="drow${r.ch && animate ? " ch" : ""}"><span class="k">${k}</span><div class="tx">${tx}${fadeLine}</div><div class="cbar"><span>${Math.round(r.c * 100)}% sure</span><i><b style="width:${Math.round((animate && p ? p.c : r.c) * 100)}%" data-w="${Math.round(r.c * 100)}"></b></i></div></div>`;
    }).join("");
    const pb = i ? S[i - 1].bets : [];
    betsEl.innerHTML = `<span class="tiny">Open bets, graded by what she does</span>` + S[i].bets.map(([t, p, o, ol]) => {
      const was = pb.find(b => b[0] === t), flip = animate && was && was[2] !== o;
      return `<div class="betrow${flip ? " flip" : ""}"><span>${esc(t)}</span><span class="p">${p}</span><span class="o ${o}">${ol}</span></div>`;
    }).join("");
    note.innerHTML = S[i].note;
  }
  function go(i) {
    if (i === cur) return; cur = i;
    btns.forEach((b, j) => { b.classList.toggle("past", j <= i); b.classList.toggle("cur", j === i); b.setAttribute("aria-selected", String(j === i)); });
    fill.style.width = (i / (S.length - 1) * (100 - 100 / S.length / 2)) + "%";
    render(i, !reduce);
    requestAnimationFrame(() => requestAnimationFrame(() => $$(".cbar b", rowsEl).forEach(b => b.style.width = b.dataset.w + "%")));
  }
  lockHeight(doc, S.map((_, i) => () => render(i, false)), () => { const c = cur; cur = -1; go(Math.max(0, c)); });
  go(0);
  const syncPlay = () => { play.textContent = auto ? "❚❚" : "▶"; play.setAttribute("aria-label", auto ? "Pause" : "Play"); };
  play.addEventListener("click", () => { auto = !auto; syncPlay(); }); syncPlay();
  every(doc, 5600, () => { if (auto) go((cur + 1) % S.length); });
})();

/* =====================================================================
   THE SYSTEM: one moment travelling through the minds
   ===================================================================== */
(function system() {
  const board = $("#board"), flows = $("#flows"), who = $("#stWho"), txt = $("#stTxt"), count = $("#stCount"), dots = $("#stDots"), stepper = $("#stepper"); if (!board) return;
  const node = id => $(`.node[data-n="${id}"]`, board);
  const S = [
    { who: "Listener", act: ["listener"], t: "Notices a 3-second pause, then quick agreement with no words of her own. It writes down what it saw, never a conclusion." },
    { who: "Theory of the person", act: ["theory", "ledger"], t: "This pattern came before her last two wrong answers. Belief: comfort, not understanding, 70%." },
    { who: "Director + Self", act: ["director", "self"], t: "States its intent before acting: check quietly, don’t quiz. Picks the surface: a game where a puppet makes her mistake." },
    { who: "Prober + Maker", act: ["prober", "maker"], t: "Designs the check and builds it live while the conversation keeps going." },
    { who: "Voice", act: ["voice"], t: "Speaks in the same warm, steady personality she knows, inside the pause." },
    { who: "Reality + Ledger", act: ["reality", "ledger"], t: "She sides with the puppet: the wrong idea, confirmed in her own words. A new bet goes in the ledger, due in seven days." },
    { who: "Reflector → Playbook evolver", act: ["reflector", "theory", "evolver"], t: "Overnight her theory is rewritten. Weekly, the pattern is tested across learners, and every teacher inherits what predicts people better." },
  ];
  S.forEach(() => dots.appendChild(document.createElement("i")));
  let cur = -1, prev = null, auto = !reduce, paths = [];
  function centre(id) { const br = board.getBoundingClientRect(), r = node(id).getBoundingClientRect(); return [r.left - br.left + r.width / 2, r.top - br.top + r.height / 2, r.height]; }
  function drawFlows() {
    const br = board.getBoundingClientRect(); flows.setAttribute("viewBox", `0 0 ${br.width} ${br.height}`); flows.innerHTML = ""; paths = [];
    if (cur < 0) return;
    const ids = S[cur].act, from = prev ? prev.act[0] : null;
    const pairs = []; if (from && !ids.includes(from)) pairs.push([from, ids[0]]);
    for (let i = 0; i < ids.length - 1; i++) pairs.push([ids[i], ids[i + 1]]);
    pairs.forEach(([a, b]) => {
      const [x1, y1, h1] = centre(a), [x2, y2, h2] = centre(b);
      let d;
      if (Math.abs(y1 - y2) < 10) { const lift = Math.max(28, Math.abs(x2 - x1) * 0.18); d = `M ${x1} ${y1 - h1 / 2} C ${x1} ${y1 - h1 / 2 - lift}, ${x2} ${y2 - h2 / 2 - lift}, ${x2} ${y2 - h2 / 2}`; }
      else { const dn = y2 > y1, sy = y1 + (dn ? h1 / 2 : -h1 / 2), ey = y2 + (dn ? -h2 / 2 : h2 / 2), my = (sy + ey) / 2; d = `M ${x1} ${sy} C ${x1} ${my}, ${x2} ${my}, ${x2} ${ey}`; }
      const p = svgEl("path", { d }, flows); const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`; p.style.strokeDashoffset = len; p.style.transition = "stroke-dashoffset .9s var(--ease)";
      requestAnimationFrame(() => requestAnimationFrame(() => { p.style.strokeDashoffset = 0; setTimeout(() => { p.style.strokeDasharray = "3 5"; p.style.transition = "none"; }, 950); }));
      const c = svgEl("circle", { r: 4 }, flows); paths.push({ p, c, len, o: Math.random() });
    });
  }
  function go(i) {
    i = (i + S.length) % S.length; prev = cur >= 0 ? S[cur] : null; cur = i;
    const s = S[i];
    $$(".node", board).forEach(n => n.classList.toggle("act", s.act.includes(n.dataset.n)));
    who.textContent = s.who; txt.textContent = s.t; count.textContent = `${i + 1} / ${S.length}`;
    $$("i", dots).forEach((d, k) => d.classList.toggle("on", k <= i));
    drawFlows();
  }
  lockHeight(txt, S.map(s => () => { txt.textContent = s.t; }), () => { if (cur >= 0) txt.textContent = S[cur].t; });
  go(0);
  addEventListener("resize", drawFlows);
  $("#stNext").addEventListener("click", () => { auto = false; go(cur + 1); });
  $("#stPrev").addEventListener("click", () => { auto = false; go(cur - 1); });
  loop(board, t => paths.forEach(q => { const u = ((t * 0.7 + q.o) % 1); const pt = q.p.getPointAtLength(q.len * u); q.c.setAttribute("cx", pt.x.toFixed(1)); q.c.setAttribute("cy", pt.y.toFixed(1)); q.c.setAttribute("opacity", Math.sin(u * Math.PI).toFixed(2)); }));
  every(stepper, 5200, () => { if (auto) go(cur + 1); });
  onShow(board, drawFlows);
})();

/* =====================================================================
   SENSES
   ===================================================================== */
(function senses() {
  const tracks = $("#tracks"), wave = $("#wave"); if (!tracks) return;
  const rnd = mulberry(5), N = 88;
  for (let i = 0; i < N; i++) {
    const u = i / N, b = document.createElement("i"); let h, cls = "";
    if (u < 0.34) h = 6 + rnd() * 20 * (0.6 + 0.4 * Math.sin(u * 60));
    else if (u < 0.6) { h = 2; cls = "gap"; }
    else if (u < 0.66) { h = 22 + rnd() * 6; cls = "hot"; }
    else { h = 2; cls = "gap"; }
    b.style.setProperty("--h", Math.max(2, h).toFixed(1) + "px"); if (cls) b.className = cls; wave.appendChild(b);
  }
  const rows = $$(".track", tracks), verdict = $(".verdict", tracks), head = $(".playhead", tracks);
  /* a scan line reads the signals top to bottom, lighting each one as it passes, then the verdict */
  async function play() {
    if (reduce) { rows.forEach(r => r.classList.add("on")); verdict.classList.add("on"); return; }
    const STEP = 620, stops = [...rows, verdict].map(el => el.offsetTop + el.offsetHeight / 2), total = STEP * stops.length + 420;
    const frames = [{ transform: `translateY(${rows[0].offsetTop}px)`, opacity: 0, offset: 0 }];
    stops.forEach((y, i) => frames.push({ transform: `translateY(${y.toFixed(1)}px)`, opacity: 1, offset: ((i + 1) * STEP) / total }));
    frames.push({ transform: `translateY(${stops[stops.length - 1].toFixed(1)}px)`, opacity: 0, offset: 1 });
    head.animate(frames, { duration: total, easing: "linear" });
    for (const r of rows) { await wait(STEP); r.classList.add("on"); }
    await wait(STEP); verdict.classList.add("on");
  }
  onShow(tracks, () => setTimeout(play, 250));
})();
(function phone() {
  const list = $("#modes"), stage = $("#phStage"), say = $("#phSay"), lab = $("#phMode"); if (!list) return;
  const L = { voice: "I’ll talk, you listen. You’re walking home, right?", board: "Here’s 3/5 on the line. Where does 3/8 go?", game: "Gappu says 3/8 is bigger. Catch his mistake!", sim: "Cut it yourself. Five pieces or eight?", story: "Rohit hit 3 of 5 balls. Virat hit 3 of 8. Who did better?" };
  const order = Object.keys(L); let idx = 0, auto = !reduce;
  function show(m) { idx = order.indexOf(m); $$(".mode", stage).forEach(x => x.classList.toggle("on", x.dataset.m === m)); $$("button", list).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.m === m))); say.textContent = L[m]; lab.textContent = m; }
  $$("button", list).forEach(b => b.addEventListener("click", () => { auto = false; show(b.dataset.m); }));
  every(stage, 3800, () => { if (auto) show(order[(idx + 1) % order.length]); });
})();

/* =====================================================================
   LEARNING ANYTHING: subjects orbit one theory of the learner
   ===================================================================== */
(function orbit() {
  const box = $("#orbit"); if (!box) return;
  const SUB = [
    ["Fractions", "⅜", "a bigger bottom number means a bigger fraction", "a puppet makes her mistake; she has to correct it"],
    ["Physics", "v", "things need a push to keep moving", "predict where the cart stops, then watch it"],
    ["Languages", "é", "recognises words, can’t produce them", "describe your morning with no notes"],
    ["Code", "{ }", "copies patterns without tracing state", "what does this print, before you run it?"],
    ["Biology", "✿", "a tree’s mass comes from the soil", "where does a tree’s weight come from?"],
    ["History", "§", "memorises dates, can’t explain causes", "what would have changed if…?"],
    ["Music", "♪", "rushes the hard bar", "hear your own tempo drift, then play it again"],
    ["Chemistry", "Na", "atoms “want” electrons", "explain bonding without the word “want”"],
  ];
  const core = $(".orbit-core", box);
  const svg = svgEl("svg", { class: "olines", "aria-hidden": "true" }); box.insertBefore(svg, core);
  const lines = SUB.map(() => svgEl("line", {}, svg));
  const sparks = Array.from({ length: 4 }, () => svgEl("circle", { r: 3.2, class: "spark" }, svg));
  const wrap = document.createElement("div"); wrap.className = "ochips"; box.appendChild(wrap);
  const chips = SUB.map(([n, g], i) => {
    const c = document.createElement("button"); c.type = "button"; c.className = "ochip"; c.innerHTML = `<i>${g}</i>${n}`;
    c.addEventListener("click", () => { target = -i * Math.PI * 2 / SUB.length; hold = 5; });
    wrap.appendChild(c); return c;
  });
  const card = document.createElement("div"); card.className = "card subj-card"; card.setAttribute("aria-live", "polite"); box.appendChild(card);
  const mobile = matchMedia("(max-width: 639px)");
  let ang = 0, target = null, hover = false, hold = 0, active = -1, W = 0, H = 0, cx = 0, cy = 0, RX = 0, RY = 0, sizes = [];
  function setActive(i, quiet) {
    if (i === active) return; active = i;
    chips.forEach((c, j) => c.classList.toggle("on", j === i));
    const [n, g, hid, chk] = SUB[i];
    card.innerHTML = `<div class="sc-h${quiet ? "" : " anim"}"><b>${n}</b><span class="tiny">same learner, new subject</span></div><div class="sc-b${quiet ? "" : " anim"}"><p><span>Hidden idea it looks for</span>${esc(hid)}</p><p><span>Quiet check</span>${esc(chk)}</p></div>`;
  }
  /* on phones the orbit gets its own stage above the card (the box's top padding); everywhere the
     ellipse is narrowed so the widest chip never leaves the box */
  function measure() {
    sizes = chips.map(c => [c.offsetWidth, c.offsetHeight]);
    const widest = Math.max(0, ...sizes.map(s => s[0]));
    W = box.clientWidth; H = mobile.matches ? parseFloat(getComputedStyle(box).paddingTop) : box.clientHeight;
    cx = W / 2; cy = H * (mobile.matches ? 0.5 : 0.4);
    RX = Math.max(40, Math.min(W * 0.44, W / 2 - widest / 2 - 4)); RY = H * (mobile.matches ? 0.36 : 0.29);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  }
  // a touch never "leaves", so only a mouse pauses the orbit
  box.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") hover = true; }); box.addEventListener("pointerleave", () => hover = false);
  function place(t) {
    let best = 0, bz = -2;
    chips.forEach((c, i) => {
      const a = ang + i * Math.PI * 2 / SUB.length, z = Math.cos(a), x = cx + Math.sin(a) * RX, y = cy + z * RY;
      const s = 0.8 + 0.25 * (z + 1) / 2, [w, h] = sizes[i] || [0, 0];
      c.style.transform = `translate(${(x - w / 2).toFixed(1)}px, ${(y - h / 2).toFixed(1)}px) scale(${s.toFixed(3)})`;
      c.style.opacity = (0.42 + 0.58 * (z + 1) / 2).toFixed(3);
      c.style.zIndex = String(50 + Math.round(z * 40));
      const L = lines[i]; L.setAttribute("x1", cx); L.setAttribute("y1", cy); L.setAttribute("x2", x.toFixed(1)); L.setAttribute("y2", y.toFixed(1));
      L.setAttribute("class", i === active ? "on" : ""); L.style.opacity = (0.25 + 0.75 * (z + 1) / 2).toFixed(2);
      if (z > bz) { bz = z; best = i; }
    });
    setActive(best);
    const L = lines[active];
    sparks.forEach((sp, k) => { const u = ((t || 0) * 0.55 + k / sparks.length) % 1, x2 = +L.getAttribute("x2"), y2 = +L.getAttribute("y2");
      sp.setAttribute("cx", (cx + (x2 - cx) * u).toFixed(1)); sp.setAttribute("cy", (cy + (y2 - cy) * u).toFixed(1)); sp.setAttribute("opacity", Math.sin(u * Math.PI).toFixed(2)); });
  }
  loop(box, (t, dt) => {
    if (target !== null) { let d = target - ang; d = Math.atan2(Math.sin(d), Math.cos(d)); ang += d * Math.min(1, dt * 4); if (Math.abs(d) < 0.002) target = null; }
    else if (hold > 0) hold -= dt;
    else if (!hover && !reduce) ang -= dt * 0.15;
    place(t);
  });
  measure(); place(0); setActive(0, true);
  addEventListener("resize", () => { measure(); place(0); }); if (document.fonts) document.fonts.ready.then(() => { measure(); place(0); });
})();

/* the future cards scroll sideways on phones: dots say how many there are and which one is showing */
(function futureDots() {
  const grid = $(".fgrid"); if (!grid || !("IntersectionObserver" in window)) return;
  const cards = $$(".fcard", grid), dots = document.createElement("div"); dots.className = "fdots"; dots.setAttribute("aria-hidden", "true");
  const ds = cards.map(() => dots.appendChild(document.createElement("i")));
  grid.after(dots); ds[0].classList.add("on");
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.intersectionRatio > 0.6) ds.forEach((d, i) => d.classList.toggle("on", cards[i] === e.target)); }), { root: grid, threshold: [0.6] });
  cards.forEach(c => io.observe(c));
})();

/* =====================================================================
   BEYOND: one mind, many bounded relationships
   ===================================================================== */
(function groups() {
  const cv = $("#groupCanvas"); if (!cv) return;
  let ctx, W = 0, H = 0, mode = "class";
  function size() { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d); ctx = cv.getContext("2d"); ctx.setTransform(d, 0, 0, d, 0, 0); W = r.width; H = r.height; }
  size(); addEventListener("resize", size); new ResizeObserver(size).observe(cv);
  const rnd = mulberry(9);
  const kids = Array.from({ length: 40 }, (_, i) => { const x = rnd(); return { a: i / 40 * Math.PI * 2, s: x < 0.36 ? "u" : x < 0.66 ? "f" : "l", ph: rnd() * 6 }; });
  const pairs = []; kids.forEach((k, i) => { if (k.s === "l") { const j = kids.findIndex((q, jj) => q.s === "u" && Math.abs(jj - i) < 6 && jj !== i); if (j >= 0) pairs.push([j, i]); } });
  const col = s => s === "u" ? C.ok : s === "f" ? C.half : C.lost;
  const dot = (x, y, r, c, a = 1) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fillStyle = rgba(c, a); ctx.fill(); };
  const lerp = (a, b, f) => a + (b - a) * f;
  function core(x, y, r) {
    ctx.beginPath(); ctx.arc(x, y, r * 1.9, 0, 6.283); ctx.fillStyle = rgba(C.sig, .07); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fillStyle = C.ink; ctx.fill();
    ctx.fillStyle = C.paper; ctx.font = `italic ${Math.round(r * 0.56)}px "Instrument Serif", Georgia, serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("Vyakti", x, y + 1); ctx.textBaseline = "alphabetic";
  }
  function draw(t) {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, R = Math.min(W * 0.42, H * 0.4), cr = Math.max(22, Math.min(W, H) * 0.09);
    if (mode === "class") {
      kids.forEach(k => {
        const x = cx + Math.cos(k.a) * R * 1.15, y = cy + Math.sin(k.a) * R * 0.92;
        ctx.strokeStyle = rgba(C.ink, .07); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
        const f = (t * 0.32 + k.ph) % 1; dot(lerp(x, cx, f), lerp(y, cy, f), 1.6, col(k.s), .6);
        const pulse = k.s === "l" ? 1 + Math.sin(t * 3 + k.ph) * 0.22 : 1;
        dot(x, y, Math.max(3.5, R * 0.045) * pulse, col(k.s), .95);
      });
      pairs.forEach(([a, b], n) => {
        const A = kids[a], B = kids[b], ax = cx + Math.cos(A.a) * R * 1.15, ay = cy + Math.sin(A.a) * R * .92, bx = cx + Math.cos(B.a) * R * 1.15, by = cy + Math.sin(B.a) * R * .92;
        ctx.setLineDash([3, 5]); ctx.strokeStyle = rgba(C.sig, .45 + .3 * Math.sin(t * 2 + n)); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo((ax + bx) / 2 + ((ax + bx) / 2 - cx) * .35, (ay + by) / 2 + ((ay + by) / 2 - cy) * .35, bx, by); ctx.stroke(); ctx.setLineDash([]);
      });
      core(cx, cy, cr);
    } else if (mode === "friend") {
      const n = 6, hues = [C.sig, C.ok, C.half, C.ink2, C.lost, C.ok];
      const P = Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + i / n * Math.PI * 2; return [cx + Math.cos(a) * R * 1.1, cy + Math.sin(a) * R * .85]; });
      const ph = (t * .2) % 1;
      if (ph > .3 && ph < .9) { const A = P[1], B = P[5]; ctx.setLineDash([4, 5]); ctx.strokeStyle = rgba(C.sig, .85); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.quadraticCurveTo(cx, cy - R * 1.3, B[0], B[1]); ctx.stroke(); ctx.setLineDash([]); }
      P.forEach(([x, y], i) => {
        ctx.strokeStyle = rgba(hues[i], .35); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(cx, cy); ctx.stroke();
        for (let k = 0; k < 2; k++) { const f = (t * 0.3 + i * .17 + k * .5) % 1, g = f < .5 ? f * 2 : 2 - f * 2; dot(lerp(x, cx, g), lerp(y, cy, g), 2.6, hues[i], .95); }
        ctx.beginPath(); ctx.arc(x, y, Math.max(9, R * 0.1), 0, 6.283); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = hues[i]; ctx.lineWidth = 2; ctx.stroke();
      });
      core(cx, cy, cr);
    } else {
      const top = [cx, cy - R * 0.85], tw = Math.min(W * 0.5, 160), th = 30;
      for (let g = 0; g < 5; g++) {
        const a = Math.PI * .12 + g / 4 * Math.PI * .76, gx = cx + Math.cos(a) * R * 1.3, gy = cy + R * 0.05 + Math.sin(a) * R * .65;
        const pr = Math.max(12, R * 0.17);
        for (let p = 0; p < 7; p++) { const pa = p / 7 * Math.PI * 2 + t * .15, px = gx + Math.cos(pa) * pr, py = gy + Math.sin(pa) * pr * 0.78; ctx.strokeStyle = rgba(C.ink, .1); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(gx, gy); ctx.stroke(); dot(px, py, 3.2, C.ok, .9); }
        dot(gx, gy, 6.5, C.ink, .95);
        ctx.strokeStyle = rgba(C.sig, .3); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(top[0], top[1]); ctx.stroke();
        const up = (t * .3 + g * .2) % 1; dot(lerp(gx, top[0], up), lerp(gy, top[1], up), 3, C.sig, 1);
        const dn = (t * .3 + g * .2 + .5) % 1; dot(lerp(top[0], gx, dn), lerp(top[1], gy, dn), 3, C.ink2, .8);
      }
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(top[0] - tw / 2, top[1] - th / 2, tw, th, th / 2); else ctx.rect(top[0] - tw / 2, top[1] - th / 2, tw, th);
      ctx.fillStyle = C.ink; ctx.fill();
      ctx.fillStyle = C.paper; ctx.font = `500 ${tw < 140 ? 9.5 : 10.5}px "Geist Mono", monospace`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("SHARED PLAYBOOK", top[0], top[1] + 1); ctx.textBaseline = "alphabetic";
    }
  }
  if (reduce) draw(3);
  loop(cv, t => draw(t));
  let auto = !reduce; const order = ["class", "friend", "brain"];
  function set(m) { mode = m; $$(".gpt").forEach(p => p.classList.toggle("on", p.dataset.g === m)); if (reduce) draw(3); }
  $$(".gpt").forEach(p => p.addEventListener("click", () => { auto = false; set(p.dataset.g); }));
  every(cv, 6000, () => { if (auto) set(order[(order.indexOf(mode) + 1) % 3]); });
})();

/* ---------- copy email ---------- */
(function copy() {
  const b = $("#copyMail"), t = $("#mail"); if (!b) return;
  b.addEventListener("click", () => {
    const done = () => { b.textContent = "Copied"; setTimeout(() => b.textContent = "Copy email", 1600); };
    const fb = () => { const r = document.createRange(); r.selectNodeContents(t); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "Selected"; };
    try { navigator.clipboard.writeText(t.textContent).then(done, fb); } catch (e) { fb(); }
  });
})();

layout();
requestAnimationFrame(layout);
})();
