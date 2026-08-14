"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import {
  MEERA_FACE_FRAGMENT,
  MEERA_FACE_VERTEX,
  MEERA_CAP_FRAGMENT,
  MEERA_CAP_VERTEX,
  MEERA_HAIR_FRAGMENT,
  MEERA_HAIR_VERTEX,
} from "./shaders";

const MODEL = "/models/meera-head.glb";
const CAMERA_Z = 4.05;

type PointerState = { x: number; y: number; tx: number; ty: number };

function makeRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

function useNormalisedFaceGeometry() {
  const { scene } = useGLTF(MODEL);

  return useMemo(() => {
    let source: THREE.Mesh | null = null;
    scene.traverse((child) => {
      if (!source && (child as THREE.Mesh).isMesh) source = child as THREE.Mesh;
    });
    if (!source) return null;

    const geometry = (source as THREE.Mesh).geometry.clone();
    geometry.deleteAttribute("color");
    geometry.computeBoundingBox();

    const bounds = geometry.boundingBox!;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);
    const scale = 2 / Math.max(size.x, size.y, size.z);
    geometry.translate(-center.x, -center.y, -center.z);
    geometry.scale(scale, scale, scale);

    // The semantic sample is intentionally refined as an authored character,
    // not shipped as the untouched statistical mean. A tapered jaw and neck
    // create a clearer feminine silhouette while retaining GNM's topology.
    const position = geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const y = position.getY(index);
      const jawBlend = 1 - THREE.MathUtils.smoothstep(y, -0.58, 0.14);
      const neckBlend = 1 - THREE.MathUtils.smoothstep(y, -0.88, -0.55);
      const cheekLift = Math.exp(-Math.pow((y - 0.15) * 4.2, 2)) * 0.018;
      const noseBlend =
        Math.exp(-Math.pow((y - 0.17) * 4.8, 2)) *
        THREE.MathUtils.smoothstep(position.getZ(index), 0.43, 0.58) *
        (1 - THREE.MathUtils.smoothstep(Math.abs(x), 0.13, 0.24));
      position.setX(
        index,
        x *
          (1 -
            jawBlend * 0.17 -
            neckBlend * 0.11 -
            noseBlend * 0.08 +
            cheekLift),
      );
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();

    return geometry;
  }, [scene]);
}

function createHairGeometry(face: THREE.BufferGeometry, compact: boolean) {
  const random = makeRandom(0x4d45_4552);
  const scalpCount = compact ? 4_400 : 9_200;
  const strandsPerSide = compact ? 26 : 42;
  const pointsPerStrand = compact ? 60 : 82;
  const browCount = compact ? 220 : 360;
  const total =
    scalpCount + strandsPerSide * 2 * pointsPerStrand + browCount;

  const positions = new Float32Array(total * 3);
  const randoms = new Float32Array(total);
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(face))
    .setRandomGenerator(random)
    .build();
  const point = new THREE.Vector3();
  const normal = new THREE.Vector3();

  let cursor = 0;
  let attempts = 0;
  while (cursor < scalpCount && attempts < scalpCount * 15) {
    attempts += 1;
    sampler.sample(point, normal);
    const crown =
      (point.y > 0.46 && point.z < 0.62) ||
      (point.y > 0.10 && point.z < 0.22);
    const temple = Math.abs(point.x) > 0.41 && point.y > -0.34 && point.z < 0.47;
    if (!crown && !temple) continue;

    const lift = 0.035 + random() * 0.055;
    positions.set(
      [
        point.x + normal.x * lift,
        point.y + normal.y * lift,
        point.z + normal.z * lift,
      ],
      cursor * 3,
    );
    randoms[cursor] = random();
    cursor += 1;
  }

  // Long, open side locks make the silhouette read as Meera without covering
  // the face. Every strand is a quadratic curve from a centre part to the
  // shoulders, sampled as particles so it stays within the site's language.
  for (const side of [-1, 1]) {
    for (let strand = 0; strand < strandsPerSide; strand += 1) {
      const band = strand / Math.max(strandsPerSide - 1, 1);
      const start = new THREE.Vector3(
        side * (0.035 + band * 0.43),
        0.93 - band * 0.18,
        0.06 - band * 0.18,
      );
      const control = new THREE.Vector3(
        side * (0.55 + band * 0.12),
        0.24 - band * 0.05,
        0.17 - band * 0.06,
      );
      const end = new THREE.Vector3(
        side * (0.48 + band * 0.16),
        -0.72 + band * 0.08,
        0.02 - band * 0.10,
      );

      for (let step = 0; step < pointsPerStrand; step += 1) {
        if (cursor >= total) break;
        const t = Math.min(
          1,
          (step + random() * 0.78) / Math.max(pointsPerStrand - 1, 1),
        );
        const inverse = 1 - t;
        const jitter = (random() - 0.5) * 0.007;
        point.set(
          inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
          inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
          inverse * inverse * start.z + 2 * inverse * t * control.z + t * t * end.z,
        );
        point.x += jitter;
        point.y += (random() - 0.5) * 0.012;
        point.z += (random() - 0.5) * 0.008;
        positions.set([point.x, point.y, point.z], cursor * 3);
        randoms[cursor] = random();
        cursor += 1;
      }
    }
  }

  for (const side of [-1, 1]) {
    const pointsPerBrow = Math.floor(browCount / 2);
    for (let step = 0; step < pointsPerBrow; step += 1) {
      if (cursor >= total) break;
      const t = (step + random() * 0.7) / Math.max(pointsPerBrow - 1, 1);
      const x = side * (0.105 + t * 0.16);
      const y = 0.49 + Math.sin(t * Math.PI) * 0.025 + (random() - 0.5) * 0.008;
      const z = 0.535 + Math.sin(t * Math.PI) * 0.012 + (random() - 0.5) * 0.006;
      positions.set([x, y, z], cursor * 3);
      randoms[cursor] = random() * 0.48;
      cursor += 1;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions.slice(0, cursor * 3), 3),
  );
  geometry.setAttribute(
    "aRandom",
    new THREE.BufferAttribute(randoms.slice(0, cursor), 1),
  );
  geometry.computeBoundingSphere();
  return geometry;
}

function MeeraModel() {
  const root = useRef<THREE.Group>(null);
  const pupils = useRef<THREE.Group>(null);
  const faceMaterial = useRef<THREE.ShaderMaterial>(null);
  const capMaterial = useRef<THREE.ShaderMaterial>(null);
  const hairMaterial = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, tx: 0, ty: 0 });
  const { size, viewport } = useThree();
  const compact = size.width < 760;
  const face = useNormalisedFaceGeometry();
  const topology = useTexture("/models/gnm-edgeflow.webp");
  const preparedTopology = useMemo(() => {
    const texture = topology.clone();
    texture.flipY = false;
    texture.colorSpace = THREE.NoColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return texture;
  }, [topology]);
  const hair = useMemo(
    () => (face ? createHairGeometry(face, compact) : null),
    [face, compact],
  );

  const faceUniforms = useMemo(() => {
    return {
      uMouthOpen: { value: 0 },
      uBlink: { value: 0 },
      uPearl: { value: new THREE.Color("#e3d5cc") },
      uShadow: { value: new THREE.Color("#584e49") },
      uAccent: { value: new THREE.Color("#c83f2d") },
      uTopology: { value: preparedTopology },
    };
  }, [preparedTopology]);

  const hairUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 4.2 },
      uPixelRatio: { value: 1 },
      uHair: { value: new THREE.Color("#282523") },
      uHairLight: { value: new THREE.Color("#81736b") },
      uAccent: { value: new THREE.Color("#c83f2d") },
      uOpacity: { value: 0.46 },
    }),
    [],
  );

  const capUniforms = useMemo(
    () => ({
      uHair: { value: new THREE.Color("#282523") },
      uHairLight: { value: new THREE.Color("#81736b") },
    }),
    [],
  );

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    const onPointer = (event: PointerEvent) => {
      pointer.current.tx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ty = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  }, []);

  useEffect(
    () => () => {
      hair?.dispose();
      preparedTopology.dispose();
    },
    [hair, preparedTopology],
  );

  useFrame((state, rawDelta) => {
    const faceUniform = faceMaterial.current?.uniforms;
    const hairUniform = hairMaterial.current?.uniforms;
    if (!faceUniform || !hairUniform) return;

    const dt = Math.min(rawDelta, 0.05);
    const time = state.clock.elapsedTime;
    const speechPhase = time % 8.4;
    const speechWindow =
      THREE.MathUtils.smoothstep(speechPhase, 1.05, 1.48) *
      (1 - THREE.MathUtils.smoothstep(speechPhase, 5.05, 5.48));
    const syllable = Math.min(
      1,
      Math.max(0, Math.sin(time * 9.1)) * 0.74 +
        Math.max(0, Math.sin(time * 14.3 + 1.15)) * 0.36,
    );
    const blinkPhase = (time + 1.1) % 5.6;
    const blinkTarget =
      blinkPhase < 0.17 ? Math.sin((blinkPhase / 0.17) * Math.PI) : 0;

    faceUniform.uMouthOpen.value = damp(
      faceUniform.uMouthOpen.value,
      speechWindow * syllable * 0.82,
      16,
      dt,
    );
    faceUniform.uBlink.value = damp(
      faceUniform.uBlink.value,
      blinkTarget,
      blinkTarget > faceUniform.uBlink.value ? 28 : 18,
      dt,
    );

    hairUniform.uTime.value = time;
    hairUniform.uPixelRatio.value = Math.min(viewport.dpr || 1, 1.65);
    hairUniform.uSize.value = compact ? 3.7 : 4.25;

    pointer.current.x = damp(pointer.current.x, pointer.current.tx, 3, dt);
    pointer.current.y = damp(pointer.current.y, pointer.current.ty, 3, dt);

    if (root.current) {
      root.current.rotation.y = damp(
        root.current.rotation.y,
        -0.16 + pointer.current.x * 0.12,
        3,
        dt,
      );
      root.current.rotation.x = damp(
        root.current.rotation.x,
        -pointer.current.y * 0.065 + Math.sin(time * 0.42) * 0.012,
        3,
        dt,
      );
      const breath = 1 + Math.sin(time * 0.72) * 0.004;
      root.current.scale.setScalar(breath * (compact ? 0.93 : 1));
    }

    if (pupils.current) {
      pupils.current.position.x = damp(
        pupils.current.position.x,
        pointer.current.x * 0.009,
        5,
        dt,
      );
      pupils.current.position.y = damp(
        pupils.current.position.y,
        pointer.current.y * 0.006,
        5,
        dt,
      );
    }
  });

  if (!face || !hair) return null;

  return (
    <group ref={root} position={[0, -0.04, 0]} rotation={[0, -0.16, 0]}>
      <mesh position={[0, -0.24, -0.31]} scale={[0.73, 1.48, 0.44]}>
        <sphereGeometry args={[1, 64, 48]} />
        <meshStandardMaterial
          color="#2b2826"
          roughness={0.88}
          metalness={0.01}
        />
      </mesh>
      <group>
        <mesh position={[0, -0.026, 0.55]} scale={[0.15, 0.042, 0.032]}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color="#3a2925" />
        </mesh>
        {[-0.186, 0.186].map((x) => (
          <mesh key={`eye-${x}`} position={[x, 0.393, 0.435]}>
            <sphereGeometry args={[0.076, 32, 24]} />
            <meshStandardMaterial
              color="#e5ded5"
              roughness={0.62}
              metalness={0.01}
            />
          </mesh>
        ))}
        <group ref={pupils}>
          {[-0.186, 0.186].map((x) => (
            <group key={`pupil-${x}`}>
              <mesh position={[x, 0.39, 0.513]}>
                <circleGeometry args={[0.027, 32]} />
                <meshBasicMaterial color="#66534a" />
              </mesh>
              <mesh position={[x, 0.39, 0.515]}>
                <circleGeometry args={[0.012, 28]} />
                <meshBasicMaterial color="#151514" />
              </mesh>
              <mesh position={[x - 0.007, 0.398, 0.517]}>
                <circleGeometry args={[0.0042, 20]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      <mesh geometry={face} frustumCulled={false}>
        <shaderMaterial
          ref={faceMaterial}
          uniforms={faceUniforms}
          vertexShader={MEERA_FACE_VERTEX}
          fragmentShader={MEERA_FACE_FRAGMENT}
          side={THREE.FrontSide}
        />
      </mesh>

      <mesh geometry={face} frustumCulled={false} renderOrder={1}>
        <shaderMaterial
          ref={capMaterial}
          uniforms={capUniforms}
          vertexShader={MEERA_CAP_VERTEX}
          fragmentShader={MEERA_CAP_FRAGMENT}
          transparent
          depthWrite
          side={THREE.FrontSide}
        />
      </mesh>

      <points geometry={hair} frustumCulled={false} renderOrder={2}>
        <shaderMaterial
          ref={hairMaterial}
          uniforms={hairUniforms}
          vertexShader={MEERA_HAIR_VERTEX}
          fragmentShader={MEERA_HAIR_FRAGMENT}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>
    </group>
  );
}

export default function MeeraScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, CAMERA_Z], fov: 38, near: 0.1, far: 20 }}
      dpr={[1, 1.65]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={1.25} />
      <directionalLight position={[-2.5, 3, 4]} intensity={2.1} />
      <MeeraModel />
    </Canvas>
  );
}

useGLTF.preload(MODEL);
