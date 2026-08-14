"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { FACE_CONCEPTS } from "./concepts";
import type { FaceLabRuntime } from "./runtime";
import {
  LAB_FACE_FRAGMENT,
  LAB_FACE_VERTEX,
  LAB_POINTS_FRAGMENT,
  LAB_POINTS_VERTEX,
} from "./shaders";

const CAMERA_Z = 4.15;

const LAB_HAIR_VERTEX = /* glsl */ `
  varying vec3 vBase;
  varying vec3 vNormal;

  void main() {
    vBase = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LAB_HAIR_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform float uOpacity;
  varying vec3 vBase;
  varying vec3 vNormal;

  void main() {
    float hairline = 0.49 + sin(vBase.x * 8.0) * 0.018 - abs(vBase.x) * 0.045;
    float top = step(hairline, vBase.y);
    if (top < 0.5) discard;
    vec3 lightDirection = normalize(vec3(-0.35, 0.68, 0.64));
    float light = 0.54 + max(dot(normalize(vNormal), lightDirection), 0.0) * 0.46;
    vec3 color = mix(vec3(0.065, 0.052, 0.048), vec3(0.20, 0.165, 0.15), light);
    gl_FragColor = vec4(color, uOpacity);
    #include <colorspace_fragment>
  }
`;

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

function normalise(geometry: THREE.BufferGeometry) {
  const next = geometry.clone();
  next.computeBoundingBox();
  const bounds = next.boundingBox!;
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);
  const scale = 2 / Math.max(size.x, size.y, size.z);
  next.translate(-center.x, -center.y, -center.z);
  next.scale(scale, scale, scale);
  next.computeVertexNormals();
  next.computeBoundingSphere();
  return next;
}

function useFaceGeometries() {
  const quiet = useGLTF(FACE_CONCEPTS[0].model);
  const continuum = useGLTF(FACE_CONCEPTS[1].model);
  const murmuration = useGLTF(FACE_CONCEPTS[2].model);
  const veil = useGLTF(FACE_CONCEPTS[3].model);
  const glyph = useGLTF(FACE_CONCEPTS[4].model);
  const scenes = useMemo(
    () => [quiet.scene, continuum.scene, murmuration.scene, veil.scene, glyph.scene],
    [quiet.scene, continuum.scene, murmuration.scene, veil.scene, glyph.scene],
  );
  return useMemo(
    () =>
      scenes.map((scene) => {
        let source: THREE.Mesh | null = null;
        scene.traverse((child) => {
          if (!source && (child as THREE.Mesh).isMesh) source = child as THREE.Mesh;
        });
        return source ? normalise((source as THREE.Mesh).geometry) : null;
      }),
    [scenes],
  );
}

function createPointGeometry(source: THREE.BufferGeometry, count: number) {
  const random = seededRandom(0xface_1ab5);
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
    direction
      .set(random() - 0.5, random() - 0.5, random() - 0.5)
      .normalize();
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

type ConceptLayerProps = {
  runtime: FaceLabRuntime;
  conceptIndex: number;
  geometry: THREE.BufferGeometry;
  pointGeometry: THREE.BufferGeometry;
  topology: THREE.Texture;
};

function ConceptLayer({
  runtime,
  conceptIndex,
  geometry,
  pointGeometry,
  topology,
}: ConceptLayerProps) {
  const root = useRef<THREE.Group>(null);
  const meshes = useRef<THREE.Group>(null);
  const faceMaterial = useRef<THREE.ShaderMaterial>(null);
  const pointsMaterial = useRef<THREE.ShaderMaterial>(null);
  const veilMaterials = useRef<THREE.ShaderMaterial[]>([]);
  const features = useRef<THREE.Group>(null);
  const eyeGroups = useRef<THREE.Group[]>([]);
  const featureMaterials = useRef<THREE.Material[]>([]);
  const mouthInterior = useRef<THREE.Mesh>(null);
  const hairMaterial = useRef<THREE.ShaderMaterial>(null);
  const style = conceptIndex;

  const faceUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLocal: { value: 0 },
      uMouthOpen: { value: 0 },
      uLayer: { value: 0 },
      uExplode: { value: style === 4 ? 0.24 : 0.6 },
      uPointer: { value: new THREE.Vector2() },
      uOpacity: { value: 0 },
      uStyle: { value: style },
      uBaseColor: {
        value: new THREE.Color(
          ["#e3d6cd", "#e9e5df", "#262320", "#e3e9ed", "#f2f0eb"][style],
        ),
      },
      uShadowColor: {
        value: new THREE.Color(
          ["#554b47", "#252321", "#080807", "#77808a", "#151411"][style],
        ),
      },
      uAccent: { value: new THREE.Color("#ef5a39") },
      uTopology: { value: topology },
    }),
    [style, topology],
  );

  const pointsUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLocal: { value: 0 },
      uOpacity: { value: 0 },
      uPointSize: { value: style === 2 ? 8.4 : 5.2 },
      uPixelRatio: { value: 1 },
      uExplode: { value: style === 2 ? 0.95 : 0.5 },
      uStyle: { value: style },
      uPointer: { value: new THREE.Vector2() },
      uBaseColor: {
        value: new THREE.Color(style === 2 ? "#181715" : "#696663"),
      },
      uAccent: { value: new THREE.Color("#ef5a39") },
    }),
    [style],
  );

  useFrame((state, rawDelta) => {
    if (!root.current) return;
    const delta = Math.min(rawDelta, 0.05);
    const scaled = Math.min(4.9999, runtime.progress * 5);
    const activeIndex = Math.floor(scaled);
    const local = scaled - activeIndex;
    const transition =
      activeIndex === 4 ? 0 : THREE.MathUtils.smoothstep(local, 0.78, 0.96);
    let weight = 0;
    let chapterLocal = local;
    if (conceptIndex === activeIndex) weight = 1 - transition;
    if (conceptIndex === activeIndex + 1) {
      weight = transition;
      chapterLocal = Math.max(0, (local - 0.78) / 0.18) * 0.24;
    }
    root.current.visible = weight > 0.002;

    const time = state.clock.elapsedTime;
    if (faceMaterial.current) {
      faceMaterial.current.visible = style !== 2 && weight > 0.002;
    }
    const syllable = Math.min(
      1,
      Math.max(0, Math.sin(time * 8.6)) * 0.72 +
        Math.max(0, Math.sin(time * 13.4 + 1.2)) * 0.38,
    );
    const speakWindow =
      THREE.MathUtils.smoothstep(chapterLocal, 0.34, 0.44) *
      (1 - THREE.MathUtils.smoothstep(chapterLocal, 0.67, 0.78));
    const mouthOpen = speakWindow * syllable;
    const pointerX = damp(
      faceUniforms.uPointer.value.x,
      runtime.pointerX,
      3,
      delta,
    );
    const pointerY = damp(
      faceUniforms.uPointer.value.y,
      runtime.pointerY,
      3,
      delta,
    );

    const materials = [faceMaterial.current, ...veilMaterials.current].filter(
      Boolean,
    ) as THREE.ShaderMaterial[];
    materials.forEach((material, layerIndex) => {
      material.uniforms.uTime.value = time;
      material.uniforms.uLocal.value = chapterLocal;
      material.uniforms.uMouthOpen.value = mouthOpen;
      material.uniforms.uOpacity.value = weight * (style === 3 ? 0.62 : 1);
      material.uniforms.uLayer.value = style === 3 ? layerIndex + 1 : 0;
      material.uniforms.uPointer.value.set(pointerX, pointerY);
    });

    if (pointsMaterial.current) {
      const uniforms = pointsMaterial.current.uniforms;
      uniforms.uTime.value = time;
      uniforms.uLocal.value = chapterLocal;
      uniforms.uOpacity.value =
        weight * (style === 2 ? 0.92 : style === 4 ? 0.5 : 0.22);
      uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.5);
      uniforms.uPointer.value.set(pointerX, pointerY);
    }

    if (features.current) {
      features.current.visible = style !== 2 && weight > 0.002;
      featureMaterials.current.forEach((material) => {
        material.opacity = weight;
      });
    }
    if (hairMaterial.current) {
      hairMaterial.current.uniforms.uOpacity.value = weight;
    }
    eyeGroups.current.forEach((eye) => {
      const blinkPhase = (time * 0.27 + style * 0.17) % 1;
      const blink = Math.exp(-Math.pow((blinkPhase - 0.5) / 0.035, 2));
      eye.rotation.y = pointerX * 0.22;
      eye.rotation.x = -pointerY * 0.16;
      eye.scale.y = 1 - blink * 0.91;
    });
    if (mouthInterior.current) {
      mouthInterior.current.scale.y = 0.004 + mouthOpen * 0.036;
      mouthInterior.current.scale.x = 0.145 - mouthOpen * 0.012;
    }

    const yaw =
      THREE.MathUtils.lerp(-0.5, 0.42, THREE.MathUtils.smoothstep(chapterLocal, 0.08, 0.78)) +
      pointerX * 0.1;
    root.current.rotation.y = damp(root.current.rotation.y, yaw, 4, delta);
    root.current.rotation.x = damp(
      root.current.rotation.x,
      -pointerY * 0.055 + Math.sin(time * 0.35) * 0.009,
      4,
      delta,
    );
    const scale = style === 4 ? 1.04 : style === 3 ? 0.97 : 1;
    root.current.scale.setScalar(scale);
    if (meshes.current) meshes.current.position.z = style === 3 ? -0.02 : 0;
  });

  return (
    <group ref={root}>
      <group ref={meshes}>
        <mesh geometry={geometry} frustumCulled={false}>
          <shaderMaterial
            ref={faceMaterial}
            uniforms={faceUniforms}
            vertexShader={LAB_FACE_VERTEX}
            fragmentShader={LAB_FACE_FRAGMENT}
            transparent={style === 3}
            depthWrite={style !== 3}
            side={THREE.FrontSide}
          />
        </mesh>
        {style === 3 &&
          [0.018, 0.042, 0.072].map((offset, index) => (
            <mesh
              key={offset}
              geometry={geometry}
              scale={1 + offset}
              position={[0, 0, -offset * 0.7]}
              renderOrder={index + 1}
              frustumCulled={false}
            >
              <shaderMaterial
                ref={(material) => {
                  if (material) veilMaterials.current[index] = material;
                }}
                uniforms={THREE.UniformsUtils.clone(faceUniforms)}
                vertexShader={LAB_FACE_VERTEX}
                fragmentShader={LAB_FACE_FRAGMENT}
                transparent
                depthWrite={false}
                side={THREE.FrontSide}
              />
            </mesh>
          ))}
      </group>
      {(style === 2 || style === 4 || style === 0) && (
        <points geometry={pointGeometry} frustumCulled={false} renderOrder={5}>
          <shaderMaterial
            ref={pointsMaterial}
            uniforms={pointsUniforms}
            vertexShader={LAB_POINTS_VERTEX}
            fragmentShader={LAB_POINTS_FRAGMENT}
            transparent
            depthWrite={false}
          />
        </points>
      )}
      {style !== 2 && (
        <group ref={features}>
          {[-0.186, 0.186].map((x, index) => (
            <group
              key={x}
              ref={(eye) => {
                if (eye) eyeGroups.current[index] = eye;
              }}
              position={[x, 0.39, 0.405]}
            >
              <mesh>
                <sphereGeometry args={[0.074, 28, 18]} />
                <meshStandardMaterial
                  ref={(material) => {
                    if (material) featureMaterials.current[index * 3] = material;
                  }}
                  color={style === 3 ? "#d7e0e5" : "#eeeae3"}
                  roughness={0.48}
                  transparent
                />
              </mesh>
              <mesh position={[0, 0, 0.071]}>
                <circleGeometry args={[0.027, 28]} />
                <meshBasicMaterial
                  ref={(material) => {
                    if (material) featureMaterials.current[index * 3 + 1] = material;
                  }}
                  color={style === 1 ? "#ef5a39" : style === 3 ? "#64717a" : "#4b352d"}
                  transparent
                />
              </mesh>
              <mesh position={[0, 0, 0.074]}>
                <circleGeometry args={[0.013, 24]} />
                <meshBasicMaterial
                  ref={(material) => {
                    if (material) featureMaterials.current[index * 3 + 2] = material;
                  }}
                  color="#11110f"
                  transparent
                />
              </mesh>
            </group>
          ))}
          <mesh
            ref={mouthInterior}
            position={[0, -0.025, 0.612]}
            scale={[0.145, 0.006, 0.018]}
            renderOrder={8}
          >
            <sphereGeometry args={[1, 32, 18]} />
            <meshStandardMaterial
              ref={(material) => {
                if (material) featureMaterials.current[6] = material;
              }}
              color={style === 1 ? "#2d1713" : style === 3 ? "#89959d" : "#3b2322"}
              roughness={0.86}
              transparent
            />
          </mesh>
          {style === 0 && (
            <>
              <mesh position={[0, 0.34, -0.2]} scale={[0.59, 0.56, 0.46]}>
                <sphereGeometry args={[1, 48, 32]} />
                <meshStandardMaterial
                  ref={(material) => {
                    if (material) featureMaterials.current[9] = material;
                  }}
                  color="#332a28"
                  roughness={0.92}
                  transparent
                />
              </mesh>
              <mesh geometry={geometry} scale={1.014} frustumCulled={false}>
                <shaderMaterial
                  ref={hairMaterial}
                  uniforms={{ uOpacity: { value: 0 } }}
                  vertexShader={LAB_HAIR_VERTEX}
                  fragmentShader={LAB_HAIR_FRAGMENT}
                  transparent
                  depthWrite
                />
              </mesh>
            </>
          )}
        </group>
      )}
    </group>
  );
}

function FaceLabScene({ runtime }: { runtime: FaceLabRuntime }) {
  const geometries = useFaceGeometries();
  const { invalidate, size } = useThree();
  const topology = useMemo(() => {
    const data = new Uint8Array([255, 255, 255, 255]);
    const texture = new THREE.DataTexture(data, 1, 1);
    texture.needsUpdate = true;
    return texture;
  }, []);
  const compact = size.width < 900;
  const pointGeometries = useMemo(
    () =>
      geometries.map((geometry) =>
        geometry ? createPointGeometry(geometry, compact ? 15_000 : 36_000) : null,
      ),
    [compact, geometries],
  );

  useEffect(() => {
    // The runtime is an imperative bridge between ScrollTrigger and R3F.
    // eslint-disable-next-line react-hooks/immutability
    runtime.invalidate = invalidate;
    invalidate();
    return () => {
      runtime.invalidate = null;
    };
  }, [invalidate, runtime, topology]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      runtime.active = true;
      invalidate();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [invalidate, runtime]);

  useEffect(
    () => () => {
      geometries.forEach((geometry) => geometry?.dispose());
      pointGeometries.forEach((geometry) => geometry?.dispose());
      topology.dispose();
    },
    [geometries, pointGeometries, topology],
  );

  useFrame(() => {
    if (runtime.active && document.visibilityState === "visible") invalidate();
  });

  if (geometries.some((geometry) => !geometry)) return null;

  return (
    <>
      <ambientLight intensity={1.05} />
      <directionalLight position={[-2.8, 3.4, 4.2]} intensity={2.2} />
      {geometries.map((geometry, index) => (
        <ConceptLayer
          key={FACE_CONCEPTS[index].slug}
          runtime={runtime}
          conceptIndex={index}
          geometry={geometry!}
          pointGeometry={pointGeometries[index]!}
          topology={topology}
        />
      ))}
    </>
  );
}

export default function FaceLabCanvas({ runtime }: { runtime: FaceLabRuntime }) {
  return (
    <Canvas
      frameloop="always"
      camera={{ position: [0, 0, CAMERA_Z], fov: 38, near: 0.1, far: 20 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
      onCreated={({ gl, camera, invalidate, scene }) => {
        // eslint-disable-next-line react-hooks/immutability
        runtime.invalidate = invalidate;
        runtime.active = true;
        window.setTimeout(() => {
          gl.compile(scene, camera);
          invalidate();
        }, 180);
      }}
    >
      <FaceLabScene runtime={runtime} />
    </Canvas>
  );
}

FACE_CONCEPTS.forEach((concept) => useGLTF.preload(concept.model));
