import { V, nearBy, until } from "../engine/build";
import { fr, hDec, hm, nb, plural } from "../engine/format";
import type { Draft, Template } from "../engine/types";

const T = "travail" as const;
const H = V((x) => plural(x, "heure"));
const DUR = V(hm);

const CTX = [
  { a: "Un robinet", b: "un second robinet", tache: "remplit un bassin", inf: "remplir le bassin", ens: "Les deux robinets sont ouverts ensemble" },
  { a: "Une imprimante", b: "une seconde imprimante", tache: "imprime un tirage", inf: "imprimer le tirage", ens: "Les deux imprimantes fonctionnent ensemble" },
  { a: "Un peintre", b: "un second peintre", tache: "repeint un appartement", inf: "repeindre l'appartement", ens: "Les deux peintres travaillent ensemble" },
  { a: "Une pompe", b: "une seconde pompe", tache: "vide une cuve", inf: "vider la cuve", ens: "Les deux pompes fonctionnent ensemble" },
] as const;

/** Couples (a, b) dont le temps commun ab/(a+b) est un nombre entier d'heures. */
const ENTIERS: [number, number][] = [
  [3, 6], [4, 12], [6, 12], [10, 15], [12, 24], [20, 30], [15, 30], [10, 40], [5, 20], [9, 18],
  [21, 42], [8, 24], [6, 30], [28, 21], [14, 35], [36, 45], [24, 40], [30, 45], [10, 90], [12, 4],
];
/** Couples dont le temps commun tombe sur un nombre entier de minutes (non entier en heures). */
const MINUTES: [number, number][] = [
  [2, 3], [4, 6], [2, 6], [1, 2], [1, 3], [2, 4], [3, 7], [1, 4], [2, 8], [3, 9], [5, 15], [4, 8], [2, 10], [6, 9], [5, 7], [7, 8],
];

export const travail: Template[] = [
  {
    id: "trav.ensemble",
    theme: T,
    subtheme: "Travailler à deux",
    level: 1,
    gen: (rng): Draft => {
      const [x, y] = rng.pick(ENTIERS);
      const [a, b] = rng.bool() ? [x, y] : [y, x];
      const ans = (a * b) / (a + b);
      const c = rng.pick(CTX);
      return {
        params: { a, b },
        statement: `${c.a} ${c.tache} en ${a} heures ; ${c.b} met ${b} heures pour le même travail. ${c.ens}. Combien de temps faut-il pour ${c.inf} ?`,
        answer: H(ans),
        distractors: [H((a + b) / 2), H(a + b), H(Math.abs(a - b)), H(Math.min(a, b))],
        near: nearBy(H, ans, 1),
        steps: [
          `En 1 heure, le premier fait 1/${a} du travail et le second 1/${b}.`,
          `Ensemble : 1/${a} + 1/${b} = ${fr(a + b, a * b)} du travail par heure.`,
          `Durée : l'inverse de la cadence, soit ${a * b} ÷ ${a + b} = ${plural(ans, "heure")}.`,
        ],
        trap: `À deux, on va forcément plus vite que le plus rapide seul (${Math.min(a, b)} h) : la moyenne des durées (${nb((a + b) / 2)} h) est impossible.`,
        tip: `Formule directe : produit ÷ somme, soit ${a} × ${b} ÷ (${a} + ${b}).`,
        notion: "On additionne les cadences (fractions du travail par heure), jamais les durées.",
        check: 1 / (1 / a + 1 / b),
      };
    },
  },
  {
    id: "trav.ensemble-minutes",
    theme: T,
    subtheme: "Travailler à deux",
    level: 2,
    gen: (rng): Draft => {
      const [x, y] = rng.pick(MINUTES);
      const [a, b] = rng.bool() ? [x, y] : [y, x];
      const min = Math.round((a * b * 60) / (a + b));
      const dec = (a * b) / (a + b);
      const cent = Math.round((dec - Math.floor(dec)) * 100);
      const net = Math.abs((dec - Math.floor(dec)) * 100 - cent) < 1e-9 && cent < 60 && cent > 0;
      const piege = net ? Math.floor(dec) * 60 + cent : min + 20;
      const c = rng.pick(CTX);
      return {
        params: { a, b },
        statement: `${c.a} ${c.tache} en ${plural(a, "heure")} ; ${c.b} met ${plural(b, "heure")} pour le même travail. ${c.ens}. Combien de temps faut-il pour ${c.inf} ?`,
        answer: DUR(min),
        distractors: [DUR(piege), DUR(((a + b) / 2) * 60), DUR(Math.min(a, b) * 60), DUR(min + 12)],
        near: nearBy(DUR, min, 10),
        steps: [
          `Cadences : 1/${a} + 1/${b} = ${fr(a + b, a * b)} du travail par heure.`,
          `Durée : l'inverse de la cadence, soit ${fr(a * b, a + b)} h.`,
          `En minutes : ${a * b} × 60 ÷ ${a + b} = ${min} min, soit ${hm(min)}.`,
        ],
        trap: net ? `${nb(dec, 2)} h ne se lit pas « ${hm(piege)} » : la partie décimale se multiplie par 60.` : `À deux, on va forcément plus vite que le plus rapide seul (${plural(Math.min(a, b), "heure")}) : élimine les propositions supérieures.`,
        tip: "Convertis en minutes avant de diviser : tu évites les heures décimales.",
        notion: "Temps à deux = (a × b) ÷ (a + b), à convertir ensuite en heures et minutes.",
        check: 60 / (1 / a + 1 / b),
      };
    },
  },
  {
    id: "trav.partenaire-seul",
    theme: T,
    subtheme: "Retrouver le temps d'un seul",
    level: 2,
    gen: (rng): Draft => {
      const [x, y] = rng.pick(ENTIERS);
      const [a, b] = rng.bool() ? [x, y] : [y, x];
      const t = (a * b) / (a + b);
      const c = rng.pick(CTX);
      return {
        params: { a, t },
        statement: `${c.ens} : il leur faut ${plural(t, "heure")} pour ${c.inf}. ${c.a.replace(/^Une? /, (m) => (m === "Un " ? "Le premier " : "La première "))}, seul${c.a.startsWith("Une") ? "e" : ""}, mettrait ${a} heures. Combien de temps mettrait ${c.b.replace("un second", "le second").replace("une seconde", "la seconde")} seul${c.a.startsWith("Une") ? "e" : ""} ?`,
        answer: H(b),
        distractors: [H(a - t), H(a + t), H(2 * t), H(Math.round((a * t) / (a + t)))],
        near: nearBy(H, b, 1),
        steps: [
          `Cadence commune : 1/${t} du travail par heure. Cadence du premier : 1/${a}.`,
          `Cadence du second : 1/${t} − 1/${a} = ${fr(a - t, a * t)}.`,
          `Durée du second seul : ${a * t} ÷ ${a - t} = ${plural(b, "heure")}.`,
        ],
        trap: `Soustraire les durées (${a} − ${t} = ${a - t} h) n'a pas de sens : ce sont les cadences qui se soustraient.`,
        tip: `Formule directe : produit ÷ différence, soit ${a} × ${t} ÷ (${a} − ${t}).`,
        notion: "Cadence de l'un = cadence commune − cadence de l'autre.",
        check: 1 / (1 / t - 1 / a),
      };
    },
  },
  {
    id: "trav.remplir-vider",
    theme: T,
    subtheme: "Remplissage et vidange simultanés",
    level: 3,
    gen: (rng): Draft => {
      const [a, b, ans] = rng.pick([
        [3, 6, 6], [4, 12, 6], [4, 6, 12], [6, 10, 15], [10, 15, 30], [8, 24, 12], [6, 9, 18], [2, 6, 3], [3, 12, 4],
        [4, 20, 5], [5, 30, 6], [12, 20, 30], [10, 35, 14], [6, 15, 10], [12, 36, 18], [15, 60, 20], [8, 12, 24], [6, 12, 12],
      ] as const);
      const ctx = rng.pick([
        `Un robinet remplit une baignoire en ${a} heures. La bonde, mal fermée, la viderait en ${b} heures. On ouvre le robinet alors que la baignoire est vide et que la bonde fuit. Au bout de combien de temps la baignoire est-elle pleine ?`,
        `Une pompe remplit un réservoir en ${a} heures. Une vanne de vidange le viderait en ${b} heures. Le réservoir est vide ; on met la pompe en marche en laissant la vanne ouverte. Au bout de combien de temps le réservoir est-il plein ?`,
      ]);
      return {
        params: { a, b },
        statement: ctx,
        answer: H(ans),
        distractors: [H(Math.round((a * b) / (a + b))), H(b - a), H(a + b), H(Math.round((a + b) / 2))],
        near: nearBy(H, ans, 1),
        steps: [
          `En 1 heure, le remplissage apporte 1/${a} du volume et la fuite en retire 1/${b}.`,
          `Bilan par heure : 1/${a} − 1/${b} = ${fr(b - a, a * b)} du volume.`,
          `Durée : ${a * b} ÷ ${b - a} = ${plural(ans, "heure")}.`,
        ],
        trap: `Les deux actions s'opposent : il faut soustraire les cadences. Les additionner donnerait environ ${nb(Math.round(((a * b) / (a + b)) * 10) / 10)} h, soit moins que le remplissage seul, sans fuite.`,
        tip: `Contrôle de vraisemblance : avec une fuite, le remplissage dure forcément plus de ${a} h. Élimine d'abord les propositions inférieures.`,
        notion: "Actions opposées : cadence nette = cadence de remplissage − cadence de vidange.",
        check: 1 / (1 / a - 1 / b),
      };
    },
  },
  {
    id: "trav.relais",
    theme: T,
    subtheme: "Travail en deux temps",
    level: 3,
    gen: (rng): Draft =>
      until(rng, () => {
        const [x, y] = rng.pick(ENTIERS);
        const [a, b] = rng.bool() ? [x, y] : [y, x];
        const solo = rng.int(1, Math.min(a - 1, 8));
        const suite = ((a - solo) * b * 60) / (a + b);
        if (!Number.isInteger(suite) || suite % 5 !== 0 || suite < 30) return null;
        const total = solo * 60 + suite;
        const ensemble = ((a * b) / (a + b)) * 60;
        return {
          params: { a, b, solo },
          statement: `Un artisan met ${a} heures pour réaliser seul un chantier ; son collègue mettrait ${b} heures. L'artisan commence seul et travaille ${plural(solo, "heure")}, puis son collègue le rejoint et ils terminent ensemble. Quelle est la durée totale du chantier ?`,
          answer: DUR(total),
          distractors: [DUR(suite), DUR(ensemble), DUR(solo * 60 + ensemble), DUR(Math.round(((a + b) / 2) * 60))],
          near: nearBy(DUR, total, 15),
          steps: [
            `En ${plural(solo, "heure")}, l'artisan réalise ${fr(solo, a)} du chantier. Il reste ${fr(a - solo, a)}.`,
            `À deux, la cadence est 1/${a} + 1/${b} = ${fr(a + b, a * b)} du chantier par heure.`,
            `Durée de la seconde phase : ${fr(a - solo, a)} ÷ ${fr(a + b, a * b)} = ${hDec(suite)}.`,
            `Durée totale : ${plural(solo, "heure")} + ${hm(suite)} = ${hm(total)}.`,
          ],
          trap: `${hm(suite)} n'est que la durée de la seconde phase : la question porte sur le chantier entier.`,
          tip: "Découpe le problème : fraction déjà réalisée, fraction restante, puis cadence commune appliquée au reste.",
          notion: "Travail en plusieurs phases : on suit la fraction du travail accomplie à chaque étape.",
          check: solo * 60 + ((1 - solo / a) / (1 / a + 1 / b)) * 60,
        };
      }),
  },
];
