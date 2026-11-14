import { V, nearBy } from "../engine/build";
import { PRENOMS } from "../engine/contextes";
import { eur, nb, pc, plural } from "../engine/format";
import type { Draft, Template } from "../engine/types";

const T = "interets" as const;
const E = V(eur);
const P = V(pc);
const A = V((x) => plural(x, "an"));

export const interets: Template[] = [
  {
    id: "int.simples",
    theme: T,
    subtheme: "Intérêts simples",
    level: 1,
    gen: (rng): Draft => {
      const c = rng.pick([500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 8000, 10000]);
      const t = rng.pick([2, 3, 4, 5, 6]);
      const n = rng.pick([2, 3, 4, 5]);
      const an = (c / 100) * t;
      const total = an * n;
      const valeur = rng.bool();
      const ans = valeur ? c + total : total;
      const qui = rng.pick(PRENOMS);
      return {
        params: { c, t, n, question: valeur ? "valeur acquise" : "intérêts" },
        statement: `${qui} place ${eur(c)} à intérêts simples au taux annuel de ${t} % pendant ${n} ans. ${
          valeur ? "Quelle est la valeur du placement à l'échéance ?" : "Quel est le montant total des intérêts perçus ?"
        }`,
        answer: E(ans),
        distractors: [E(valeur ? total : c + total), E(valeur ? c + an : an), E((c * (t + n)) / 100)],
        near: nearBy(E, ans, an / 2),
        steps: [
          `Intérêts d'une année : ${eur(c)} × ${t}/100 = ${eur(an)}.`,
          `À intérêts simples, ce montant est le même chaque année : ${eur(an)} × ${n} = ${eur(total)}.`,
          ...(valeur ? [`Somme disponible : ${eur(c)} + ${eur(total)} = ${eur(c + total)}.`] : []),
        ],
        trap: valeur
          ? `${eur(total)} ne représente que les intérêts : la question porte sur la somme totale.`
          : `${eur(an)} correspond à une seule année, et ${eur(c + total)} inclut le capital.`,
        tip: "Lis la dernière phrase avant de calculer : intérêts seuls ou capital + intérêts ?",
        notion: "Intérêts simples = capital × taux × durée. Ils sont calculés uniquement sur le capital de départ.",
        check: valeur ? c * (1 + (t * n) / 100) : (c * t * n) / 100,
      };
    },
  },
  {
    id: "int.simples-mois",
    theme: T,
    subtheme: "Intérêts simples sur une durée en mois",
    level: 2,
    gen: (rng): Draft => {
      const c = rng.pick([1200, 2400, 3600, 4800, 6000, 7200, 12000]);
      const t = rng.pick([2, 3, 4, 5, 6]);
      const m = rng.pick([3, 4, 6, 8, 9, 15, 18]);
      const ans = (c / 1200) * t * m;
      const an = (c / 100) * t;
      return {
        params: { c, t, m },
        statement: `Un capital de ${eur(c)} est placé à intérêts simples au taux annuel de ${t} % pendant ${m} mois. Quel est le montant des intérêts ?`,
        answer: E(ans),
        distractors: [E(an), E((c * t * m) / 100), E((c / 100) * m)],
        near: nearBy(E, ans, c / 1200),
        steps: [
          `Intérêts pour une année entière : ${eur(c)} × ${t}/100 = ${eur(an)}.`,
          `${m} mois représentent ${m}/12 d'année.`,
          `Intérêts : ${eur(an)} × ${m}/12 = ${eur(ans)}.`,
        ],
        trap: `${eur(an)} correspond à 12 mois. Le taux est annuel : il faut le ramener à la durée réelle.`,
        tip: `Calcule l'intérêt d'un mois (${eur(an / 12)}) puis multiplie par ${m}.`,
        notion: "Intérêts simples sur n mois = capital × taux annuel × n/12.",
        check: c * (t / 100) * (m / 12),
      };
    },
  },
  {
    id: "int.simples-inverse",
    theme: T,
    subtheme: "Retrouver le taux ou la durée",
    level: 2,
    gen: (rng): Draft => {
      const c = rng.pick([2000, 4000, 6000, 8000, 10000, 20000]);
      const t = rng.pick([1.5, 2, 2.5, 3, 4, 5, 6]);
      const n = rng.pick([2, 3, 4, 5, 6, 8]);
      const total = (c / 100) * t * n;
      const taux = rng.bool();
      if (taux) {
        return {
          params: { c, n, total, question: "taux" },
          statement: `Un capital de ${eur(c)} placé à intérêts simples rapporte ${eur(total)} d'intérêts en ${n} ans. Quel est le taux annuel du placement ?`,
          answer: P(t),
          distractors: [P(t * n), P(t / 2), P(t * 2), P((total / c) * 10)],
          near: nearBy(P, t, 0.5),
          steps: [
            `Intérêts par an : ${eur(total)} ÷ ${n} = ${eur(total / n)}.`,
            `Taux annuel : ${eur(total / n)} ÷ ${eur(c)} = ${nb(t / 100, 4)}, soit ${pc(t)}.`,
          ],
          trap: `${pc(t * n)} est le rendement total sur ${n} ans, pas le taux annuel.`,
          tip: "Ramène d'abord les intérêts à une année, puis compare au capital.",
          notion: "Taux annuel = intérêts d'une année ÷ capital.",
          check: (total / n / c) * 100,
        };
      }
      return {
        params: { c, t, total, question: "durée" },
        statement: `Un capital de ${eur(c)} est placé à intérêts simples au taux annuel de ${nb(t)} %. Au bout de combien de temps aura-t-il rapporté ${eur(total)} d'intérêts ?`,
        answer: A(n),
        distractors: [A(n + 1), A(n - 1), A(n * 2), A(n + 2)],
        near: nearBy(A, n, 1),
        steps: [
          `Intérêts par an : ${eur(c)} × ${nb(t)}/100 = ${eur((c / 100) * t)}.`,
          `Durée : ${eur(total)} ÷ ${eur((c / 100) * t)} = ${n} ans.`,
        ],
        tip: "Calcule ce que rapporte une année, puis compte combien d'années il faut.",
        notion: "Durée = intérêts totaux ÷ intérêts d'une année.",
        check: total / ((c * t) / 100),
      };
    },
  },
  {
    id: "int.composes-2ans",
    theme: T,
    subtheme: "Intérêts composés sur deux ans",
    level: 2,
    gen: (rng): Draft => {
      const c = rng.pick([1000, 2000, 5000, 10000, 20000]);
      const t = rng.pick([2, 3, 4, 5, 10, 20]);
      const v1 = (c / 100) * (100 + t);
      const v2 = (v1 / 100) * (100 + t);
      const simple = c + 2 * (c / 100) * t;
      const ecart = v2 - simple;
      return {
        params: { c, t },
        statement: `On place ${eur(c)} à intérêts composés au taux annuel de ${t} %. Quelle est la valeur du placement au bout de 2 ans ?`,
        answer: E(v2),
        distractors: [E(simple), E(v1), E(v2 - c), E(v2 + ecart)],
        near: nearBy(E, v2, ecart),
        steps: [
          `Fin de la 1re année : ${eur(c)} × ${nb(1 + t / 100)} = ${eur(v1)}.`,
          `Fin de la 2e année, les intérêts portent sur ${eur(v1)} : ${eur(v1)} × ${nb(1 + t / 100)} = ${eur(v2)}.`,
        ],
        trap: `${eur(simple)} correspond à des intérêts simples : on oublie les intérêts produits par les intérêts de la 1re année (${eur(ecart)}).`,
        tip: `Calcule en intérêts simples (${eur(simple)}), puis ajoute « les intérêts des intérêts » : ${eur((c / 100) * t)} × ${t} % = ${eur(ecart)}.`,
        notion: "Intérêts composés : valeur = capital × (1 + taux)ⁿ.",
        check: c * (1 + t / 100) ** 2,
      };
    },
  },
  {
    id: "int.ecart-simples-composes",
    theme: T,
    subtheme: "Comparer intérêts simples et composés",
    level: 3,
    gen: (rng): Draft => {
      const c = rng.pick([5000, 10000, 20000, 40000, 50000]);
      const t = rng.pick([2, 3, 4, 5, 6, 8, 10]);
      const an = (c / 100) * t;
      const ans = (an / 100) * t;
      return {
        params: { c, t },
        statement: `Deux placements de ${eur(c)} sont rémunérés au taux annuel de ${t} % pendant 2 ans : l'un à intérêts simples, l'autre à intérêts composés. Quel est l'écart entre les deux au bout de 2 ans ?`,
        answer: E(ans),
        distractors: [E(an), E(ans * 2), E(ans / 2), E(an * 2)],
        near: nearBy(E, ans, ans / 2),
        steps: [
          `La 1re année, les deux placements rapportent la même chose : ${eur(an)}.`,
          `La 2e année, le placement à intérêts composés rapporte en plus ${t} % sur les intérêts de la 1re année.`,
          `Écart : ${eur(an)} × ${t}/100 = ${eur(ans)}.`,
        ],
        trap: `${eur(an)} est l'intérêt d'une année, pas la différence entre les deux placements.`,
        tip: "Inutile de calculer les deux valeurs finales : l'écart sur 2 ans vaut capital × taux².",
        notion: "Sur 2 ans, composés − simples = capital × taux².",
        check: c * (1 + t / 100) ** 2 - c * (1 + (2 * t) / 100),
      };
    },
  },
  {
    id: "int.composes-3ans",
    theme: T,
    subtheme: "Intérêts composés sur trois ans",
    level: 3,
    gen: (rng): Draft => {
      const [t, caps] = rng.pick([
        [10, [1000, 2000, 5000, 10000]],
        [20, [1000, 5000, 10000]],
        [5, [8000, 16000, 40000, 80000]],
        [50, [800, 1600, 2000, 4000]],
      ] as const);
      const c = rng.pick(caps);
      const k = 100 + t;
      const v1 = (c * k) / 100;
      const v2 = (v1 * k) / 100;
      const v3 = (v2 * k) / 100;
      const simple = c + 3 * (c / 100) * t;
      return {
        params: { c, t },
        statement: `Un capital de ${eur(c)} est placé à intérêts composés au taux annuel de ${t} %. Quelle est sa valeur au bout de 3 ans ?`,
        answer: E(v3),
        distractors: [E(simple), E(v2), E(v3 - c), E(simple + (v3 - simple) / 2)],
        near: nearBy(E, v3, (c / 100) * t / 2),
        steps: [
          `Année 1 : ${eur(c)} × ${nb(k / 100)} = ${eur(v1)}.`,
          `Année 2 : ${eur(v1)} × ${nb(k / 100)} = ${eur(v2)}.`,
          `Année 3 : ${eur(v2)} × ${nb(k / 100)} = ${eur(v3)}.`,
        ],
        trap: `${eur(simple)} correspond à des intérêts simples (3 × ${t} %). À intérêts composés, chaque année s'appuie sur la valeur de l'année précédente.`,
        tip: `Mémorise les cubes utiles : 1,1³ = 1,331 ; 1,2³ = 1,728 ; 1,5³ = 3,375 ; 1,05³ ≈ 1,158.`,
        notion: "Intérêts composés : valeur = capital × (1 + taux)ⁿ.",
        check: c * (1 + t / 100) ** 3,
      };
    },
  },
];
