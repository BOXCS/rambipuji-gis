import type { MetadataRoute } from "next"
import { getPotensiByKategori } from "@/lib/api"
import type { KategoriSlug } from "@/types"

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL
  ?? "https://rambipuji.desa.id"

const KATEGORI_LIST: KategoriSlug[] = [
  "pertanian", "umkm", "wisata", "infrastruktur"
]

export default async function sitemap():
  Promise<MetadataRoute.Sitemap> {

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/peta`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/potensi`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tentang`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]

  // Dynamic potensi detail pages
  const dynamicPages: MetadataRoute.Sitemap = []

  for (const kategori of KATEGORI_LIST) {
    try {
      const collection = await getPotensiByKategori(kategori)
      for (const feature of collection.features) {
        const id =
          feature.id
          ?? feature.properties?.id
        if (!id) continue
        dynamicPages.push({
          url: `${BASE_URL}/potensi/${kategori}/${id}`,
          lastModified: feature.properties.updated_at
            ? new Date(feature.properties.updated_at)
            : new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        })
      }
    } catch {
      // Skip category if API fails during build
      continue
    }
  }

  return [...staticPages, ...dynamicPages]
}
