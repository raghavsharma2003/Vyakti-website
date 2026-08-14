"use client";

import Image from "next/image";
import { useRef } from "react";
import styles from "./meera-portrait.module.css";

type MeeraPortraitProps = {
  className?: string;
  preload?: boolean;
  sizes?: string;
};

export function MeeraPortrait({
  className = "",
  preload = false,
  sizes = "(max-width: 767px) 100vw, 52vw",
}: MeeraPortraitProps) {
  const root = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    root.current?.style.setProperty("--portrait-x", `${x * -1.45}%`);
    root.current?.style.setProperty("--portrait-y", `${y * -1.05}%`);
  };

  const resetPointer = () => {
    root.current?.style.setProperty("--portrait-x", "0%");
    root.current?.style.setProperty("--portrait-y", "0%");
  };

  return (
    <div
      ref={root}
      className={[styles.root, className].join(" ")}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      aria-hidden="true"
    >
      <Image
        src="/images/meera-portrait-v1.webp"
        alt=""
        fill
        preload={preload}
        sizes={sizes}
        className={styles.image}
      />
      <span className={styles.colorSignature} />
    </div>
  );
}
