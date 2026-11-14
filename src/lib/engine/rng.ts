// Générateur pseudo-aléatoire reproductible (mulberry32).
// Une même graine redonne exactement la même question.
export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(xs: readonly T[]): T;
  shuffle<T>(xs: readonly T[]): T[];
  bool(p?: number): boolean;
}

export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  return {
    next,
    int,
    pick: (xs) => xs[int(0, xs.length - 1)],
    shuffle: (xs) => {
      const out = xs.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(0, i);
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    bool: (p = 0.5) => next() < p,
  };
}

/** Graine fraîche. À n'appeler que côté navigateur, dans un gestionnaire d'événement ou un effet. */
export function newSeed(): number {
  return Math.floor(Math.random() * 4294967296) >>> 0;
}
