"use client";

/* eslint-disable react-hooks/immutability -- A stable imperative runtime keeps scroll updates out of React renders. */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { StoryRuntime } from "./story-runtime";

const MODEL = "/models/meera-3d/meera-portrait-mesh-v2.glb";

function remap(value: number, start: number, end: number) {
  return THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
}

function phase(value: number, start: number, end: number) {
  const t = remap(value, start, end);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function prepareModel(source: THREE.Group) {
  const model = source.clone(true);
  const ownedGeometries: THREE.BufferGeometry[] = [];
  const ownedMaterials: THREE.Material[] = [];

  model.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    const geometry = mesh.geometry.clone();
    if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
    mesh.geometry = geometry;
    mesh.frustumCulled = false;
    ownedGeometries.push(geometry);

    const sourceMaterials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    const materials = sourceMaterials.map((sourceMaterial) => {
      const material = sourceMaterial.clone();
      if (material instanceof THREE.MeshStandardMaterial) {
        material.vertexColors = Boolean(geometry.getAttribute("color"));
        material.roughness = Math.max(material.roughness, 0.72);
        material.metalness = 0;
      }
      ownedMaterials.push(material);
      return material;
    });
    mesh.material = Array.isArray(mesh.material) ? materials : materials[0];
  });

  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const scale = 2.12 / Math.max(size.y, 0.001);
  model.position.set(-center.x, -center.y, -center.z);

  return { model, ownedGeometries, ownedMaterials, scale };
}

function MeeraModel({
  runtime,
  onReady,
  modelUrl,
  frontYaw,
}: {
  runtime: StoryRuntime;
  onReady?: () => void;
  modelUrl: string;
  frontYaw: number;
}) {
  const gltf = useGLTF(modelUrl);
  const root = useRef<THREE.Group>(null);
  const { invalidate, size } = useThree();
  const compact = size.width < 900;
  const prepared = useMemo(() => prepareModel(gltf.scene), [gltf.scene]);

  useEffect(() => {
    runtime.invalidate = invalidate;
    onReady?.();
    invalidate();
    return () => {
      runtime.invalidate = null;
    };
  }, [invalidate, onReady, runtime]);

  useEffect(
    () => () => {
      prepared.ownedGeometries.forEach((geometry) => geometry.dispose());
      prepared.ownedMaterials.forEach((material) => material.dispose());
    },
    [prepared],
  );

  useFrame(() => {
    if (!root.current) return;
    const progress = runtime.progress;

    // Meera starts as a complete, authored model after the Noor scene has
    // already left. Nothing in this scene is paired with Noor's topology.
    const arrival = phase(progress, 0.7, 0.79);
    const secondTurn = phase(progress, 0.835, 0.94);
    const pointerWindow =
      phase(progress, 0.775, 0.815) * (1 - phase(progress, 0.94, 0.97));
    const yaw =
      THREE.MathUtils.lerp(0.32, -0.04, arrival) -
      secondTurn * 0.18 +
      runtime.pointerX * pointerWindow * 0.03;
    const pitch =
      THREE.MathUtils.lerp(0.035, -0.012, arrival) -
      runtime.pointerY * pointerWindow * 0.022;

    root.current.visible = progress >= 0.688;
    root.current.rotation.set(pitch, frontYaw + yaw, 0);
    root.current.position.set(
      compact ? 0 : -1.12,
      compact ? 0.12 : -0.12,
      THREE.MathUtils.lerp(-0.12, 0, arrival),
    );
    root.current.scale.setScalar(
      prepared.scale * THREE.MathUtils.lerp(0.975, 1, arrival),
    );
  });

  return (
    <group ref={root} visible={false}>
      <primitive object={prepared.model} />
    </group>
  );
}

export default function MeeraStoryCanvas({
  runtime,
  onContextLost,
  onReady,
  modelUrl = MODEL,
  frontYaw = Math.PI,
}: {
  runtime: StoryRuntime;
  onContextLost: () => void;
  onReady?: () => void;
  modelUrl?: string;
  frontYaw?: number;
}) {
  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [0, 0.02, 4.35], fov: 32, near: 0.1, far: 20 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
      onCreated={({ gl, camera, invalidate, scene }) => {
        const canvas = gl.domElement;
        const lost = (event: Event) => {
          event.preventDefault();
          onContextLost();
        };
        canvas.addEventListener("webglcontextlost", lost, { once: true });
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.06;
        gl.compile(scene, camera);
        invalidate();
      }}
    >
      <hemisphereLight args={["#fffaf5", "#4b3540", 1.65]} />
      <directionalLight color="#fff4ec" position={[-3.2, 3.8, 4.6]} intensity={2.8} />
      <directionalLight color="#dbe4ff" position={[3.5, 1.2, 3.4]} intensity={0.95} />
      <directionalLight color="#b04d70" position={[2.2, 2.4, -3]} intensity={1.1} />
      <MeeraModel
        runtime={runtime}
        onReady={onReady}
        modelUrl={modelUrl}
        frontYaw={frontYaw}
      />
    </Canvas>
  );
}

useGLTF.preload(MODEL);
