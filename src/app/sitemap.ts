import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { siteConfig } from "@/data/site";

/** Content only changes on deploy, so `lastModified` is pinned to the build that produced it. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("max");

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/makas/support`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
