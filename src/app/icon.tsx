import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Generated so there is no binary favicon to keep in sync with the palette.
 * A reduced mark for tiny sizes: the Devanagari headline, a continuous V and
 * one individual point. The full lockup uses the authentic `व्य` glyph.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8F8F5",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <path d="M5 7H27" stroke="#0C0E0D" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M8.5 10C9.2 16.6 11.5 22.4 16 26.2C20.5 22.4 22.8 16.6 23.5 10" stroke="#0C0E0D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="14" r="2.1" fill="#C83F2D" />
        </svg>
      </div>
    ),
    size,
  );
}
