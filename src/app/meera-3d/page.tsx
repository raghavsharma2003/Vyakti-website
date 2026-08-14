import type { Metadata } from "next";
import { Meera3dPreview } from "@/components/meera/meera-3d-preview";

export const metadata: Metadata = {
  title: "Meera 3D study",
  robots: { index: false, follow: false },
};

export default function Meera3dPage() {
  return (
    <main className="min-h-screen bg-ink pt-24">
      <div className="shell">
        <p className="eyebrow text-meera">Meera 3D study</p>
        <div className="mt-5 flex items-end justify-between gap-8">
          <h1 className="max-w-[11ch] text-bone">A separate presence.</h1>
          <p className="measure max-w-[35ch] pb-2 text-small text-ash">
            Drag to inspect the model. The final homepage movement will be tied
            to scroll, not an automatic loop.
          </p>
        </div>
        <div className="mt-8 h-[72svh] min-h-[520px] border-y border-hairline">
          <Meera3dPreview />
        </div>
      </div>
    </main>
  );
}
