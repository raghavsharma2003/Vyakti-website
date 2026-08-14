import type { Metadata } from "next";
import NoorStudyExperience from "@/components/noor-study/noor-study-experience";
import "@/components/noor-study/noor-study.css";

export const metadata: Metadata = {
  title: "Noor Refinement Study",
  description:
    "A refined scroll-controlled study of Noor's formation, attention and speech.",
  robots: { index: false, follow: false },
};

export default function NoorStudyPage() {
  return <NoorStudyExperience />;
}
