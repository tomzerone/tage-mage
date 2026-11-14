import { makeRng, type Rng } from "./rng";
import type { Draft, Question, Template, Val } from "./types";

const EPS = 1e-9;
const same = (a: Val, b: Val) => a.label === b.label || Math.abs(a.v - b.v) < EPS;

/** Fabrique une valeur numérique affichable. */
export const V = (fmt: (x: number) => string) => (x: number): Val => ({ v: x, label: fmt(x) });

/** Valeurs voisines : réponse + k × pas. */
export const nearBy = (mk: (x: number) => Val, answer: number, step: number) => (k: number) =>
  mk(answer + k * step);

/** Réessaie un tirage jusqu'à obtenir un brouillon valide. */
export function until(rng: Rng, f: () => Draft | null, max = 2000): Draft {
  for (let i = 0; i < max; i++) {
    const r = f();
    if (r !== null) return r;
  }
  throw new Error("tirage impossible");
}

export class GenerationError extends Error {}

/**
 * Assemble une question à partir d'un modèle et d'une graine.
 * Garanties : 5 propositions distinctes, exactement une bonne réponse, valeurs finies.
 */
export function build(template: Template, seed: number): Question {
  const rng = makeRng(seed);
  const d: Draft = template.gen(rng);
  const ok = (x: Val) =>
    Number.isFinite(x.v) && (d.allowNonPositive || x.v > EPS) && !/NaN|undefined|Infinity/.test(x.label);

  if (!ok(d.answer)) throw new GenerationError(`${template.id}: réponse invalide (${d.answer.label})`);

  const wrong: Val[] = [];
  const push = (x: Val | null) => {
    if (!x || !ok(x) || same(x, d.answer) || wrong.some((w) => same(w, x))) return;
    wrong.push(x);
  };
  for (const x of d.distractors) if (wrong.length < 4) push(x);
  for (let k = 1; wrong.length < 4 && k <= 40; k++) {
    push(d.near(k));
    if (wrong.length < 4) push(d.near(-k));
  }
  if (wrong.length < 4) throw new GenerationError(`${template.id}: pas assez de distracteurs`);

  const all = rng.shuffle([d.answer, ...wrong.slice(0, 4)]);
  return {
    templateId: template.id,
    seed,
    subtest: "calcul",
    theme: template.theme,
    subtheme: template.subtheme,
    level: template.level,
    statement: d.statement,
    choices: all.map((x) => x.label),
    correct: all.indexOf(d.answer),
    steps: d.steps,
    trap: d.trap,
    tip: d.tip,
    notion: d.notion,
    params: d.params,
  };
}
