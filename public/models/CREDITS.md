# 3D asset credits

## head-geo.glb (shipped, used by the hero)

**"Infinite" 3D Head Scan** by Lee Perry-Smith, Infinite-Realities.

- Source: distributed with three.js at
  `examples/models/gltf/LeePerrySmith/LeePerrySmith.glb`
  (<https://github.com/mrdoob/three.js>)
- Licence: **CC BY 3.0** (<https://creativecommons.org/licenses/by/3.0/>)
- Original: 9,279 vertices, 17,684 triangles, POSITION + NORMAL + TEXCOORD_0
- **Shipped copy: 75 KB, POSITION and indices only, simplified to 35% of the
  original triangle count.** The site renders the model as a point cloud, so it
  never samples a material, recomputes normals on load, and ignores UVs.
  Simplification is invisible at the scale the cloud is drawn.

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

## Regenerating the shipped build

Starting from the original `LeePerrySmith.glb`:

```bash
npx @gltf-transform/cli weld    LeePerrySmith.glb welded.glb
npx @gltf-transform/cli simplify welded.glb simplified.glb --ratio 0.35 --error 0.0015
# then drop every attribute except POSITION, and prune the orphaned accessors
```

The last step is a short @gltf-transform/functions script: set each primitive's
non-POSITION semantics and material to null, then run `dedup()` and `prune()`.
Keeping NORMAL and TEXCOORD_0 costs roughly 30 KB and buys nothing here.
