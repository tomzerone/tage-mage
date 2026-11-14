import { describe, expect, it } from "vitest";
import { TEMPLATES, compose, composeSubtest, rebuild, THEMES } from "../src/lib/calcul";
import { build } from "../src/lib/engine/build";
import { makeRng } from "../src/lib/engine/rng";
import type { Draft } from "../src/lib/engine/types";

const RUNS = 3000;

describe("catalogue", () => {
  it("identifiants uniques", () => {
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(TEMPLATES.length);
  });
  it("chaque thème a au moins un modèle par niveau", () => {
    for (const th of THEMES)
      for (const lvl of [1, 2, 3])
        expect(TEMPLATES.some((t) => t.theme === th.id && t.level === lvl), `${th.id} niveau ${lvl}`).toBe(true);
  });
});

describe.each(TEMPLATES.map((t) => [t.id, t] as const))("%s", (_id, t) => {
  it(`${RUNS} tirages : 5 propositions distinctes, une seule bonne réponse, textes propres`, () => {
    const statements = new Set<string>();
    const positions = [0, 0, 0, 0, 0];
    for (let seed = 1; seed <= RUNS; seed++) {
      const q = build(t, seed * 7919);
      expect(q.choices).toHaveLength(5);
      expect(new Set(q.choices).size, `doublon (graine ${seed * 7919}) : ${q.choices.join(" | ")}`).toBe(5);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(5);
      const all = [q.statement, ...q.choices, ...q.steps, q.tip, q.notion, q.trap ?? ""].join(" ");
      expect(all, `texte invalide (graine ${seed * 7919})`).not.toMatch(/NaN|undefined|Infinity|null|\[object|,\d{3,}\s*€|−\s*−|\+\s*−/);
      expect(q.statement.length).toBeGreaterThan(20);
      expect(q.steps.length).toBeGreaterThan(0);
      for (const c of q.choices) expect(c.trim().length).toBeGreaterThan(0);
      statements.add(q.statement);
      positions[q.correct]++;
    }
    // La bonne réponse doit être répartie sur les 5 positions (mélange effectif).
    for (const p of positions) expect(p).toBeGreaterThan(RUNS * 0.14);
    // Diversité minimale des énoncés.
    expect(statements.size, "trop peu d'énoncés différents").toBeGreaterThanOrEqual(8);
  });

  it("la réponse affichée correspond au recalcul indépendant", () => {
    let checked = 0;
    for (let seed = 1; seed <= RUNS; seed++) {
      const s = seed * 104729;
      const d: Draft = t.gen(makeRng(s));
      if (d.check === undefined) continue;
      checked++;
      expect(Math.abs(d.check - d.answer.v), `écart (graine ${s}) : ${d.check} vs ${d.answer.v} — ${d.statement}`).toBeLessThan(1e-6);
      // La bonne réponse assemblée est bien celle du brouillon.
      const q = build(t, s);
      expect(q.choices[q.correct]).toBe(d.answer.label);
      // Aucun distracteur n'a la même valeur que la réponse.
      for (const w of d.distractors)
        if (w.label === d.answer.label) expect(Math.abs(w.v - d.answer.v)).toBeLessThan(1e-6);
    }
    expect(checked, "aucun contrôle indépendant").toBeGreaterThan(0);
  });

  it("reproductible : même graine, même question", () => {
    for (const seed of [1, 42, 123456789, 4294967295]) {
      expect(rebuild(t.id, seed)).toEqual(rebuild(t.id, seed));
    }
  });
});

describe("composition", () => {
  it("série : bon nombre de questions, pas deux fois de suite le même modèle", () => {
    for (let s = 1; s < 200; s++) {
      const refs = compose({ theme: "tous", level: "mixte", count: 30 }, s);
      expect(refs).toHaveLength(30);
      for (let i = 1; i < refs.length; i++) expect(refs[i].templateId).not.toBe(refs[i - 1].templateId);
    }
  });
  it("sous-test : 15 questions, modèles tous différents, 8 thèmes représentés, niveaux 4/7/4", () => {
    for (let s = 1; s < 500; s++) {
      const refs = composeSubtest(s);
      expect(refs).toHaveLength(15);
      expect(new Set(refs.map((r) => r.templateId)).size).toBe(15);
      const qs = refs.map((r) => rebuild(r.templateId, r.seed));
      expect(new Set(qs.map((q) => q.theme)).size).toBe(8);
      expect(qs.filter((q) => q.level === 1)).toHaveLength(4);
      expect(qs.filter((q) => q.level === 2)).toHaveLength(7);
      expect(qs.filter((q) => q.level === 3)).toHaveLength(4);
    }
  });
});
