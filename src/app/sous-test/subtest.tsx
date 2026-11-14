"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Choices, QuestionMeta, Statement } from "@/components/question";
import { Review } from "@/components/review";
import { BottomBar, Button, ButtonLink, Header, Page, Stat } from "@/components/ui";
import { composeSubtest, rebuild } from "@/lib/calcul";
import { formatClock, useHydrated, useNow } from "@/lib/hooks";
import { KEYS, SUBTEST_MINUTES, load, recordAttempts, recordResult, remove, save, type SubtestSession } from "@/lib/storage";

export function SubtestApp() {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return <Loaded />;
}

function Loaded() {
  const [session, setSession] = useState<SubtestSession | null>(() => load<SubtestSession | null>(KEYS.subtest, null));
  const update = (s: SubtestSession | null) => {
    if (s) save(KEYS.subtest, s);
    else remove(KEYS.subtest);
    setSession(s);
  };

  const start = () => {
    const now = Date.now();
    update({
      refs: composeSubtest(),
      answers: Array(15).fill(null),
      startedAt: now,
      endsAt: now + SUBTEST_MINUTES * 60 * 1000,
    });
    window.scrollTo({ top: 0 });
  };

  /** Clôture le sous-test et enregistre le résultat, une seule fois. */
  const finish = (s: SubtestSession, at: number) => {
    if (s.finishedAt) return;
    const finishedAt = Math.min(at, s.endsAt);
    const qs = s.refs.map((r) => rebuild(r.templateId, r.seed));
    const duration = finishedAt - s.startedAt;
    recordAttempts(
      qs.map((q, i) => ({
        t: finishedAt,
        templateId: q.templateId,
        seed: q.seed,
        theme: q.theme,
        level: q.level,
        chosen: s.answers[i],
        correct: s.answers[i] === q.correct,
        ms: Math.round(duration / qs.length),
        mode: "subtest" as const,
      })),
    );
    const correct = qs.filter((q, i) => s.answers[i] === q.correct).length;
    const blank = s.answers.filter((a) => a === null).length;
    recordResult({ t: finishedAt, correct, blank, wrong: qs.length - correct - blank, durationMs: duration });
    update({ ...s, finishedAt });
    window.scrollTo({ top: 0 });
  };

  if (!session) return <Intro onStart={start} />;
  if (session.finishedAt) return <Results session={session} onRestart={start} />;
  return <Play session={session} update={update} finish={finish} />;
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <>
      <Header />
      <Page>
        <section className="pt-8">
          <p className="text-sm text-muted">Sous-test 2 · Calcul</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">15 questions, 20 minutes</h1>
          <ul className="mt-6 grid gap-3 text-[0.98rem] leading-relaxed">
            {[
              "Le chronomètre démarre dès que tu lances le sous-test et ne s'arrête pas, même si tu quittes la page ou verrouilles ton téléphone.",
              "Tu peux naviguer librement entre les questions et modifier tes réponses jusqu'à la fin.",
              "Aucune correction pendant l'épreuve : tout le détail arrive avec le résultat.",
              "Calculatrice interdite, comme le jour J. Garde un brouillon et un stylo.",
              "Une mauvaise réponse ne retire aucun point : ne laisse aucune question sans réponse.",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-muted" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
            Les 15 questions couvrent les huit thèmes disponibles, avec 4 questions de niveau 1, 7 de niveau 2 et 4 de niveau 3.
          </p>
        </section>
      </Page>
      <BottomBar>
        <ButtonLink href="/" variant="ghost" className="px-3">
          Retour
        </ButtonLink>
        <Button onClick={onStart} className="flex-1">
          Démarrer le chronomètre
        </Button>
      </BottomBar>
    </>
  );
}

function Play({
  session,
  update,
  finish,
}: {
  session: SubtestSession;
  update: (s: SubtestSession) => void;
  finish: (s: SubtestSession, at: number) => void;
}) {
  const [index, setIndex] = useState(() => Math.max(0, session.answers.findIndex((a) => a === null)));
  const [confirm, setConfirm] = useState(false);
  const now = useNow(true);
  const remaining = session.endsAt - now;
  const qs = useMemo(() => session.refs.map((r) => rebuild(r.templateId, r.seed)), [session.refs]);
  const q = qs[index];
  const answered = session.answers.filter((a) => a !== null).length;
  const expired = remaining <= 0;

  // Fin automatique : le temps restant vient de l'heure de fin enregistrée, pas d'un compteur.
  useEffect(() => {
    if (expired) finish(session, session.endsAt);
  }, [expired, finish, session]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [index]);

  const choose = (i: number) => {
    const answers = session.answers.slice();
    answers[index] = answers[index] === i ? null : i;
    update({ ...session, answers });
  };

  const low = remaining < 2 * 60 * 1000;

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-5 py-3">
          <div>
            <div className="text-[0.7rem] uppercase tracking-wider text-muted">Temps restant</div>
            <div className={`font-mono text-2xl font-medium leading-tight tabular-nums ${low ? "text-bad" : "text-ink"}`} role="timer">
              {formatClock(remaining)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[0.7rem] uppercase tracking-wider text-muted">Réponses</div>
            <div className="font-mono text-2xl font-medium leading-tight tabular-nums">
              {answered}
              <span className="text-muted">/15</span>
            </div>
          </div>
        </div>
        <nav className="mx-auto grid w-full max-w-2xl grid-cols-8 gap-1.5 px-5 pb-3 sm:grid-cols-15" aria-label="Questions">
          {qs.map((_, i) => {
            const isAnswered = session.answers[i] !== null;
            const current = i === index;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-current={current ? "step" : undefined}
                aria-label={`Question ${i + 1}${isAnswered ? ", répondue" : ", sans réponse"}`}
                className={`flex h-8 items-center justify-center rounded-lg border font-mono text-xs tabular-nums transition-colors duration-150 ${
                  current
                    ? "border-ink bg-ink text-bg"
                    : isAnswered
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line bg-surface text-muted hover:border-muted"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </nav>
      </div>

      <Page>
        <article key={index} className="rise pt-5">
          <div className="flex items-center justify-between">
            <QuestionMeta q={q} />
            <span className="font-mono text-xs tabular-nums text-muted">Q{index + 1}</span>
          </div>
          <Statement q={q} />
          <Choices q={q} chosen={session.answers[index]} onChoose={choose} reveal={false} />
        </article>

      </Page>

      <BottomBar>
        {confirm ? (
          <div className="rise w-full" role="alertdialog" aria-label="Terminer le sous-test">
            <p className="text-[0.95rem] leading-relaxed">
              {answered < 15
                ? `Il reste ${15 - answered} question${15 - answered > 1 ? "s" : ""} sans réponse et ${formatClock(remaining)} au chronomètre. Une erreur ne coûte rien : réponds à tout avant de terminer.`
                : `Tu as répondu aux 15 questions. Il reste ${formatClock(remaining)} pour te relire.`}
            </p>
            <div className="mt-3 flex gap-3">
              <Button variant="secondary" onClick={() => setConfirm(false)} className="flex-1">
                Continuer
              </Button>
              <Button onClick={() => finish(session, Date.now())} className="flex-1">
                Terminer
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setIndex(index - 1)} disabled={index === 0} className="px-4">
              Précédente
            </Button>
            {index < 14 ? (
              <Button onClick={() => setIndex(index + 1)} className="flex-1">
                Suivante
              </Button>
            ) : (
              <Button onClick={() => setConfirm(true)} className="flex-1">
                Terminer
              </Button>
            )}
            {index < 14 && (
              <Button variant="ghost" onClick={() => setConfirm(true)} className="px-2">
                Terminer
              </Button>
            )}
          </>
        )}
      </BottomBar>
    </>
  );
}

function Results({ session, onRestart }: { session: SubtestSession; onRestart: () => void }) {
  const items = useMemo(
    () => session.refs.map((r, i) => ({ q: rebuild(r.templateId, r.seed), chosen: session.answers[i] })),
    [session],
  );
  const correct = items.filter((x) => x.chosen === x.q.correct).length;
  const blank = items.filter((x) => x.chosen === null).length;
  const wrong = items.length - correct - blank;
  const duration = (session.finishedAt ?? session.endsAt) - session.startedAt;
  const timeUp = (session.finishedAt ?? 0) >= session.endsAt;

  return (
    <>
      <Header />
      <Page>
        <section className="rise pt-8">
          <p className="text-sm text-muted">Résultat du sous-test Calcul{timeUp ? " · temps écoulé" : ""}</p>
          <h1 className="mt-2 font-serif text-6xl leading-none tracking-tight tabular-nums">
            {correct}
            <span className="text-muted">/15</span>
          </h1>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Bonnes réponses" value={correct} />
            <Stat label="Mauvaises réponses" value={wrong} />
            <Stat label="Sans réponse" value={blank} />
            <Stat label="Temps utilisé" value={formatClock(duration)} hint={`sur ${SUBTEST_MINUTES}:00`} />
          </div>
          <div className="mt-3 rounded-2xl border border-line bg-surface p-4">
            <div className="text-xs text-muted">Score brut du sous-test</div>
            <div className="mt-1 font-serif text-3xl leading-none tabular-nums">
              {correct * 4}
              <span className="text-muted">/60</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              4 points par bonne réponse, aucun point retiré pour une erreur. Ce score ne concerne que le Calcul : l&apos;estimation sur 600 arrivera
              avec les examens blancs complets.
            </p>
          </div>
          {blank > 0 && (
            <p className="mt-3 rounded-xl bg-warn-soft px-4 py-3 text-[0.95rem] leading-relaxed">
              {blank} question{blank > 1 ? "s" : ""} sans réponse. Au TAGE MAGE, une erreur ne retire pas de point : dans les dernières secondes, coche
              toujours une réponse.
            </p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted">Questions et corrections</h2>
          <Review items={items} />
        </section>
      </Page>
      <BottomBar>
        <Link href="/" className="flex min-h-12 items-center px-3 text-[0.95rem] text-muted hover:text-ink">
          Accueil
        </Link>
        <Button onClick={onRestart} className="flex-1">
          Nouveau sous-test
        </Button>
      </BottomBar>
    </>
  );
}
