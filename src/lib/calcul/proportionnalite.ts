import { V, nearBy, until } from "../engine/build";
import { eur, nb, plural, unit } from "../engine/format";
import type { Draft, Template } from "../engine/types";

const T = "proportionnalite" as const;
const E = V(eur);
const N = V((x) => nb(x));

export const proportionnalite: Template[] = [
  {
    id: "prop.regle-de-trois",
    theme: T,
    subtheme: "Règle de trois",
    level: 1,
    gen: (rng): Draft =>
      until(rng, (): Draft | null => {
        const recette = rng.bool(0.4);
        if (recette) {
          const base = rng.pick([4, 6, 8]);
          const par = rng.pick([25, 30, 40, 50, 60, 75]);
          const cible = rng.pick([3, 5, 7, 9, 10, 12, 14, 15]);
          if (cible === base) return null;
          const q = base * par;
          const ans = cible * par;
          const ing = rng.pick(["de farine", "de sucre", "de riz", "de chocolat", "de pâtes"]);
          const G = V((x) => unit(x, "g"));
          return {
            params: { base, q, cible },
            statement: `Une recette prévue pour ${base} personnes demande ${nb(q)} g ${ing}. Quelle quantité faut-il pour ${cible} personnes ?`,
            answer: G(ans),
            distractors: [G(q + (cible - base) * 10), G(Math.round((q * base) / cible)), G(q * cible)],
            near: nearBy(G, ans, par),
            steps: [
              `Quantité pour 1 personne : ${nb(q)} ÷ ${base} = ${par} g.`,
              `Pour ${cible} personnes : ${par} × ${cible} = ${nb(ans)} g.`,
            ],
            tip: "Passe toujours par l'unité : « pour 1 », puis « pour n ».",
            notion: "Deux grandeurs proportionnelles : on multiplie les deux par le même nombre.",
            check: (q / base) * cible,
          };
        }
        const u = rng.pick([12, 15, 20, 24, 25, 30, 35, 40, 45, 60]) / 10;
        const a = rng.int(2, 8);
        const b = rng.int(3, 15);
        if (a === b) return null;
        const prod = rng.pick(["de pommes", "de tomates", "d'oranges", "de cerises", "de farine", "de pommes de terre"]);
        const p = a * u;
        const ans = b * u;
        return {
          params: { a, p, b },
          statement: `${a} kg ${prod} coûtent ${eur(p)}. Combien coûtent ${b} kg ?`,
          answer: E(ans),
          distractors: [E(Math.round(((p * a) / b) * 2) / 2), E(p + (b - a)), E(u), E(p * b)],
          near: nearBy(E, ans, u),
          steps: [
            `Prix d'un kilo : ${eur(p)} ÷ ${a} = ${eur(u)}.`,
            `Prix de ${b} kg : ${eur(u)} × ${b} = ${eur(ans)}.`,
          ],
          trap: `${eur(u)} est le prix d'un seul kilo : il reste à multiplier par ${b}.`,
          tip: "Passe par le prix unitaire, ou repère un rapport simple entre les deux quantités.",
          notion: "Proportionnalité directe : quand une grandeur est multipliée par k, l'autre aussi.",
          check: (p / a) * b,
        };
      }),
  },
  {
    id: "prop.inverse",
    theme: T,
    subtheme: "Proportionnalité inverse",
    level: 2,
    gen: (rng): Draft =>
      until(rng, () => {
        const n = rng.int(2, 12);
        const m = rng.int(2, 15);
        const d = rng.int(3, 30);
        const w = n * d;
        if (m === n || w % m !== 0 || (d * m) % n !== 0) return null;
        const ans = w / m;
        if (ans === d || ans < 2) return null;
        const direct = (d * m) / n;
        const ctx = rng.pick([
          { q: "ouvriers", un: "un seul ouvrier", tache: "construisent un mur", u: "jour", fin: "au même rythme" },
          { q: "pompes identiques", un: "une seule pompe", tache: "vident une piscine", u: "heure", fin: "dans les mêmes conditions" },
          { q: "camions", un: "un seul camion", tache: "évacuent les gravats d'un chantier", u: "jour", fin: "au même rythme" },
          { q: "correcteurs", un: "un seul correcteur", tache: "corrigent un lot de copies", u: "heure", fin: "au même rythme" },
        ]);
        const D = V((x) => plural(x, ctx.u));
        return {
          params: { n, d, m },
          statement: `${n} ${ctx.q} ${ctx.tache} en ${plural(d, ctx.u)}. Combien de temps faudrait-il à ${m} ${ctx.q}, ${ctx.fin} ?`,
          answer: D(ans),
          distractors: [D(Math.round(direct * 10) / 10), D(d + (n - m)), D(d)],
          near: nearBy(D, ans, 1),
          steps: [
            `Travail total : ${n} × ${d} = ${w} ${ctx.u}s pour ${ctx.un}.`,
            `Avec ${m} ${ctx.q} : ${w} ÷ ${m} = ${plural(ans, ctx.u)}.`,
          ],
          trap: `Appliquer une règle de trois classique donnerait ${plural(direct, ctx.u)} : or ${m > n ? "plus on est nombreux, moins" : "moins on est nombreux, plus"} cela prend de temps.`,
          tip: `Vérifie le sens avant de calculer : ${m > n ? "plus" : "moins"} de moyens, donc ${m > n ? "moins" : "plus"} de temps que ${plural(d, ctx.u)}. Élimine les propositions du mauvais côté.`,
          notion: "Proportionnalité inverse : le produit (effectif × durée) reste constant.",
          check: d * (n / m),
        };
      }),
  },
  {
    id: "prop.echelle",
    theme: T,
    subtheme: "Échelle d'une carte",
    level: 2,
    gen: (rng): Draft => {
      const e = rng.pick([25000, 50000, 100000, 200000, 250000, 500000]);
      const c = rng.pick([2, 3, 4, 5, 6, 7, 8, 12, 15]);
      const ans = (c * e) / 100000;
      const K = V((x) => unit(x, "km", 4));
      return {
        params: { e, c },
        statement: `Sur une carte à l'échelle 1/${nb(e)}, deux villes sont séparées de ${c} cm. Quelle est la distance réelle entre ces deux villes ?`,
        answer: K(ans),
        distractors: [K(ans * 10), K(ans / 10), K(ans * 100), K(ans / 100)],
        near: nearBy(K, ans, ans / 2),
        steps: [
          `1 cm sur la carte représente ${nb(e)} cm en réalité.`,
          `${c} cm représentent ${c} × ${nb(e)} = ${nb(c * e)} cm.`,
          `Conversion : ${nb(c * e)} cm = ${nb((c * e) / 100)} m = ${nb(ans, 4)} km.`,
        ],
        trap: "L'erreur classique est dans la conversion : 1 km = 1 000 m = 100 000 cm.",
        tip: `Retiens l'équivalence une fois pour toutes : au 1/${nb(e)}, 1 cm sur la carte = ${nb(e / 100000, 4)} km.`,
        notion: "Distance réelle = distance sur la carte × dénominateur de l'échelle.",
        check: (c * e) / 1e5,
      };
    },
  },
  {
    id: "prop.partage",
    theme: T,
    subtheme: "Partage proportionnel",
    level: 2,
    gen: (rng): Draft =>
      until(rng, () => {
        const parts = [rng.int(2, 12), rng.int(2, 12), rng.int(2, 12)];
        if (new Set(parts).size < 3) return null;
        const k = rng.pick([50, 100, 150, 200, 250, 300]);
        const tot = parts[0] + parts[1] + parts[2];
        const s = k * tot;
        const i = rng.int(0, 2);
        const ans = k * parts[i];
        const ctx = rng.pick([
          ["Une prime", "trois salariés", "leur ancienneté", "ans", "le salarié qui a", " d'ancienneté"],
          ["Un bénéfice", "trois associés", "leur nombre de parts", "parts", "l'associé qui détient", ""],
          ["Un héritage", "trois héritiers", "leur nombre de parts", "parts", "l'héritier qui détient", ""],
        ] as const);
        return {
          params: { s, parts: parts.join(";"), i },
          statement: `${ctx[0]} de ${eur(s)} est partagé${ctx[0].startsWith("Une") ? "e" : ""} entre ${ctx[1]} proportionnellement à ${ctx[2]} : ${parts[0]}, ${parts[1]} et ${parts[2]} ${ctx[3]}. Quelle somme reçoit ${ctx[4]} ${parts[i]} ${ctx[3]}${ctx[5]} ?`,
          answer: E(ans),
          distractors: [E(Math.round(s / 3)), E(k * parts[(i + 1) % 3]), E(k * parts[(i + 2) % 3])],
          near: nearBy(E, ans, k),
          steps: [
            `Nombre total de parts : ${parts.join(" + ")} = ${tot}.`,
            `Valeur d'une part : ${eur(s)} ÷ ${tot} = ${eur(k)}.`,
            `Somme reçue : ${parts[i]} × ${eur(k)} = ${eur(ans)}.`,
          ],
          trap: `Un partage en trois parts égales (${eur(Math.round(s / 3))}) ne tient pas compte de la proportionnalité.`,
          tip: "Additionne les parts, calcule la valeur d'une part, puis multiplie.",
          notion: "Partage proportionnel : chaque part vaut total ÷ somme des coefficients.",
          check: (s * parts[i]) / tot,
        };
      }),
  },
  {
    id: "prop.multiple-production",
    theme: T,
    subtheme: "Proportionnalité multiple",
    level: 3,
    gen: (rng): Draft =>
      until(rng, () => {
        const r = rng.pick([5, 10, 12, 15, 20, 25, 30, 40]);
        const a = rng.int(2, 6);
        const c = rng.int(2, 8);
        const d = rng.int(3, 12);
        const e = rng.int(2, 10);
        if (a === d || c === e) return null;
        const b = a * c * r;
        const ans = d * e * r;
        const ctx = rng.pick([
          ["machines", "produisent", "pièces"],
          ["imprimantes", "impriment", "affiches"],
          ["ouvriers", "assemblent", "meubles"],
        ] as const);
        return {
          params: { a, b, c, d, e },
          statement: `${a} ${ctx[0]} ${ctx[1]} ${nb(b)} ${ctx[2]} en ${c} heures. Combien ${/^[aeiou]/.test(ctx[2]) ? "d'" : "de "}${ctx[2]} ${d} ${ctx[0]} ${ctx[1]}-${ctx[0] === "ouvriers" ? "ils" : "elles"} en ${e} heures, au même rythme ?`,
          answer: N(ans),
          distractors: [N((b * d) / a), N((b * e) / c), N(b + (d - a) * (e - c) * r)],
          near: nearBy(N, ans, r * d),
          steps: [
            `Production d'une seule unité en 1 heure : ${nb(b)} ÷ (${a} × ${c}) = ${r} ${ctx[2]}.`,
            `Pour ${d} ${ctx[0]} pendant ${e} heures : ${r} × ${d} × ${e} = ${nb(ans)} ${ctx[2]}.`,
          ],
          trap: `Ne corriger qu'une seule des deux grandeurs donne ${nb((b * d) / a)} (effectif seul) ou ${nb((b * e) / c)} (durée seule).`,
          tip: `Applique les deux rapports à la suite : ${nb(b)} × ${d}/${a} × ${e}/${c}.`,
          notion: "Proportionnalité multiple : on ramène tout à l'unité (1 machine, 1 heure), puis on multiplie.",
          check: b * (d / a) * (e / c),
        };
      }),
  },
  {
    id: "prop.multiple-duree",
    theme: T,
    subtheme: "Proportionnalité multiple",
    level: 3,
    gen: (rng): Draft =>
      until(rng, () => {
        const r = rng.pick([5, 10, 12, 15, 20, 25, 30]);
        const a = rng.int(2, 6);
        const c = rng.int(2, 8);
        const d = rng.int(2, 10);
        const h = rng.int(2, 12);
        if (a === d || h === c) return null;
        const b = a * c * r;
        const f = d * h * r;
        const naive = (c * f) / b;
        const H = V((x) => plural(x, "heure"));
        return {
          params: { a, b, c, d, f },
          statement: `${a} machines produisent ${nb(b)} pièces en ${c} heures. Combien de temps faut-il à ${d} machines identiques pour produire ${nb(f)} pièces ?`,
          answer: H(h),
          distractors: [H(Math.round(naive)), H(Math.round(((c * f) / b) * (d / a))), H(h + 1)],
          near: nearBy(H, h, 1),
          steps: [
            `Une machine produit en 1 heure : ${nb(b)} ÷ (${a} × ${c}) = ${r} pièces.`,
            `${d} machines produisent donc ${d} × ${r} = ${nb(d * r)} pièces par heure.`,
            `Durée : ${nb(f)} ÷ ${nb(d * r)} = ${plural(h, "heure")}.`,
          ],
          trap: `La durée est proportionnelle au nombre de pièces, mais inversement proportionnelle au nombre de machines.`,
          tip: "Calcule d'abord la cadence horaire du nouvel atelier : la durée s'en déduit en une division.",
          notion: "Durée = quantité à produire ÷ (nombre de machines × cadence d'une machine).",
          check: f / ((b / (a * c)) * d),
        };
      }),
  },
];
