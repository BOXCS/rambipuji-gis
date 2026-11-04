export type UmkmSubCategorySlug =
  | "olahan-pangan"
  | "kerajinan-seni"
  | "usaha-lainnya";

export interface UmkmSubCategory {
  slug: UmkmSubCategorySlug;
  label: string;
  description: string;
}

export const UMKM_SUB_CATEGORIES: UmkmSubCategory[] = [
  {
    slug: "olahan-pangan",
    label: "Olahan Pangan",
    description:
      "Makanan, minuman, kuliner, olahan tempe, jajanan, dan produk pangan olahan warga",
  },
  {
    slug: "kerajinan-seni",
    label: "Kerajinan & Seni",
    description:
      "Kriya, kerajinan tangan, batik, anyaman, dan karya seni kreatif",
  },
  {
    slug: "usaha-lainnya",
    label: "Usaha Lainnya",
    description:
      "Jasa, perdagangan, toko kelontong, dan ragam usaha produktif lainnya",
  },
];

/**
 * Normalizes any free-form `jenis_produk` string into one of the 3 standard sub-categories.
 * This guarantees that existing database entries (such as "Tempe", "Bakso", "Kripik") automatically
 * categorize into the correct sub-category without breaking any existing data.
 */
export function getUmkmSubCategory(
  jenisProduk?: string | null
): UmkmSubCategory {
  if (!jenisProduk || typeof jenisProduk !== "string") {
    return UMKM_SUB_CATEGORIES[2]; // Default: Usaha Lainnya
  }

  const normalized = jenisProduk.trim().toLowerCase();

  // Exact matches
  if (
    normalized === "olahan pangan" ||
    normalized === "olahan-pangan"
  ) {
    return UMKM_SUB_CATEGORIES[0];
  }
  if (
    normalized === "kerajinan dan seni" ||
    normalized === "kerajinan & seni" ||
    normalized === "kerajinan seni" ||
    normalized === "kerajinan-seni"
  ) {
    return UMKM_SUB_CATEGORIES[1];
  }
  if (
    normalized === "usaha lainnya" ||
    normalized === "usaha-lainnya"
  ) {
    return UMKM_SUB_CATEGORIES[2];
  }

  // Keyword heuristic matching for existing/legacy free-text data
  const foodKeywords = [
    "pangan",
    "makan",
    "kuliner",
    "tempe",
    "bakso",
    "kripik",
    "keripik",
    "kue",
    "minuman",
    "kopi",
    "tahu",
    "snack",
    "roti",
    "warung",
    "olahan",
    "sambal",
    "dapur",
    "resto",
    "cafe",
    "kedelai",
    "susu",
    "jus",
  ];
  if (foodKeywords.some((kw) => normalized.includes(kw))) {
    return UMKM_SUB_CATEGORIES[0]; // Olahan Pangan
  }

  const craftKeywords = [
    "kerajinan",
    "seni",
    "craft",
    "art",
    "batik",
    "anyam",
    "kriya",
    "kayu",
    "jahit",
    "konveksi",
    "souvenir",
    "tenun",
    "rajut",
    "bambu",
    "lukis",
    "gerabah",
  ];
  if (craftKeywords.some((kw) => normalized.includes(kw))) {
    return UMKM_SUB_CATEGORIES[1]; // Kerajinan & Seni
  }

  return UMKM_SUB_CATEGORIES[2]; // Usaha Lainnya
}

