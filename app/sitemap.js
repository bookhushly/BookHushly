// app/sitemap.js
import { SCATEGORIES } from "@/lib/constants";

export default function sitemap() {
  const baseUrl = "https://bookhushly.com";

  // Generate service category pages
  const servicePages = SCATEGORIES.map((category) => ({
    url: `${baseUrl}/services?category=${category.value}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...servicePages,
    {
      url: `${baseUrl}/quote-services`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
