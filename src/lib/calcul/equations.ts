import { V, nearBy, until } from "../engine/build";
import { eur, nb, plural } from "../engine/format";
import type { Draft, Template } from "../engine/types";

const T = "equations" as const;
const N = V((x) => nb(x));
const cents = (x: number) => eur(x / 100);
const tm = (k: number, v: string) => (k === 1 ? v : `${k}${v}`);

export const equations: Template[] = [
  {
    id: "eq.nombre-mystere",
    theme: T,
    subtheme: "Équation du premier degré",
    level: 1,
    gen: (rng): Draft => {
      const [k, mot] = rng.pick([[2, "double"], [3, "triple"], [4, "quadruple"], [5, "quintuple"]] as const);
      const x = rng.int(3, 25);
      const b = rng.int(2, 20);
      const plus = rng.bool();
      const c = plus ? k * x + b : k * x - b;
      return {
        params: { k, b, c, op: plus ? "+" : "−" },
        statement: `Le ${mot} d'un nombre, ${plus ? "augmenté" : "diminué"} de ${b}, est égal à ${c}. Quel est ce nombre ?`,
        answer: N(x),
        distractors: [N(Math.round((plus ? c + b : c - b) / k)), N(plus ? c - b : c + b), N(Math.round(c / k))],
        near: nearBy(N, x, 1),
        steps: [
          `Mise en équation : ${k}x ${plus ? "+" : "−"} ${b} = ${c}.`,
          `${k}x = ${c} ${plus ? "−" : "+"} ${b} = ${plus ? c - b : c + b}.`,
          `x = ${plus ? c - b : c + b} ÷ ${k} = ${x}.`,
        ],
        trap: `Attention au sens de l'opération : « ${plus ? "augmenté" : "diminué"} de ${b} » se défait en ${plus ? "retranchant" : "ajoutant"} ${b}.`,
        tip: `Teste les propositions : ${k} × ${x} ${plus ? "+" : "−"} ${b} = ${c}. C'est souvent plus rapide que de résoudre.`,
        notion: "Résoudre ax + b = c : on isole ax, puis on divise par a.",
        check: (c - (plus ? b : -b)) / k,
      };
    },
  },
  {
    id: "eq.ages",
    theme: T,
    subtheme: "Problèmes d'âges",
    level: 2,
    gen: (rng): Draft =>
      until(rng, () => {
        const k = rng.pick([2, 3, 4]);
        const futur = rng.bool(0.6);
        const f = rng.int(4, 20);
        const n = rng.int(2, 12);
        // futur : P + n = k(F + n) ; passé : P − n = k(F − n)
        const p = futur ? k * (f + n) - n : k * (f - n) + n;
        if (!futur && f - n < 2) return null;
        if (p - f < 20 || p - f > 42 || p > 75) return null;
        const mot = k === 2 ? "le double" : k === 3 ? "le triple" : "le quadruple";
        const [parent, enfant] = rng.pick([["Un père", "son fils"], ["Une mère", "sa fille"], ["Un père", "sa fille"], ["Une mère", "son fils"]] as const);
        const A = V((x) => plural(x, "an"));
        return {
          params: { p, f, k, sens: futur ? "futur" : "passé" },
          statement: futur
            ? `${parent} a ${p} ans et ${enfant} a ${f} ans. Dans combien d'années l'âge du parent sera-t-il ${mot} de celui de l'enfant ?`
            : `${parent} a ${p} ans et ${enfant} a ${f} ans. Il y a combien d'années l'âge du parent était-il ${mot} de celui de l'enfant ?`,
          answer: A(n),
          distractors: [A(Math.abs(p - k * f)), A(p - f), A(Math.round((p - f) / k)), A(n + 2)],
          near: nearBy(A, n, 1),
          steps: [
            futur
              ? `Dans x années : ${p} + x = ${k} × (${f} + x).`
              : `Il y a x années : ${p} − x = ${k} × (${f} − x).`,
            futur
              ? `${p} + x = ${k * f} + ${k}x, donc ${p - k * f} = ${k - 1}x.`
              : `${p} − x = ${k * f} − ${k}x, donc ${k - 1}x = ${k * f - p}.`,
            `x = ${n}. Vérification : ${futur ? p + n : p - n} = ${k} × ${futur ? f + n : f - n}.`,
          ],
          trap: "Les deux personnes vieillissent en même temps : il faut ajouter (ou retirer) x aux deux âges.",
          tip: `L'écart d'âge (${p - f} ans) ne change jamais. Quand le parent a ${mot}, l'enfant a ${Math.round((p - f) / (k - 1))} ans.`,
          notion: "Problèmes d'âges : poser l'inconnue x sur la durée, et l'appliquer aux deux personnes.",
          check: futur ? (p - k * f) / (k - 1) : (k * f - p) / (k - 1),
        };
      }),
  },
  {
    id: "eq.tetes-pattes",
    theme: T,
    subtheme: "Système à deux inconnues",
    level: 2,
    gen: (rng): Draft =>
      until(rng, () => {
        const ctx = rng.pick([
          { lieu: "Dans une ferme, on compte des poules et des lapins", a: "poules", b: "lapins", ua: "une poule", ub: "un lapin", pa: 2, pb: 4, tete: "têtes", patte: "pattes" },
          { lieu: "Sur un parking, on compte des motos et des voitures", a: "motos", b: "voitures", ua: "une moto", ub: "une voiture", pa: 2, pb: 4, tete: "véhicules", patte: "roues" },
          { lieu: "Dans une salle, on compte des tabourets à 3 pieds et des chaises à 4 pieds", a: "tabourets", b: "chaises", ua: "un tabouret", ub: "une chaise", pa: 3, pb: 4, tete: "sièges", patte: "pieds" },
        ]);
        const na = rng.int(4, 25);
        const nbB = rng.int(4, 25);
        if (na === nbB) return null;
        const t = na + nbB;
        const p = na * ctx.pa + nbB * ctx.pb;
        const askB = rng.bool(0.6);
        const ans = askB ? nbB : na;
        return {
          params: { t, p, question: askB ? ctx.b : ctx.a },
          statement: `${ctx.lieu} : ${t} ${ctx.tete} et ${p} ${ctx.patte} au total. Combien y a-t-il de ${askB ? ctx.b : ctx.a} ?`,
          answer: N(ans),
          distractors: [N(askB ? na : nbB), N(Math.round(p / ctx.pb)), N(p - ctx.pa * t), N(Math.round(t / 2))],
          near: nearBy(N, ans, 1),
          steps: [
            `Supposons que tout soit des ${ctx.a} : ${t} × ${ctx.pa} = ${t * ctx.pa} ${ctx.patte}.`,
            `Il manque ${p} − ${t * ctx.pa} = ${p - t * ctx.pa} ${ctx.patte}. Remplacer ${ctx.ua} par ${ctx.ub} en ajoute ${ctx.pb - ctx.pa}.`,
            `Nombre de ${ctx.b} : ${p - t * ctx.pa} ÷ ${ctx.pb - ctx.pa} = ${nbB}. Nombre de ${ctx.a} : ${t} − ${nbB} = ${na}.`,
          ],
          trap: `Vérifie bien ce qui est demandé : ${askB ? na : nbB} est le nombre de ${askB ? ctx.a : ctx.b}.`,
          tip: "Méthode de la fausse supposition : suppose que tout est du même type, puis corrige l'écart. Pas besoin de poser un système.",
          notion: "Système x + y = total et ax + by = total pondéré.",
          check: askB ? (p - ctx.pa * t) / (ctx.pb - ctx.pa) : (ctx.pb * t - p) / (ctx.pb - ctx.pa),
        };
      }),
  },
  {
    id: "eq.consecutifs",
    theme: T,
    subtheme: "Nombres consécutifs",
    level: 2,
    gen: (rng): Draft => {
      const type = rng.pick(["entiers consécutifs", "nombres pairs consécutifs", "nombres impairs consécutifs"] as const);
      const pas = type === "entiers consécutifs" ? 1 : 2;
      const count = rng.pick([3, 3, 5]);
      let milieu = rng.int(8, 60);
      if (type === "nombres pairs consécutifs" && milieu % 2) milieu++;
      if (type === "nombres impairs consécutifs" && milieu % 2 === 0) milieu++;
      const s = milieu * count;
      const demi = ((count - 1) / 2) * pas;
      const grand = rng.bool();
      const ans = grand ? milieu + demi : milieu - demi;
      return {
        params: { s, count, type, question: grand ? "plus grand" : "plus petit" },
        statement: `La somme de ${count} ${type} est égale à ${s}. Quel est le plus ${grand ? "grand" : "petit"} de ces nombres ?`,
        answer: N(ans),
        distractors: [N(milieu), N(grand ? milieu - demi : milieu + demi), N(grand ? milieu + demi + pas : milieu - demi - pas), N(Math.round(s / (count - 1)))],
        near: nearBy(N, ans, pas),
        steps: [
          `Pour des nombres régulièrement espacés, celui du milieu est la moyenne : ${s} ÷ ${count} = ${milieu}.`,
          `Les nombres vont de ${milieu - demi} à ${milieu + demi}, par pas de ${pas}.`,
          `Le plus ${grand ? "grand" : "petit"} est ${ans}.`,
        ],
        trap: `${milieu} est le nombre du milieu, pas le plus ${grand ? "grand" : "petit"}.`,
        tip: "Divise la somme par le nombre de termes : tu obtiens directement le terme central.",
        notion: "Dans une suite régulière de n termes (n impair), le terme central vaut somme ÷ n.",
        check: s / count + (grand ? 1 : -1) * demi,
      };
    },
  },
  {
    id: "eq.systeme-prix",
    theme: T,
    subtheme: "Système à deux inconnues",
    level: 3,
    gen: (rng): Draft =>
      until(rng, () => {
        const [o1, o2] = rng.pick([
          ["café", "croissant"], ["stylo", "cahier"], ["sandwich", "boisson"], ["menu", "dessert"],
        ] as const);
        const x = rng.int(6, 22) * 20; // centimes
        const y = rng.int(4, 18) * 20;
        const [a, b, c, d] = [rng.int(1, 5), rng.int(1, 5), rng.int(1, 5), rng.int(1, 5)];
        if (x === y || a * d === b * c || (a === c) || (b === d)) return null;
        const t1 = a * x + b * y;
        const t2 = c * x + d * y;
        const q = rng.pick(["somme", "premier", "second"] as const);
        const ans = q === "somme" ? x + y : q === "premier" ? x : y;
        const C = V(cents);
        const pl = (n: number, w: string) => `${n} ${n > 1 ? w + "s" : w}`;
        return {
          params: { a, b, t1, c, d, t2, question: q },
          statement: `${pl(a, o1)} et ${pl(b, o2)} coûtent ${cents(t1)}. ${pl(c, o1)} et ${pl(d, o2)} coûtent ${cents(t2)}. Combien ${
            q === "somme" ? `coûtent 1 ${o1} et 1 ${o2}` : `coûte 1 ${q === "premier" ? o1 : o2}`
          } ?`,
          answer: C(ans),
          distractors: [
            C(q === "somme" ? x : x + y),
            C(q === "second" ? x : y),
            C(Math.round((t1 + t2) / (a + b + c + d) / 10) * 10),
            C(Math.abs(x - y)),
          ],
          near: nearBy(C, ans, 20),
          steps: [
            `Notons x le prix unitaire du premier article (${o1}) et y celui du second (${o2}) : ${tm(a, "x")} + ${tm(b, "y")} = ${nb(t1 / 100, 2, 2)} et ${tm(c, "x")} + ${tm(d, "y")} = ${nb(t2 / 100, 2, 2)}.`,
            `On élimine x en combinant les deux équations (la 1re × ${c}, la 2e × ${a}, puis soustraction) : y = ${nb(y / 100, 2, 2)}.`,
            `On reporte : x = ${nb(x / 100, 2, 2)}.`,
            q === "somme" ? `Donc x + y = ${cents(x + y)}.` : `La réponse demandée est ${cents(ans)}.`,
          ],
          trap: "Relis la question : prix d'un article, de l'autre, ou des deux ensemble ?",
          tip:
            q === "somme" && (a + c) === (b + d)
              ? `Ici, additionner les deux lignes donne ${a + c} de chaque : il suffit de diviser ${cents(t1 + t2)} par ${a + c}.`
              : "Avant de résoudre, regarde si additionner ou soustraire les deux lignes donne directement ce qui est demandé.",
          notion: "Système de deux équations : éliminer une inconnue par combinaison.",
          check: (() => {
            const det = a * d - b * c;
            const xs = (t1 * d - b * t2) / det;
            const ys = (a * t2 - c * t1) / det;
            return q === "somme" ? xs + ys : q === "premier" ? xs : ys;
          })(),
        };
      }),
  },
  {
    id: "eq.distribution",
    theme: T,
    subtheme: "Mise en équation",
    level: 3,
    gen: (rng): Draft =>
      until(rng, () => {
        const n = rng.int(6, 30);
        const a = rng.int(2, 6);
        const b = a + rng.int(1, 3);
        const r = rng.int(2, 15);
        const s = (b - a) * n - r;
        if (s < 1) return null;
        const total = a * n + r;
        const ctx = rng.pick([
          ["Un professeur distribue des stylos à ses élèves", "stylos", "élève", "élèves"],
          ["Un bénévole distribue des colis à des familles", "colis", "famille", "familles"],
          ["Un animateur distribue des bonbons à des enfants", "bonbons", "enfant", "enfants"],
        ] as const);
        const askN = rng.bool(0.65);
        const ans = askN ? n : total;
        return {
          params: { a, b, r, s, question: askN ? "effectif" : "total" },
          statement: `${ctx[0]}. S'il en donne ${a} par ${ctx[2]}, il lui en reste ${r}. S'il en donne ${b} par ${ctx[2]}, il lui en manque ${s}. Combien ${askN ? `y a-t-il ${/^[aeioué]/.test(ctx[3]) ? "d'" : "de "}${ctx[3]}` : `a-t-il de ${ctx[1]}`} ?`,
          answer: N(ans),
          distractors: askN
            ? [N(Math.round(Math.abs(r - s) / (b - a))), N(r + s), N(Math.round((r + s) / (a + b))), N(n + (b - a))]
            : [N(b * n + s), N(a * n), N(b * n), N(total + r)],
          near: nearBy(N, ans, askN ? 1 : a),
          steps: [
            `Soit n le nombre de ${ctx[3]}. Le stock vaut ${a}n + ${r} (premier cas) et ${b}n − ${s} (second cas).`,
            `${a}n + ${r} = ${b}n − ${s}, donc ${r} + ${s} = ${b - a}n, soit n = ${n}.`,
            `Stock : ${a} × ${n} + ${r} = ${total} ${ctx[1]}.`,
          ],
          trap: "« Il en reste » s'ajoute au stock distribué ; « il en manque » se retranche.",
          tip: `Passer de ${a} à ${b} par ${ctx[2]} consomme le reste (${r}) plus le manque (${s}) : ${r + s} ÷ ${b - a} = ${n}.`,
          notion: "Deux expressions d'une même quantité : on les égalise.",
          check: askN ? (r + s) / (b - a) : a * ((r + s) / (b - a)) + r,
        };
      }),
  },
];
