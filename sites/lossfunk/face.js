/* Vyakti's face.
   The ink renderer from vyakti.ai (same model, rig and shaders), ported to three r128 and extended with
   eye gaze and saccades, natural blinks, text-driven visemes, head motion, and listening / thinking /
   speaking states. Scrolling past the hero loosens the face back into particles. */
(function () {
  "use strict";
  const stage = document.getElementById("faceStage"), cv = document.getElementById("face");
  const D = window.VYAKTI_FACE, T = window.THREE;
  const api = { ready: false, state: "idle", setState() {}, say(text, o) { o && o.onDone && setTimeout(o.onDone, 1200); } };
  window.VyaktiFace = api;
  if (!stage || !cv) return;
  const fail = () => stage.classList.add("noface");
  if (!T) return fail();

  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: false, alpha: true, powerPreference: "high-performance" }); }
  catch (e) { return fail(); }
  renderer.setClearColor(0x000000, 0);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- the model: packed data if present, else the vyakti.ai files ---------- */
  function fromPacked() {
    const raw = atob(D.data), bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    let off = 0;
    const parts = D.meshes.map(m => {
      const q = new Uint16Array(bytes.buffer, off, m.v * 3); off += m.v * 6;
      const ix = new Uint16Array(bytes.buffer, off, m.i); off += m.i * 2;
      const pos = new Float32Array(m.v * 3);
      for (let i = 0; i < pos.length; i++) { const k = i % 3; pos[i] = m.min[k] + (q[i] / 65535) * (m.max[k] - m.min[k]); }
      const g = new T.BufferGeometry();
      g.setAttribute("position", new T.BufferAttribute(pos, 3));
      g.setIndex(new T.BufferAttribute(new Uint16Array(ix), 1));
      return { kind: m.name, g };
    });
    return { parts, rig: new Uint8Array(bytes.buffer.slice(off, off + D.meshes[0].v * 4)) };
  }
  async function fromRemote() {
    const base = "https://www.vyakti.ai/models/ink-lab/";
    /* a dropped connection should not cost the hero its face: retry twice before giving up */
    const get = async (path, tries = 3) => {
      for (let k = 1; ; k++) {
        try { const r = await fetch(base + path); if (!r.ok) throw new Error(path + " " + r.status); return await r.arrayBuffer(); }
        catch (e) { if (k >= tries) throw e; await new Promise(res => setTimeout(res, 700 * k)); }
      }
    };
    const [glb, rigBuf] = await Promise.all([get("androgynous-soft.glb?v=mouth2"), get("noor-rig.bin")]);
    const dv = new DataView(glb), jl = dv.getUint32(12, true);
    const json = JSON.parse(new TextDecoder().decode(new Uint8Array(glb, 20, jl)));
    const bin = 20 + jl + 8, N = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
    const acc = i => {
      const a = json.accessors[i], bv = json.bufferViews[a.bufferView], off = bin + (bv.byteOffset || 0) + (a.byteOffset || 0);
      const Ctor = a.componentType === 5126 ? Float32Array : a.componentType === 5125 ? Uint32Array : Uint16Array;
      return new Ctor(glb.slice(off, off + a.count * N[a.type] * Ctor.BYTES_PER_ELEMENT));
    };
    const parts = json.meshes.map(m => {
      const p = m.primitives[0], g = new T.BufferGeometry();
      g.setAttribute("position", new T.BufferAttribute(acc(p.attributes.POSITION), 3));
      g.setIndex(new T.BufferAttribute(Uint16Array.from(acc(p.indices)), 1));
      return { kind: m.name.toLowerCase(), g };
    });
    return { parts, rig: new Uint8Array(rigBuf) };
  }
  (D ? Promise.resolve(fromPacked()) : fromRemote()).then(({ parts, rig }) => build(parts, rig)).catch(fail);

  function build(parts, rig) {
  const skinGeo = parts[0].g;
  skinGeo.computeBoundingBox();
  const size = new T.Vector3(), ctr = new T.Vector3();
  skinGeo.boundingBox.getSize(size); skinGeo.boundingBox.getCenter(ctr);
  const sc = 2 / Math.max(size.x, size.y, size.z);
  parts.forEach(p => { p.g.translate(-ctr.x, -ctr.y, -ctr.z); p.g.scale(sc, sc, sc); p.g.computeVertexNormals(); p.g.computeBoundingSphere(); });
  skinGeo.setAttribute("aRig", new T.BufferAttribute(rig, 4, true));

  /* ---------- shaders (from vyakti.ai) ---------- */
  const ROT = `vec3 rotateX(vec3 p, vec3 pivot, float a){float s=sin(a),c=cos(a);vec3 r=p-pivot;r.yz=mat2(c,-s,s,c)*r.yz;return r+pivot;}`;
  const skinVS = `
    uniform float uCohesion; uniform vec3 uViseme; uniform float uBlink; uniform vec2 uPointer;
    attribute vec4 aRig;
    varying vec3 vNormal; varying vec3 vViewPosition; varying vec3 vBase;
    ${ROT}
    void main(){
      vec3 base=position; vec3 pos=base; vec3 n=normalize(normal);
      float upperLip=aRig.r, lowerLip=aRig.g, jawWeight=aRig.b, eyelid=aRig.a;
      vec3 v=max(uViseme,vec3(0.)); v/=max(1.,v.x+v.y+v.z);
      float A=v.x,O=v.y,M=v.z;
      float theta=.105*A+.045*O;
      pos=mix(pos,rotateX(pos,vec3(0.,.055,.08),-theta),jawWeight);
      n=mix(n,rotateX(n,vec3(0.),-theta),jawWeight);
      float lipWeight=max(upperLip,lowerLip);
      vec3 mc=vec3(.000668,-.010513,.598307);
      float corner=smoothstep(.065,.145,abs(base.x-mc.x))*lipWeight;
      float xScale=1.+.055*A-.28*O-.035*M;
      pos.x+=lipWeight*(mc.x+(pos.x-mc.x)*xScale-pos.x);
      pos.y+=upperLip*(.006*A+.007*O-.008*M);
      pos.y+=lowerLip*(-.004*A-.010*O+.008*M);
      pos.z+=lipWeight*(.002*A+(.014+.006*corner)*O+.007*M);
      pos.y=mix(pos.y,.38+(pos.y-.38)*.14,eyelid*uBlink);
      float unresolved=1.-smoothstep(.12,.74,uCohesion);
      float field=sin(base.x*19.+base.y*27.+base.z*13.)*.62+sin(base.y*11.-base.z*21.)*.38;
      pos+=n*field*unresolved*.021;
      pos.x+=uPointer.x*.012; pos.y+=uPointer.y*.008;
      vec4 mv=viewMatrix*modelMatrix*vec4(pos,1.);
      vNormal=normalize(normalMatrix*n); vViewPosition=mv.xyz; vBase=base;
      gl_Position=projectionMatrix*mv;
    }`;
  /* Skin: the vyakti.ai ink shader, extended. uEngrave=0 is the original stochastic ink; uEngrave=1 adds a
     fill light and engraved line-shading so midtones read as drawn lines instead of solid black, and fades
     the shoulders into the page. */
  const skinFS = `
    precision highp float;
    uniform float uCohesion; uniform float uMeshOpacity; uniform vec3 uPaper; uniform vec3 uInk; uniform float uEngrave; uniform float uLineFreq;
    uniform vec3 uSignal; uniform float uScanY; uniform float uScanAmt;
    varying vec3 vNormal; varying vec3 vViewPosition; varying vec3 vBase;
    float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
    float hatch(float coord, float darkness){
      float s=abs(fract(coord)-.5)*2.;
      float aa=max(fwidth(coord)*1.6,.02);
      return 1.-smoothstep(darkness-aa,darkness+aa,s);
    }
    void main(){
      vec3 n=normalize(vNormal); vec3 vd=normalize(-vViewPosition);
      vec3 key=normalize(vec3(-.46,.58,.76));
      float diffuse=max(dot(n,key),0.); float facing=max(dot(n,vd),0.);
      float rim=pow(1.-facing,1.72);
      float form=smoothstep(.24,.86,uCohesion);
      vec2 cell=floor((vBase.xy+vBase.z*vec2(.24,-.15))*mix(36.,84.,form));
      float grain=hash21(cell);
      float tone=diffuse*.92-rim*.27+.012;
      float th=mix(.57,.43,form)+(grain-.5)*mix(.26,.085,form);
      float inkField=1.-smoothstep(th-.09,th+.09,tone);
      float contour=smoothstep(.15,.72,rim)*.48;
      float inkA=clamp(inkField+contour,0.,1.);

      // engraved variant
      vec3 fillDir=normalize(vec3(.75,.05,.62));
      float fillL=max(dot(n,fillDir),0.);
      float tone2=diffuse*.95+fillL*.24-rim*.2+.03;
      float dark=1.-smoothstep(.06,.92,tone2);
      float c1=(vBase.y+.16*vBase.x*vBase.x+.05*vBase.z)*uLineFreq;
      float lines=hatch(c1,dark*.9)*smoothstep(.1,.26,dark);
      float c2=(vBase.x*.86-vBase.y*.5+.04*vBase.z)*uLineFreq*.92;
      float cross=hatch(c2,smoothstep(.5,1.,dark)*.8)*smoothstep(.52,.66,dark);
      float inkB=clamp(max(lines,cross)+smoothstep(.3,.8,rim)*.5,0.,1.);
      inkB=mix(inkB, max(inkB,inkField*.95), smoothstep(.82,.98,dark));
      float ink=mix(inkA,inkB,uEngrave*form);
      vec3 color=mix(uPaper,uInk,ink);
      float band=exp(-pow((vBase.y-uScanY)*30.,2.))*uScanAmt;
      color=mix(color,uSignal,band*ink*.95);

      float island=clamp(.5+sin(vBase.x*17.+vBase.y*11.+vBase.z*7.)*.2+sin(vBase.y*25.-vBase.z*13.)*.15
        +sin((vBase.x-vBase.z)*37.+vBase.y*5.)*.08+(grain-.5)*.09,0.,1.);
      float surface=smoothstep(.12,.76,uCohesion);
      float gate=smoothstep(.2,.3,uCohesion);
      float reveal=gate*smoothstep(island-.16,island+.11,surface);
      if(reveal<.012) discard;
      float base=mix(1.,smoothstep(-.98,-.52,vBase.y),uEngrave);
      gl_FragColor=vec4(color,uMeshOpacity*reveal*base);
    }`;
  /* Features: the original eye/mouth shader, plus gaze for irises and pupils. */
  const featVS = `
    uniform vec3 uViseme; uniform float uBlink; uniform float uIsEye; uniform float uIsMouth;
    uniform float uIsIris; uniform vec2 uGaze;
    varying vec3 vFeatureBase;
    ${ROT}
    void main(){
      vec3 pos=position; vFeatureBase=pos;
      if(uIsIris>.5){ pos.x+=uGaze.x*.026; pos.y+=uGaze.y*.012; }
      if(uIsEye>.5){ pos.y=mix(pos.y,.38+(pos.y-.38)*.12,uBlink); }
      if(uIsMouth>.5){
        vec3 v=max(uViseme,vec3(0.)); v/=max(1.,v.x+v.y+v.z);
        float A=v.x,O=v.y,M=v.z;
        float jw=1.-smoothstep(-.012,.012,pos.y);
        float theta=.105*A+.045*O;
        pos=mix(pos,rotateX(pos,vec3(0.,.055,.08),-theta),jw);
        vec3 mc=vec3(.000668,-.010513,.598307);
        float front=smoothstep(.48,.59,pos.z);
        float xScale=1.+.055*A-.28*O-.035*M;
        pos.x+=front*(mc.x+(pos.x-mc.x)*xScale-pos.x);
        pos.z+=front*(.002*A+.014*O+.007*M);
      }
      gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.);
    }`;
  const featFS = `
    precision highp float;
    uniform vec3 uColor; uniform float uOpacity; uniform float uIsTeeth; uniform float uIsSocket; uniform vec3 uViseme;
    varying vec3 vFeatureBase;
    void main(){
      float alpha=uOpacity;
      if(uIsSocket>.5){
        float A=uViseme.x,O=uViseme.y;
        float open=clamp(A+O*.82,0.,1.);
        float hw=max(.07,.112+A*.045-O*.025);
        float hh=.006+A*.052+O*.038;
        vec2 ap=vec2((vFeatureBase.x-.000668)/hw,(vFeatureBase.y+.010513)/hh);
        alpha*=(1.-smoothstep(.86,1.03,length(ap)))*smoothstep(.08,.26,open);
      }
      if(uIsTeeth>.5){
        float open=clamp(uViseme.x+uViseme.y*.82,0.,1.);
        alpha*=smoothstep(.002,.024,vFeatureBase.y)*smoothstep(.52,.59,vFeatureBase.z)*smoothstep(.3,.64,open)*.72;
      }
      if(alpha<.012) discard;
      gl_FragColor=vec4(uColor,alpha);
    }`;
  const ptVS = `
    uniform float uCohesion; uniform float uPixelRatio;
    attribute float aRandom; attribute float aArrival; attribute float aSize; attribute vec3 aOrigin; attribute vec3 aControl;
    varying float vAlpha; varying float vRandom;
    void main(){
      float arrival=smoothstep(aArrival,min(aArrival+.22,1.),uCohesion);
      vec3 a=mix(aOrigin,aControl,arrival); vec3 b=mix(aControl,position,arrival);
      vec4 mv=modelViewMatrix*vec4(mix(a,b,arrival),1.);
      gl_PointSize=(1.35+aSize*1.85)*uPixelRatio*(3.8/max(-mv.z,.001));
      gl_Position=projectionMatrix*mv;
      vAlpha=(1.-smoothstep(.72,1.,arrival))*mix(.46,.9,aRandom);
      vRandom=aRandom;
    }`;
  const ptFS = `
    precision highp float;
    uniform vec3 uInk; uniform vec3 uSignal;
    varying float vAlpha; varying float vRandom;
    void main(){
      vec2 p=gl_PointCoord-.5; float d=length(p); if(d>.5) discard;
      float a=smoothstep(.5,.12,d)*vAlpha;
      float sig=smoothstep(.91,.985,vRandom);
      gl_FragColor=vec4(mix(uInk,uSignal,sig*.92),a*mix(.55,1.,vRandom));
    }`;

  /* ---------- particles sampled on the skin (same recipe as vyakti.ai) ---------- */
  function particles(geo, count) {
    let seed = 0x7679616b;
    const r = () => { let e = (seed = (seed + 0x6d2b79f5) >>> 0); e = Math.imul(e ^ (e >>> 15), 1 | e); e ^= e + Math.imul(e ^ (e >>> 7), 61 | e); return ((e ^ (e >>> 14)) >>> 0) / 4294967296; };
    const P = geo.getAttribute("position"), I = geo.getIndex(), tri = I.count / 3;
    const cum = new Float32Array(tri), a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3(), u = new T.Vector3(), w = new T.Vector3();
    let total = 0;
    for (let t = 0; t < tri; t++) {
      a.fromBufferAttribute(P, I.getX(3 * t)); b.fromBufferAttribute(P, I.getX(3 * t + 1)); c.fromBufferAttribute(P, I.getX(3 * t + 2));
      u.subVectors(b, a); w.subVectors(c, a); total += 0.5 * u.cross(w).length(); cum[t] = total;
    }
    const pos = new Float32Array(3 * count), org = new Float32Array(3 * count), ctl = new Float32Array(3 * count);
    const arr = new Float32Array(count), sz = new Float32Array(count), rnd = new Float32Array(count);
    const h = new T.Vector3(), g = new T.Vector3(), dir = new T.Vector3(), side = new T.Vector3(), cp = new T.Vector3(), up = new T.Vector3(0, 1, 0);
    const lin = (x, e0, e1) => Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    for (let i = 0; i < count; i++) {
      const target = r() * total; let lo = 0, hi = cum.length - 1;
      while (lo < hi) { const m = (lo + hi) >>> 1; if (target <= cum[m]) hi = m; else lo = m + 1; }
      const i0 = I.getX(3 * lo), i1 = I.getX(3 * lo + 1), i2 = I.getX(3 * lo + 2);
      const s = Math.sqrt(r()), k0 = 1 - s, k1 = s * (1 - r()), k2 = 1 - k0 - k1;
      h.set(P.getX(i0) * k0 + P.getX(i1) * k1 + P.getX(i2) * k2, P.getY(i0) * k0 + P.getY(i1) * k1 + P.getY(i2) * k2, P.getZ(i0) * k0 + P.getZ(i1) * k1 + P.getZ(i2) * k2);
      const ang = r() * Math.PI * 2, rad = 0.58 + 0.72 * r();
      dir.set(Math.cos(ang) * rad, (r() - 0.5) * 0.88, 0.34 + Math.sin(ang) * rad).normalize();
      g.copy(h).addScaledVector(dir, 0.56 + 1.18 * r()); g.y += (r() - 0.5) * 0.24;
      side.crossVectors(dir, up); if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
      side.normalize().multiplyScalar((r() - 0.5) * 0.72);
      cp.copy(g).lerp(h, 0.47).add(side);
      const eyes = Math.exp(-(((Math.abs(h.x) - 0.25) / 0.18) ** 2) - (((h.y - 0.36) / 0.14) ** 2) - (((h.z - 0.54) / 0.17) ** 2));
      const mouth = Math.exp(-((h.x / 0.24) ** 2) - (((h.y + 0.01) / 0.13) ** 2) - (((h.z - 0.59) / 0.13) ** 2));
      const edge = Math.max(lin(Math.abs(h.x), 0.56, 0.94), lin(h.y, 0.66, 0.93), lin(-h.y, 0.62, 0.94));
      arr[i] = Math.min(0.7, Math.max(0.02, 0.08 + 0.39 * r() + 0.24 * Math.max(eyes, mouth) - 0.08 * edge));
      pos.set([h.x, h.y, h.z], 3 * i); org.set([g.x, g.y, g.z], 3 * i); ctl.set([cp.x, cp.y, cp.z], 3 * i);
      sz[i] = r(); rnd[i] = r();
    }
    const pg = new T.BufferGeometry();
    pg.setAttribute("position", new T.BufferAttribute(pos, 3));
    pg.setAttribute("aOrigin", new T.BufferAttribute(org, 3));
    pg.setAttribute("aControl", new T.BufferAttribute(ctl, 3));
    pg.setAttribute("aArrival", new T.BufferAttribute(arr, 1));
    pg.setAttribute("aSize", new T.BufferAttribute(sz, 1));
    pg.setAttribute("aRandom", new T.BufferAttribute(rnd, 1));
    pg.computeBoundingSphere();
    return pg;
  }

  /* ---------- scene ---------- */
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(37, 1, 0.1, 20); camera.position.set(0, 0, 4.12);
  const head = new T.Group(); scene.add(head);
  const paper = (getComputedStyle(stage).getPropertyValue("--face-paper") || "#f7f7f4").trim() || "#f7f7f4";
  const small = () => stage.clientWidth < 520 || innerWidth <= 980;
  const skinU = {
    uCohesion: { value: 0 }, uViseme: { value: new T.Vector3() }, uBlink: { value: 0 }, uPointer: { value: new T.Vector2() },
    uMeshOpacity: { value: 1 }, uPaper: { value: new T.Color(paper) }, uInk: { value: new T.Color("#0d0f0e") },
    uEngrave: { value: window.FACE_STYLE === 0 ? 0 : 1 }, uLineFreq: { value: 52 },
    uSignal: { value: new T.Color("#d33f2c") }, uScanY: { value: 2 }, uScanAmt: { value: 0 },
  };
  const skin = new T.Mesh(skinGeo, new T.ShaderMaterial({ uniforms: skinU, vertexShader: skinVS, fragmentShader: skinFS, transparent: true, extensions: { derivatives: true } }));
  skin.frustumCulled = false; head.add(skin);

  const feats = new T.Group(); head.add(feats);
  const featMats = [];
  const isEye = k => /eye|sclera|iris|pupil/.test(k), isMouth = k => /mouth|teeth/.test(k);
  parts.slice(1).forEach(p => {
    const k = p.kind;
    const col = k.includes("sclera") ? "#eff0ed" : k.includes("iris") ? "#363732" : k.includes("teeth") ? "#d4d5d1" : k.includes("pupil") ? "#090a09" : "#111210";
    const m = new T.ShaderMaterial({
      uniforms: {
        uColor: { value: new T.Color(col) }, uOpacity: { value: 0 }, uViseme: { value: new T.Vector3() }, uBlink: { value: 0 },
        uIsEye: { value: +isEye(k) }, uIsMouth: { value: +isMouth(k) }, uIsTeeth: { value: +k.includes("teeth") },
        uIsSocket: { value: +k.includes("mouth") }, uIsIris: { value: +(k.includes("iris") || k.includes("pupil")) }, uGaze: { value: new T.Vector2() },
      },
      vertexShader: featVS, fragmentShader: featFS, transparent: true, side: isMouth(k) ? T.DoubleSide : T.FrontSide,
    });
    featMats.push(m); feats.add(new T.Mesh(p.g, m));
  });

  const ptU = { uCohesion: { value: 0 }, uPixelRatio: { value: 1 }, uInk: { value: new T.Color("#151715") }, uSignal: { value: new T.Color("#d33f2c") } };
  const pts = new T.Points(particles(skinGeo, small() ? 4800 : 14000), new T.ShaderMaterial({ uniforms: ptU, vertexShader: ptVS, fragmentShader: ptFS, transparent: true, depthWrite: false }));
  pts.frustumCulled = false; pts.renderOrder = 4; head.add(pts);

  function resize() {
    // size to the canvas itself: on desktop it sits below the nav, on phones above the dialog card
    const w = Math.max(1, cv.clientWidth || stage.clientWidth), h = Math.max(1, cv.clientHeight || stage.clientHeight);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    ptU.uPixelRatio.value = Math.min(dpr, small() ? 1 : 1.5);
    head.scale.setScalar(1.14);
    skinU.uLineFreq.value = Math.min(72, Math.max(34, h / 2.757 / 3.5));
  }
  new ResizeObserver(resize).observe(stage); resize();

  /* ---------- behaviour ---------- */
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const sstep = (x, a, b) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * t * (t * (6 * t - 15) + 10); };
  const damp = (cur, tgt, k, dt) => cur + (tgt - cur) * (1 - Math.exp(-k * dt));

  // speech: characters -> viseme targets (A open, O round, M closed)
  function visemeFor(ch) {
    if ("aá".includes(ch)) return [0.9, 0.05, 0];
    if (ch === "e") return [0.6, 0, 0];
    if (ch === "i" || ch === "y") return [0.42, 0, 0];
    if (ch === "o") return [0.18, 0.85, 0];
    if (ch === "u" || ch === "w") return [0.05, 0.72, 0];
    if ("mbp".includes(ch)) return [0, 0, 1];
    if ("fv".includes(ch)) return [0.1, 0, 0.5];
    if (/[0-9]/.test(ch)) return [0.55, 0.25, 0];
    if (/[a-z]/.test(ch)) return [0.2, 0, 0];
    if (ch === " ") return [0.06, 0, 0];
    return null; // punctuation: rest
  }
  let speech = null; // {chars, times, total, t0, onChar, onDone, last}
  function plan(text) {
    const chars = [...text], times = []; let t = 0;
    chars.forEach(ch => {
      times.push(t);
      const c = ch.toLowerCase();
      t += ",;:".includes(c) ? 0.2 : ".?!…".includes(c) ? 0.34 : "—–".includes(c) ? 0.16 : "aeiouo".includes(c) ? 0.082 : c === " " ? 0.05 : 0.062;
    });
    return { chars, times, total: t };
  }
  const st = {
    state: "idle", t: 0, intro: 0, coh: 0, out: 0,
    vis: new T.Vector3(), visT: new T.Vector3(),
    gaze: new T.Vector2(), gazeT: new T.Vector2(), sacc: new T.Vector2(), nextSacc: 0.6,
    blink: 0, nextBlink: 1.6, blinkT: -1, double: false, squint: 0,
    tilt: 0, nod: 0, px: 0, py: 0, ppx: 0, ppy: 0,
  };
  api.setState = s => { st.state = s; };
  api.say = (text, o = {}) => {
    const p = plan(text);
    speech = { ...p, t0: st.t, onChar: o.onChar, onDone: o.onDone, last: -1 };
    st.state = "speak";
    return p.total;
  };
  addEventListener("pointermove", e => { st.px = clamp((e.clientX / innerWidth) * 2 - 1, -1, 1); st.py = clamp(-((e.clientY / innerHeight) * 2 - 1), -1, 1); }, { passive: true });

  let visible = true, running = false, last = 0, startAt = 0;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }, { rootMargin: "120px" }).observe(stage);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) kick(); });
  addEventListener("deckchange", kick);
  const deck = () => window.VyaktiDeck;
  const covered = () => !!(deck() && deck().covered && deck().covered(stage));
  function kick() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }

  function frame(now) {
    if (!visible || document.hidden || covered()) { running = false; return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!startAt) startAt = now;
    st.t += dt;
    const t = st.t;

    // assembly on load, loosening as the hero scrolls away
    st.intro = reduce ? 1 : clamp((now - startAt - 250) / 2900, 0, 1);
    if (deck() && deck().cover) st.out = deck().cover(stage);
    else { const r = stage.getBoundingClientRect(); st.out = clamp(-r.top / Math.max(1, r.height * 0.95), 0, 1); }
    const target = sstep(st.intro, 0, 1) * (1 - 0.72 * sstep(st.out, 0.05, 0.9));
    st.coh = damp(st.coh, target, 7, dt);
    const coh = st.coh;

    // speech
    st.visT.set(0, 0, 0);
    if (speech) {
      const e = t - speech.t0;
      let i = speech.last;
      while (i + 1 < speech.chars.length && speech.times[i + 1] <= e) i++;
      if (i !== speech.last) { speech.last = i; speech.onChar && speech.onChar(i + 1); }
      if (e > speech.total + 0.05) {
        const done = speech.onDone; speech = null; if (st.state === "speak") st.state = "idle"; done && done();
      } else if (i >= 0) {
        const v = visemeFor(speech.chars[i].toLowerCase());
        if (v) { const j = 0.88 + 0.24 * Math.sin(i * 12.9898); st.visT.set(v[0] * j, v[1] * j, v[2]); }
      }
    }
    const k = st.visT.lengthSq() > st.vis.lengthSq() ? 26 : 16;
    st.vis.set(damp(st.vis.x, st.visT.x, k, dt), damp(st.vis.y, st.visT.y, k, dt), damp(st.vis.z, st.visT.z, k + 6, dt));

    // gaze, saccades and squint by state
    const s = st.state;
    const pw = s === "idle" || s === "speak" ? 1 : 0.35;
    if (s === "listen") st.gazeT.set(-0.55, -0.35);
    else if (s === "think") st.gazeT.set(0.6, 0.75);
    else st.gazeT.set(st.px * 0.7, st.py * 0.55);
    if (t > st.nextSacc) {
      st.sacc.set((Math.random() - 0.5) * (s === "think" ? 0.5 : 0.22), (Math.random() - 0.5) * (s === "think" ? 0.3 : 0.14));
      st.nextSacc = t + (s === "think" ? 0.35 + Math.random() * 0.5 : 0.7 + Math.random() * 1.6);
    }
    st.gaze.x = damp(st.gaze.x, clamp(st.gazeT.x + st.sacc.x, -1, 1), 22, dt);
    st.gaze.y = damp(st.gaze.y, clamp(st.gazeT.y + st.sacc.y, -1, 1), 22, dt);
    st.squint = damp(st.squint, s === "think" ? 0.2 : s === "listen" ? 0.06 : 0, 4, dt);

    // blinks: random, sometimes double; fast close, slower open
    if (t > st.nextBlink && st.blinkT < 0) { st.blinkT = t; }
    let bl = 0;
    if (st.blinkT >= 0) {
      const e = t - st.blinkT;
      bl = e < 0.075 ? e / 0.075 : e < 0.11 ? 1 : e < 0.26 ? 1 - (e - 0.11) / 0.15 : 0;
      if (e >= 0.26) {
        st.blinkT = -1;
        if (!st.double && Math.random() < 0.18) { st.double = true; st.nextBlink = t + 0.12; }
        else { st.double = false; st.nextBlink = t + 2.2 + Math.random() * 3.8; }
      }
    }
    if (coh < 0.5) bl = 0;
    const blink = Math.max(bl, st.squint);

    // head: turn-in on load, idle sway, listening tilt, nods on open vowels, pointer
    st.ppx = damp(st.ppx, st.px * pw, 3, dt); st.ppy = damp(st.ppy, st.py * pw, 3, dt);
    st.tilt = damp(st.tilt, s === "listen" ? 0.055 : s === "think" ? -0.03 : 0, 2.2, dt);
    st.nod = damp(st.nod, st.vis.x * 0.035 + (s === "listen" ? 0.012 * Math.max(0, Math.sin(t * 2.4)) : 0), 6, dt);
    const sway = reduce ? 0 : 1;
    head.rotation.y = T.MathUtils.lerp(-0.42, -0.025, sstep(st.intro, 0, 0.9)) + st.ppx * 0.07 + sway * (0.03 * Math.sin(t * 0.43) + 0.012 * Math.sin(t * 1.13));
    head.rotation.x = -(st.ppy * 0.045) + st.nod + sway * (0.014 * Math.sin(t * 0.61) + 0.006 * Math.sin(t * 1.7));
    head.rotation.z = st.tilt + sway * 0.01 * Math.sin(t * 0.37);
    head.position.y = 0.11 + sway * 0.006 * Math.sin(t * 1.05);

    // thinking: a red scan band sweeps down the face
    st.scanAmt = damp(st.scanAmt || 0, s === "think" ? 0.9 : 0, 3, dt);
    if (st.scanAmt > 0.01) { st.scanT = (st.scanT || 0) + dt; skinU.uScanY.value = 1.15 - ((st.scanT % 1.7) / 1.7) * 2.3; }
    else st.scanT = 0;
    skinU.uScanAmt.value = st.scanAmt;
    skinU.uCohesion.value = coh; ptU.uCohesion.value = coh;
    skinU.uViseme.value.copy(st.vis); skinU.uBlink.value = blink;
    skinU.uPointer.value.set(st.ppx, st.ppy);
    feats.visible = coh > 0.25;
    const fo = sstep(coh, 0.32, 0.76);
    featMats.forEach(m => { m.uniforms.uOpacity.value = fo; m.uniforms.uViseme.value.copy(st.vis); m.uniforms.uBlink.value = blink; m.uniforms.uGaze.value.copy(st.gaze); });
    pts.visible = coh < 0.995;

    renderer.render(scene, camera);
    if (!api.ready) { api.ready = true; stage.classList.add("ready"); }
    requestAnimationFrame(frame);
  }
  cv.addEventListener("webglcontextlost", e => { e.preventDefault(); fail(); });
  kick();
  }
})();
