import type { Metadata } from "next";
import InkLabExperience from "@/components/ink-lab/ink-lab-experience";
import "@/components/ink-lab/ink-lab.css";

export const metadata: Metadata = {
  title: "Ink Identity Study",
  description:
    "Eight female, male and androgynous identity candidates explored through Vyakti's living ink face system.",
  robots: { index: false, follow: false },
};

export default function InkLabPage() {
  return <InkLabExperience />;
}
