import { Cta } from "@/components/ui/cta";

export default function NotFound() {
  return (
    <section className="flex min-h-[100dvh] items-center bg-ink">
      <div className="shell-narrow py-32 text-center">
        <p className="font-mono text-micro tracking-[0.16em] text-slate uppercase">
          404
        </p>
        <h1 className="mt-5 text-bone">There is nothing at this address.</h1>
        <p className="mx-auto mt-6 max-w-[42ch] text-lead text-ash">
          The page you were looking for has moved or never existed.
        </p>
        <div className="mt-9 flex justify-center">
          <Cta href="/">Back to the start</Cta>
        </div>
      </div>
    </section>
  );
}
