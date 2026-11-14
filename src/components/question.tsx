import { themeLabel } from "@/lib/calcul";
import type { Question } from "@/lib/engine/types";
import { Check, Cross } from "./ui";

const LETTERS = ["A", "B", "C", "D", "E"];
const LEVELS = { 1: "Niveau 1 · fondamental", 2: "Niveau 2 · intermédiaire", 3: "Niveau 3 · avancé" } as const;

export function QuestionMeta({ q }: { q: Question }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
      <span>Calcul</span>
      <span aria-hidden>·</span>
      <span>{themeLabel(q.theme)}</span>
      <span aria-hidden>·</span>
      <span>{LEVELS[q.level]}</span>
    </div>
  );
}

export function Statement({ q }: { q: Question }) {
  return <p className="mt-3 text-[1.08rem] leading-[1.6] text-ink sm:text-[1.15rem]">{q.statement}</p>;
}

/**
 * Les cinq propositions.
 * - `reveal` faux : simple sélection.
 * - `reveal` vrai : la bonne réponse et l'éventuelle erreur sont mises en évidence.
 */
export function Choices({
  q,
  chosen,
  onChoose,
  reveal,
}: {
  q: Question;
  chosen: number | null;
  onChoose?: (i: number) => void;
  reveal: boolean;
}) {
  return (
    <div className="mt-5 flex flex-col gap-2.5" role="radiogroup" aria-label="Propositions">
      {q.choices.map((c, i) => {
        const isChosen = chosen === i;
        const isRight = i === q.correct;
        let box = "border-line bg-surface hover:border-muted";
        let badge = "border-line text-muted";
        if (!reveal && isChosen) {
          box = "border-accent bg-accent-soft ring-1 ring-accent";
          badge = "border-accent bg-accent text-surface";
        }
        if (reveal && isRight) {
          box = "border-ok bg-ok-soft";
          badge = "border-ok bg-ok text-surface";
        } else if (reveal && isChosen) {
          box = "border-bad bg-bad-soft";
          badge = "border-bad bg-bad text-surface";
        } else if (reveal) {
          box = "border-line bg-surface opacity-60";
        }
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={isChosen}
            disabled={reveal || !onChoose}
            onClick={() => onChoose?.(i)}
            className={`flex min-h-14 w-full items-center gap-3.5 rounded-xl border px-3.5 py-2.5 text-left transition-[border-color,background-color,opacity] duration-150 ${box}`}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-medium transition-colors duration-150 ${badge}`}>
              {reveal && isRight ? <Check /> : reveal && isChosen ? <Cross /> : LETTERS[i]}
            </span>
            <span className="min-w-0 text-[1.02rem] tabular-nums">{c}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Correction({ q, chosen }: { q: Question; chosen: number | null }) {
  const right = chosen === q.correct;
  return (
    <section className="rise mt-6" aria-live="polite">
      <div className={`rounded-xl px-4 py-3 text-[0.95rem] font-medium ${right ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"}`}>
        {right
          ? "Bonne réponse."
          : chosen === null
            ? `Sans réponse. La bonne réponse était ${LETTERS[q.correct]} : ${q.choices[q.correct]}.`
            : `Ce n'est pas ça. La bonne réponse était ${LETTERS[q.correct]} : ${q.choices[q.correct]}.`}
      </div>

      <h3 className="mt-6 text-xs font-medium uppercase tracking-wider text-muted">Raisonnement</h3>
      <ol className="mt-2.5 flex flex-col gap-2.5">
        {q.steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-[0.98rem] leading-relaxed">
            <span className="mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full border border-line font-mono text-[0.7rem] text-muted">{i + 1}</span>
            <span className="min-w-0">{s}</span>
          </li>
        ))}
      </ol>

      {q.trap && (
        <Note title="Le piège" tone="warn">
          {q.trap}
        </Note>
      )}
      <Note title="Astuce de rapidité" tone="accent">
        {q.tip}
      </Note>
      <Note title="À retenir" tone="plain">
        {q.notion}
      </Note>
    </section>
  );
}

function Note({ title, tone, children }: { title: string; tone: "warn" | "accent" | "plain"; children: React.ReactNode }) {
  const tones = {
    warn: "bg-warn-soft",
    accent: "bg-accent-soft",
    plain: "border border-line bg-surface",
  };
  const titles = { warn: "text-warn", accent: "text-accent", plain: "text-muted" };
  return (
    <div className={`mt-3.5 rounded-xl px-4 py-3 ${tones[tone]}`}>
      <div className={`text-xs font-medium uppercase tracking-wider ${titles[tone]}`}>{title}</div>
      <p className="mt-1 text-[0.95rem] leading-relaxed">{children}</p>
    </div>
  );
}

export { LETTERS };
