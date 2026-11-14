import { build } from "../engine/build";
import { makeRng, newSeed } from "../engine/rng";
import type { Level, Question, Template, ThemeId } from "../engine/types";
import { equations } from "./equations";
import { fractions } from "./fractions";
import { interets } from "./interets";
import { mouvement } from "./mouvement";
import { moyennes } from "./moyennes";
import { pourcentages } from "./pourcentages";
import { proportionnalite } from "./proportionnalite";
import { travail } from "./travail";

export const THEMES: { id: ThemeId; label: string; short: string }[] = [
  { id: "pourcentages", label: "Pourcentages", short: "Hausses, baisses, évolutions successives" },
  { id: "interets", label: "Intérêts", short: "Intérêts simples et composés" },
  { id: "moyennes", label: "Moyennes", short: "Moyennes simples et pondérées" },
  { id: "proportionnalite", label: "Proportionnalité", short: "Règle de trois, partages, échelles" },
  { id: "equations", label: "Équations", short: "Mise en équation, systèmes" },
  { id: "fractions", label: "Fractions", short: "Opérations et fractions successives" },
  { id: "mouvement", label: "Vitesse et distance", short: "Vitesse moyenne, rattrapage, croisement" },
  { id: "travail", label: "Temps de travail", short: "Travail à plusieurs, remplissage" },
];

export const TEMPLATES: Template[] = [
  ...pourcentages,
  ...interets,
  ...moyennes,
  ...proportionnalite,
  ...equations,
  ...fractions,
  ...mouvement,
  ...travail,
];

const BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));

export const themeLabel = (id: ThemeId) => THEMES.find((t) => t.id === id)?.label ?? id;

/** Régénère à l'identique une question à partir de son modèle et de sa graine. */
export function rebuild(templateId: string, seed: number): Question {
  const t = BY_ID.get(templateId);
  if (!t) throw new Error(`modèle inconnu : ${templateId}`);
  return build(t, seed);
}

export interface Ref {
  templateId: string;
  seed: number;
}

export interface Selection {
  theme: ThemeId | "tous";
  level: Level | "mixte";
  count: number;
}

/**
 * Compose une série en alternant les modèles pour éviter les répétitions.
 * `seed` rend la composition reproductible ; chaque question reçoit sa propre graine.
 */
export function compose(sel: Selection, seed: number = newSeed()): Ref[] {
  const rng = makeRng(seed);
  const pool = TEMPLATES.filter(
    (t) => (sel.theme === "tous" || t.theme === sel.theme) && (sel.level === "mixte" || t.level === sel.level),
  );
  if (pool.length === 0) return [];
  const out: Ref[] = [];
  let bag: Template[] = [];
  let last: string | null = null;
  while (out.length < sel.count) {
    if (bag.length === 0) {
      bag = rng.shuffle(pool);
      if (bag.length > 1 && bag[0].id === last) bag.push(bag.shift()!);
    }
    const t = bag.shift()!;
    last = t.id;
    out.push({ templateId: t.id, seed: rng.int(0, 4294967295) });
  }
  return out;
}

/** Sous-test de Calcul : 15 questions, tous thèmes, difficulté répartie (4 / 7 / 4). */
export function composeSubtest(seed: number = newSeed()): Ref[] {
  const rng = makeRng(seed);
  const plan: Level[] = [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3];
  const used = new Set<string>();
  const themeCount = new Map<ThemeId, number>();
  const out: Ref[] = [];
  for (const level of rng.shuffle(plan)) {
    const candidates = TEMPLATES.filter((t) => t.level === level && !used.has(t.id));
    const min = Math.min(...candidates.map((t) => themeCount.get(t.theme) ?? 0));
    const t = rng.pick(candidates.filter((c) => (themeCount.get(c.theme) ?? 0) === min));
    used.add(t.id);
    themeCount.set(t.theme, (themeCount.get(t.theme) ?? 0) + 1);
    out.push({ templateId: t.id, seed: rng.int(0, 4294967295) });
  }
  return out;
}

export function countTemplates(theme: ThemeId | "tous", level: Level | "mixte"): number {
  return TEMPLATES.filter((t) => (theme === "tous" || t.theme === theme) && (level === "mixte" || t.level === level)).length;
}
