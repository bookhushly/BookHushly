import { createStaticClient } from "@/lib/supabase/server";

const BASE = "https://bookhushly.com";

export default async function sitemap() {
  // ─── Static pages ─────────────────────────────────────────────────────────
  const staticPages = [
    { url: BASE, priority: 1.0, changeFrequency: "daily" },
    { url: `${BASE}/services`, priority: 0.95, changeFrequency: "daily" },
    { url: `${BASE}/services?category=hotels`, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE}/services?category=serviced_apartments`, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE}/services?category=events`, priority: 0.85, changeFrequency: "daily" },
    { url: `${BASE}/services?category=logistics`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/services?category=security`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/quote-services`, priority: 0.85, changeFrequency: "weekly" },
    { url: `${BASE}/search`, priority: 0.8, changeFrequency: "daily" },
    { url: `${BASE}/about`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/contact`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/blog`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/careers`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/help`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/privacy`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/terms`, priority: 0.3, changeFrequency: "yearly" },
  ].map((p) => ({ ...p, lastModified: new Date() }));

  // ─── Dynamic pages ─────────────────────────────────────────────────────────
  let hotelPages = [];
  let apartmentPages = [];

  try {
    const supabase = createStaticClient();

    const [{ data: hotels }, { data: apartments }] = await Promise.all([
      supabase.from("hotels").select("id, updated_at").eq("status", "active"),
      supabase.from("serviced_apartments").select("id, updated_at").eq("status", "active"),
    ]);

    hotelPages = (hotels ?? []).map((h) => ({
      url: `${BASE}/services/hotels/${h.id}`,
      lastModified: h.updated_at ? new Date(h.updated_at) : new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    }));

    apartmentPages = (apartments ?? []).map((a) => ({
      url: `${BASE}/services/serviced-apartments/${a.id}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    }));
  } catch {
    // If DB is unreachable during build, skip dynamic pages gracefully
  }

  return [...staticPages, ...hotelPages, ...apartmentPages];
}
