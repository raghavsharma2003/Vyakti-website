# 3D Model Credits

All models below are legally usable (attribution or public-domain licenses).
Verified downloaded, inspected with `@gltf-transform/cli inspect`, and
confirmed as valid binary glTF (`glTF` magic bytes at file start).

---

## 1. `head.glb` / `head-geo.glb` — PRIMARY RECOMMENDATION

**"Infinite" 3D Head Scan by Lee Perry-Smith**

- Source URL (downloaded from): https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb
- Original license file: https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/LeePerrySmith/LeePerrySmith_License.txt
- Author: Lee Perry-Smith / Infinite-Realities (ir-ltd.net), based on a work at triplegangers.com
- Distributed via: the official three.js repository examples (mrdoob/three.js), used in many official three.js demos (e.g. `webgl_materials_bumpmap_skin`)
- **License: Creative Commons Attribution 3.0 Unported (CC BY 3.0)**
- **Required attribution string (use verbatim, per the model's own license file):**
  > "Infinite" 3D Head Scan by Lee Perry-Smith, licensed under CC BY 3.0. Based on a work at www.triplegangers.com. Source: Infinite-Realities (ir-ltd.net), via the three.js project (mrdoob/three.js).

### Files
| File | Size | Vertices | Triangles | Textures | Attributes |
|---|---|---|---|---|---|
| `head.glb` | 396 KB (404,976 bytes) | 9,279 | 17,684 | 0 (none embedded) | NORMAL, POSITION, TEXCOORD_0 |
| `head-geo.glb` | 324 KB (329,888 bytes) | 9,279 | 17,684 | 0 | NORMAL, POSITION, TEXCOORD_0 |

Notes: the source GLB as shipped by three.js has **no embedded textures** —
it is already geometry-only (UVs are present in case you want to apply the
separate diffuse/normal/specular maps from the three.js repo yourself, but
none are required for a point-cloud/wireframe look). `head-geo.glb` is a
`gltf-transform prune`-passed copy with an unused empty auxiliary scene/node
removed; both files are otherwise geometry-identical. Neither needed
optimization — both are far under the 8 MB budget.

---

## 2. `bust.glb` / `bust-geo.glb` — ALTERNATE (classical bust aesthetic)

**Marble Bust 01**

- Source URL (asset page): https://polyhaven.com/a/marble_bust_01
- Downloaded via Poly Haven public API (`api.polyhaven.com`), 1K glTF + textures variant:
  - https://dl.polyhaven.org/file/ph-assets/Models/gltf/1k/marble_bust_01/marble_bust_01_1k.gltf
  - https://dl.polyhaven.org/file/ph-assets/Models/gltf/8k/marble_bust_01/marble_bust_01.bin
  - https://dl.polyhaven.org/file/ph-assets/Models/jpg/1k/marble_bust_01/marble_bust_01_{diff,nor_gl,rough}_1k.jpg
- Author: Rico Cilliers (Poly Haven)
- **License: CC0 1.0 (Public Domain).** All Poly Haven assets are CC0 — no attribution legally required.
- **Attribution string (optional, courtesy credit):**
  > "Marble Bust 01" by Rico Cilliers, via Poly Haven (polyhaven.com), CC0.

### Files
| File | Size | Vertices | Triangles | Textures | Attributes |
|---|---|---|---|---|---|
| `bust.glb` | 880 KB (897,296 bytes) | 9,746 | 17,456 | 3 embedded (baseColor, normal, metallicRoughness — 1K JPGs) | NORMAL, POSITION, TEXCOORD_0 |
| `bust-geo.glb` | 332 KB (339,692 bytes) | 9,746 | 17,456 | 0 (stripped) | NORMAL, POSITION, TEXCOORD_0 |

Source glTF + separate texture files (as downloaded from Poly Haven, 1K
resolution) are kept in `bust/` for reference / if you want to rebuild at
higher texture resolution (2K/4K/8K available at the source URLs above).

Notes: `bust.glb` was assembled from Poly Haven's split gltf+bin+textures
package into a single self-contained binary via `gltf-transform copy`.
`bust-geo.glb` has all texture references removed and unused image/texture
resources pruned via `@gltf-transform/functions` `prune()` — pure geometry,
ideal for a point cloud. Both are well under the 8 MB budget; no further
optimization/decimation was needed.

---

## Inspection method

```
npm i -g @gltf-transform/cli   # (or install locally)
gltf-transform inspect <file>.glb
```

Texture-stripped variants were produced with a small Node script using
`@gltf-transform/core` + `@gltf-transform/functions`:

```js
import { NodeIO } from '@gltf-transform/core';
import { prune } from '@gltf-transform/functions';

const io = new NodeIO();
const doc = await io.read(inputPath);
for (const material of doc.getRoot().listMaterials()) {
  material.setBaseColorTexture(null);
  material.setNormalTexture(null);
  material.setMetallicRoughnessTexture(null);
  material.setOcclusionTexture(null);
  material.setEmissiveTexture(null);
}
await doc.transform(prune());
await io.write(outputPath, doc);
```

## Recommendation

**Use `head-geo.glb` as the hero point-cloud/wireframe model.** It is a
genuine high-resolution human face/head laser scan (not a stylized/sculpted
bust), has clean topology with normals and UVs, 9,279 vertices (just under
the 10k target but a dense, well-distributed real face scan that reads very
well as a point cloud at that density), zero embedded texture weight, and a
tiny 324 KB footprint — no further compression is necessary. Its CC BY 3.0
license only requires the attribution string above (e.g. in a footer credits
section or an HTML comment).

`bust-geo.glb` (Marble Bust 01, CC0) is a strong aesthetic alternate if a
"digital sculpture" / classical look fits the brand better than a literal
face scan — and it needs no attribution at all since it is CC0.
