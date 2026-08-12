/**
 * Derives public/models/head-geo.glb from the canonical upstream head scan.
 *
 * The hero draws the model as a point cloud: normals are recomputed on load,
 * UVs are never sampled and the material is never bound. So the shipped asset
 * is the upstream mesh simplified and stripped down to POSITION plus indices,
 * which takes it from 396 KB to roughly 75 KB.
 *
 * The derived file is committed, and this script is a no-op when it is already
 * present. It only does real work where the binary is absent, which keeps the
 * asset reproducible from its source rather than being an opaque blob whose
 * provenance lives in a commit message.
 *
 * Run `node scripts/build-head-model.mjs --force` to regenerate it.
 */
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import { NodeIO } from "@gltf-transform/core";
import { dedup, prune, simplify, weld } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";

// Pinned to a tag, not a branch, so the input cannot move under us.
const SOURCE_URL =
  "https://raw.githubusercontent.com/mrdoob/three.js/r180/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb";
const SOURCE_SHA256 =
  "402b8a8ac9f03232e6d64b5962929703a069daf99d3c49ac8eb0e48bedc9c576";

// Below this the mouth and nose go blobby at the scale the cloud is drawn.
const SIMPLIFY_RATIO = 0.35;
const SIMPLIFY_ERROR = 0.0015;

const OUT = path.join(process.cwd(), "public", "models", "head-geo.glb");

async function main() {
  const force = process.argv.includes("--force");

  if (existsSync(OUT) && !force) {
    console.log("[head-model] public/models/head-geo.glb present, skipping.");
    return;
  }

  console.log(`[head-model] fetching ${SOURCE_URL}`);
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(
      `[head-model] source fetch failed: ${response.status} ${response.statusText}`,
    );
  }
  const source = Buffer.from(await response.arrayBuffer());

  const digest = createHash("sha256").update(source).digest("hex");
  if (digest !== SOURCE_SHA256) {
    throw new Error(
      `[head-model] source hash mismatch.\n  expected ${SOURCE_SHA256}\n  received ${digest}`,
    );
  }

  const io = new NodeIO();
  const doc = await io.readBinary(source);

  await doc.transform(
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: SIMPLIFY_RATIO, error: SIMPLIFY_ERROR }),
  );

  // Drop everything the point cloud does not read.
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      for (const semantic of primitive.listSemantics()) {
        if (semantic !== "POSITION") primitive.setAttribute(semantic, null);
      }
      primitive.setMaterial(null);
    }
  }

  await doc.transform(dedup(), prune());

  const output = Buffer.from(await io.writeBinary(doc));
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, output);

  const verts = doc
    .getRoot()
    .listMeshes()
    .flatMap((m) => m.listPrimitives())
    .reduce((n, p) => n + (p.getAttribute("POSITION")?.getCount() ?? 0), 0);

  console.log(
    `[head-model] wrote ${path.relative(process.cwd(), OUT)} ` +
      `(${(output.length / 1024).toFixed(1)} KB, ${verts} vertices)`,
  );
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
