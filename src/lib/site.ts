export const SITE = {
  name: "Vyakti",
  domain: "vyakti.ai",
  url: "https://vyakti.ai",
  tagline: "A relational intelligence lab.",
  description:
    "Vyakti researches AI identities that build shared context over time and remain recognizable as the models beneath them change. Meera is our first product in development.",
  locale: "en_US",
  twitter: "@vyakti_ai",
  email: "hello@vyakti.ai",
  careers: "careers@vyakti.ai",
} as const;

export const NAV = [
  { label: "Research", href: "/research" },
  { label: "Meera", href: "/meera" },
  { label: "Principles", href: "/#principles" },
  { label: "Company", href: "/company" },
] as const;

export const FOOTER_GROUPS = [
  {
    title: "Explore",
    links: [
      { label: "Research", href: "/research" },
      { label: "Meera", href: "/meera" },
      { label: "Principles", href: "/#principles" },
    ],
  },
  {
    title: "Lab",
    links: [
      { label: "Company", href: "/company" },
      { label: "Careers", href: "/company#careers" },
      { label: "Contact", href: "/company#contact" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Request access", href: "/meera#access" },
      { label: "Email the lab", href: "mailto:hello@vyakti.ai" },
    ],
  },
] as const;

export const PILLARS = [
  {
    id: "identity",
    title: "Identity",
    short: "Character that holds.",
    summary:
      "Preferences are easy. A coherent identity is harder: a voice, point of view, values and contradictions that remain recognisable without preventing growth.",
    detail:
      "We research architectures that preserve character across topics, situations and model upgrades. The goal is not a rigid script, but a stable centre: opinions that can be defended, boundaries that mean something, and change that has a reason.",
    terms: ["Persona consistency", "Social reasoning", "Value stability"],
  },
  {
    id: "memory",
    title: "Memory",
    short: "History with meaning.",
    summary:
      "Memory should do more than retrieve facts. It should recognise what mattered, to whom and why, so a relationship can continue instead of restart.",
    detail:
      "We work on long-horizon memory that consolidates experience into reflection, distinguishes a passing detail from a meaningful moment, and forgets deliberately. Recall should appear as familiarity, not as a database result read aloud.",
    terms: ["Long-horizon memory", "Salience", "Reflection", "Forgetting"],
  },
  {
    id: "perception",
    title: "Perception",
    short: "More than the words.",
    summary:
      "Conversation also lives in tone, timing, expression, context and what goes unsaid. We build models that reason across the signals people choose to share.",
    detail:
      "A pause can mean uncertainty, invitation, annoyance or nothing at all. Perception means integrating language with prosody, gaze, gesture and context, while making clear what the system can sense.",
    terms: ["Multimodal understanding", "Prosody", "Gaze", "Context"],
  },
  {
    id: "expression",
    title: "Expression",
    short: "One state. Many signals.",
    summary:
      "Language, voice, gaze, facial motion and reaction should feel like expressions of the same underlying moment, not separate models performing beside one another.",
    detail:
      "We work on full-duplex speech, affective voice and embodied response. The seams matter: when to enter, when to yield, how silence feels, and whether the face says the same thing as the voice.",
    terms: ["Full-duplex voice", "Affect", "Facial motion", "Timing"],
  },
  {
    id: "agency",
    title: "Agency",
    short: "Initiative within boundaries.",
    summary:
      "A companion should be capable of curiosity, reflection and initiative without becoming controlling. Agency must remain legible and interruptible.",
    detail:
      "We explore systems that can act on their own train of thought while keeping the user in control. Initiative is useful only when its reasons, permissions and limits are understandable.",
    terms: ["Planning", "Initiative", "User control", "Alignment"],
  },
] as const;
