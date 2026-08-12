# 3D asset credits

## head-geo.glb (shipped, used by the hero)

**"Infinite" 3D Head Scan** by Lee Perry-Smith, Infinite-Realities.

- Source: distributed with three.js at
  `examples/models/gltf/LeePerrySmith/LeePerrySmith.glb`
  (<https://github.com/mrdoob/three.js>)
- Licence: **CC BY 3.0** (<https://creativecommons.org/licenses/by/3.0/>)
- Geometry: 9,279 vertices, 17,684 triangles, one mesh, POSITION + NORMAL +
  TEXCOORD_0
- This copy has texture references pruned, since the site renders the model as
  a point cloud and never samples a material.

### Required attribution

Attribution is a licence condition, not a courtesy. It is rendered in the site
footer on every page (`src/components/site-footer.tsx`):

> Head geometry from the Infinite head scan by Lee Perry-Smith,
> Infinite-Realities, licensed CC BY 3.0.

**If the footer credit is ever removed, this model must be removed with it.**

## Alternate, not shipped

If a classical-sculpture look is ever preferred over a human face scan,
**Marble Bust 01** by Rico Cilliers on Poly Haven
(<https://polyhaven.com/a/marble_bust_01>) is **CC0**, needs no attribution, and
has comparable topology (9,746 vertices). It was evaluated and left out to keep
the bundle small; re-download it from Poly Haven rather than restoring it from
git history.

## Regenerating a geometry-only build

Textures are dead weight for a point cloud. To strip them from a fresh
download:

```bash
npx @gltf-transform/cli prune input.glb head-geo.glb
```
