export type FaceConcept = {
  slug: string;
  name: string;
  thesis: string;
  description: string;
  model: string;
};

export const FACE_CONCEPTS: FaceConcept[] = [
  {
    slug: "quiet-human",
    name: "The Quiet Human",
    thesis: "Familiar, but deliberately unfinished.",
    description:
      "A calm synthetic woman with a porcelain surface, graphite construction lines and restrained human micro-expression.",
    model: "/models/face-lab/quiet-human.glb",
  },
  {
    slug: "continuum",
    name: "Continuum",
    thesis: "One identity, drawn without interruption.",
    description:
      "A face built from continuous contour bands. The structure tightens around attention and loosens while thinking.",
    model: "/models/face-lab/continuum.glb",
  },
  {
    slug: "murmuration",
    name: "Murmuration",
    thesis: "A person held together by attention.",
    description:
      "Thousands of dark samples form a precise face. Speech moves through the cloud and attention gathers it back together.",
    model: "/models/face-lab/murmuration.glb",
  },
  {
    slug: "veil",
    name: "The Veil",
    thesis: "Presence beneath the surface.",
    description:
      "Nested translucent membranes align when listening, separate while reflecting and reveal depth without simulating skin.",
    model: "/models/face-lab/veil.glb",
  },
  {
    slug: "glyph",
    name: "The Glyph",
    thesis: "The minimum shape that still feels like someone.",
    description:
      "A living portrait reduced to ink, edge and negative space. Expression comes from line weight, curvature and rhythm.",
    model: "/models/face-lab/glyph.glb",
  },
];
