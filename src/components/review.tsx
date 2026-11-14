import type { Question } from "@/lib/engine/types";
import { Choices, Correction, QuestionMeta, Statement } from "./question";
import { Check, Cross } from "./ui";

/** Liste repliable des questions d'une série, avec leur correction complète. */
export function Review({ items }: { items: { q: Question; chosen: number | null }[] }) {
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {items.map(({ q, chosen }, i) => {
        const right = chosen === q.correct;
        return (
          <li key={i} className="min-w-0">
            <details className="group min-w-0 overflow-hidden rounded-xl border border-line bg-surface open:pb-4">
              <summary className="flex min-h-14 min-w-0 cursor-pointer list-none items-center gap-3 px-3.5 py-2.5 [&::-webkit-details-marker]:hidden">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    right ? "bg-ok-soft text-ok" : chosen === null ? "bg-line text-muted" : "bg-bad-soft text-bad"
                  }`}
                >
                  {right ? <Check /> : chosen === null ? <span className="text-xs">—</span> : <Cross />}
                </span>
                <span className="w-6 shrink-0 font-mono text-xs tabular-nums text-muted">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-[0.95rem] group-open:hidden">{q.statement}</span>
                <span className="hidden flex-1 text-sm text-muted group-open:block">{right ? "Réussie" : chosen === null ? "Sans réponse" : "Ratée"}</span>
                <span className="text-xs text-muted group-open:hidden">Voir</span>
                <span className="hidden text-xs text-muted group-open:inline">Fermer</span>
              </summary>
              <div className="px-3.5">
                <QuestionMeta q={q} />
                <Statement q={q} />
                <Choices q={q} chosen={chosen} reveal />
                <Correction q={q} chosen={chosen} />
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
