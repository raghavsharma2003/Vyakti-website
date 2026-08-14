import { ImageResponse } from "next/og";

export const alt =
  "Vyakti, a relational intelligence lab";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F8F8F5",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Warm light offset to the right, echoing the face on the site. */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -160,
            width: 720,
            height: 720,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(200,63,45,0.18) 0%, rgba(200,63,45,0.04) 45%, rgba(248,248,245,0) 70%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
            <path d="M5 7H27" stroke="#0C0E0D" strokeWidth="2" strokeLinecap="round" />
            <path d="M8.5 10C9.2 16.6 11.5 22.4 16 26.2C20.5 22.4 22.8 16.6 23.5 10" stroke="#0C0E0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="14" r="2.1" fill="#C83F2D" />
          </svg>
          <div
            style={{
              fontSize: 34,
              fontWeight: 600,
              color: "#0C0E0D",
              letterSpacing: "-0.03em",
            }}
          >
            vyakti
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Satori needs every multi-child div to declare display, so the
              two-tone headline is built as two single-text rows. */}
          <div
            style={{
              fontSize: 74,
              lineHeight: 1.08,
              fontWeight: 500,
              letterSpacing: "-0.038em",
              color: "#0C0E0D",
              maxWidth: 960,
            }}
          >
            Intelligence is becoming abundant.
          </div>
          <div
            style={{
              fontSize: 74,
              lineHeight: 1.08,
              fontWeight: 500,
              letterSpacing: "-0.038em",
              color: "#C83F2D",
              maxWidth: 960,
            }}
          >
            Continuity is not.
          </div>
          <div
            style={{
              marginTop: 30,
              fontSize: 27,
              color: "#55564F",
              letterSpacing: "-0.01em",
            }}
          >
            A relational intelligence lab. Meera is our first product in development.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
