import { V, nearBy, until } from "../engine/build";
import { PRENOMS } from "../engine/contextes";
import { eur, nb, unit } from "../engine/format";
import { F, add, ff, mul, one, sub, val, type Frac } from "../engine/frac";
import type { Draft, Template, Val } from "../engine/types";

const T = "fractions" as const;
const E = V(eur);
const FR = (f: Frac): Val => ({ v: val(f), label: ff(f) });
const nearFrac = (f: Frac) => (k: number): Val | null => {
  const g = F(f.n + k, f.d);
  return g.n > 0 ? FR(g) : null;
};

const MOTS: Record<number, string> = { 2: "la moitié", 3: "le tiers", 4: "le quart", 5: "le cinquième", 6: "le sixième", 8: "le huitième" };
/** « le tiers », « les 2/5 »… */
const part = (f: Frac) => (f.n === 1 && MOTS[f.d] ? MOTS[f.d] : `les ${ff(f)}`);
const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const SIMPLES: Frac[] = [F(1, 2), F(1, 3), F(2, 3), F(1, 4), F(3, 4), F(1, 5), F(2, 5), F(3, 5), F(1, 6)];

export const fractions: Template[] = [
  {
    id: "frac.de-quantite",
    theme: T,
    subtheme: "Fraction d'une quantité",
    level: 1,
    gen: (rng): Draft => {
      const [n, d] = rng.pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [3, 8], [5, 8], [7, 10], [3, 10], [4, 9], [5, 12], [7, 12]] as const);
      const q = d * rng.pick([5, 10, 12, 15, 20, 25, 30, 40, 50]);
      const ans = (q / d) * n;
      const ctx = rng.pick([
        { s: `Un réservoir de ${nb(q)} litres est rempli aux ${n}/${d}. Combien de litres contient-il ?`, u: "litres" },
        { s: `Une promotion compte ${nb(q)} étudiants. Les ${n}/${d} d'entre eux ont validé leur semestre. Combien d'étudiants ont validé ?`, u: "étudiants" },
        { s: `Un trajet fait ${nb(q)} km. Un cycliste en a déjà parcouru les ${n}/${d}. Quelle distance a-t-il parcourue ?`, u: "km" },
      ]);
      const U = V((x) => unit(x, ctx.u));
      return {
        params: { n, d, q },
        statement: ctx.s,
        answer: U(ans),
        distractors: [U(q - ans), U(q / d), U((q / d) * (n + 1))],
        near: nearBy(U, ans, q / d),
        steps: [
          `Une part : ${nb(q)} ÷ ${d} = ${nb(q / d)}.`,
          `${n} parts : ${nb(q / d)} × ${n} = ${nb(ans)}.`,
        ],
        trap: `${nb(q - ans)} correspond à ce qui reste (${d - n}/${d}), pas à la fraction demandée.`,
        tip: "Divise d'abord par le dénominateur, puis multiplie par le numérateur : les nombres restent petits.",
        notion: "Prendre a/b d'une quantité : diviser par b, multiplier par a.",
        check: (q * n) / d,
      };
    },
  },
  {
    id: "frac.somme",
    theme: T,
    subtheme: "Additionner et soustraire des fractions",
    level: 1,
    gen: (rng): Draft =>
      until(rng, () => {
        const a = rng.pick(SIMPLES);
        const b = rng.pick(SIMPLES);
        if (a.d === b.d) return null;
        const plus = rng.bool(0.6);
        const [x, y] = plus || val(a) > val(b) ? [a, b] : [b, a];
        const ans = plus ? add(x, y) : sub(x, y);
        if (ans.n <= 0) return null;
        const ppcm = (x.d * y.d) / gcdLocal(x.d, y.d);
        const faux = F(plus ? x.n + y.n : Math.abs(x.n - y.n) || 1, plus ? x.d + y.d : Math.abs(x.d - y.d) || 1);
        return {
          params: { a: ff(x), b: ff(y), op: plus ? "+" : "−" },
          statement: `Combien vaut ${ff(x)} ${plus ? "+" : "−"} ${ff(y)} ?`,
          answer: FR(ans),
          distractors: [FR(faux), FR(F(plus ? x.n + y.n : Math.abs(x.n - y.n) || 1, x.d * y.d)), FR(F(ans.n, ans.d + 1)), FR(mul(x, y))],
          near: nearFrac(ans),
          steps: [
            `Dénominateur commun : ${ppcm}.`,
            `${ff(x)} = ${(x.n * ppcm) / x.d}/${ppcm} et ${ff(y)} = ${(y.n * ppcm) / y.d}/${ppcm}.`,
            `${(x.n * ppcm) / x.d}/${ppcm} ${plus ? "+" : "−"} ${(y.n * ppcm) / y.d}/${ppcm} = ${plus ? (x.n * ppcm) / x.d + (y.n * ppcm) / y.d : (x.n * ppcm) / x.d - (y.n * ppcm) / y.d}/${ppcm}${ans.d !== ppcm ? ` = ${ff(ans)}` : ""}.`,
          ],
          trap: "On n'additionne jamais les numérateurs entre eux et les dénominateurs entre eux.",
          tip: `Ordre de grandeur : ${ff(x)} ≈ ${nb(val(x))} et ${ff(y)} ≈ ${nb(val(y))}, donc le résultat est proche de ${nb(val(ans))}. Cela suffit souvent à éliminer trois propositions.`,
          notion: "Pour additionner des fractions, on les met au même dénominateur.",
          check: plus ? val(x) + val(y) : val(x) - val(y),
        };
      }),
  },
  {
    id: "frac.restes-successifs",
    theme: T,
    subtheme: "Fractions successives d'un reste",
    level: 2,
    gen: (rng): Draft =>
      until(rng, () => {
        const f1 = rng.pick(SIMPLES);
        const f2 = rng.pick(SIMPLES);
        const k = rng.pick([10, 20, 25, 30, 40, 50, 60, 80, 100]);
        const init = f1.d * f2.d * k;
        const r1 = sub(one, f1);
        const reste = mul(r1, sub(one, f2));
        const fin = (init * reste.n) / reste.d;
        if (init < 150 || init > 3000) return null;
        const qui = rng.pick(PRENOMS);
        const sommeF = add(f1, f2);
        const piege = val(sommeF) < 1 ? fin / (1 - val(sommeF)) : init * 2;
        return {
          params: { f1: ff(f1), f2: ff(f2), fin },
          statement: `${qui} dépense ${part(f1)} de ses économies en janvier, puis ${part(f2)} de ce qui reste en février. Il lui reste alors ${eur(fin)}. Quel était le montant de ses économies ?`,
          answer: E(init),
          distractors: [E(Math.round(piege / 10) * 10), E(Math.round(fin / val(r1) / 10) * 10), E(Math.round(fin / val(sub(one, f2)) / 10) * 10), E(Math.round((fin * (1 + val(sommeF))) / 10) * 10)],
          near: nearBy(E, init, f1.d * f2.d * 5),
          steps: [
            `Après janvier, il reste ${ff(r1)} des économies.`,
            `Après février, il reste ${ff(sub(one, f2))} de ce reste : ${ff(r1)} × ${ff(sub(one, f2))} = ${ff(reste)} des économies.`,
            `${ff(reste)} des économies = ${eur(fin)}, donc économies = ${eur(fin)} × ${reste.d}/${reste.n} = ${eur(init)}.`,
          ],
          trap: `La seconde fraction porte sur ce qui reste, pas sur le total : on ne peut pas additionner ${ff(f1)} et ${ff(f2)}.`,
          tip: "Travaille avec les fractions restantes et multiplie-les : c'est une seule ligne de calcul.",
          notion: "Fractions successives : on multiplie les fractions restantes.",
          check: fin / ((1 - val(f1)) * (1 - val(f2))),
        };
      }),
  },
  {
    id: "frac.cuve",
    theme: T,
    subtheme: "Écart entre deux fractions",
    level: 2,
    gen: (rng): Draft =>
      until(rng, () => {
        const a = rng.pick(SIMPLES);
        const b = rng.pick(SIMPLES);
        if (val(b) <= val(a)) return null;
        const diff = sub(b, a);
        const cap = diff.d * rng.pick([5, 10, 15, 20, 25, 30, 50]) * (diff.d < 6 ? 2 : 1);
        const ajout = (cap * diff.n) / diff.d;
        const L = V((x) => unit(x, "litres"));
        const txt = (f: Frac) => (f.n === 1 ? (f.d === 2 ? "à moitié" : `au ${MOTS[f.d].replace("le ", "")}`) : `aux ${ff(f)}`);
        return {
          params: { a: ff(a), b: ff(b), ajout },
          statement: `Une cuve est remplie ${txt(a)}. On y verse ${nb(ajout)} litres : elle est alors remplie ${txt(b)}. Quelle est la capacité de la cuve ?`,
          answer: L(cap),
          distractors: [L(Math.round(ajout / val(b) / 5) * 5), L(Math.round(ajout / val(a) / 5) * 5), L(cap / 2), L(cap * 2)],
          near: nearBy(L, cap, diff.d * 5),
          steps: [
            `Les ${nb(ajout)} litres versés font passer la cuve de ${ff(a)} à ${ff(b)}.`,
            `Ils représentent donc ${ff(b)} − ${ff(a)} = ${ff(diff)} de la capacité.`,
            `Capacité : ${nb(ajout)} × ${diff.d}/${diff.n} = ${nb(cap)} litres.`,
          ],
          trap: `Les ${nb(ajout)} litres ne représentent pas ${ff(b)} de la cuve, mais seulement la différence entre les deux niveaux.`,
          tip: "Repère à quelle fraction du tout correspond la quantité connue, puis remonte au tout.",
          notion: "Si une quantité q représente la fraction a/b d'un tout, le tout vaut q × b/a.",
          check: ajout / (val(b) - val(a)),
        };
      }),
  },
  {
    id: "frac.sous-populations",
    theme: T,
    subtheme: "Fraction de fraction",
    level: 3,
    gen: (rng): Draft =>
      until(rng, () => {
        const f = rng.pick([F(1, 3), F(2, 3), F(1, 4), F(3, 4), F(2, 5), F(3, 5), F(1, 5), F(4, 5)]);
        const g1 = rng.pick(SIMPLES);
        const g2 = rng.pick(SIMPLES);
        if (g1.n === g2.n && g1.d === g2.d) return null;
        const p1 = mul(f, g1);
        const p2 = mul(sub(one, f), g2);
        const ans = add(p1, p2);
        if (ans.d > 60) return null;
        const moy = mul(add(g1, g2), F(1, 2));
        const ctx = rng.pick([
          ["Dans une promotion, les alternants représentent", "des étudiants", "des alternants", "des autres étudiants", "ont choisi l'option anglais renforcé", "de la promotion a choisi cette option"],
          ["Dans une entreprise, le siège emploie", "des salariés", "des salariés du siège", "des autres salariés", "sont en télétravail le vendredi", "des salariés est en télétravail le vendredi"],
        ] as const);
        const les = part;
        return {
          params: { f: ff(f), g1: ff(g1), g2: ff(g2) },
          statement: `${ctx[0]} ${les(f)} ${ctx[1]}. ${maj(les(g1))} ${ctx[2]} et ${les(g2)} ${ctx[3]} ${ctx[4]}. Quelle fraction ${ctx[5]} ?`,
          answer: FR(ans),
          distractors: [FR(moy), FR(add(mul(f, g2), mul(sub(one, f), g1))), FR(p1), ...(val(add(g1, g2)) < 1 ? [FR(add(g1, g2))] : [])],
          near: nearFrac(ans),
          steps: [
            `Premier groupe : ${ff(f)} × ${ff(g1)} = ${ff(p1)} du total.`,
            `Second groupe : il représente ${ff(sub(one, f))} du total, donc ${ff(sub(one, f))} × ${ff(g2)} = ${ff(p2)} du total.`,
            `Au total : ${ff(p1)} + ${ff(p2)} = ${ff(ans)}.`,
          ],
          trap: `Faire la moyenne des deux fractions (${ff(moy)}) suppose à tort que les deux groupes ont la même taille.`,
          tip: `Remplace les fractions par des effectifs : choisis un total divisible par tous les dénominateurs (par exemple ${f.d * g1.d * g2.d}) et compte.`,
          notion: "« Fraction d'une fraction » : on multiplie. Puis on additionne les deux groupes.",
          check: val(f) * val(g1) + (1 - val(f)) * val(g2),
        };
      }),
  },
  {
    id: "frac.partage-en-chaine",
    theme: T,
    subtheme: "Partage en plusieurs étapes",
    level: 3,
    gen: (rng): Draft =>
      until(rng, () => {
        const f1 = rng.pick([F(1, 2), F(1, 3), F(1, 4), F(2, 5), F(1, 5), F(3, 8)]);
        const f2 = rng.pick([F(1, 2), F(1, 3), F(2, 3), F(3, 4), F(2, 5), F(3, 5)]);
        const k = rng.pick([100, 200, 300, 500, 1000]);
        const total = f1.d * f2.d * k;
        const r1 = sub(one, f1);
        const part1 = (total * f1.n) / f1.d;
        const part2 = (total * r1.n * f2.n) / (r1.d * f2.d);
        const part3 = total - part1 - part2;
        if (part2 === part3 || part1 === part2 || total > 60000) return null;
        return {
          params: { f1: ff(f1), f2: ff(f2), part3 },
          statement: `Trois associés se partagent un bénéfice. Le premier reçoit ${part(f1)} du total. Le deuxième reçoit ${part(f2)} de ce qui reste. Le troisième reçoit le solde, soit ${eur(part3)}. Combien reçoit le deuxième associé ?`,
          answer: E(part2),
          distractors: [E(Math.round((total * f2.n) / f2.d)), E(part1), E(total), E(Math.round((part3 * f2.n) / f2.d))],
          near: nearBy(E, part2, k),
          steps: [
            `Après le premier associé, il reste ${ff(r1)} du bénéfice.`,
            `Le troisième reçoit ${ff(sub(one, f2))} de ce reste, soit ${ff(mul(r1, sub(one, f2)))} du bénéfice = ${eur(part3)}.`,
            `Bénéfice total : ${eur(part3)} × ${mul(r1, sub(one, f2)).d}/${mul(r1, sub(one, f2)).n} = ${eur(total)}.`,
            `Part du deuxième : ${ff(r1)} × ${ff(f2)} = ${ff(mul(r1, f2))} du bénéfice, soit ${eur(part2)}.`,
          ],
          trap: `Le deuxième reçoit ${ff(f2)} du reste, pas ${ff(f2)} du bénéfice total.`,
          tip: `Le deuxième et le troisième se partagent le même reste dans le rapport ${f2.n} pour ${f2.d - f2.n} : part du deuxième = ${eur(part3)} × ${f2.n}/${f2.d - f2.n}.`,
          notion: "Dans un partage en chaîne, chaque fraction s'applique à ce qui reste à cet instant.",
          check: (part3 / (1 - val(f2))) * val(f2),
        };
      }),
  },
];

function gcdLocal(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}
