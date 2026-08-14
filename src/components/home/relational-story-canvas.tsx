"use client";

/* eslint-disable react-hooks/immutability -- A stable imperative object bridges ScrollTrigger and R3F without React renders. */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { StoryRuntime } from "./story-runtime";
import {
  STORY_FACE_FRAGMENT,
  STORY_FACE_VERTEX,
  STORY_FEATURE_FRAGMENT,
  STORY_FEATURE_VERTEX,
  STORY_POINTS_FRAGMENT,
  STORY_POINTS_VERTEX,
} from "./story-shaders";

const NOOR_MODEL = "/models/ink-lab/androgynous-soft.glb?v=mouth2";

type FeatureGeometry = {
  geometry: THREE.BufferGeometry;
  kind: string;
};

type IdentityGeometry = {
  face: THREE.BufferGeometry;
  features: FeatureGeometry[];
};

const VISEME_KEYS = [
  [0, 0, 0, 0],
  [0.12, 0, 0, 0.85],
  [0.26, 0.55, 0, 0],
  [0.41, 0.05, 0.85, 0],
  [0.58, 0.88, 0, 0],
  [0.73, 0.4, 0.08, 0],
  [0.88, 0, 0, 0.65],
  [1, 0, 0, 0],
] as const;

function remap(value: number, start: number, end: number) {
  return THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
}

function phase(value: number, start: number, end: number) {
  const t = remap(value, start, end);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function pulse(value: number, center: number, width: number) {
  return Math.exp(-Math.pow((value - center) / width, 2));
}

function sampleViseme(progress: number, target: THREE.Vector3) {
  const value = THREE.MathUtils.clamp(progress, 0, 1);
  for (let index = 0; index < VISEME_KEYS.length - 1; index += 1) {
    const from = VISEME_KEYS[index];
    const to = VISEME_KEYS[index + 1];
    if (value > to[0]) continue;
    const interval = Math.max(to[0] - from[0], 0.0001);
    const raw = THREE.MathUtils.clamp((value - from[0]) / interval, 0, 1);
    const mix = raw * raw * (3 - 2 * raw);
    target.set(
      THREE.MathUtils.lerp(from[1], to[1], mix),
      THREE.MathUtils.lerp(from[2], to[2], mix),
      THREE.MathUtils.lerp(from[3], to[3], mix),
    );
    return target;
  }
  return target.set(0, 0, 0);
}

function labelFor(mesh: THREE.Mesh) {
  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  return `${mesh.name} ${material?.name ?? ""}`.trim().toLowerCase();
}

function normalise(
  geometry: THREE.BufferGeometry,
  center: THREE.Vector3,
  scale: number,
) {
  const clone = geometry.clone();
  clone.translate(-center.x, -center.y, -center.z);
  clone.scale(scale, scale, scale);
  clone.computeVertexNormals();
  clone.computeBoundingSphere();
  return clone;
}

function extractIdentity(scene: THREE.Group): IdentityGeometry | null {
  const meshes: THREE.Mesh[] = [];
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
  });
  const skin = meshes.find((mesh) => labelFor(mesh).includes("skin"));
  if (!skin) return null;
  skin.geometry.computeBoundingBox();
  const bounds = skin.geometry.boundingBox!;
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);
  const scale = 2 / Math.max(size.x, size.y, size.z);
  return {
    face: normalise(skin.geometry, center, scale),
    features: meshes
      .filter((mesh) => mesh !== skin)
      .map((mesh) => ({
        geometry: normalise(mesh.geometry, center, scale),
        kind: labelFor(mesh),
      })),
  };
}

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function prepareFace(noor: THREE.BufferGeometry, rig: Uint8Array) {
  const face = noor.clone();
  const count = face.getAttribute("position").count;
  if (rig.length !== count * 4) {
    face.dispose();
    return null;
  }
  face.setAttribute("aRig", new THREE.BufferAttribute(rig, 4, true));
  return face;
}

function triangleIndex(
  index: THREE.BufferAttribute | null,
  triangle: number,
  corner: number,
) {
  return index ? index.getX(triangle * 3 + corner) : triangle * 3 + corner;
}

function buildAreaTable(geometry: THREE.BufferGeometry) {
  const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
  const indices = geometry.getIndex();
  const triangles = Math.floor((indices?.count ?? positions.count) / 3);
  const cumulative = new Float32Array(triangles);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  let total = 0;
  for (let triangle = 0; triangle < triangles; triangle += 1) {
    a.fromBufferAttribute(positions, triangleIndex(indices, triangle, 0));
    b.fromBufferAttribute(positions, triangleIndex(indices, triangle, 1));
    c.fromBufferAttribute(positions, triangleIndex(indices, triangle, 2));
    ab.subVectors(b, a);
    ac.subVectors(c, a);
    total += ab.cross(ac).length() * 0.5;
    cumulative[triangle] = total;
  }
  return { cumulative, total, indices };
}

function findTriangle(cumulative: Float32Array, value: number) {
  let low = 0;
  let high = cumulative.length - 1;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (value <= cumulative[middle]) high = middle;
    else low = middle + 1;
  }
  return low;
}

function barycentricPoint(
  attribute: THREE.BufferAttribute,
  ia: number,
  ib: number,
  ic: number,
  wa: number,
  wb: number,
  wc: number,
  target: THREE.Vector3,
) {
  target.set(
    attribute.getX(ia) * wa + attribute.getX(ib) * wb + attribute.getX(ic) * wc,
    attribute.getY(ia) * wa + attribute.getY(ib) * wb + attribute.getY(ic) * wc,
    attribute.getZ(ia) * wa + attribute.getZ(ib) * wb + attribute.getZ(ic) * wc,
  );
}

function makePointGeometry(noor: THREE.BufferGeometry, count: number) {
  const random = seededRandom(0x7679_616b);
  const noorPositions = noor.getAttribute("position") as THREE.BufferAttribute;
  const { cumulative, total, indices } = buildAreaTable(noor);

  const positions = new Float32Array(count * 3);
  const origins = new Float32Array(count * 3);
  const controls = new Float32Array(count * 3);
  const arrivals = new Float32Array(count);
  const sizes = new Float32Array(count);
  const randoms = new Float32Array(count);

  const noorPoint = new THREE.Vector3();
  const origin = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const control = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  for (let sample = 0; sample < count; sample += 1) {
    const triangle = findTriangle(cumulative, random() * total);
    const ia = triangleIndex(indices, triangle, 0);
    const ib = triangleIndex(indices, triangle, 1);
    const ic = triangleIndex(indices, triangle, 2);
    const squareRoot = Math.sqrt(random());
    const wa = 1 - squareRoot;
    const wb = squareRoot * (1 - random());
    const wc = 1 - wa - wb;
    barycentricPoint(noorPositions, ia, ib, ic, wa, wb, wc, noorPoint);

    const angle = random() * Math.PI * 2;
    const outward = 0.58 + random() * 0.72;
    direction
      .set(
        Math.cos(angle) * outward,
        (random() - 0.5) * 0.88,
        0.34 + Math.sin(angle) * outward,
      )
      .normalize();
    origin.copy(noorPoint);
    origin.addScaledVector(direction, 0.56 + random() * 1.18);
    origin.y += (random() - 0.5) * 0.24;

    tangent.crossVectors(direction, up);
    if (tangent.lengthSq() < 0.0001) tangent.set(1, 0, 0);
    tangent.normalize().multiplyScalar((random() - 0.5) * 0.72);
    control.copy(origin).lerp(noorPoint, 0.47).add(tangent);

    const eyeZone = Math.exp(
      -Math.pow((Math.abs(noorPoint.x) - 0.25) / 0.18, 2) -
      Math.pow((noorPoint.y - 0.36) / 0.14, 2) -
      Math.pow((noorPoint.z - 0.54) / 0.17, 2),
    );
    const mouthZone = Math.exp(
      -Math.pow(noorPoint.x / 0.24, 2) -
      Math.pow((noorPoint.y + 0.01) / 0.13, 2) -
      Math.pow((noorPoint.z - 0.59) / 0.13, 2),
    );
    const silhouette = Math.max(
      remap(Math.abs(noorPoint.x), 0.56, 0.94),
      remap(noorPoint.y, 0.66, 0.93),
      remap(-noorPoint.y, 0.62, 0.94),
    );
    const arrival = THREE.MathUtils.clamp(
      0.08 + random() * 0.39 + Math.max(eyeZone, mouthZone) * 0.24 - silhouette * 0.08,
      0.02,
      0.7,
    );

    positions.set(noorPoint.toArray(), sample * 3);
    origins.set(origin.toArray(), sample * 3);
    controls.set(control.toArray(), sample * 3);
    arrivals[sample] = arrival;
    sizes[sample] = random();
    randoms[sample] = random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aOrigin", new THREE.BufferAttribute(origins, 3));
  geometry.setAttribute("aControl", new THREE.BufferAttribute(controls, 3));
  geometry.setAttribute("aArrival", new THREE.BufferAttribute(arrivals, 1));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

function featureColor(kind: string) {
  if (kind.includes("sclera")) return "#eff0ed";
  if (kind.includes("iris")) return "#363732";
  if (kind.includes("teeth")) return "#d4d5d1";
  if (kind.includes("mouth")) return "#111210";
  if (kind.includes("pupil")) return "#090a09";
  return "#111210";
}

function isEye(kind: string) {
  return (
    kind.includes("eye") ||
    kind.includes("sclera") ||
    kind.includes("iris") ||
    kind.includes("pupil")
  );
}

function isMouth(kind: string) {
  return kind.includes("mouth") || kind.includes("teeth");
}

function StoryScene({
  runtime,
  rig,
  onContextLost,
}: {
  runtime: StoryRuntime;
  rig: Uint8Array;
  onContextLost: () => void;
}) {
  const noorGltf = useGLTF(NOOR_MODEL);
  const noor = useMemo(() => extractIdentity(noorGltf.scene), [noorGltf.scene]);
  const root = useRef<THREE.Group>(null);
  const featureRoot = useRef<THREE.Group>(null);
  const faceMaterial = useRef<THREE.ShaderMaterial>(null);
  const pointMaterial = useRef<THREE.ShaderMaterial>(null);
  const featureMaterials = useRef<THREE.ShaderMaterial[]>([]);
  const { gl, invalidate, size } = useThree();
  const compact = size.height < window.innerHeight * 0.8;

  const face = useMemo(() => (noor ? prepareFace(noor.face, rig) : null), [noor, rig]);
  const features = noor?.features ?? [];
  const points = useMemo(
    () => (noor ? makePointGeometry(noor.face, compact ? 7_000 : 14_000) : null),
    [compact, noor],
  );
  const faceUniforms = useMemo(
    () => ({
      uCohesion: { value: 0 },
      uViseme: { value: new THREE.Vector3() },
      uBlink: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uMeshOpacity: { value: 1 },
      uPaper: { value: new THREE.Color("#f7f7f4") },
      uInk: { value: new THREE.Color("#0d0f0e") },
    }),
    [],
  );
  const pointUniforms = useMemo(
    () => ({
      uCohesion: { value: 0 },
      uPixelRatio: { value: 1 },
      uInk: { value: new THREE.Color("#151715") },
      uSignal: { value: new THREE.Color("#d33f2c") },
    }),
    [],
  );
  useEffect(() => {
    runtime.invalidate = invalidate;
    invalidate();
    return () => {
      runtime.invalidate = null;
    };
  }, [invalidate, runtime]);

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onContextLost]);

  useEffect(() => () => face?.dispose(), [face]);
  useEffect(() => () => points?.dispose(), [points]);
  useEffect(
    () => () => {
      noor?.face.dispose();
      noor?.features.forEach((feature) => feature.geometry.dispose());
    },
    [noor],
  );
  useFrame(() => {
    if (!root.current || !faceMaterial.current || !pointMaterial.current) {
      return;
    }
    const progress = runtime.progress;
    const formation = phase(progress, 0.025, 0.255);
    const release = phase(progress, 0.575, 0.655);
    const cohesion = Math.min(formation, 1 - release);

    const speech =
      phase(progress, 0.415, 0.432) * (1 - phase(progress, 0.495, 0.515));
    const speechProgress = remap(progress, 0.415, 0.515);

    const faceValues = faceMaterial.current.uniforms;
    faceValues.uCohesion.value = cohesion;
    sampleViseme(speechProgress, faceValues.uViseme.value).multiplyScalar(speech);
    faceValues.uBlink.value = Math.min(1, pulse(progress, 0.355, 0.0075));

    const pointerWindow =
      phase(progress, 0.29, 0.32) * (1 - phase(progress, 0.495, 0.515));
    faceValues.uPointer.value.set(
      runtime.pointerX * pointerWindow,
      runtime.pointerY * pointerWindow,
    );

    const pointValues = pointMaterial.current.uniforms;
    pointValues.uCohesion.value = cohesion;
    pointValues.uPixelRatio.value = Math.min(
      gl.getPixelRatio(),
      compact ? 1.25 : 1.5,
    );

    const noorYaw = THREE.MathUtils.lerp(-0.42, -0.025, phase(progress, 0.025, 0.3));
    root.current.rotation.y = noorYaw + runtime.pointerX * pointerWindow * 0.045;
    root.current.rotation.x = runtime.pointerY * pointerWindow * -0.028;
    root.current.position.x = compact ? 0 : 0.72;
    root.current.position.y = compact ? -0.02 : -0.065;
    root.current.scale.setScalar(compact ? 0.9 : 1.04);

    if (featureRoot.current) {
      featureRoot.current.visible = cohesion > 0.25;
      const featureOpacity = phase(cohesion, 0.32, 0.76);
      featureMaterials.current.forEach((material) => {
        if (!material) return;
        material.uniforms.uOpacity.value = featureOpacity;
        material.uniforms.uViseme.value.copy(faceValues.uViseme.value);
        material.uniforms.uBlink.value = faceValues.uBlink.value;
      });
    }
  });

  if (!face || !points || !noor) return null;

  return (
    <group ref={root}>
      <mesh geometry={face} frustumCulled={false}>
        <shaderMaterial
          ref={faceMaterial}
          uniforms={faceUniforms}
          vertexShader={STORY_FACE_VERTEX}
          fragmentShader={STORY_FACE_FRAGMENT}
          transparent
        />
      </mesh>
      <points geometry={points} frustumCulled={false} renderOrder={4}>
        <shaderMaterial
          ref={pointMaterial}
          uniforms={pointUniforms}
          vertexShader={STORY_POINTS_VERTEX}
          fragmentShader={STORY_POINTS_FRAGMENT}
          transparent
          depthWrite={false}
        />
      </points>
      <group ref={featureRoot}>
        {features.map((feature, index) =>
          isEye(feature.kind) || isMouth(feature.kind) ? (
            <mesh key={`${feature.kind}-${index}`} geometry={feature.geometry}>
              <shaderMaterial
                ref={(material) => {
                  if (material) featureMaterials.current[index] = material;
                }}
                uniforms={{
                  uColor: { value: new THREE.Color(featureColor(feature.kind)) },
                  uOpacity: { value: 0 },
                  uViseme: { value: new THREE.Vector3() },
                  uBlink: { value: 0 },
                  uIsEye: { value: isEye(feature.kind) ? 1 : 0 },
                  uIsMouth: { value: isMouth(feature.kind) ? 1 : 0 },
                  uIsTeeth: { value: feature.kind.includes("teeth") ? 1 : 0 },
                  uIsSocket: { value: feature.kind.includes("mouth") ? 1 : 0 },
                }}
                vertexShader={STORY_FEATURE_VERTEX}
                fragmentShader={STORY_FEATURE_FRAGMENT}
                transparent
                side={isMouth(feature.kind) ? THREE.DoubleSide : THREE.FrontSide}
              />
            </mesh>
          ) : null,
        )}
      </group>
    </group>
  );
}

export default function RelationalStoryCanvas({
  runtime,
  rig,
  onContextLost,
}: {
  runtime: StoryRuntime;
  rig: Uint8Array;
  onContextLost: () => void;
}) {
  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [0, 0, 4.12], fov: 37, near: 0.1, far: 20 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
      onCreated={({ gl, camera, invalidate, scene }) => {
        runtime.invalidate = invalidate;
        gl.compile(scene, camera);
        invalidate();
      }}
    >
      <StoryScene runtime={runtime} rig={rig} onContextLost={onContextLost} />
    </Canvas>
  );
}

useGLTF.preload(NOOR_MODEL);
