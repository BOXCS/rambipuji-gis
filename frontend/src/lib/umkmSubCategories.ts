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
 * Normalizes any free-form `jenis_produk` string (with fallback to `nama_usaha` and `deskripsi`)
 * into one of the 3 standard sub-categories.
 * This guarantees that existing database entries (such as "Tempe", "Bakso", "Kripik") automatically
 * categorize into the correct sub-category without breaking any existing data, even if `jenis_produk`
 * is empty or not yet explicitly populated.
 */
export function getUmkmSubCategory(
  jenisProduk?: string | null,
  namaUsaha?: string | null,
  deskripsi?: string | null
): UmkmSubCategory {
  const primary = (jenisProduk || "").trim().toLowerCase();
  const secondary = `${(namaUsaha || "").trim()} ${(deskripsi || "").trim()}`.toLowerCase();

  // 1. Exact / Standard matches on jenisProduk
  if (
    primary === "olahan pangan" ||
    primary === "olahan-pangan"
  ) {
    return UMKM_SUB_CATEGORIES[0];
  }
  if (
    primary === "kerajinan dan seni" ||
    primary === "kerajinan & seni" ||
    primary === "kerajinan seni" ||
    primary === "kerajinan-seni"
  ) {
    return UMKM_SUB_CATEGORIES[1];
  }
  if (
    primary === "usaha lainnya" ||
    primary === "usaha-lainnya"
  ) {
    // If explicitly marked as "usaha lainnya", check if secondary gives a specific clue only if primary was a generic default
    return UMKM_SUB_CATEGORIES[2];
  }

  // Keyword heuristic lists
  const foodKeywords = [
    "pangan",
    "makan",
    "kuliner",
    "tempe",
    "tahu",
    "bakso",
    "kripik",
    "keripik",
    "kue",
    "minuman",
    "minum",
    "kopi",
    "cafe",
    "kafe",
    "snack",
    "camilan",
    "cemilan",
    "roti",
    "bakery",
    "warung",
    "olahan",
    "sambal",
    "dapur",
    "resto",
    "restoran",
    "kedelai",
    "susu",
    "jus",
    "juice",
    "catering",
    "katering",
    "madu",
    "jamu",
    "mie",
    "nasi",
    "soto",
    "ayam",
    "bebek",
    "ikan",
    "lele",
    "pecel",
    "gorengan",
    "cilok",
    "pentol",
    "sate",
    "rendang",
    "bumbu",
    "pudding",
    "puding",
    "jajanan",
    "es ",
    "es_",
  ];

  const craftKeywords = [
    "kerajinan",
    "seni",
    "craft",
    "art",
    "batik",
    "anyam",
    "anyaman",
    "kriya",
    "kayu",
    "jahit",
    "konveksi",
    "souvenir",
    "cinderamata",
    "tenun",
    "rajut",
    "bambu",
    "rotan",
    "lukis",
    "lukisan",
    "gerabah",
    "keramik",
    "mebel",
    "furniture",
    "ukir",
    "ukiran",
    "aksesoris",
    "pernak-pernik",
    "bordir",
    "sablon",
    "handmade",
  ];

  // 2. Keyword heuristic matching on jenisProduk
  if (primary) {
    if (foodKeywords.some((kw) => primary.includes(kw))) {
      return UMKM_SUB_CATEGORIES[0]; // Olahan Pangan
    }
    if (craftKeywords.some((kw) => primary.includes(kw))) {
      return UMKM_SUB_CATEGORIES[1]; // Kerajinan & Seni
    }
  }

  // 3. Fallback heuristic matching on nama_usaha / deskripsi (for legacy data or missing field)
  if (secondary) {
    if (foodKeywords.some((kw) => secondary.includes(kw))) {
      return UMKM_SUB_CATEGORIES[0]; // Olahan Pangan
    }
    if (craftKeywords.some((kw) => secondary.includes(kw))) {
      return UMKM_SUB_CATEGORIES[1]; // Kerajinan & Seni
    }
  }

  return UMKM_SUB_CATEGORIES[2]; // Usaha Lainnya
}

