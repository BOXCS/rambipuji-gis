import type * as GeoJSON from "geojson";

export type KategoriSlug =
  | "pertanian"
  | "umkm"
  | "wisata"
  | "infrastruktur"
  | "batas-wilayah";

export interface PotensiProperties {
  id: number;
  nama?: string; // pertanian, wisata, infrastruktur
  nama_usaha?: string; // umkm
  nama_wilayah?: string; // batas-wilayah
  foto?: string | null; // absolute URL or null
  kategori: KategoriSlug; // added client-side from the endpoint context
  // detail fields (only on detail responses):
  deskripsi?: string;
  kontak?: string;
  nama_pemilik?: string; // pertanian, umkm
  komoditas?: string; // pertanian
  luas_ha?: number; // pertanian
  musim_tanam?: string; // pertanian
  jenis_produk?: string; // umkm
  jam_operasional?: string; // umkm
  harga_tiket?: string; // wisata
  jam_kunjungan?: string; // wisata
  jenis_fasilitas?: string; // infrastruktur
  kondisi?: string; // infrastruktur
  kapasitas?: string; // infrastruktur
  created_at?: string;
  updated_at?: string;
}

export interface PotensiFeature {
  id?: number;
  type: "Feature";
  geometry: GeoJSON.Point | GeoJSON.Polygon | GeoJSON.MultiPolygon;
  properties: PotensiProperties;
}

export interface PotensiCollection {
  type: "FeatureCollection";
  features: PotensiFeature[];
}

export interface StatistikData {
  pertanian: number;
  umkm: number;
  wisata: number;
  infrastruktur: number;
  total: number;
}

export interface StatistikResponse {
  status: "ok" | "error";
  data: StatistikData;
}

export interface DesaProfile {
  nama_desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  jumlah_penduduk: number;
  luas_wilayah_ha: number;
  jumlah_dusun: number;
  visi: string;
  misi: string[];
  kontak: {
    alamat: string;
    telepon: string;
    email: string;
    jam: string;
  };
}

export interface DesaProfileResponse {
  status: "ok" | "error";
  data: DesaProfile;
}

// Auth
export interface AuthToken {
  access_token: string;
  user?: AdminUser;
}

// Admin
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: "superadmin" | "operator";
}
