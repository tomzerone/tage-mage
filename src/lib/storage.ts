import type { Ref, Selection } from "./calcul";
import type { Level, ThemeId } from "./engine/types";

// Toutes les données de la V1 restent sur l'appareil (stockage local du navigateur).

export interface Attempt {
  t: number;
  templateId: string;
  seed: number;
  theme: ThemeId;
  level: Level;
  chosen: number | null;
  correct: boolean;
  ms: number;
  mode: "exo" | "subtest";
}

export interface ExoSession {
  sel: Selection;
  refs: Ref[];
  /** Réponse choisie pour chaque question validée ; undefined = pas encore traitée ; null = passée. */
  answers: (number | null | undefined)[];
  index: number;
  startedAt: number;
  questionStartedAt: number;
  finishedAt?: number;
}

export interface SubtestSession {
  refs: Ref[];
  answers: (number | null)[];
  startedAt: number;
  endsAt: number;
  finishedAt?: number;
}

export interface SubtestResult {
  t: number;
  correct: number;
  wrong: number;
  blank: number;
  durationMs: number;
}

export const KEYS = {
  history: "cap600.history.v1",
  exo: "cap600.exo.v1",
  subtest: "cap600.subtest.v1",
  results: "cap600.results.v1",
} as const;

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Stockage plein ou navigation privée : la session continue en mémoire.
  }
}

export function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

const MAX_HISTORY = 6000;

export function recordAttempts(items: Attempt[]): void {
  const all = load<Attempt[]>(KEYS.history, []);
  all.push(...items);
  save(KEYS.history, all.slice(-MAX_HISTORY));
}

export function recordResult(r: SubtestResult): void {
  const all = load<SubtestResult[]>(KEYS.results, []);
  all.push(r);
  save(KEYS.results, all.slice(-200));
}

export const SUBTEST_MINUTES = 20;
