import { V, nearBy, until } from "../engine/build";
import { ARTICLES } from "../engine/contextes";
import { eur, nb, pc, spc } from "../engine/format";
import type { Draft, Template } from "../engine/types";

const T = "pourcentages" as const;
const E = V(eur);
const N = V((x) => nb(x));
const P = V(pc);
const SP = V(spc);

/** Décompose un pourcentage en blocs faciles : 35 % = 3 × 10 % + 5 %. */
function blocs(p: number): string {
  if (p === 25) return "25 % = un quart";
  if (p === 50) return "50 % = la moitié";
  if (p === 75) return "75 % = les trois quarts";
  if (p === 20) return "20 % = un cinquième";
  const dix = Math.floor(p / 10);
  const reste = p % 10;
  if (reste === 0) return `${p} % = ${dix} × 10 %`;
  if (dix === 0) return "5 % = la moitié de 10 %";
  return `${p} % = ${dix} × 10 % + 5 %`;
}

const coef = (p: number, up: boolean) => nb(up ? 1 + p / 100 : 1 - p / 100);

export const pourcentages: Template[] = [
  {
    id: "pct.part",
    theme: T,
    subtheme: "Calculer un pourcentage d'une quantité",
    level: 1,
    gen: (rng): Draft => {
      const n = rng.pick([40, 60, 80, 120, 160, 200, 240, 300, 360, 400, 480, 500, 600, 800]);
      const p = rng.pick([5, 15, 20, 25, 30, 35, 40, 45, 60, 65, 70, 75, 80, 85]);
      const ans = (n / 20) * (p / 5);
      const ctx = rng.pick([
        `Une école de commerce compte ${nb(n)} étudiants, dont ${p} % sont en alternance. Combien d'étudiants sont en alternance ?`,
        `Une entreprise emploie ${nb(n)} salariés, dont ${p} % travaillent à temps partiel. Combien de salariés travaillent à temps partiel ?`,
        `Sur ${nb(n)} candidats à un concours, ${p} % sont admis. Combien de candidats sont admis ?`,
        `Un magasin a vendu ${nb(n)} articles dans la journée, dont ${p} % en promotion. Combien d'articles ont été vendus en promotion ?`,
      ]);
      return {
        params: { n, p },
        statement: ctx,
        answer: N(ans),
        distractors: [N(n - ans), N((n / 20) * ((p + 10) / 5)), N((n / 20) * ((p - 5) / 5)), N((n / 20) * ((p + 5) / 5))],
        near: nearBy(N, ans, n / 20),
        steps: [
          `Prendre ${p} % d'une quantité, c'est la multiplier par ${p}/100.`,
          `${nb(n)} × ${p}/100 = ${nb(ans)}.`,
        ],
        trap: `${nb(n - ans)} correspond aux ${100 - p} % restants, pas aux ${p} % demandés.`,
        tip: `Calcule d'abord 10 % (${nb(n / 10)}), puis assemble : ${blocs(p)}.`,
        notion: "p % d'une quantité = quantité × p/100.",
        check: (n * p) / 100,
      };
    },
  },
  {
    id: "pct.variation-simple",
    theme: T,
    subtheme: "Appliquer une hausse ou une baisse",
    level: 1,
    gen: (rng): Draft => {
      const prix = rng.pick([40, 60, 80, 120, 140, 160, 180, 200, 240, 260, 300, 320, 360, 400, 480, 520, 600, 640, 800]);
      const p = rng.pick([5, 10, 15, 20, 25, 30, 35, 40]);
      const up = rng.bool();
      const delta = (prix / 20) * (p / 5);
      const ans = up ? prix + delta : prix - delta;
      const art = rng.pick(ARTICLES);
      return {
        params: { prix, p, sens: up ? "hausse" : "baisse" },
        statement: `${art} coûte ${eur(prix)}. Son prix ${up ? "augmente" : "baisse"} de ${p} %. Quel est son nouveau prix ?`,
        answer: E(ans),
        distractors: [E(up ? prix + p : prix - p), E(delta), E(up ? prix - delta : prix + delta)],
        near: nearBy(E, ans, prix / 20),
        steps: [
          `Montant de la ${up ? "hausse" : "baisse"} : ${eur(prix)} × ${p}/100 = ${eur(delta)}.`,
          `Nouveau prix : ${eur(prix)} ${up ? "+" : "−"} ${eur(delta)} = ${eur(ans)}.`,
          `En une seule étape : ${eur(prix)} × ${coef(p, up)} = ${eur(ans)}.`,
        ],
        trap: `${eur(delta)} est le montant de la variation, pas le nouveau prix. Et ${p} % ne veut pas dire ${p} €.`,
        tip: `${up ? "Augmenter" : "Baisser"} de ${p} %, c'est multiplier par ${coef(p, up)}. Retiens le coefficient plutôt que deux opérations.`,
        notion: "Hausse de p % : × (1 + p/100). Baisse de p % : × (1 − p/100).",
        check: prix * (up ? 1 + p / 100 : 1 - p / 100),
      };
    },
  },
  {
    id: "pct.evolutions-successives",
    theme: T,
    subtheme: "Enchaîner deux variations",
    level: 2,
    gen: (rng): Draft =>
      until(rng, () => {
        const prix = rng.pick([200, 400, 500, 600, 800, 1000, 1200, 1500, 2000]);
        const a = rng.pick([10, 20, 25, 30, 40, 50]);
        const b = rng.pick([10, 20, 25, 30, 40, 50]);
        const up1 = rng.bool();
        const up2 = rng.bool(up1 ? 0.3 : 0.7);
        const f1 = up1 ? 100 + a : 100 - a;
        const f2 = up2 ? 100 + b : 100 - b;
        const ans = ((prix / 100) * f1 * f2) / 100;
        const somme = (prix * (100 + (up1 ? a : -a) + (up2 ? b : -b))) / 100;
        if (somme <= 0 || Math.abs(somme - ans) < 0.005) return null;
        const art = rng.pick(ARTICLES);
        const v = (up: boolean) => (up ? "augmente" : "baisse");
        const inter = (prix * f1) / 100;
        return {
          params: { prix, a, b, sens1: v(up1), sens2: v(up2) },
          statement: `${art} coûte ${eur(prix)}. Son prix ${v(up1)} de ${a} %, puis ${v(up2)} de ${b} %. Quel est son prix final ?`,
          answer: E(ans),
          distractors: [E(somme), E(inter), E(prix), E((prix * f2) / 100)],
          near: nearBy(E, ans, prix / 50),
          steps: [
            `Première variation : ${eur(prix)} × ${coef(a, up1)} = ${eur(inter)}.`,
            `Seconde variation, appliquée au nouveau prix : ${eur(inter)} × ${coef(b, up2)} = ${eur(ans)}.`,
            `Coefficient global : ${coef(a, up1)} × ${coef(b, up2)} = ${nb((f1 * f2) / 10000, 4)}.`,
          ],
          trap: `Additionner les deux taux donnerait ${eur(somme)} : c'est faux, car la seconde variation porte sur un prix déjà modifié.`,
          tip: "Multiplie les coefficients entre eux, puis applique le résultat au prix de départ.",
          notion: "Des variations successives se multiplient, elles ne s'additionnent pas.",
          check: prix * (up1 ? 1 + a / 100 : 1 - a / 100) * (up2 ? 1 + b / 100 : 1 - b / 100),
        };
      }),
  },
  {
    id: "pct.valeur-initiale",
    theme: T,
    subtheme: "Retrouver la valeur de départ",
    level: 2,
    gen: (rng): Draft =>
      until(rng, () => {
      const init = rng.pick([40, 60, 80, 100, 120, 160, 200, 240, 250, 300, 360, 400, 480, 500, 600, 800, 1000]);
      const p = rng.pick([10, 20, 25, 30, 40, 50, 60]);
      const up = rng.bool(0.35);
      const fin = up ? init * (1 + p / 100) : init * (1 - p / 100);
      if (!Number.isInteger(fin) || (fin * p) % 100 !== 0) return null;
      const art = rng.pick(ARTICLES);
      const piege = up ? fin - (fin * p) / 100 : fin + (fin * p) / 100;
      return {
        params: { fin, p, sens: up ? "hausse" : "remise" },
        statement: up
          ? `Après une hausse de ${p} %, ${art.toLowerCase()} coûte ${eur(fin)}. Quel était son prix avant la hausse ?`
          : `Après une remise de ${p} %, ${art.toLowerCase()} coûte ${eur(fin)}. Quel était son prix avant la remise ?`,
        answer: E(init),
        distractors: [E(piege), E(up ? fin - p : fin + p), E(up ? fin + (fin * p) / 100 : fin - (fin * p) / 100)],
        near: nearBy(E, init, init / 20),
        steps: [
          `Prix final = prix initial × ${coef(p, up)}.`,
          `Donc prix initial = ${eur(fin)} ÷ ${coef(p, up)} = ${eur(init)}.`,
          `Vérification : ${eur(init)} × ${coef(p, up)} = ${eur(fin)}.`,
        ],
        trap: `Appliquer ${p} % au prix final (${eur(piege)}) est faux : le pourcentage a été calculé sur le prix de départ.`,
        tip: `Teste les propositions : laquelle, ${up ? "augmentée" : "diminuée"} de ${p} %, donne ${eur(fin)} ?`,
        notion: "Pour remonter à la valeur initiale, on divise par le coefficient.",
        check: fin / (up ? 1 + p / 100 : 1 - p / 100),
      };
      }),
  },
  {
    id: "pct.taux-global",
    theme: T,
    subtheme: "Calculer une évolution globale",
    level: 2,
    gen: (rng): Draft =>
      until(rng, () => {
        const a = rng.pick([10, 20, 25, 30, 40, 50, 60]);
        const b = rng.pick([10, 20, 25, 30, 40, 50]);
        const up1 = rng.bool(0.6);
        const up2 = rng.bool(up1 ? 0.4 : 0.6);
        const s1 = up1 ? a : -a;
        const s2 = up2 ? b : -b;
        const ans = ((100 + s1) * (100 + s2)) / 100 - 100;
        if (Math.abs(ans) < 0.001) return null;
        const v = (up: boolean) => (up ? "augmente" : "diminue");
        const sujet = rng.pick([
          "Le chiffre d'affaires d'une entreprise",
          "Le nombre d'abonnés d'un média",
          "Le cours d'une action",
          "La fréquentation d'un musée",
        ]);
        return {
          params: { a: s1, b: s2 },
          statement: `${sujet} ${v(up1)} de ${a} % une année, puis ${v(up2)} de ${b} % l'année suivante. Quelle est l'évolution globale sur les deux ans ?`,
          answer: SP(ans),
          distractors: [SP(s1 + s2), SP(s1 + s2 - (s1 * s2) / 100), SP(-ans), SP((s1 * s2) / 100)].filter((x) => x.v > -100),
          near: (k) => (ans + k * 2.5 > -100 ? SP(ans + k * 2.5) : null),
          steps: [
            `Coefficients : ${coef(a, up1)} puis ${coef(b, up2)}.`,
            `Coefficient global : ${coef(a, up1)} × ${coef(b, up2)} = ${nb((100 + s1) * (100 + s2) / 10000, 4)}.`,
            `Soit une évolution de ${spc(ans)}.`,
          ],
          trap: `La somme des deux taux (${spc(s1 + s2)}) oublie que la seconde variation s'applique à une base différente.`,
          tip: "Pars de 100 : applique la première variation, puis la seconde, et lis l'écart avec 100.",
          notion: "Évolution globale = produit des coefficients − 1.",
          check: ((1 + s1 / 100) * (1 + s2 / 100) - 1) * 100,
          allowNonPositive: true,
        };
      }),
  },
  {
    id: "pct.retour-initial",
    theme: T,
    subtheme: "Compenser une baisse",
    level: 3,
    gen: (rng): Draft => {
      const [p, ans] = rng.pick([
        [20, 25], [50, 100], [60, 150], [75, 300], [37.5, 60], [80, 400],
        [36, 56.25], [68, 212.5], [84, 525], [90, 900], [87.5, 700], [10, 100 / 9],
      ] as const);
      const sujet = rng.pick([
        ["Le cours d'une action", "il"],
        ["Le prix d'une matière première", "il"],
        ["La production d'une usine", "elle"],
        ["La valeur d'un portefeuille", "elle"],
      ] as const);
      const reste = 100 - p;
      return {
        params: { p },
        statement: `${sujet[0]} baisse de ${nb(p)} %. De quel pourcentage doit-${sujet[1]} augmenter ensuite pour retrouver son niveau initial ?`,
        answer: P(ans),
        distractors: [P(p), P(100 - p), P(p / 2)],
        near: nearBy(P, ans, 5),
        steps: [
          `Partons de 100. Après une baisse de ${nb(p)} %, il reste ${nb(reste)}.`,
          `Pour revenir à 100, il faut regagner ${nb(p)} à partir d'une base de ${nb(reste)}.`,
          `${nb(p)} ÷ ${nb(reste)} = ${nb(ans / 100, 4)}, soit une hausse de ${pc(ans)}.`,
        ],
        trap: `Une hausse de ${nb(p)} % ne suffit pas : elle s'appliquerait à ${nb(reste)}, pas à 100.`,
        tip: "Prends toujours 100 comme valeur de départ, et demande-toi sur quelle base porte chaque pourcentage.",
        notion: "Une baisse de p % se compense par une hausse de p/(100 − p).",
        check: (1 / (1 - p / 100) - 1) * 100,
      };
    },
  },
  {
    id: "pct.sous-populations",
    theme: T,
    subtheme: "Pourcentage de pourcentage",
    level: 3,
    gen: (rng): Draft =>
      until(rng, () => {
        const h = rng.pick([20, 25, 30, 40, 60, 70, 75, 80]);
        const a = rng.pick([10, 20, 30, 40, 50, 60, 70, 80]);
        const b = rng.pick([10, 20, 30, 40, 50, 60, 70, 80]);
        if (a === b) return null;
        const ans = (h * a + (100 - h) * b) / 100;
        const ctx = rng.pick([
          ["Dans une entreprise", "des salariés sont des femmes", "des femmes", "des hommes", "sont cadres", "des salariés sont cadres"],
          ["Dans une école", "des étudiants sont en première année", "des étudiants de première année", "des autres étudiants", "sont boursiers", "des étudiants sont boursiers"],
          ["Dans un club de sport", "des adhérents sont mineurs", "des mineurs", "des majeurs", "pratiquent la compétition", "des adhérents pratiquent la compétition"],
        ] as const);
        return {
          params: { h, a, b },
          statement: `${ctx[0]}, ${h} % ${ctx[1]}. ${a} % ${ctx[2]} et ${b} % ${ctx[3]} ${ctx[4]}. Quel pourcentage ${ctx[5]} ?`,
          answer: P(ans),
          distractors: [P((a + b) / 2), P((h * b + (100 - h) * a) / 100), P((h * a) / 100)],
          near: nearBy(P, ans, 1.5),
          steps: [
            `Raisonnons sur 100 personnes : ${h} dans le premier groupe, ${100 - h} dans le second.`,
            `Premier groupe : ${h} × ${a}/100 = ${nb((h * a) / 100)}.`,
            `Second groupe : ${100 - h} × ${b}/100 = ${nb(((100 - h) * b) / 100)}.`,
            `Total : ${nb((h * a) / 100)} + ${nb(((100 - h) * b) / 100)} = ${nb(ans)} sur 100, soit ${pc(ans)}.`,
          ],
          trap: `La moyenne simple des deux taux (${pc((a + b) / 2)}) serait juste seulement si les deux groupes avaient la même taille.`,
          tip: "Fixe l'effectif total à 100 et compte les personnes, groupe par groupe.",
          notion: "Un taux global est la moyenne des taux pondérée par la taille des groupes.",
          check: (h / 100) * a + (1 - h / 100) * b,
        };
      }),
  },
  {
    id: "pct.taux-de-marque",
    theme: T,
    subtheme: "Marge exprimée sur le prix de vente",
    level: 3,
    gen: (rng): Draft => {
      const pv = rng.pick([40, 60, 80, 100, 120, 160, 200, 240, 300, 400, 500, 600]);
      const m = rng.pick([20, 25, 30, 40, 50, 60]);
      const achat = pv - (pv / 20) * (m / 5);
      const piege = achat * (1 + m / 100);
      return {
        params: { achat, m },
        statement: `Un commerçant achète un article ${eur(achat)}. Il veut que sa marge représente ${m} % du prix de vente. À quel prix doit-il le vendre ?`,
        answer: E(pv),
        distractors: [E(piege), E(achat + m), E(achat * (1 + (2 * m) / 100))],
        near: nearBy(E, pv, pv / 20),
        steps: [
          `La marge vaut ${m} % du prix de vente : le prix d'achat représente donc ${100 - m} % du prix de vente.`,
          `Prix de vente = ${eur(achat)} ÷ ${nb(1 - m / 100)} = ${eur(pv)}.`,
          `Vérification : marge = ${eur(pv)} − ${eur(achat)} = ${eur(pv - achat)}, soit ${m} % de ${eur(pv)}.`,
        ],
        trap: `Ajouter ${m} % au prix d'achat (${eur(piege)}) donne une marge calculée sur l'achat, pas sur la vente.`,
        tip: `Repère toujours la base du pourcentage. Ici « du prix de vente » : l'achat pèse ${100 - m} %.`,
        notion: "Marge sur prix de vente de m % : prix de vente = prix d'achat ÷ (1 − m/100).",
        check: achat / (1 - m / 100),
      };
    },
  },
];
