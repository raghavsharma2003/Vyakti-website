import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { PAPERS, RELEASES } from "@/lib/research";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", priority: 1, changeFrequency: "monthly" as const },
    { path: "/research", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/meera", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/company", priority: 0.7, changeFrequency: "monthly" as const },
    // Papers and releases come from the content module, so publishing one is
    // a data edit rather than a code edit here.
    ...PAPERS.map((paper) => ({
      path: `/research/papers/${paper.slug}`,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    })),
    ...RELEASES.map((release) => ({
      path: `/research/releases/${release.slug}`,
      priority: 0.6,
      changeFrequency: "monthly" as const,
    })),
  ];

  const lastModified = new Date("2026-08-18T00:00:00.000Z");

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
