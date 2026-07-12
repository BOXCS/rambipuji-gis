import type {
  AdminUser,
  AuthToken,
  DesaProfile,
  DesaProfileResponse,
  KategoriSlug,
  PotensiCollection,
  PotensiFeature,
  StatistikData,
  StatistikResponse,
} from "../types";

function getBaseUrl(): string {
  if (typeof window === "undefined") {
    // Running server-side inside Docker container
    return process.env.INTERNAL_API_URL ?? "http://backend:8000/api";
  }
  // Running client-side in browser
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8888/api";
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;

  const headers = new Headers(options.headers || {});
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
    try {
      const errorBody = await response.json();
      console.error("API error detail:", errorBody);
      if (
        errorBody &&
        errorBody.errors &&
        typeof errorBody.errors === "object"
      ) {
        const details = Object.entries(
          errorBody.errors as Record<string, unknown>
        )
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        errorMessage = `${errorBody.message || "Validasi gagal"} (${details})`;
      } else if (errorBody && typeof errorBody.message === "string") {
        errorMessage = errorBody.message;
      } else if (errorBody && typeof errorBody.detail === "string") {
        errorMessage = errorBody.detail;
      } else if (errorBody && typeof errorBody === "object") {
        errorMessage = JSON.stringify(errorBody);
      }
    } catch {
      // ignore non-json body
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

function attachKategoriToCollection(
  collection: PotensiCollection,
  kategori: KategoriSlug
): PotensiCollection {
  return {
    ...collection,
    features: (collection.features || []).map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        kategori,
      },
    })),
  };
}

function attachKategoriToFeature(
  feature: PotensiFeature,
  kategori: KategoriSlug
): PotensiFeature {
  return {
    ...feature,
    properties: {
      ...feature.properties,
      kategori,
    },
  };
}

// Public endpoints (no auth)
export async function getPotensiByKategori(
  kategori: KategoriSlug
): Promise<PotensiCollection> {
  const collection = await fetchAPI<PotensiCollection>(
    `public/${kategori}/`
  );
  return attachKategoriToCollection(collection, kategori);
}

export async function getPotensiAll(
  kategori?: KategoriSlug
): Promise<PotensiCollection> {
  if (kategori) {
    return getPotensiByKategori(kategori);
  }

  const slugs: KategoriSlug[] = [
    "pertanian",
    "umkm",
    "wisata",
    "infrastruktur",
  ];
  const results = await Promise.all(
    slugs.map((k) => getPotensiByKategori(k))
  );

  return {
    type: "FeatureCollection",
    features: results.flatMap((r) => r.features || []),
  };
}

export async function getPotensiDetail(
  kategori: KategoriSlug,
  id: number
): Promise<PotensiFeature> {
  const feature = await fetchAPI<PotensiFeature>(
    `public/potensi/${kategori}/${id}/`
  );
  return attachKategoriToFeature(feature, kategori);
}

export async function getStatistik(): Promise<StatistikData> {
  const response = await fetchAPI<StatistikResponse>("public/statistik/");
  return response.data;
}

export async function getDesaProfile(): Promise<DesaProfile> {
  const response = await fetchAPI<DesaProfileResponse>("public/desa/");
  return response.data;
}

export async function getBatasWilayah(): Promise<PotensiCollection> {
  const collection = await fetchAPI<PotensiCollection>(
    "public/batas-wilayah/"
  );
  return attachKategoriToCollection(collection, "batas-wilayah");
}

// Admin endpoints (require token)
export async function adminLogin(
  username: string,
  password: string
): Promise<AuthToken> {
  const response = await fetchAPI<{
    status: string;
    data: AuthToken & { user?: AdminUser };
  }>("auth/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return response.data;
}

export async function adminLogout(token: string): Promise<void> {
  await fetchAPI<void>("auth/logout/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function adminGetPotensiList(
  kategori: KategoriSlug,
  token: string
): Promise<PotensiCollection> {
  const collection = await fetchAPI<PotensiCollection>(
    `admin/potensi/${kategori}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return attachKategoriToCollection(collection, kategori);
}

export async function adminCreatePotensi(
  kategori: KategoriSlug,
  formData: FormData,
  token: string
): Promise<PotensiFeature> {
  formData.forEach((value, key) => {
    console.log("FormData field:", key, value);
  });
  const feature = await fetchAPI<PotensiFeature>(
    `admin/potensi/${kategori}/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );
  return attachKategoriToFeature(feature, kategori);
}

export async function adminUpdatePotensi(
  kategori: KategoriSlug,
  id: number,
  formData: FormData,
  token: string
): Promise<PotensiFeature> {
  formData.forEach((value, key) => {
    console.log("FormData field:", key, value);
  });
  const feature = await fetchAPI<PotensiFeature>(
    `admin/potensi/${kategori}/${id}/`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );
  return attachKategoriToFeature(feature, kategori);
}

export async function adminDeletePotensi(
  kategori: KategoriSlug,
  id: number,
  token: string
): Promise<void> {
  await fetchAPI<void>(`admin/potensi/${kategori}/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function adminImportShapefile(
  formData: FormData,
  token: string
): Promise<{ imported: number; kategori: string; filename: string }> {
  const response = await fetchAPI<{
    status: string;
    data: { imported: number; kategori: string; filename: string };
  }>("admin/import/shapefile/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return response.data;
}
