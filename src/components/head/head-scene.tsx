"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { HEAD_FRAGMENT, HEAD_VERTEX, SIMPLEX_CHUNK } from "./shaders";

const MODEL = "/models/head-geo.glb";
const SAMPLE_COUNT = 52_000;
const SAMPLE_COUNT_MOBILE = 21_000;

/** Far enough back that the head sits at ~55% of frame height, with air around it. */
const CAMERA_Z = 4.4;
/**
 * Depth-shading band. Tighter than the head's true radius so the near side of
 * the face separates from the far side instead of averaging into a soft blob.
 */
const HEAD_RADIUS = 1.1;

type Progress = { current: number };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Seeded PRNG (mulberry32). The sampling pass runs during render, so it has to
 * be deterministic: the same seed gives the same cloud on the server and the
 * client, and across re-renders.
 */
function makeRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth, frame-rate independent approach toward a target. */
function damp(current: number, target: number, lambda: number, dt: number) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

function useFacePoints(count: number) {
  const { scene } = useGLTF(MODEL);

  return useMemo(() => {
    // Take the first real mesh in the file. The scan ships as a single mesh,
    // but traversing keeps this working if the asset is ever swapped.
    let source: THREE.Mesh | null = null;
    scene.traverse((child) => {
      if (!source && (child as THREE.Mesh).isMesh) source = child as THREE.Mesh;
    });
    if (!source) return null;

    const src = (source as THREE.Mesh).geometry.clone();
    src.computeVertexNormals();

    // Normalise: centre on the origin and scale so the head is ~2 units tall,
    // whatever units the source asset was authored in.
    src.computeBoundingBox();
    const box = src.boundingBox!;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const scale = 2 / Math.max(size.x, size.y, size.z);
    src.translate(-center.x, -center.y, -center.z);
    src.scale(scale, scale, scale);

    const random = makeRandom(0x5eed_1234);
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(src)).setRandomGenerator(
      random,
    ).build();

    const positions = new Float32Array(count * 3);
    const normals = new Float32Array(count * 3);
    const directions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    const p = new THREE.Vector3();
    const n = new THREE.Vector3();
    const d = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      sampler.sample(p, n);
      positions.set([p.x, p.y, p.z], i * 3);
      normals.set([n.x, n.y, n.z], i * 3);

      // Per-point escape vector for the dispersion pass.
      d.set(random() - 0.5, random() - 0.5, random() - 0.5).normalize();
      directions.set([d.x, d.y, d.z], i * 3);
      randoms[i] = random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    geometry.setAttribute("aDirection", new THREE.BufferAttribute(directions, 3));
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
    geometry.computeBoundingSphere();

    src.dispose();
    return geometry;
  }, [scene, count]);
}

function FaceCloud({ progress }: { progress: Progress }) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const { size, viewport } = useThree();

  const isCompact = size.width < 900;
  const geometry = useFacePoints(isCompact ? SAMPLE_COUNT_MOBILE : SAMPLE_COUNT);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDisperse: { value: 0.32 },
      uMouthOpen: { value: 0 },
      uSpeechEnergy: { value: 0 },
      uSize: { value: 9 },
      uPixelRatio: { value: 1 },
      uNear: { value: CAMERA_Z - HEAD_RADIUS },
      uFar: { value: CAMERA_Z + HEAD_RADIUS },
      uPointer: { value: new THREE.Vector2(0, 0) },
      // Calibrated from the normalised scan. The previous value sat on the
      // throat, which made the speech ripple read as a square goatee.
      uMouth: { value: new THREE.Vector3(0, 0.105, 0.505) },
      uColorCore: { value: new THREE.Color("#11120f") },
      uColorEdge: { value: new THREE.Color("#b8b6ae") },
      uColorHot: { value: new THREE.Color("#c83f2d") },
      uOpacity: { value: 0.88 },
    }),
    [],
  );

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      pointer.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  }, []);

  useFrame((_, rawDelta) => {
    // Read the uniforms off the live material rather than the memoised object.
    // Suspense can replay this component, and a closure captured before the
    // replay would otherwise animate an orphaned copy while the material that
    // is actually rendering keeps its initial values.
    const u = material.current?.uniforms;
    if (!u) return;

    const dt = Math.min(rawDelta, 0.05);
    const p = progress.current;

    u.uTime.value += dt;
    u.uPixelRatio.value = Math.min(viewport.dpr || 1, 1.65);
    u.uSize.value = isCompact ? 7.6 : 9.4;

    // --- Beat 1 (0 to .3): the cloud converges into a face.
    // --- Beat 2 (.3 to .5): it holds still and listens.
    // --- Beat 3 (.5 to .78): it speaks, ripples running from the mouth.
    // --- Beat 4 (.78 to 1): it turns away and comes apart again.
    const assemble = THREE.MathUtils.smoothstep(p, 0.0, 0.3);
    const dissolve = THREE.MathUtils.smoothstep(p, 0.76, 1.0);
    const targetDisperse = (1 - assemble) * 0.32 + dissolve * 1.25;

    const speakWindow =
      THREE.MathUtils.smoothstep(p, 0.48, 0.58) *
      (1 - THREE.MathUtils.smoothstep(p, 0.72, 0.82));

    // Closures between peaks matter more than extra oscillators: a mouth that
    // never closes reads as shimmer, not speech. The two cadences overlap like
    // short and long syllables while still returning to a visible rest state.
    const syllable = Math.min(
      1,
      Math.max(0, Math.sin(u.uTime.value * 8.8)) * 0.72 +
        Math.max(0, Math.sin(u.uTime.value * 13.7 + 1.4)) * 0.38,
    );

    u.uDisperse.value = damp(u.uDisperse.value, targetDisperse, 5, dt);
    u.uMouthOpen.value = damp(
      u.uMouthOpen.value,
      speakWindow * syllable,
      14,
      dt,
    );
    u.uSpeechEnergy.value = damp(
      u.uSpeechEnergy.value,
      speakWindow,
      7,
      dt,
    );
    u.uOpacity.value = damp(u.uOpacity.value, 0.88 - dissolve * 0.5, 4, dt);

    pointer.current.x = damp(pointer.current.x, pointer.current.tx, 3, dt);
    pointer.current.y = damp(pointer.current.y, pointer.current.ty, 3, dt);
    u.uPointer.value.set(pointer.current.x, pointer.current.y);

    if (points.current) {
      // Turns from three-quarter profile, through full face, and away again.
      const scrollYaw = lerp(-0.54, 0.5, p);
      points.current.rotation.y = damp(
        points.current.rotation.y,
        scrollYaw + pointer.current.x * 0.22,
        3,
        dt,
      );
      points.current.rotation.x = damp(
        points.current.rotation.x,
        -pointer.current.y * 0.13 + Math.sin(u.uTime.value * 0.3) * 0.014,
        3,
        dt,
      );
      const s = lerp(0.9, 1.02, assemble) * (isCompact ? 0.82 : 1);
      points.current.scale.setScalar(damp(points.current.scale.x, s, 4, dt));
    }
  });

  if (!geometry) return null;

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={`${SIMPLEX_CHUNK}\n${HEAD_VERTEX}`}
        fragmentShader={HEAD_FRAGMENT}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

export default function HeadScene({ progress }: { progress: Progress }) {
  return (
    <Canvas
      camera={{ position: [0, 0, CAMERA_Z], fov: 42, near: 0.1, far: 20 }}
      dpr={[1, 1.65]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <FaceCloud progress={progress} />
    </Canvas>
  );
}

useGLTF.preload(MODEL);
