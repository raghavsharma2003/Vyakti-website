"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL = "/models/meera-3d/meera-portrait-mesh-v2.glb";

function MeeraModel() {
  const root = useRef<THREE.Group>(null);
  const gltf = useGLTF(MODEL);
  const prepared = useMemo(() => {
    const scene = gltf.scene.clone(true);
    scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map((material) => material.clone())
        : mesh.material.clone();
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    const bounds = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);
    const scale = 2.65 / Math.max(size.x, size.y, size.z);
    scene.position.set(-center.x, -center.y, -center.z);
    return { scene, scale };
  }, [gltf.scene]);

  useFrame(({ clock }) => {
    if (!root.current) return;
    root.current.rotation.y = Math.PI - 0.08 + Math.sin(clock.elapsedTime * 0.28) * 0.08;
  });

  return (
    <group ref={root} scale={prepared.scale} rotation={[0.02, Math.PI, 0]}>
      <primitive object={prepared.scene} />
    </group>
  );
}

export function Meera3dPreview() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 34, near: 0.01, far: 30 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows
    >
      <ambientLight intensity={1.45} />
      <directionalLight position={[-3, 4, 5]} intensity={2.2} />
      <directionalLight position={[4, 1, 2]} intensity={0.9} color="#d8b5c2" />
      <Suspense fallback={null}>
        <MeeraModel />
        <Environment preset="studio" environmentIntensity={0.55} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={2.5}
        maxDistance={6}
        minPolarAngle={Math.PI * 0.32}
        maxPolarAngle={Math.PI * 0.68}
      />
    </Canvas>
  );
}

useGLTF.preload(MODEL);
