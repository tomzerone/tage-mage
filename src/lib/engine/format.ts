// Mise en forme française des nombres. Aucune dépendance à la locale du navigateur.
const NBSP = " ";
const THIN = " ";

export function nb(x: number, maxDec = 2, minDec = 0): string {
  const p = 10 ** maxDec;
  const r = Math.round((x + Number.EPSILON * Math.sign(x)) * p) / p;
  const neg = r < 0;
  const [i, f = ""] = Math.abs(r).toFixed(maxDec).split(".");
  let frac = f.replace(/0+$/, "");
  while (frac.length < minDec) frac += "0";
  const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, THIN);
  return (neg ? "−" : "") + int + (frac ? "," + frac : "");
}

/** Montant en euros : 240 € ou 12,50 €. */
export function eur(x: number): string {
  const r = Math.round(x * 100) / 100;
  return (Number.isInteger(r) ? nb(r, 0) : nb(r, 2, 2)) + NBSP + "€";
}

export function pc(x: number): string {
  return nb(x) + NBSP + "%";
}

/** Pourcentage signé : +12 % ou −4 %. */
export function spc(x: number): string {
  return (x > 0 ? "+" : "") + nb(x) + NBSP + "%";
}

export function unit(x: number, u: string, maxDec = 2): string {
  return nb(x, maxDec) + NBSP + u;
}

/** Durée à partir d'un nombre de minutes : 1 h 20 min, 45 min, 2 h. */
export function hm(minutes: number): string {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}${NBSP}min`;
  if (r === 0) return `${h}${NBSP}h`;
  return `${h}${NBSP}h${NBSP}${r}${NBSP}min`;
}

/** Heure d'horloge à partir de minutes depuis minuit : 9 h 05, 11 h 30, 14 h. */
export function clock(minutes: number): string {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h}${NBSP}h` : `${h}${NBSP}h${NBSP}${String(r).padStart(2, "0")}`;
}

export function plural(n: number, singular: string, pluralForm?: string): string {
  return `${nb(n)}${NBSP}${n >= 2 ? pluralForm ?? singular + "s" : singular}`;
}

/** Durée pour une explication : « 3 h », « 1,25 h, soit 1 h 15 min » ou « 2 h 40 min ». */
export function hDec(minutes: number): string {
  const m = Math.round(minutes);
  if (m % 60 === 0) return `${m / 60}${NBSP}h`;
  const dec = m / 60;
  const clean = Math.abs(dec * 100 - Math.round(dec * 100)) < 1e-9;
  return clean ? `${nb(dec)}${NBSP}h, soit ${hm(m)}` : hm(m);
}

/** Fraction réduite sous forme de texte : 3/8. */
export function fr(n: number, d: number): string {
  let a = Math.abs(n);
  let b = Math.abs(d);
  while (b) [a, b] = [b, a % b];
  const g = a || 1;
  return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`;
}
