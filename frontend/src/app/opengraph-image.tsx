import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "WebGIS Potensi Desa Rambipuji"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #1D6A47 0%, #0f3d28 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "white",
            marginBottom: 16,
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          WebGIS Potensi Desa Rambipuji
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.8)",
            textAlign: "center",
          }}
        >
          Kec. Rambipuji · Kab. Jember · Jawa Timur
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 20,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Pertanian · UMKM · Wisata · Infrastruktur
        </div>
      </div>
    ),
    { ...size }
  )
}
