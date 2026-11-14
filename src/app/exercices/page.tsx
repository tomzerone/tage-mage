import { Header, Page } from "@/components/ui";
import { Config } from "./config";

export const metadata = { title: "Entraînement — Cap 600" };

export default function Exercices() {
  return (
    <>
      <Header />
      <Page>
        <h1 className="pt-8 font-serif text-4xl tracking-tight">Entraînement</h1>
        <p className="mt-2 text-[0.98rem] leading-relaxed text-muted">Compose ta série. Les questions sont générées à l&apos;instant : tu n&apos;auras jamais deux fois la même.</p>
        <Config />
      </Page>
    </>
  );
}
