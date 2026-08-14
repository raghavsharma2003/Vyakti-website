import type { Metadata } from "next";
import FaceLabExperience from "@/components/face-lab/face-lab-experience";
import "@/components/face-lab/face-lab.css";

export const metadata: Metadata = {
  title: "Face Direction Study",
  description:
    "Five distinct visual identity systems for Meera, Vyakti's consumer AI companion.",
  robots: { index: false, follow: false },
};

export default function FaceLabPage() {
  return <FaceLabExperience />;
}
