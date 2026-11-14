"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Arrow, Stat } from "@/components/ui";
import { THEMES } from "@/lib/calcul";
import { formatClock, useHydrated, useNow } from "@/lib/hooks";
import { KEYS, load, type Attempt, type ExoSession, type SubtestResult, type SubtestSession } from "@/lib/storage";

export function HomeProgress() {
  const hydrated = useHydrated();
  if (!hydrated) return <div className="mt-12 h-40" aria-hidden />;
  return <Inner />;
}

function Inner() {
  const history = useMemo(() => load<Attempt[]>(KEYS.history, []), []);
  const results = useMemo(() => load<SubtestResult[]>(KEYS.results, []), []);
  const exo = useMemo(() => load<ExoSession | null>(KEYS.exo, null), []);
  const subtest = useMemo(() => load<SubtestSession | null>(KEYS.subtest, null), []);
  const running = !!subtest && !subtest.finishedAt;
  const now = useNow(running, 1000);

  const total = history.length;
  const right = history.filter((a) => a.correct).length;
  const best = results.reduce((m, r) => Math.max(m, r.correct), 0);
  const byTheme = THEMES.map((t) => {
    const xs = history.filter((a) => a.theme === t.id);
    return { ...t, n: xs.length, ok: xs.filter((a) => a.correct).length };
  });
  const exoOpen = !!exo && !exo.finishedAt && exo.answers.filter((a) => a !== undefined).length < exo.refs.length;

  return (
    <>
      {(running || exoOpen) && (
        <section className="mt-4 grid gap-2">
          {running && subtest && (
            <Resume
              href="/sous-test"
              label="Sous-test en cours"
              detail={subtest.endsAt > now ? `Il reste ${formatClock(subtest.endsAt - now)}` : "Temps écoulé : voir le résultat"}
            />
          )}
          {exoOpen && exo && (
            <Resume
              href="/exercices/session"
              label="Série en cours"
              detail={`Question ${Math.min(exo.index + 1, exo.refs.length)} sur ${exo.refs.length}`}
            />
          )}
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted">Ta progression</h2>
        {total === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line px-5 py-6 text-[0.95rem] leading-relaxed text-muted">
            Tes statistiques apparaîtront ici dès ta première série : taux de réussite global et par thème, meilleur sous-test.
          </p>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <Stat label="Questions" value={total} />
              <Stat label="Réussite" value={`${Math.round((right / total) * 100)} %`} />
              <Stat label="Meilleur sous-test" value={results.length ? `${best}/15` : "—"} hint={results.length ? `${results.length} passé${results.length > 1 ? "s" : ""}` : "Aucun pour l'instant"} />
            </div>
            <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
              {byTheme.map((t) => {
                const pct = t.n ? Math.round((t.ok / t.n) * 100) : null;
                return (
                  <li key={t.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[0.95rem]">{t.label}</div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
                        <div className={`h-full rounded-full ${pct === null ? "" : pct >= 70 ? "bg-ok" : pct >= 45 ? "bg-accent" : "bg-bad"}`} style={{ width: `${pct ?? 0}%` }} />
                      </div>
                    </div>
                    <div className="w-24 shrink-0 text-right text-sm tabular-nums text-muted">
                      {pct === null ? "pas encore vu" : `${pct} % · ${t.ok}/${t.n}`}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </>
  );
}

function Resume({ href, label, detail }: { href: string; label: string; detail: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-4 rounded-xl border border-accent bg-accent-soft px-4 py-3 transition-opacity hover:opacity-90">
      <span>
        <span className="block text-[0.95rem] font-medium">{label}</span>
        <span className="block text-sm tabular-nums text-muted">{detail}</span>
      </span>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-accent">
        Reprendre <Arrow />
      </span>
    </Link>
  );
}
