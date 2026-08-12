import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Generated so there is no binary favicon to keep in sync with the palette.
 * Ember on the warm black, matching the wordmark.
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
          background: "#12110E",
          color: "#F0653A",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "-0.06em",
          fontFamily: "sans-serif",
        }}
      >
        V
      </div>
    ),
    size,
  );
}
