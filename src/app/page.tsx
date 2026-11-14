import Link from "next/link";
import { Arrow, Header, Page } from "@/components/ui";
import { TEMPLATES, THEMES } from "@/lib/calcul";
import { HomeProgress } from "./home-progress";

export default function Home() {
  return (
    <>
      <Header />
      <Page wide>
        <section className="pb-2 pt-10 sm:pt-16">
          <p className="text-sm text-muted">Préparation au TAGE MAGE · sous-test Calcul</p>
          <h1 className="mt-3 max-w-xl font-serif text-[2.6rem] leading-[1.05] tracking-tight sm:text-6xl">
            Une question après l&apos;autre, jusqu&apos;au jour J.
          </h1>
          <p className="mt-4 max-w-lg text-[1.02rem] leading-relaxed text-muted">
            {TEMPLATES.length} modèles de questions sur {THEMES.length} thèmes, renouvelés à chaque série. Chaque réponse est calculée et
            expliquée pas à pas.
          </p>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          <ModeCard
            href="/exercices"
            title="Entraînement"
            text="Choisis un thème, un niveau et un nombre de questions. Correction détaillée après chaque réponse."
            cta="Composer une série"
          />
          <ModeCard
            href="/sous-test"
            title="Sous-test chronométré"
            text="15 questions de Calcul en 20 minutes, sans correction intermédiaire, comme le jour de l'épreuve."
            cta="Lancer le chronomètre"
          />
        </section>

        <HomeProgress />
      </Page>
      <footer className="mx-auto w-full max-w-3xl px-5 pb-8 pt-14 text-xs leading-relaxed text-muted">
        Projet personnel indépendant, sans lien avec la FNEGE. TAGE MAGE® est une marque déposée de la FNEGE. Les données de progression
        restent sur cet appareil.
      </footer>
    </>
  );
}

function ModeCard({ href, title, text, cta }: { href: string; title: string; text: string; cta: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition-[border-color,transform] duration-150 hover:border-muted active:scale-[0.995]"
    >
      <h2 className="font-serif text-2xl tracking-tight">{title}</h2>
      <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-muted">{text}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-ink">
        {cta}
        <Arrow className="transition-transform duration-150 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
