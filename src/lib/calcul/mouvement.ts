import { V, nearBy, until } from "../engine/build";
import { PRENOMS } from "../engine/contextes";
import { clock, hDec, hm, nb, unit } from "../engine/format";
import type { Draft, Template } from "../engine/types";

const T = "mouvement" as const;
const KM = V((x) => unit(x, "km"));
const KMH = V((x) => unit(x, "km/h"));
const DUR = V(hm);
const HEURE = V(clock);
const SEC = V((x) => unit(x, "s"));

const VEHICULES = ["Une voiture", "Un train", "Un bus", "Une moto", "Un camion"] as const;

export const mouvement: Template[] = [
  {
    id: "vit.distance",
    theme: T,
    subtheme: "Calculer une distance",
    level: 1,
    gen: (rng): Draft =>
      until(rng, () => {
        const v = rng.pick([40, 48, 50, 60, 72, 80, 90, 100, 120]);
        const t = rng.pick([15, 20, 30, 40, 45, 75, 80, 90, 100, 105, 135, 150, 165]);
        if ((v * t) % 60 !== 0) return null;
        const ans = (v * t) / 60;
        const h = Math.floor(t / 60);
        const m = t % 60;
        const piege = v * (h + m / 100);
        return {
          params: { v, t },
          statement: `${rng.pick(VEHICULES)} roule à la vitesse constante de ${v} km/h pendant ${hm(t)}. Quelle est la distance parcourue ?`,
          answer: KM(ans),
          distractors: [KM(Math.round(piege)), KM(v * (h || 1)), KM(Math.round((v * t) / 100))],
          near: nearBy(KM, ans, 5),
          steps: [
            `Durée en minutes : ${hm(t)} = ${t} min, soit ${t}/60 d'heure.`,
            `Distance = vitesse × temps = ${v} × ${t}/60 = ${nb(ans)} km.`,
          ],
          trap: m ? `${hm(t)} ne vaut pas ${nb(h + m / 100, 2)} h : une heure compte 60 minutes, pas 100.` : undefined,
          tip: v % 4 === 0 ? `À ${v} km/h, on parcourt ${v / 4} km par quart d'heure : compte les quarts d'heure.` : `À ${v} km/h, on parcourt ${v / 2} km par demi-heure : découpe la durée en demi-heures.`,
          notion: "Distance = vitesse × temps, avec des unités cohérentes (km, h, km/h).",
          check: v * (t / 60),
        };
      }),
  },
  {
    id: "vit.duree",
    theme: T,
    subtheme: "Calculer une durée",
    level: 1,
    gen: (rng): Draft =>
      until(rng, () => {
        const v = rng.pick([40, 48, 50, 60, 72, 80, 90, 100, 120]);
        const t = rng.pick([20, 40, 45, 75, 80, 100, 105, 135, 150, 165, 195]);
        if ((v * t) % 60 !== 0) return null;
        const d = (v * t) / 60;
        const dec = d / v;
        const cent = Math.round((dec - Math.floor(dec)) * 100);
        const net = Math.abs((dec - Math.floor(dec)) * 100 - cent) < 1e-9 && cent < 60 && cent > 0;
        const piege = net ? Math.floor(dec) * 60 + cent : t + 20;
        return {
          params: { v, d },
          statement: `Combien de temps faut-il pour parcourir ${nb(d)} km à la vitesse constante de ${v} km/h ?`,
          answer: DUR(t),
          distractors: [DUR(piege), DUR(t + 15), DUR(t - 10)],
          near: nearBy(DUR, t, 5),
          steps: [
            `Temps = distance ÷ vitesse = ${nb(d)} ÷ ${v} = ${hDec(t)}.`,
            `En minutes : ${nb(d)} × 60 ÷ ${v} = ${t} min, soit ${hm(t)}.`,
          ],
          trap: net ? `${nb(dec, 2)} h ne se lit pas « ${hm(piege)} » : la partie décimale doit être multipliée par 60.` : "Une durée en heures décimales se convertit en multipliant la partie décimale par 60.",
          tip: v % 4 === 0 ? `À ${v} km/h, on parcourt ${v / 4} km par quart d'heure : compte combien de quarts d'heure il faut.` : `À ${v} km/h, on parcourt ${v / 2} km par demi-heure : compte combien de demi-heures il faut.`,
          notion: "Temps = distance ÷ vitesse. 0,25 h = 15 min ; 0,5 h = 30 min ; 0,75 h = 45 min.",
          check: (d / v) * 60,
        };
      }),
  },
  {
    id: "vit.conversion",
    theme: T,
    subtheme: "Convertir km/h et m/s",
    level: 1,
    gen: (rng): Draft => {
      const ms = rng.pick([5, 10, 15, 20, 25, 30, 35, 40]);
      const kmh = (ms * 36) / 10;
      const versMs = rng.bool();
      const MS = V((x) => unit(x, "m/s"));
      if (versMs) {
        return {
          params: { kmh, sens: "km/h vers m/s" },
          statement: `Un véhicule roule à ${nb(kmh)} km/h. Quelle est sa vitesse en mètres par seconde ?`,
          answer: MS(ms),
          distractors: [MS(kmh * 3.6), MS(Math.round((kmh * 1000) / 60)), MS(kmh / 6), MS(ms * 2)],
          near: nearBy(MS, ms, 2.5),
          steps: [
            `${nb(kmh)} km/h = ${nb(kmh * 1000)} m en 3 600 s.`,
            `${nb(kmh * 1000)} ÷ 3 600 = ${ms} m/s.`,
          ],
          trap: "Pour passer des km/h aux m/s, on divise par 3,6 (on ne multiplie pas).",
          tip: "Repères : 36 km/h = 10 m/s ; 72 km/h = 20 m/s ; 108 km/h = 30 m/s.",
          notion: "km/h → m/s : diviser par 3,6. m/s → km/h : multiplier par 3,6.",
          check: (kmh * 1000) / 3600,
        };
      }
      return {
        params: { ms, sens: "m/s vers km/h" },
        statement: `${ms <= 10 ? "Un coureur avance" : "Un véhicule se déplace"} à ${ms} m/s. Quelle est sa vitesse en kilomètres par heure ?`,
        answer: KMH(kmh),
        distractors: [KMH(Math.round(ms / 3.6)), KMH(ms * 6), KMH(ms * 3)],
        near: nearBy(KMH, kmh, 9),
        steps: [
          `${ms} m/s = ${nb(ms * 3600)} m en une heure.`,
          `${nb(ms * 3600)} m = ${nb(kmh)} km, soit ${nb(kmh)} km/h.`,
        ],
        trap: "Pour passer des m/s aux km/h, on multiplie par 3,6 (on ne divise pas).",
        tip: "Repères : 10 m/s = 36 km/h ; 20 m/s = 72 km/h ; 30 m/s = 108 km/h.",
        notion: "m/s → km/h : multiplier par 3,6. km/h → m/s : diviser par 3,6.",
        check: (ms * 3600) / 1000,
      };
    },
  },
  {
    id: "vit.moyenne-aller-retour",
    theme: T,
    subtheme: "Vitesse moyenne sur deux trajets égaux",
    level: 2,
    gen: (rng): Draft => {
      const [v1, v2, ans] = rng.pick([
        [40, 60, 48], [30, 60, 40], [60, 90, 72], [60, 120, 80], [45, 90, 60], [20, 30, 24], [80, 120, 96],
        [40, 120, 60], [30, 70, 42], [50, 75, 60], [70, 105, 84], [90, 110, 99], [72, 90, 80], [48, 80, 60], [60, 84, 70],
      ] as const);
      const inv = rng.bool();
      const [a, b] = inv ? [v2, v1] : [v1, v2];
      const qui = rng.pick(PRENOMS);
      const ville = rng.pick(["Lyon", "Nantes", "Lille", "Bordeaux", "Rennes", "Tours"]);
      const d = (v1 * v2) / gcd2(v1, v2);
      return {
        params: { a, b },
        statement: rng.bool()
          ? `${qui} se rend à ${ville} à la vitesse moyenne de ${a} km/h, puis revient par la même route à ${b} km/h. Quelle est sa vitesse moyenne sur l'ensemble du trajet ?`
          : `${qui} parcourt la première moitié d'un trajet à ${a} km/h et la seconde moitié à ${b} km/h. Quelle est sa vitesse moyenne sur l'ensemble du trajet ?`,
        answer: KMH(ans),
        distractors: [KMH((v1 + v2) / 2), KMH(Math.round(Math.sqrt(v1 * v2))), KMH(Math.round(v1 + (v2 - v1) / 4))],
        near: nearBy(KMH, ans, 2),
        steps: [
          `Prenons une distance pratique : ${d} km pour chaque partie.`,
          `Temps à ${a} km/h : ${d} ÷ ${a} = ${nb(d / a)} h. Temps à ${b} km/h : ${d} ÷ ${b} = ${nb(d / b)} h.`,
          `Vitesse moyenne : distance totale ÷ temps total = ${2 * d} ÷ ${nb(d / a + d / b)} = ${ans} km/h.`,
        ],
        trap: `La moyenne des deux vitesses (${nb((v1 + v2) / 2)} km/h) est fausse : on passe plus de temps sur la partie lente, qui pèse donc davantage.`,
        tip: `Formule directe pour deux distances égales : 2 × ${a} × ${b} ÷ (${a} + ${b}). Le résultat est toujours inférieur à la moyenne simple.`,
        notion: "Vitesse moyenne = distance totale ÷ temps total (jamais la moyenne des vitesses).",
        check: 2 / (1 / v1 + 1 / v2),
      };
    },
  },
  {
    id: "vit.deux-etapes",
    theme: T,
    subtheme: "Vitesse moyenne sur deux durées",
    level: 2,
    gen: (rng): Draft =>
      until(rng, () => {
        const v1 = rng.pick([40, 50, 60, 70, 80, 90, 100, 110, 120]);
        const v2 = rng.pick([40, 50, 60, 70, 80, 90, 100, 110, 120]);
        const t1 = rng.int(1, 4);
        const t2 = rng.int(1, 4);
        if (v1 === v2 || t1 === t2) return null;
        const d = v1 * t1 + v2 * t2;
        if (d % (t1 + t2) !== 0) return null;
        const ans = d / (t1 + t2);
        const D = rng.bool(0.4);
        return {
          params: { v1, t1, v2, t2, question: D ? "distance" : "vitesse moyenne" },
          statement: `Un automobiliste roule ${t1} h à ${v1} km/h, puis ${t2} h à ${v2} km/h. ${D ? "Quelle distance totale a-t-il parcourue ?" : "Quelle est sa vitesse moyenne sur l'ensemble du trajet ?"}`,
          answer: D ? KM(d) : KMH(ans),
          distractors: D
            ? [KM(((v1 + v2) / 2) * (t1 + t2)), KM(v1 * t2 + v2 * t1), KM(v1 + v2)]
            : [KMH((v1 + v2) / 2), KMH(Math.round((v1 * t2 + v2 * t1) / (t1 + t2))), KMH(Math.round((2 * v1 * v2) / (v1 + v2)))],
          near: D ? nearBy(KM, d, 10) : nearBy(KMH, ans, 2),
          steps: [
            `Distance de la 1re étape : ${v1} × ${t1} = ${v1 * t1} km. Distance de la 2e étape : ${v2} × ${t2} = ${v2 * t2} km.`,
            `Distance totale : ${d} km en ${t1 + t2} h.`,
            ...(D ? [] : [`Vitesse moyenne : ${d} ÷ ${t1 + t2} = ${ans} km/h.`]),
          ],
          trap: D
            ? `Chaque vitesse s'applique à sa propre durée : multiplier la moyenne des vitesses par la durée totale donnerait ${nb(((v1 + v2) / 2) * (t1 + t2))} km.`
            : `La moyenne simple des vitesses (${nb((v1 + v2) / 2)} km/h) ne vaut que si les deux durées sont égales.`,
          tip: D
            ? "Calcule chaque étape séparément, puis additionne : deux multiplications simples."
            : `La vitesse moyenne est plus proche de celle de l'étape la plus longue en temps (${t1 > t2 ? v1 : v2} km/h).`,
          notion: "Vitesse moyenne = distance totale ÷ temps total : c'est une moyenne pondérée par les durées.",
          check: D ? v1 * t1 + v2 * t2 : (v1 * t1 + v2 * t2) / (t1 + t2),
        };
      }),
  },
  {
    id: "vit.rattrapage",
    theme: T,
    subtheme: "Cas de rattrapage",
    level: 3,
    gen: (rng): Draft =>
      until(rng, () => {
        const v1 = rng.pick([40, 50, 60, 70, 80, 90]);
        const v2 = v1 + rng.pick([10, 20, 30, 40]);
        const retard = rng.pick([30, 60, 90, 120]);
        const h0 = rng.pick([7, 8, 9, 10, 13, 14]) * 60 + rng.pick([0, 0, 30]);
        const avance = (v1 * retard) / 60;
        const tm = (avance * 60) / (v2 - v1);
        if (!Number.isInteger(tm) || tm % 5 !== 0 || tm > 480 || tm < 20) return null;
        const ans = h0 + retard + tm;
        if (ans > 22 * 60) return null;
        const [a, b] = rng.shuffle(PRENOMS).slice(0, 2);
        const dist = rng.bool(0.35);
        const dAns = (v2 * tm) / 60;
        if (dist && !Number.isInteger(dAns)) return null;
        const piege = h0 + retard + Math.round(((avance / v2) * 60) / 5) * 5;
        return {
          params: { v1, v2, retard, h0, question: dist ? "distance" : "heure" },
          statement: `${a} quitte Paris à ${clock(h0)} et roule à ${v1} km/h. ${b} part du même endroit à ${clock(h0 + retard)}, sur la même route, à ${v2} km/h. ${
            dist ? "À quelle distance de Paris les deux véhicules se rejoignent-ils ?" : "À quelle heure les deux véhicules se rejoignent-ils ?"
          }`,
          answer: dist ? KM(dAns) : HEURE(ans),
          distractors: dist
            ? [KM(avance), KM(Math.round((v1 * tm) / 60)), KM(Math.round((v2 * (retard + tm)) / 60))]
            : [HEURE(piege), HEURE(h0 + tm), HEURE(ans + 30), HEURE(h0 + retard + Math.round(tm / 2 / 5) * 5)],
          near: dist ? nearBy(KM, dAns, 10) : nearBy(HEURE, ans, 15),
          steps: [
            `Avance de ${a} au départ de ${b} : ${v1} km/h × ${hm(retard)} = ${nb(avance)} km.`,
            `${b} reprend ${v2} − ${v1} = ${v2 - v1} km chaque heure.`,
            `Durée du rattrapage : ${nb(avance)} ÷ ${v2 - v1} = ${hDec(tm)}.`,
            dist
              ? `Distance parcourue par ${b} en ${hm(tm)} à ${v2} km/h : ${nb(dAns)} km.`
              : `Heure de la rencontre : ${clock(h0 + retard)} + ${hm(tm)} = ${clock(ans)}.`,
          ],
          trap: `Pendant que ${b} roule, ${a} continue d'avancer : diviser l'avance par ${v2} km/h (et non par l'écart de vitesses) est l'erreur classique.`,
          tip: "Rattrapage : temps = avance ÷ différence des vitesses. La durée se compte à partir du départ du poursuivant.",
          notion: "Cas de rattrapage : on raisonne sur la vitesse relative (différence des vitesses).",
          check: dist ? (v2 * avance) / (v2 - v1) : h0 + retard + (avance / (v2 - v1)) * 60,
        };
      }),
  },
  {
    id: "vit.croisement",
    theme: T,
    subtheme: "Cas de croisement",
    level: 3,
    gen: (rng): Draft =>
      until(rng, () => {
        const v1 = rng.pick([60, 72, 80, 90, 100, 120, 150]);
        const v2 = rng.pick([60, 72, 80, 90, 100, 120, 150]);
        const tm = rng.pick([40, 45, 60, 75, 80, 90, 100, 120, 150]);
        if (v1 === v2 || (v1 * tm) % 60 !== 0 || (v2 * tm) % 60 !== 0) return null;
        const d1 = (v1 * tm) / 60;
        const d2 = (v2 * tm) / 60;
        const d = d1 + d2;
        if (d % 2 !== 0) return null;
        const [A, B] = rng.pick([["Paris", "Lyon"], ["Lille", "Reims"], ["Nantes", "Tours"], ["Toulouse", "Bordeaux"], ["Dijon", "Strasbourg"]] as const);
        const q = rng.pick(["distance", "durée"] as const);
        return {
          params: { d, v1, v2, question: q },
          statement: `Les villes de ${A} et ${B} sont reliées par une voie ferrée de ${nb(d)} km. Un train quitte ${A} vers ${B} à ${v1} km/h. Au même instant, un autre train quitte ${B} vers ${A} à ${v2} km/h. ${
            q === "distance" ? `À quelle distance de ${A} les deux trains se croisent-ils ?` : "Au bout de combien de temps les deux trains se croisent-ils ?"
          }`,
          answer: q === "distance" ? KM(d1) : DUR(tm),
          distractors:
            q === "distance"
              ? [KM(d / 2), KM(d2), KM(Math.round((d * v1) / v2 / 5) * 5), KM(Math.round(d1 / 2))]
              : [DUR(Math.round((d / v1) * 60 / 5) * 5), DUR(Math.round((d / ((v1 + v2) / 2)) * 60 / 5) * 5), DUR(Math.round((d / v2) * 60 / 5) * 5)].filter((x) => x.v <= 600),
          near: q === "distance" ? nearBy(KM, d1, 10) : nearBy(DUR, tm, 10),
          steps: [
            `Les trains se rapprochent l'un de l'autre de ${v1} + ${v2} = ${v1 + v2} km chaque heure.`,
            `Durée avant le croisement : ${nb(d)} ÷ ${v1 + v2} = ${hDec(tm)}.`,
            ...(q === "distance" ? [`Distance parcourue par le train parti de ${A} en ${hm(tm)} à ${v1} km/h : ${nb(d1)} km.`] : []),
          ],
          trap:
            q === "distance"
              ? `Les trains ne se croisent au milieu (${nb(d / 2)} km) que s'ils roulent à la même vitesse. Et ${nb(d2)} km est la distance depuis ${B}.`
              : "Deux mobiles qui vont l'un vers l'autre : les vitesses s'ajoutent, elles ne se retranchent pas.",
          tip: `Les distances parcourues sont dans le même rapport que les vitesses : ${v1} pour ${v2}.`,
          notion: "Cas de croisement : temps = distance ÷ somme des vitesses.",
          check: q === "distance" ? (d * v1) / (v1 + v2) : (d / (v1 + v2)) * 60,
        };
      }),
  },
  {
    id: "vit.tunnel",
    theme: T,
    subtheme: "Longueur du mobile",
    level: 3,
    gen: (rng): Draft =>
      until(rng, () => {
        const ms = rng.pick([10, 15, 20, 25, 30, 40]);
        const kmh = (ms * 36) / 10;
        const L = rng.pick([100, 150, 200, 250, 300, 400]);
        const tun = rng.pick([500, 600, 800, 900, 1000, 1200, 1400, 1500, 1800, 2000, 2400, 3000]);
        if ((L + tun) % ms !== 0 || tun % ms !== 0) return null;
        const ans = (L + tun) / ms;
        const ouvrage = rng.pick(["un tunnel", "un pont", "un viaduc"]);
        return {
          params: { kmh, L, tun },
          statement: `Un train de ${L} m de long roule à ${nb(kmh)} km/h. Combien de temps met-il pour traverser entièrement ${ouvrage} de ${nb(tun)} m, entre l'instant où la locomotive y entre et celui où le dernier wagon en sort ?`,
          answer: SEC(ans),
          distractors: [SEC(tun / ms), SEC(Math.round((tun - L) / ms)), SEC(Math.round((2 * L + tun) / ms))],
          near: nearBy(SEC, ans, 5),
          steps: [
            `Vitesse en m/s : ${nb(kmh)} ÷ 3,6 = ${ms} m/s.`,
            `Pour que le dernier wagon sorte, la locomotive doit parcourir la longueur de l'ouvrage plus celle du train : ${nb(tun)} + ${L} = ${nb(tun + L)} m.`,
            `Durée : ${nb(tun + L)} ÷ ${ms} = ${ans} s.`,
          ],
          trap: `Oublier la longueur du train donne ${tun / ms} s : c'est l'instant où la locomotive sort, pas le dernier wagon.`,
          tip: "Dès qu'un énoncé donne la longueur du mobile, c'est qu'il faut l'ajouter à la distance.",
          notion: "Traversée complète : distance = longueur de l'ouvrage + longueur du mobile.",
          check: (L + tun) / (kmh / 3.6),
        };
      }),
  },
];

function gcd2(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}
