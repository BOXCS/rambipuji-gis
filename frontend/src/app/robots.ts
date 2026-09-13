import type { MetadataRoute } from "next"

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL
  ?? "https://rambipuji.desa.id"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/peta", "/potensi", "/tentang"],
        disallow: ["/admin/", "/login", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
