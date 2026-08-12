import { ImageResponse } from "next/og";

export const alt =
  "Vyakti, an AI research lab building machines you cannot tell from people";
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
          backgroundColor: "#12110E",
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
              "radial-gradient(circle, rgba(240,101,58,0.30) 0%, rgba(240,101,58,0.06) 45%, rgba(18,17,14,0) 70%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <div
            style={{
              fontSize: 34,
              fontWeight: 600,
              color: "#F4F1EA",
              letterSpacing: "-0.03em",
            }}
          >
            Vyakti
          </div>
          <div style={{ fontSize: 20, color: "#7A746A" }}>व्यक्ति</div>
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
              color: "#F4F1EA",
              maxWidth: 960,
            }}
          >
            We are building AI that is
          </div>
          <div
            style={{
              fontSize: 74,
              lineHeight: 1.08,
              fontWeight: 500,
              letterSpacing: "-0.038em",
              color: "#F0653A",
              maxWidth: 960,
            }}
          >
            indistinguishable from a person.
          </div>
          <div
            style={{
              marginTop: 30,
              fontSize: 27,
              color: "#A49D91",
              letterSpacing: "-0.01em",
            }}
          >
            An AI research lab. Turn-taking, affect, persona, culture.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
