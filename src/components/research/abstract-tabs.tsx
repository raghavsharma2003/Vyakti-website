"use client";

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";

/**
 * Plain language first, technical second.
 *
 * Both abstracts are in the DOM, so search, Ctrl-F and a JS-less visit all
 * work and the plain version is what a no-JS reader sees. The height snaps
 * and only the text crossfades: the two abstracts differ by well over a
 * hundred words, and animating a block that size would shift everything under
 * it for a quarter of a second.
 */
const TABS = [
  { key: "plain", label: "Plain language" },
  { key: "technical", label: "Technical" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/**
 * `?abstract=technical` is a link a technical reader can send a colleague, so
 * the URL is the source of the initial tab. It is read as an external store
 * rather than copied into state in an effect, which keeps the server render
 * and the first client render agreeing on "plain".
 */
function subscribeToHistory(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function requestedTab(): TabKey {
  return new URLSearchParams(window.location.search).get("abstract") ===
    "technical"
    ? "technical"
    : "plain";
}

export function AbstractTabs({
  plain,
  technical,
}: {
  plain: ReactNode;
  technical: ReactNode;
}) {
  const fromUrl = useSyncExternalStore(
    subscribeToHistory,
    requestedTab,
    () => "plain" as TabKey,
  );
  const [chosen, setChosen] = useState<TabKey | null>(null);
  const active = chosen ?? fromUrl;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const select = (key: TabKey, focus = false) => {
    setChosen(key);
    if (focus) refs.current[key]?.focus();
    const url = new URL(window.location.href);
    if (key === "technical") url.searchParams.set("abstract", "technical");
    else url.searchParams.delete("abstract");
    window.history.replaceState(null, "", url);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    select(active === "plain" ? "technical" : "plain", true);
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Abstract version"
        onKeyDown={onKeyDown}
        className="relative inline-grid grid-cols-2 border border-hairline bg-surface p-1"
      >
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] bg-raised transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-quint)] motion-reduce:transition-none"
          style={{
            transform: active === "technical" ? "translateX(100%)" : "none",
          }}
        />
        {TABS.map((tab) => (
          <button
            key={tab.key}
            ref={(node) => {
              refs.current[tab.key] = node;
            }}
            type="button"
            role="tab"
            id={`abstract-tab-${tab.key}`}
            aria-selected={active === tab.key}
            aria-controls={`abstract-panel-${tab.key}`}
            tabIndex={active === tab.key ? 0 : -1}
            onClick={() => select(tab.key)}
            className={[
              "relative px-4 py-2 font-mono text-micro tracking-[0.12em] uppercase transition-colors duration-[var(--duration-fast)]",
              active === tab.key ? "text-bone" : "text-slate hover:text-ash",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {TABS.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`abstract-panel-${tab.key}`}
          aria-labelledby={`abstract-tab-${tab.key}`}
          hidden={active !== tab.key}
          className="mt-8 transition-opacity duration-[140ms]"
        >
          {tab.key === "plain" ? plain : technical}
        </div>
      ))}
    </div>
  );
}
