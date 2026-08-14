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
          "Identity continuity",
          "Long-term memory systems",
          "Multimodal interaction",
          "Conversational turn-taking",
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
          "Vyakti's first product in development: a text and voice AI companion designed around stable identity, selective memory and user-controlled shared context.",
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
