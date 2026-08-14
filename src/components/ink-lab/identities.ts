export type InkIdentity = {
  slug: string;
  name: string;
  group: "Female" | "Male" | "Androgynous";
  character: string;
  description: string;
  model: string;
  inkBias: number;
  dotScale: number;
};

export const INK_IDENTITIES: InkIdentity[] = [
  {
    slug: "feminine-soft",
    name: "Meera",
    group: "Female",
    character: "Warm, observant, quietly expressive.",
    description: "A softer jaw and compact features give the ink treatment a calm, approachable presence.",
    model: "/models/ink-lab/feminine-soft.glb?v=mouth2",
    inkBias: 0.04,
    dotScale: 1.05,
  },
  {
    slug: "feminine-sculpted",
    name: "Eleni",
    group: "Female",
    character: "Composed, sculptural, slowly confident.",
    description: "A longer profile and clearer cheek structure create a more editorial, fashion-led silhouette.",
    model: "/models/ink-lab/feminine-sculpted.glb?v=mouth2",
    inkBias: -0.03,
    dotScale: 0.9,
  },
  {
    slug: "feminine-angular",
    name: "Imani",
    group: "Female",
    character: "Direct gaze, vivid reaction, fast warmth.",
    description: "Sharper planes hold the black fields longer, giving turns and expressions more graphic force.",
    model: "/models/ink-lab/feminine-angular.glb?v=mouth2",
    inkBias: -0.08,
    dotScale: 0.82,
  },
  {
    slug: "masculine-calm",
    name: "Kabir",
    group: "Male",
    character: "Grounded, kind, unhurried.",
    description: "Balanced proportions and a restrained brow make this the most conversational masculine direction.",
    model: "/models/ink-lab/masculine-calm.glb?v=mouth2",
    inkBias: 0.02,
    dotScale: 1,
  },
  {
    slug: "masculine-strong",
    name: "Ade",
    group: "Male",
    character: "Energetic, decisive, openly expressive.",
    description: "A broader jaw and stronger cheek planes produce the boldest light-to-ink transitions in the set.",
    model: "/models/ink-lab/masculine-strong.glb?v=mouth2",
    inkBias: -0.1,
    dotScale: 0.8,
  },
  {
    slug: "masculine-lean",
    name: "Theo",
    group: "Male",
    character: "Reflective, precise, quietly intense.",
    description: "A narrower silhouette and longer facial rhythm feel thoughtful without becoming severe.",
    model: "/models/ink-lab/masculine-lean.glb?v=mouth2",
    inkBias: 0.07,
    dotScale: 1.12,
  },
  {
    slug: "androgynous-soft",
    name: "Noor",
    group: "Androgynous",
    character: "Soft ambiguity, deep attention.",
    description: "Soft planes and an ambiguous silhouette keep attention on expression rather than category.",
    model: "/models/ink-lab/androgynous-soft.glb?v=mouth2",
    inkBias: 0,
    dotScale: 1.16,
  },
  {
    slug: "androgynous-angular",
    name: "Ari",
    group: "Androgynous",
    character: "Curious, agile, emotionally transparent.",
    description: "An angular neutral form makes the chosen ink language feel most like a proprietary Vyakti symbol.",
    model: "/models/ink-lab/androgynous-angular.glb?v=mouth2",
    inkBias: -0.13,
    dotScale: 0.74,
  },
];
