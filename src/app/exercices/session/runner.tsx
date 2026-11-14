"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Choices, Correction, QuestionMeta, Statement } from "@/components/question";
import { Review } from "@/components/review";
import { BottomBar, Button, ButtonLink, Header, Page, ProgressBar, Stat } from "@/components/ui";
import { THEMES, compose, rebuild } from "@/lib/calcul";
import { formatDuration, useHydrated } from "@/lib/hooks";
import { KEYS, load, recordAttempts, save, type ExoSession } from "@/lib/storage";

export function Runner() {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return <Loaded />;
}

function Loaded() {
  const [session, setSession] = useState<ExoSession | null>(() => load<ExoSession | null>(KEYS.exo, null));
  const update = (s: ExoSession) => {
    save(KEYS.exo, s);
    setSession(s);
  };
  if (!session || session.refs.length === 0) {
    return (
      <>
        <Header />
        <Page>
          <p className="pt-12 text-muted">Aucune série en cours.</p>
          <ButtonLink href="/exercices" className="mt-5">
            Composer une série
          </ButtonLink>
        </Page>
      </>
    );
  }
  if (session.finishedAt) return <Summary session={session} onRestart={update} />;
  return <Play session={session} update={update} />;
}

function Play({ session, update }: { session: ExoSession; update: (s: ExoSession) => void }) {
  const { refs, index } = session;
  const ref = refs[index];
  const q = useMemo(() => rebuild(ref.templateId, ref.seed), [ref.templateId, ref.seed]);
  const stored = session.answers[index];
  const revealed = stored !== undefined;
  const [picked, setPicked] = useState<number | null>(null);
  const chosen = revealed ? stored : picked;
  const last = index === refs.length - 1;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [index]);

  const answer = (value: number | null) => {
    const now = Date.now();
    const answers = session.answers.slice();
    answers[index] = value;
    recordAttempts([
      {
        t: now,
        templateId: ref.templateId,
        seed: ref.seed,
        theme: q.theme,
        level: q.level,
        chosen: value,
        correct: value === q.correct,
        ms: now - session.questionStartedAt,
        mode: "exo",
      },
    ]);
    update({ ...session, answers });
  };

  const next = () => {
    const now = Date.now();
    setPicked(null);
    update(last ? { ...session, finishedAt: now } : { ...session, index: index + 1, questionStartedAt: now });
  };

  const done = session.answers.filter((a) => a !== undefined).length;

  return (
    <>
      <div className="sticky top-0 z-10 bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-4 px-5 pb-3 pt-4">
          <Link href="/" className="-ml-1 flex h-9 items-center rounded-lg px-1 text-sm text-muted hover:text-ink">
            Quitter
          </Link>
          <div className="flex-1">
            <ProgressBar value={done} max={refs.length} />
          </div>
          <span className="font-mono text-sm tabular-nums text-muted">
            {index + 1}/{refs.length}
          </span>
        </div>
      </div>

      <Page>
        <article key={index} className="rise pt-5">
          <QuestionMeta q={q} />
          <Statement q={q} />
          <Choices q={q} chosen={chosen} onChoose={setPicked} reveal={revealed} />
          {revealed && <Correction q={q} chosen={stored} />}
        </article>
      </Page>

      <BottomBar>
        {revealed ? (
          <Button onClick={next} className="flex-1">
            {last ? "Voir le bilan" : "Question suivante"}
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={() => answer(null)} className="px-3">
              Passer
            </Button>
            <Button onClick={() => answer(picked)} disabled={picked === null} className="flex-1">
              Valider
            </Button>
          </>
        )}
      </BottomBar>
    </>
  );
}

function Summary({ session, onRestart }: { session: ExoSession; onRestart: (s: ExoSession) => void }) {
  const router = useRouter();
  const items = useMemo(
    () => session.refs.map((r, i) => ({ q: rebuild(r.templateId, r.seed), chosen: session.answers[i] ?? null })),
    [session],
  );
  const right = items.filter((x) => x.chosen === x.q.correct).length;
  const total = items.length;
  const duration = (session.finishedAt ?? session.startedAt) - session.startedAt;
  const pct = Math.round((right / total) * 100);
  const byTheme = THEMES.map((t) => {
    const xs = items.filter((x) => x.q.theme === t.id);
    return { label: t.label, n: xs.length, ok: xs.filter((x) => x.chosen === x.q.correct).length };
  }).filter((t) => t.n > 0);

  const again = () => {
    const now = Date.now();
    onRestart({ sel: session.sel, refs: compose(session.sel), answers: [], index: 0, startedAt: now, questionStartedAt: now });
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <Header />
      <Page>
        <section className="rise pt-8">
          <p className="text-sm text-muted">Bilan de la série</p>
          <h1 className="mt-2 font-serif text-6xl leading-none tracking-tight tabular-nums">
            {right}
            <span className="text-muted">/{total}</span>
          </h1>
          <p className="mt-3 text-[0.98rem] text-muted">
            {pct >= 80 ? "Série solide." : pct >= 50 ? "Des points à consolider : relis les corrections des questions ratées." : "Série difficile : reprends les corrections une à une avant de relancer."}
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat label="Réussite" value={`${pct} %`} />
            <Stat label="Durée" value={formatDuration(duration)} />
            <Stat label="Par question" value={formatDuration(duration / total)} hint="Cible : 80 s" />
          </div>
        </section>

        {byTheme.length > 1 && (
          <section className="mt-8">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted">Par thème</h2>
            <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
              {byTheme.map((t) => (
                <li key={t.label} className="flex items-center justify-between px-4 py-3 text-[0.95rem]">
                  <span>{t.label}</span>
                  <span className="tabular-nums text-muted">
                    {t.ok}/{t.n}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted">Questions et corrections</h2>
          <Review items={items} />
        </section>
      </Page>
      <BottomBar>
        <Button variant="secondary" onClick={() => router.push("/exercices")}>
          Réglages
        </Button>
        <Button onClick={again} className="flex-1">
          Nouvelle série
        </Button>
      </BottomBar>
    </>
  );
}
