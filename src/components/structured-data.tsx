import { SITE } from "@/lib/site";

/**
 * Organization plus WebSite JSON-LD. Kept in one script so search engines get
 * a single graph rather than competing top-level entities.
 */
export function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#organization`,
        name: SITE.name,
        alternateName: "व्यक्ति",
        url: SITE.url,
        email: SITE.email,
        description: SITE.description,
        slogan: SITE.tagline,
        knowsAbout: [
          "Relational artificial intelligence",
          "Identity fidelity evaluation",
          "Long-term memory systems",
          "Private-scope conversation architecture",
          "Synthetic voice disclosure and watermarking",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        description: SITE.description,
        publisher: { "@id": `${SITE.url}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE.url}/#rooms`,
        name: "Vyakti Rooms",
        applicationCategory: "Conversational AI",
        description:
          "A creator builds an AI version of themselves, and every follower gets a private, continuing relationship with it. In a hand-built first phase, one creator at a time.",
        url: `${SITE.url}/#rooms`,
        publisher: { "@id": `${SITE.url}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Serialised server side; the content is static and contains no user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
