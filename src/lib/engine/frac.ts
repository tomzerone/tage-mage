// Fractions exactes (entiers), pour éviter toute erreur d'arrondi.
export interface Frac {
  n: number;
  d: number;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function F(n: number, d = 1): Frac {
  if (d === 0) throw new Error("dénominateur nul");
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

export const add = (a: Frac, b: Frac) => F(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Frac, b: Frac) => F(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Frac, b: Frac) => F(a.n * b.n, a.d * b.d);
export const div = (a: Frac, b: Frac) => F(a.n * b.d, a.d * b.n);
export const val = (a: Frac) => a.n / a.d;
export const one = F(1);

/** 3/4, ou 2 si la fraction est un entier. */
export function ff(a: Frac): string {
  return a.d === 1 ? String(a.n).replace("-", "−") : `${String(a.n).replace("-", "−")}/${a.d}`;
}
