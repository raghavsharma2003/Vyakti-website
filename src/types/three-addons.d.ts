/**
 * `setRandomGenerator` exists on MeshSurfaceSampler at runtime (three r18x) but
 * is missing from @types/three. Declaration merging adds it back without
 * casting the sampler to `any` at the call site.
 */
declare module "three/examples/jsm/math/MeshSurfaceSampler.js" {
  interface MeshSurfaceSampler {
    setRandomGenerator(randomFunction: () => number): this;
  }
}

export {};
