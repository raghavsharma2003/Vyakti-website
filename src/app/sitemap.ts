import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", priority: 1, changeFrequency: "monthly" as const },
    { path: "/research", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/meera", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/company", priority: 0.7, changeFrequency: "monthly" as const },
  ];

  const lastModified = new Date();

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
