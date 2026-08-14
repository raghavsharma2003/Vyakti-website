# Meera 3D studies

## `meera-portrait-mesh-v2.glb`

The production candidate. It keeps the exact face geometry, texture and -Z
orientation of v1, but stores the portrait texture as RGBA and feathers the
face perimeter into the opaque `MeeraCurlShell`. The forehead uses the widest
blend, followed by the temples and jaw. Its `MeeraFacePortraitBlend` material
is authored with glTF `alphaMode: BLEND`.

Three's `GLTFLoader` maps `BLEND` to `transparent = true` and
`depthWrite = false`, so the opaque curl shell renders beneath the transition
instead of exposing the page background. Integration code should preserve the
loaded material. If it clones or replaces that material, it must also preserve
`transparent = true` and `depthWrite = false`.

The asset's face points toward **-Z**. With the standard Three/R3F camera on
+Z looking at the origin, use `rotation.y = Math.PI` as the front pose and
animate around `Math.PI +/- 0.38` radians for a restrained 22-degree yaw.

Exact production asset data:

- 81,669 vertices and 162,859 triangles across two primitives;
- 5,739,284 bytes;
- SHA-256:
  `6831E438A6223792092B5848491D4AD5676A91D15BAC12A14E6F8577AD92CF32`;
- live Three/R3F QA sheet: `meera-portrait-mesh-v2-turntable.webp`.

TripoSR is MIT-licensed and MediaPipe is Apache-2.0; copies of both upstream
licenses are stored beside the model.

## Generation provenance

- source portrait: `public/images/meera-portrait-v1.webp`;
- TripoSR official Hugging Face Space: background removal enabled, foreground
  ratio `0.86`, marching-cubes resolution `256`;
- MediaPipe Python `0.10.21`, static Face Mesh mode, first 468 landmarks, and
  the upstream `canonical_face_model.obj` triangle topology;
- landmark-to-shell transform: `x = -(u - 0.5) * 1.33`,
  `y = -(v - 0.5) * 1.12`, `z = -0.325 + landmarkZ * 0.82`;
- texture coordinates: `(u, 1 - v)` from the detected portrait landmarks;
- v2 alpha transition: smoothstep distance feather of 34 px at the forehead,
  26 px at the temples, and 18 px at the jaw;
- exported with Trimesh `4.12.2` and `include_normals=True`.
