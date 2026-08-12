export const SITE = {
  name: "Vyakti",
  domain: "vyakti.ai",
  url: "https://vyakti.ai",
  // व्यक्ति (Sanskrit): a person; the individual; that which is made manifest.
  tagline: "An AI research lab building machines you cannot tell from people",
  description:
    "Vyakti is an AI research lab working on human indistinguishability across voice, text and video: real turn-taking, emotion that is felt rather than labelled, memory that accrues, and culture that shapes how a system speaks. Makers of Meera.",
  locale: "en_US",
  twitter: "@vyakti_ai",
  email: "hello@vyakti.ai",
  careers: "careers@vyakti.ai",
} as const;

export const NAV = [
  { label: "Research", href: "/research" },
  { label: "Meera", href: "/meera" },
  { label: "Company", href: "/company" },
] as const;

export const FOOTER_GROUPS = [
  {
    title: "Research",
    links: [
      { label: "Overview", href: "/research" },
      { label: "Turn-taking", href: "/research#turn-taking" },
      { label: "Affect", href: "/research#affect" },
      { label: "Persona", href: "/research#persona" },
      { label: "Culture", href: "/research#culture" },
      { label: "Evaluation", href: "/research#evaluation" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Meera", href: "/meera" },
      { label: "What it does", href: "/meera#capabilities" },
      { label: "Request access", href: "/meera#access" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/company" },
      { label: "Careers", href: "/company#careers" },
      { label: "Contact", href: "/company#contact" },
    ],
  },
] as const;

/**
 * The four things a person does in conversation that machines still do not.
 * These are the lab's research tracks and they order every page on the site.
 */
export const PILLARS = [
  {
    id: "turn-taking",
    title: "Turn-taking",
    summary:
      "People do not wait for silence. They read breath, pitch and syntax to know a turn is ending, and they start speaking into the gap.",
    detail:
      "Most voice systems detect silence and then respond, which is why they interrupt when you pause to think and stall when you have clearly finished. We model the end of a turn as something predicted from prosody and syntax rather than something measured with a timer, and we let the system yield the floor the instant you take it back.",
    terms: ["Full-duplex", "Endpointing", "Barge-in", "Backchannel"],
  },
  {
    id: "affect",
    title: "Affect",
    summary:
      "Emotion in speech is carried by timing, pitch contour and breath, not by an adjective the model picks from a list.",
    detail:
      "Labelling a sentence happy and rendering it with a happy voice preset is not emotion, it is costume. We work on affect as a continuous state that persists across a conversation, moves for a reason, and shows up in how a line is timed and stressed rather than in what it says about itself.",
    terms: ["Prosody", "Paralinguistics", "Disfluency", "Expressive synthesis"],
  },
  {
    id: "persona",
    title: "Persona",
    summary:
      "A person is the same person tomorrow. They have a history, opinions they will defend, and things they are wrong about.",
    detail:
      "Consistency is what separates a character from a chat session. We work on stable identity under pressure: a backstory the system will not contradict, preferences that hold across weeks, memory that accrues into something like a relationship, and the willingness to disagree with you.",
    terms: ["Identity consistency", "Long-horizon memory", "Grounding"],
  },
  {
    id: "culture",
    title: "Culture",
    summary:
      "How close you stand, how fast you interrupt, when silence is comfortable. None of this is universal, and all of it is learned.",
    detail:
      "Conversational norms are local. Overlap that reads as warm engagement in one place reads as rudeness in another, and the register you use with a colleague is not the one you use with your mother. We work on systems that carry a specific cultural register rather than an averaged one, and that code-switch the way bilingual people actually do.",
    terms: ["Register", "Code-switching", "Politeness strategy", "Idiom"],
  },
] as const;
