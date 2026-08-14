"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import type { NoorRuntime } from "./runtime";
import {
  NOOR_FACE_FRAGMENT,
  NOOR_FACE_VERTEX,
  NOOR_FEATURE_VERTEX,
  NOOR_POINTS_FRAGMENT,
  NOOR_POINTS_VERTEX,
} from "./shaders";

const MODEL = "/models/ink-lab/androgynous-soft.glb?v=mouth2";
const FEATURE_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uIsTeeth;
  uniform float uIsSocket;
  uniform vec3 uViseme;
  varying vec3 vFeatureBase;
  void main() {
    float alpha = uOpacity;
    if (uIsSocket > 0.5) {
      float A = uViseme.x;
      float O = uViseme.y;
      float openness = clamp(A + O * 0.82, 0.0, 1.0);
      float halfWidth = max(0.07, 0.112 + A * 0.045 - O * 0.025);
      float halfHeight = 0.006 + A * 0.052 + O * 0.038;
      vec2 aperture = vec2(
        (vFeatureBase.x - 0.000668) / halfWidth,
        (vFeatureBase.y + 0.010513) / halfHeight
      );
      alpha *=
        (1.0 - smoothstep(0.86, 1.03, length(aperture))) *
        smoothstep(0.08, 0.26, openness);
    }
    if (uIsTeeth > 0.5) {
      float openness = clamp(uViseme.x + uViseme.y * 0.82, 0.0, 1.0);
      float upperTeeth = smoothstep(0.002, 0.024, vFeatureBase.y);
      float frontTeeth = smoothstep(0.52, 0.59, vFeatureBase.z);
      alpha *= upperTeeth * frontTeeth * smoothstep(0.3, 0.64, openness) * 0.72;
    }
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(uColor, alpha);
    #include <colorspace_fragment>
  }
`;

type FeatureGeometry = {
  geometry: THREE.BufferGeometry;
  kind: string;
};

type NoorGeometry = {
  face: THREE.BufferGeometry;
  features: FeatureGeometry[];
};

function damp(current: number, target: number, lambda: number, delta: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * delta));
}

function remap(value: number, start: number, end: number) {
  return THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
}

function eased(value: number, start: number, end: number) {
  const normalized = remap(value, start, end);
  return normalized * normalized * (3 - 2 * normalized);
}

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

function normalise(geometry: THREE.BufferGeometry, center: THREE.Vector3, scale: number) {
  const clone = geometry.clone();
  clone.translate(-center.x, -center.y, -center.z);
  clone.scale(scale, scale, scale);
  clone.computeVertexNormals();
  clone.computeBoundingSphere();
  return clone;
}

function extractModel(scene: THREE.Group): NoorGeometry | null {
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

function makePointGeometry(source: THREE.BufferGeometry, count: number) {
  const random = seededRandom(0x6e6f6f72);
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(source))
    .setRandomGenerator(random)
    .build();
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const origins = new Float32Array(count * 3);
  const controls = new Float32Array(count * 3);
  const arrivals = new Float32Array(count);
  const sizes = new Float32Array(count);
  const randoms = new Float32Array(count);
  const point = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const origin = new THREE.Vector3();
  const control = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  for (let index = 0; index < count; index += 1) {
    sampler.sample(point, normal);
    const angle = random() * Math.PI * 2;
    const outward = 0.58 + random() * 0.72;
    direction
      .set(
        point.x * 0.3 + Math.cos(angle) * outward,
        point.y * 0.12 + (random() - 0.5) * 0.78,
        0.38 + Math.sin(angle) * outward,
      )
      .normalize();
    const radius = 0.5 + random() * 1.16;
    origin.copy(point).addScaledVector(direction, radius);
    origin.y += (random() - 0.5) * 0.24;
    tangent.crossVectors(direction, up);
    if (tangent.lengthSq() < 0.0001) tangent.set(1, 0, 0);
    tangent.normalize().multiplyScalar((random() - 0.5) * 0.7);
    control.copy(origin).lerp(point, 0.47).add(tangent);
    control.y += Math.sin(angle) * 0.12;

    const eyeZone = Math.exp(
      -Math.pow((Math.abs(point.x) - 0.25) / 0.18, 2) -
      Math.pow((point.y - 0.36) / 0.14, 2) -
      Math.pow((point.z - 0.54) / 0.17, 2),
    );
    const mouthZone = Math.exp(
      -Math.pow(point.x / 0.24, 2) -
      Math.pow((point.y + 0.01) / 0.13, 2) -
      Math.pow((point.z - 0.59) / 0.13, 2),
    );
    const silhouette = Math.max(
      remap(Math.abs(point.x), 0.56, 0.94),
      remap(point.y, 0.66, 0.93),
      remap(-point.y, 0.62, 0.94),
    );
    const arrival = THREE.MathUtils.clamp(
      0.08 + random() * 0.39 + Math.max(eyeZone, mouthZone) * 0.24 - silhouette * 0.08,
      0.02,
      0.7,
    );

    positions.set(point.toArray(), index * 3);
    normals.set(normal.toArray(), index * 3);
    origins.set(origin.toArray(), index * 3);
    controls.set(control.toArray(), index * 3);
    arrivals[index] = arrival;
    sizes[index] = random();
    randoms[index] = random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
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
  if (kind.includes("iris")) return "#252624";
  if (kind.includes("teeth")) return "#c7c9c4";
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

function NoorScene({
  runtime,
  rig,
  onContextLost,
}: {
  runtime: NoorRuntime;
  rig: Uint8Array | null;
  onContextLost: () => void;
}) {
  const gltf = useGLTF(MODEL);
  const model = useMemo(() => extractModel(gltf.scene), [gltf.scene]);
  const root = useRef<THREE.Group>(null);
  const featureRoot = useRef<THREE.Group>(null);
  const featureMaterials = useRef<THREE.ShaderMaterial[]>([]);
  const faceMaterial = useRef<THREE.ShaderMaterial>(null);
  const pointsMaterial = useRef<THREE.ShaderMaterial>(null);
  const { gl, invalidate, size } = useThree();

  const face = useMemo(() => {
    if (!model || !rig) return null;
    const geometry = model.face;
    const count = geometry.getAttribute("position").count;
    if (rig.length !== count * 4) return null;
    geometry.setAttribute(
      "aRig",
      new THREE.BufferAttribute(rig, 4, true),
    );
    return geometry;
  }, [model, rig]);

  const points = useMemo(
    () => (face ? makePointGeometry(face, size.width < 900 ? 7_000 : 14_000) : null),
    [face, size.width],
  );

  const faceUniforms = useMemo(
    () => ({
      uConsolidation: { value: 0 },
      uRelease: { value: 0 },
      uViseme: { value: new THREE.Vector3() },
      uBlink: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uMeshOpacity: { value: 1 },
      uPaper: { value: new THREE.Color("#f4f5f3") },
      uInk: { value: new THREE.Color("#101110") },
    }),
    [],
  );

  const pointUniforms = useMemo(
    () => ({
      uConsolidation: { value: 0 },
      uRelease: { value: 0 },
      uPixelRatio: { value: 1 },
      uInk: { value: new THREE.Color("#141513") },
    }),
    [],
  );

  useEffect(() => {
    // ScrollTrigger and R3F share one imperative invalidation bridge.
    // eslint-disable-next-line react-hooks/immutability
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

  useEffect(
    () => () => {
      model?.features.forEach((feature) => feature.geometry.dispose());
      face?.dispose();
      points?.dispose();
    },
    [face, model, points],
  );

  useFrame((state, rawDelta) => {
    if (!root.current || !faceMaterial.current || !pointsMaterial.current) return;
    const progress = runtime.progress;
    const delta = Math.min(rawDelta, 0.05);
    const time = state.clock.elapsedTime;

    const consolidation = eased(progress, 0.06, 0.48);
    const release = eased(progress, 0.86, 1.0);
    const cohesion = Math.min(consolidation, 1 - release);
    const listening = eased(progress, 0.48, 0.51) * (1 - eased(progress, 0.59, 0.6));
    const speaking = eased(progress, 0.6, 0.615) * (1 - eased(progress, 0.755, 0.77));
    const reaction = eased(progress, 0.77, 0.79) * (1 - eased(progress, 0.85, 0.86));
    const speechProgress = remap(progress, 0.6, 0.77);

    const blinkBeat = time % 5.1;
    const naturalBlink = Math.exp(-Math.pow((blinkBeat - 4.62) / 0.065, 2));
    const attentionBlink = listening * Math.exp(-Math.pow((progress - 0.49) / 0.012, 2));
    const blink = Math.min(1, naturalBlink + attentionBlink);

    const pointerX = damp(faceUniforms.uPointer.value.x, runtime.pointerX, 3.8, delta);
    const pointerY = damp(faceUniforms.uPointer.value.y, runtime.pointerY, 3.8, delta);
    const uniforms = faceMaterial.current.uniforms;
    uniforms.uConsolidation.value = consolidation;
    uniforms.uRelease.value = release;
    sampleViseme(speechProgress, uniforms.uViseme.value).multiplyScalar(speaking);
    uniforms.uBlink.value = blink;
    uniforms.uPointer.value.set(pointerX, pointerY);

    const pointValues = pointsMaterial.current.uniforms;
    pointValues.uConsolidation.value = consolidation;
    pointValues.uRelease.value = release;
    pointValues.uPixelRatio.value = Math.min(window.devicePixelRatio, size.width < 900 ? 1.25 : 1.5);

    const targetYaw = THREE.MathUtils.lerp(-0.42, -0.025, eased(progress, 0.06, 0.48));
    root.current.rotation.y = targetYaw + pointerX * 0.045;
    root.current.rotation.x =
      -pointerY * 0.032 - listening * 0.012 +
      speaking * Math.sin(speechProgress * Math.PI * 2) * 0.004;
    root.current.position.y = listening * -0.008 + reaction * 0.004;

    if (featureRoot.current) {
      featureRoot.current.visible = cohesion > 0.28;
      const featureOpacity = eased(cohesion, 0.34, 0.76);
      featureMaterials.current.forEach((material) => {
        const featureUniforms = material.uniforms;
        featureUniforms.uOpacity.value = featureOpacity;
        featureUniforms.uViseme.value.copy(uniforms.uViseme.value);
        featureUniforms.uBlink.value = blink;
      });
    }
  });

  useFrame(() => {
    if (runtime.active && document.visibilityState === "visible") invalidate();
  });

  if (!face || !points || !model) return null;

  return (
    <group ref={root} scale={1.06}>
      <mesh geometry={face} frustumCulled={false}>
        <shaderMaterial
          ref={faceMaterial}
          uniforms={faceUniforms}
          vertexShader={NOOR_FACE_VERTEX}
          fragmentShader={NOOR_FACE_FRAGMENT}
          transparent
        />
      </mesh>
      <points geometry={points} frustumCulled={false} renderOrder={4}>
        <shaderMaterial
          ref={pointsMaterial}
          uniforms={pointUniforms}
          vertexShader={NOOR_POINTS_VERTEX}
          fragmentShader={NOOR_POINTS_FRAGMENT}
          transparent
          depthWrite={false}
        />
      </points>
      <group ref={featureRoot}>
        {model.features.map((feature, index) =>
          isEye(feature.kind) || isMouth(feature.kind) ? (
            <mesh key={feature.geometry.uuid} geometry={feature.geometry}>
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
                vertexShader={NOOR_FEATURE_VERTEX}
                fragmentShader={FEATURE_FRAGMENT}
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

export default function NoorCanvas({
  runtime,
  rig,
  onContextLost,
}: {
  runtime: NoorRuntime;
  rig: Uint8Array | null;
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
        // eslint-disable-next-line react-hooks/immutability
        runtime.invalidate = invalidate;
        gl.compile(scene, camera);
        invalidate();
      }}
    >
      <NoorScene runtime={runtime} rig={rig} onContextLost={onContextLost} />
    </Canvas>
  );
}

useGLTF.preload(MODEL);
