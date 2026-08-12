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
        foundingDate: "2026",
        knowsAbout: [
          "Conversational artificial intelligence",
          "Speech synthesis",
          "Turn-taking in dialogue",
          "Affective computing",
          "Human computer interaction",
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
        "@id": `${SITE.url}/meera#software`,
        name: "Meera",
        applicationCategory: "Conversational AI",
        description:
          "A conversational system built to be indistinguishable from a person, with predicted turn ends, instant yielding and persistent identity.",
        url: `${SITE.url}/meera`,
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
