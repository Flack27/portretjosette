import { ImageResponse } from "next/og";

export const alt = "Portret door Josette — Realistische portrettekeningen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded social card. Uses satori's default font (basic latin), no external assets.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "#2c3c14",
          color: "#f3f1e6",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#a9b490",
          }}
        >
          Portret in opdracht · Hilvarenbeek
        </div>
        <div style={{ fontSize: 92, marginTop: 28, fontWeight: 600, lineHeight: 1.05 }}>
          Portret door Josette
        </div>
        <div style={{ fontSize: 38, marginTop: 26, color: "#c3ccae" }}>
          Realistische portrettekeningen van mensen en huisdieren
        </div>
      </div>
    ),
    { ...size },
  );
}
