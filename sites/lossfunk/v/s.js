/* lossfunk.vyakti.ai visit recorder.
   Structured events (what was read, for how long, what was touched) plus an rrweb session replay,
   sent in small batches to /api/e on this origin. Every handler is wrapped so a fault here can never
   break the page. Served under neutral names (/v/s.js, /api/e) so content blockers leave it alone. */
(() => {
  "use strict";
  if (window.__vyRec) return; window.__vyRec = true;
  const EP = "/api/e", T0 = Date.now(), perfNow = () => performance.now();
  const safe = fn => function () { try { return fn.apply(this, arguments); } catch (e) { /* never break the page */ } };
  const store = (s, k, v) => { try { if (v === undefined) return window[s].getItem(k); window[s].setItem(k, v); } catch (e) { return null; } };
  const rid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)).replace(/-/g, "").slice(0, 24);
  const txt = (s, n = 120) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);

  /* ---------- identity: a visitor id per browser, a session per tab (kept across reloads) ---------- */
  const vid = store("localStorage", "vy_v") || rid(); store("localStorage", "vy_v", vid);
  let sid = store("sessionStorage", "vy_s");
  const lastAct = +store("sessionStorage", "vy_t") || 0;
  if (!sid || Date.now() - lastAct > 30 * 60e3) { sid = rid(); store("sessionStorage", "vy_s", sid); store("sessionStorage", "vy_q", "0"); store("sessionStorage", "vy_rq", "0"); }
  const qs = new URLSearchParams(location.search);
  const tag = {};
  ["r", "ref", "via", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(k => { if (qs.get(k)) tag[k] = txt(qs.get(k), 80); });
  const firstTouch = store("localStorage", "vy_ft");
  if (!firstTouch && Object.keys(tag).length) store("localStorage", "vy_ft", JSON.stringify({ ...tag, at: new Date().toISOString() }));
  const ref = tag.r || tag.ref || tag.via || tag.utm_source || (firstTouch ? (JSON.parse(firstTouch).r || JSON.parse(firstTouch).ref || JSON.parse(firstTouch).via || JSON.parse(firstTouch).utm_source) : "") || "";
  const internal = store("localStorage", "vy_me") === "1";

  /* ---------- queue ---------- */
  let seq = +store("sessionStorage", "vy_q") || 0, rseq = +store("sessionStorage", "vy_rq") || 0;
  const evq = [], rrq = []; let rrBytes = 0, sentCtx = false, slideNow = null;
  function ev(type, d) {
    evq.push({ t: Date.now(), q: ++seq, type, slide: slideNow ? slideNow.id : null, d: d || null });
    store("sessionStorage", "vy_q", String(seq)); store("sessionStorage", "vy_t", String(Date.now()));
    if (evq.length > 200) flush();
  }
  async function gz(str) {
    if (!("CompressionStream" in window)) return null;
    const cs = new Blob([str]).stream().pipeThrough(new CompressionStream("gzip"));
    return new Uint8Array(await new Response(cs).arrayBuffer());
  }
  function payload(rr) {
    const p = { v: vid, s: sid, ref, internal, url: location.href, ev: evq.splice(0), t: Date.now() };
    if (!sentCtx) { p.ctx = ctx; sentCtx = true; }
    if (rr && rr.length) { p.rr = rr; p.rs = ++rseq; store("sessionStorage", "vy_rq", String(rseq)); }
    p.act = Math.round(activeMs()); p.maxSlide = maxSlide; p.maxScroll = maxScroll;
    return p;
  }
  let flushing = false;
  const flush = safe(async function () {
    if (flushing || (!evq.length && !rrq.length)) return;
    flushing = true;
    try {
      const rr = rrq.splice(0); rrBytes = 0;
      const body = JSON.stringify(payload(rr));
      const z = await gz(body).catch(() => null);
      await fetch(EP + (z ? "?z=1" : ""), { method: "POST", body: z || body, headers: { "content-type": "application/octet-stream" }, keepalive: (z || body).length < 60000, credentials: "omit" });
    } catch (e) { /* the next flush carries on */ } finally { flushing = false; }
  });
  /* leaving: no time to compress, so beacons, each under the 64 KB beacon limit */
  const flushNow = safe(function () {
    const rr = rrq.splice(0); rrBytes = 0;
    const parts = []; let cur = [], n = 0;
    rr.forEach(e => { const l = JSON.stringify(e).length; if (n + l > 48000 && cur.length) { parts.push(cur); cur = []; n = 0; } cur.push(e); n += l; });
    if (cur.length) parts.push(cur);
    if (!parts.length) parts.push([]);
    parts.forEach(rrPart => {
      const body = JSON.stringify(payload(rrPart));
      const ok = navigator.sendBeacon && navigator.sendBeacon(EP, new Blob([body], { type: "text/plain" }));
      if (!ok) fetch(EP, { method: "POST", body, keepalive: true, credentials: "omit" }).catch(() => {});
    });
  });
  setInterval(flush, 3000);

  /* ---------- context ---------- */
  const mm = q => { try { return matchMedia(q).matches; } catch (e) { return null; } };
  const nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  const ctx = {
    ua: navigator.userAgent, langs: navigator.languages, lang: navigator.language, platform: navigator.platform,
    tz: (Intl.DateTimeFormat().resolvedOptions() || {}).timeZone, tzOff: new Date().getTimezoneOffset(),
    screen: [screen.width, screen.height, screen.availWidth, screen.availHeight, screen.colorDepth], dpr: devicePixelRatio,
    viewport: [innerWidth, innerHeight], touch: navigator.maxTouchPoints, cores: navigator.hardwareConcurrency, mem: navigator.deviceMemory,
    net: navigator.connection ? { type: navigator.connection.effectiveType, down: navigator.connection.downlink, rtt: navigator.connection.rtt, save: navigator.connection.saveData } : null,
    dnt: navigator.doNotTrack, webdriver: navigator.webdriver, cookies: navigator.cookieEnabled,
    reduceMotion: mm("(prefers-reduced-motion: reduce)"), dark: mm("(prefers-color-scheme: dark)"),
    deck: mm("(min-width: 1000px) and (min-height: 540px) and (min-aspect-ratio: 5/4)"),
    referrer: document.referrer, title: document.title, navType: nav ? nav.type : null, tag, firstTouch: firstTouch ? JSON.parse(firstTouch) : null,
    returning: !!store("localStorage", "vy_seen"), visits: (+store("localStorage", "vy_n") || 0) + 1,
  };
  store("localStorage", "vy_seen", "1"); store("localStorage", "vy_n", String(ctx.visits));
  safe(() => { const c = document.createElement("canvas").getContext("webgl"); const x = c && c.getExtension("WEBGL_debug_renderer_info"); if (x) ctx.gpu = c.getParameter(x.UNMASKED_RENDERER_WEBGL); })();
  if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) navigator.userAgentData.getHighEntropyValues(["model", "platformVersion", "fullVersionList"]).then(h => ev("ua_hints", h)).catch(() => {});

  ev("page_view", { url: location.href, path: location.pathname, hash: location.hash, navType: ctx.navType, referrer: document.referrer });

  /* ---------- time: visible, focused and not idle counts as active ---------- */
  let act = 0, actFrom = document.hidden ? null : perfNow(), idle = false, lastInput = perfNow();
  const activeMs = () => act + (actFrom !== null ? perfNow() - actFrom : 0);
  const pause = () => { if (actFrom !== null) { act += perfNow() - actFrom; actFrom = null; } };
  const resume = () => { if (actFrom === null && !document.hidden && !idle) actFrom = perfNow(); };
  const poke = safe(() => { lastInput = perfNow(); if (idle) { idle = false; ev("idle_end", { ms: Math.round(perfNow() - idleFrom) }); resume(); } store("sessionStorage", "vy_t", String(Date.now())); });
  let idleFrom = 0;
  setInterval(safe(() => { if (!idle && !document.hidden && perfNow() - lastInput > 30e3) { idle = true; idleFrom = lastInput; pause(); ev("idle_start", { afterMs: 30000 }); } }), 1000);
  ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"].forEach(t => addEventListener(t, poke, { passive: true, capture: true }));
  let hiddenAt = 0;
  document.addEventListener("visibilitychange", safe(() => {
    if (document.hidden) { pause(); hiddenAt = perfNow(); ev("hidden", { activeMs: Math.round(activeMs()) }); closeSlide("hidden"); flushNow(); }
    else { resume(); ev("visible", { awayMs: Math.round(perfNow() - hiddenAt) }); openSlide(); }
  }));
  addEventListener("blur", safe(() => ev("window_blur")));
  addEventListener("focus", safe(() => ev("window_focus")));
  setInterval(safe(() => { if (!document.hidden) ev("heartbeat", { activeMs: Math.round(activeMs()), scroll: scrollPct(), idle }); }), 15000);

  /* ---------- slides: entered, left, how long, how much of it actively ---------- */
  const slides = () => Array.from(document.querySelectorAll(".deck > .slide"));
  let maxSlide = 0, slideFrom = 0, slideAct0 = 0;
  const curIndex = () => { if (window.VyaktiDeck && VyaktiDeck.current) return VyaktiDeck.current(); const s = slides(); let c = 0; s.forEach((x, i) => { if (x.getBoundingClientRect().top <= innerHeight * 0.5) c = i; }); return c; };
  function openSlide() { const s = slides(), i = curIndex(); if (!s[i]) return; slideNow = { i, id: s[i].id, name: s[i].dataset.name || s[i].id }; slideFrom = perfNow(); slideAct0 = activeMs(); maxSlide = Math.max(maxSlide, i + 1); ev("slide_enter", { i: i + 1, name: slideNow.name }); }
  function closeSlide(why) { if (!slideNow) return; ev("slide_leave", { i: slideNow.i + 1, name: slideNow.name, ms: Math.round(perfNow() - slideFrom), activeMs: Math.round(activeMs() - slideAct0), why }); slideNow = null; }
  const checkSlide = safe(() => { if (document.hidden) return; const i = curIndex(); if (!slideNow || slideNow.i !== i) { closeSlide("moved"); openSlide(); } });
  let maxScroll = 0, lastMile = 0;
  const scrollPct = () => { const h = document.documentElement; return Math.round(100 * h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)); };
  let scrollT = 0;
  addEventListener("scroll", safe(() => {
    const p = scrollPct(); if (p > maxScroll) maxScroll = p;
    while (maxScroll >= lastMile + 10) { lastMile += 10; ev("scroll_depth", { pct: lastMile }); }
    clearTimeout(scrollT); scrollT = setTimeout(safe(() => { ev("scroll_stop", { pct: scrollPct(), y: Math.round(scrollY) }); checkSlide(); }), 400);
    checkSlide();
  }), { passive: true });
  addEventListener("load", () => setTimeout(checkSlide, 300));
  setTimeout(checkSlide, 800);

  /* ---------- every click, described by what it is, not just where ---------- */
  const describe = el => {
    if (!el || el.nodeType !== 1) return null;
    const hit = el.closest("a,button,[role=button],[role=tab],summary,input,label,[data-go],[data-m],[data-g],[data-d],.dn,.ochip,.seat,.node,.h,.fcard,.qs li,.use,.card") || el;
    const d = { tag: hit.tagName.toLowerCase(), text: txt(hit.getAttribute("aria-label") || hit.textContent, 140) };
    if (hit.id) d.id = hit.id;
    if (typeof hit.className === "string" && hit.className) d.cls = txt(hit.className, 80);
    else if (hit.className && hit.className.baseVal) d.cls = txt(hit.className.baseVal, 80);
    if (hit.href) d.href = String(hit.href).slice(0, 300);
    ["go", "m", "g", "d", "n"].forEach(k => { if (hit.dataset && hit.dataset[k] !== undefined) d["data_" + k] = hit.dataset[k]; });
    const role = hit.getAttribute("role"); if (role) d.role = role;
    const sec = hit.closest(".slide"); if (sec) d.section = sec.id;
    const box = hit.closest("[id]"); if (box && box !== hit) d.within = box.id;
    d.interactive = hit !== el || /^(a|button|summary|input|label)$/i.test(el.tagName);
    return d;
  };
  let clicks = [];
  addEventListener("click", safe(e => {
    if (!e.isTrusted) return;
    const d = describe(e.target) || {};
    d.x = Math.round(e.clientX); d.y = Math.round(e.clientY); d.vw = innerWidth; d.vh = innerHeight; d.pageY = Math.round(e.pageY);
    const now = perfNow(); clicks = clicks.filter(c => now - c.t < 800 && Math.hypot(c.x - e.clientX, c.y - e.clientY) < 40); clicks.push({ t: now, x: e.clientX, y: e.clientY });
    if (clicks.length >= 3) { d.rage = clicks.length; }
    ev(d.interactive ? "click" : "dead_click", d);
    if (d.href && new URL(d.href, location.href).origin !== location.origin) { ev("outbound", { href: d.href, text: d.text }); flushNow(); }
  }), true);
  addEventListener("contextmenu", safe(e => ev("context_menu", describe(e.target))), true);
  addEventListener("auxclick", safe(e => ev("aux_click", { button: e.button, ...(describe(e.target) || {}) })), true);
  addEventListener("keydown", safe(e => {
    const k = e.key, mod = e.ctrlKey || e.metaKey;
    const navKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End", " ", "Tab", "Enter", "Escape"];
    if (navKeys.includes(k) || (mod && /^[a-z]$/i.test(k))) ev("key", { key: k === " " ? "Space" : k, mod: mod ? (e.metaKey ? "meta" : "ctrl") : undefined, shift: e.shiftKey || undefined, target: describe(e.target) ? describe(e.target).text : undefined });
  }), true);
  ["copy", "cut"].forEach(t => document.addEventListener(t, safe(() => ev(t, { text: txt(String(getSelection()), 2000) })), true));
  let selT = 0;
  document.addEventListener("selectionchange", safe(() => { clearTimeout(selT); selT = setTimeout(safe(() => { const s = txt(String(getSelection()), 2000); if (s.length >= 3) ev("select_text", { text: s }); }), 900); }));
  document.addEventListener("toggle", safe(e => { if (e.target.tagName === "DETAILS") ev("details_toggle", { open: e.target.open, text: txt(e.target.querySelector("summary") && e.target.querySelector("summary").textContent, 60) }); }), true);
  addEventListener("beforeprint", safe(() => ev("print")));
  let rzT = 0;
  addEventListener("resize", safe(() => { clearTimeout(rzT); rzT = setTimeout(safe(() => ev("resize", { w: innerWidth, h: innerHeight, deck: mm("(min-width: 1000px) and (min-height: 540px) and (min-aspect-ratio: 5/4)"), zoom: window.visualViewport ? +visualViewport.scale.toFixed(2) : null })), 500); }));
  if (window.visualViewport) { let zT = 0; visualViewport.addEventListener("resize", safe(() => { clearTimeout(zT); zT = setTimeout(safe(() => { if (visualViewport.scale > 1.05) ev("pinch_zoom", { scale: +visualViewport.scale.toFixed(2) }); }), 600); })); }
  if (screen.orientation) screen.orientation.addEventListener("change", safe(() => ev("orientation", { type: screen.orientation.type })));
  document.addEventListener("fullscreenchange", safe(() => ev("fullscreen", { on: !!document.fullscreenElement })));
  addEventListener("hashchange", safe(() => ev("hashchange", { hash: location.hash })));

  /* hover dwell on cards and controls: on a desktop, what the pointer rests on is what is being read */
  const HOV = ".card,.h,.fcard,.node,.gpt,.qs li,.use,.dn,.ochip,.rung,.facts li,.principles li,.fam-chips button,.modes button,.track,.betrow,.drow,.tchips span,.guard span,.exists li,a,button";
  let hov = null, hovFrom = 0;
  document.addEventListener("pointerover", safe(e => {
    if (e.pointerType !== "mouse") return;
    const el = e.target.closest && e.target.closest(HOV); if (el === hov) return;
    if (hov && perfNow() - hovFrom > 700) ev("hover", { ...(describe(hov) || {}), ms: Math.round(perfNow() - hovFrom) });
    hov = el; hovFrom = perfNow();
  }), true);

  /* ---------- errors and speed ---------- */
  addEventListener("error", safe(e => { if (e.target && e.target !== window && e.target.tagName) ev("resource_error", { tag: e.target.tagName, src: String(e.target.src || e.target.href || "").slice(0, 200) }); else ev("js_error", { msg: txt(e.message, 300), src: e.filename, line: e.lineno }); }), true);
  addEventListener("unhandledrejection", safe(e => ev("js_error", { msg: txt(e.reason && (e.reason.message || e.reason), 300), kind: "promise" })));
  addEventListener("load", () => setTimeout(safe(() => {
    const n = performance.getEntriesByType("navigation")[0]; const d = {};
    if (n) { d.ttfb = Math.round(n.responseStart); d.dcl = Math.round(n.domContentLoadedEventEnd); d.load = Math.round(n.loadEventEnd || perfNow()); d.bytes = n.transferSize; }
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]; if (fcp) d.fcp = Math.round(fcp.startTime);
    ev("perf", d);
  }), 1500));
  let lcp = null;
  safe(() => new PerformanceObserver(l => { const e = l.getEntries().pop(); if (e) lcp = Math.round(e.startTime); }).observe({ type: "largest-contentful-paint", buffered: true }))();
  /* the 3D face is the heaviest thing on the page: note whether it arrived */
  let faceSeen = false;
  setInterval(safe(() => { if (!faceSeen && window.VyaktiFace && VyaktiFace.ready) { faceSeen = true; ev("face_ready", { atMs: Date.now() - T0 }); } }), 1000);

  /* ---------- leaving ---------- */
  const bye = safe(why => { closeSlide(why); ev("page_end", { why, totalMs: Date.now() - T0, activeMs: Math.round(activeMs()), maxScroll, maxSlide, lcp }); flushNow(); });
  addEventListener("pagehide", () => bye("pagehide"));

  /* ---------- session replay ---------- */
  function startReplay() {
    if (!window.rrweb || !rrweb.record) { ev("replay_unavailable"); return; }
    rrweb.record({
      emit: safe(e => { rrq.push(e); rrBytes += 200; if (e.type === 2) flush(); }),
      recordCanvas: false, collectFonts: false, inlineStylesheet: true, maskAllInputs: false,
      sampling: { mousemove: 50, mouseInteraction: true, scroll: 120, media: 800, input: "last" },
      blockSelector: window.__vyBlock || null,
      checkoutEveryNms: 4 * 60e3,
    });
  }
  const rs = document.createElement("script"); rs.src = "/v/r.js"; rs.async = true;
  rs.onload = safe(startReplay); rs.onerror = safe(() => ev("replay_unavailable", { why: "load" }));
  const go = () => document.head.appendChild(rs);
  if (document.readyState === "complete") setTimeout(go, 200); else addEventListener("load", () => setTimeout(go, 200));
})();
