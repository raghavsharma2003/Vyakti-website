"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { INK_IDENTITIES } from "./identities";
import type { FaceLabRuntime } from "../face-lab/runtime";
import {
  INK_FACE_FRAGMENT,
  INK_FACE_VERTEX,
  INK_POINTS_FRAGMENT,
  INK_POINTS_VERTEX,
} from "./shaders";

const CAMERA_Z = 4.12;

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

function damp(current: number, target: number, lambda: number, delta: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * delta));
}

type Normalisation = { center: THREE.Vector3; scale: number };

function normalisationFor(geometry: THREE.BufferGeometry): Normalisation {
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox!;
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);
  return { center, scale: 2 / Math.max(size.x, size.y, size.z) };
}

function normalise(geometry: THREE.BufferGeometry, normalisation?: Normalisation) {
  const next = geometry.clone();
  const { center, scale } = normalisation ?? normalisationFor(next);
  next.translate(-center.x, -center.y, -center.z);
  next.scale(scale, scale, scale);
  next.computeVertexNormals();
  next.computeBoundingSphere();
  return next;
}

type InkModelGeometry = {
  face: THREE.BufferGeometry | null;
  features: Array<{
    geometry: THREE.BufferGeometry;
    kind: string;
  }>;
};

function meshLabel(mesh: THREE.Mesh) {
  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  return `${mesh.name} ${material?.name ?? ""}`.trim().toLowerCase();
}

function modelGeometry(scene: THREE.Group): InkModelGeometry {
  const meshes: THREE.Mesh[] = [];
  scene.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    meshes.push(child as THREE.Mesh);
  });
  const faceMesh =
    meshes.find((mesh) => meshLabel(mesh).includes("skin")) ??
    meshes.reduce((largest, mesh) => {
      const count = mesh.geometry.getAttribute("position")?.count ?? 0;
      const largestCount = largest?.geometry.getAttribute("position")?.count ?? -1;
      return count > largestCount ? mesh : largest;
    }, null as THREE.Mesh | null);
  if (!faceMesh) return { face: null, features: [] };
  const normalisation = normalisationFor(faceMesh.geometry);
  const face = normalise(faceMesh.geometry, normalisation);
  const features = meshes
    .filter((mesh) => mesh !== faceMesh)
    .map((mesh) => ({
      geometry: normalise(mesh.geometry, normalisation),
      kind: meshLabel(mesh),
    }));
  return { face, features };
}

function useInkGeometries() {
  const feminineSoft = useGLTF(INK_IDENTITIES[0].model);
  const feminineSculpted = useGLTF(INK_IDENTITIES[1].model);
  const feminineAngular = useGLTF(INK_IDENTITIES[2].model);
  const masculineCalm = useGLTF(INK_IDENTITIES[3].model);
  const masculineStrong = useGLTF(INK_IDENTITIES[4].model);
  const masculineLean = useGLTF(INK_IDENTITIES[5].model);
  const androgynousSoft = useGLTF(INK_IDENTITIES[6].model);
  const androgynousAngular = useGLTF(INK_IDENTITIES[7].model);
  const scenes = useMemo(
    () => [
      feminineSoft.scene,
      feminineSculpted.scene,
      feminineAngular.scene,
      masculineCalm.scene,
      masculineStrong.scene,
      masculineLean.scene,
      androgynousSoft.scene,
      androgynousAngular.scene,
    ],
    [
      feminineSoft.scene,
      feminineSculpted.scene,
      feminineAngular.scene,
      masculineCalm.scene,
      masculineStrong.scene,
      masculineLean.scene,
      androgynousSoft.scene,
      androgynousAngular.scene,
    ],
  );
  return useMemo(() => scenes.map(modelGeometry), [scenes]);
}

function createPointGeometry(source: THREE.BufferGeometry, count: number, seed: number) {
  const random = seededRandom(seed);
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(source))
    .setRandomGenerator(random)
    .build();
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const directions = new Float32Array(count * 3);
  const randoms = new Float32Array(count);
  const point = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const direction = new THREE.Vector3();
  for (let index = 0; index < count; index += 1) {
    sampler.sample(point, normal);
    direction.set(random() - 0.5, random() - 0.5, random() - 0.5).normalize();
    positions.set(point.toArray(), index * 3);
    normals.set(normal.toArray(), index * 3);
    directions.set(direction.toArray(), index * 3);
    randoms[index] = random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("aDirection", new THREE.BufferAttribute(directions, 3));
  geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

type IdentityLayerProps = {
  runtime: FaceLabRuntime;
  index: number;
  geometry: THREE.BufferGeometry;
  points: THREE.BufferGeometry;
  featuresGeometry: InkModelGeometry["features"];
};

function featureColor(kind: string, index: number) {
  if (kind.includes("sclera")) return "#eeeeea";
  if (kind.includes("teeth")) return "#111210";
  if (kind.includes("iris")) return "#30312f";
  if (kind.includes("pupil") || kind.includes("socket") || kind.includes("mouth")) {
    return "#111210";
  }
  return index === 1 ? "#eeeeea" : "#171817";
}

function isEyeFeature(kind: string) {
  return (
    kind.includes("eye") ||
    kind.includes("sclera") ||
    kind.includes("iris") ||
    kind.includes("pupil")
  );
}

function IdentityLayer({
  runtime,
  index,
  geometry,
  points,
  featuresGeometry,
}: IdentityLayerProps) {
  const identity = INK_IDENTITIES[index];
  const root = useRef<THREE.Group>(null);
  const faceMaterial = useRef<THREE.ShaderMaterial>(null);
  const pointsMaterial = useRef<THREE.ShaderMaterial>(null);
  const features = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group>(null);
  const featureMaterials = useRef<THREE.Material[]>([]);

  const faceUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLocal: { value: 0 },
      uJawOpen: { value: 0 },
      uLipRound: { value: 0 },
      uLipPress: { value: 0 },
      uSeed: { value: index + 1 },
      uPointer: { value: new THREE.Vector2() },
      uOpacity: { value: 0 },
      uInkBias: { value: identity.inkBias },
      uDotScale: { value: identity.dotScale },
      uPaper: { value: new THREE.Color("#f4f5f3") },
      uInk: { value: new THREE.Color("#101110") },
      uAccent: { value: new THREE.Color("#de4d32") },
    }),
    [identity.dotScale, identity.inkBias, index],
  );

  const pointUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLocal: { value: 0 },
      uOpacity: { value: 0 },
      uPixelRatio: { value: 1 },
      uSeed: { value: index + 1 },
      uInk: { value: new THREE.Color("#161716") },
      uAccent: { value: new THREE.Color("#de4d32") },
    }),
    [index],
  );

  useFrame((state, rawDelta) => {
    if (!root.current) return;
    const delta = Math.min(rawDelta, 0.05);
    const scaled = Math.min(7.9999, runtime.progress * INK_IDENTITIES.length);
    const active = Math.floor(scaled);
    const local = scaled - active;
    const transition =
      active === INK_IDENTITIES.length - 1
        ? 0
        : THREE.MathUtils.smoothstep(local, 0.79, 0.97);
    let weight = 0;
    let chapterLocal = local;
    if (index === active) weight = 1 - transition;
    if (index === active + 1) {
      weight = transition;
      chapterLocal = Math.max(0, (local - 0.79) / 0.18) * 0.2;
    }
    root.current.visible = weight > 0.002;

    const time = state.clock.elapsedTime;
    const syllable = Math.min(
      1,
      Math.max(0, Math.sin(time * 7.7 + index * 0.4)) * 0.68 +
        Math.max(0, Math.sin(time * 12.2 + 0.9)) * 0.32,
    );
    const speaking =
      THREE.MathUtils.smoothstep(chapterLocal, 0.34, 0.44) *
      (1 - THREE.MathUtils.smoothstep(chapterLocal, 0.68, 0.78));
    const jawOpen = speaking * syllable;
    const lipRound =
      speaking * Math.max(0, Math.sin(time * 5.2 + index * 0.3 + 1.4));
    const lipPress =
      speaking * Math.max(0, Math.sin(time * 6.3 + index * 0.2 + 3.3));
    const pointerX = damp(faceUniforms.uPointer.value.x, runtime.pointerX, 3.4, delta);
    const pointerY = damp(faceUniforms.uPointer.value.y, runtime.pointerY, 3.4, delta);

    if (faceMaterial.current) {
      const uniforms = faceMaterial.current.uniforms;
      uniforms.uTime.value = time;
      uniforms.uLocal.value = chapterLocal;
      uniforms.uJawOpen.value = jawOpen;
      uniforms.uLipRound.value = lipRound;
      uniforms.uLipPress.value = lipPress;
      uniforms.uOpacity.value = weight;
      uniforms.uPointer.value.set(pointerX, pointerY);
    }
    if (pointsMaterial.current) {
      const uniforms = pointsMaterial.current.uniforms;
      uniforms.uTime.value = time;
      uniforms.uLocal.value = chapterLocal;
      const formationPoints = 1 - THREE.MathUtils.smoothstep(chapterLocal, 0.12, 0.32);
      const exitPoints = THREE.MathUtils.smoothstep(chapterLocal, 0.82, 1);
      uniforms.uOpacity.value = weight * (formationPoints * 0.74 + exitPoints * 0.46);
      uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.5);
    }
    if (features.current) {
      features.current.visible = weight > 0.002;
      featureMaterials.current.forEach((material) => {
        material.opacity = weight;
      });
    }
    if (eyes.current) {
      const blinkBeat = (time + index * 0.73) % 4.9;
      const blink = Math.exp(-Math.pow((blinkBeat - 4.45) / 0.075, 2));
      eyes.current.scale.y = damp(eyes.current.scale.y, 1 - blink * 0.9, 30, delta);
    }
    const yaw =
      THREE.MathUtils.lerp(
        -0.58,
        0.5,
        THREE.MathUtils.smoothstep(chapterLocal, 0.08, 0.8),
      ) + pointerX * 0.08;
    root.current.rotation.y = damp(root.current.rotation.y, yaw, 4.2, delta);
    root.current.rotation.x = damp(
      root.current.rotation.x,
      -pointerY * 0.045 + Math.sin(time * 0.31 + index) * 0.008,
      4.2,
      delta,
    );
  });

  return (
    <group ref={root}>
      <mesh geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={faceMaterial}
          uniforms={faceUniforms}
          vertexShader={INK_FACE_VERTEX}
          fragmentShader={INK_FACE_FRAGMENT}
          transparent
        />
      </mesh>
      <points geometry={points} frustumCulled={false} renderOrder={4}>
        <shaderMaterial
          ref={pointsMaterial}
          uniforms={pointUniforms}
          vertexShader={INK_POINTS_VERTEX}
          fragmentShader={INK_POINTS_FRAGMENT}
          transparent
          depthWrite={false}
        />
      </points>
      <group ref={features}>
        <group ref={eyes} position={[0, 0.38, 0]}>
          {featuresGeometry.map((feature, featureIndex) =>
            isEyeFeature(feature.kind) ? (
              <mesh
                key={feature.geometry.uuid}
                geometry={feature.geometry}
                position={[0, -0.38, 0]}
              >
                <meshBasicMaterial
                  ref={(material) => {
                    if (material) featureMaterials.current[featureIndex] = material;
                  }}
                  color={featureColor(feature.kind, featureIndex)}
                  transparent
                />
              </mesh>
            ) : null,
          )}
        </group>
        {featuresGeometry.map((feature, featureIndex) =>
          !isEyeFeature(feature.kind) ? (
          <mesh key={feature.geometry.uuid} geometry={feature.geometry}>
            <meshBasicMaterial
              ref={(material) => {
                if (material) featureMaterials.current[featureIndex] = material;
              }}
              color={featureColor(feature.kind, featureIndex)}
              transparent
            />
          </mesh>
          ) : null,
        )}
      </group>
    </group>
  );
}

function InkScene({
  runtime,
  onContextLost,
}: {
  runtime: FaceLabRuntime;
  onContextLost: () => void;
}) {
  const models = useInkGeometries();
  const geometries = useMemo(() => models.map((model) => model.face), [models]);
  const { gl, invalidate, size } = useThree();
  const compact = size.width < 900;
  const pointGeometries = useMemo(
    () =>
      geometries.map((geometry, index) =>
        geometry
          ? createPointGeometry(geometry, compact ? 9_000 : 18_000, 0x1a2b + index * 37)
          : null,
      ),
    [compact, geometries],
  );

  useEffect(() => {
    // ScrollTrigger and R3F intentionally share this imperative invalidation bridge.
    // eslint-disable-next-line react-hooks/immutability
    runtime.invalidate = invalidate;
    invalidate();
    return () => {
      runtime.invalidate = null;
    };
  }, [invalidate, runtime]);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);
    return () => canvas.removeEventListener("webglcontextlost", handleContextLost);
  }, [gl, onContextLost]);

  useEffect(
    () => () => {
      geometries.forEach((geometry) => geometry?.dispose());
      models.forEach((model) =>
        model.features.forEach((feature) => feature.geometry.dispose()),
      );
      pointGeometries.forEach((geometry) => geometry?.dispose());
    },
    [geometries, models, pointGeometries],
  );

  useFrame(() => {
    if (runtime.active && document.visibilityState === "visible") invalidate();
  });

  if (geometries.some((geometry) => !geometry)) return null;

  return (
    <>
      {geometries.map((geometry, index) => (
        <IdentityLayer
          key={INK_IDENTITIES[index].slug}
          runtime={runtime}
          index={index}
          geometry={geometry!}
          points={pointGeometries[index]!}
          featuresGeometry={models[index].features}
        />
      ))}
    </>
  );
}

export default function InkLabCanvas({
  runtime,
  onContextLost,
}: {
  runtime: FaceLabRuntime;
  onContextLost: () => void;
}) {
  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [0, 0, CAMERA_Z], fov: 38, near: 0.1, far: 20 }}
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
      <InkScene runtime={runtime} onContextLost={onContextLost} />
    </Canvas>
  );
}

INK_IDENTITIES.forEach((identity) => useGLTF.preload(identity.model));
