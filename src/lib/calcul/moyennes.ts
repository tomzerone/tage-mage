import { V, nearBy, until } from "../engine/build";
import { PRENOMS } from "../engine/contextes";
import { eur, nb } from "../engine/format";
import type { Draft, Template } from "../engine/types";

const T = "moyennes" as const;
const N = V((x) => nb(x));
const E = V(eur);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const MATIERES = ["mathématiques", "économie", "anglais", "marketing", "droit", "comptabilité"] as const;

export const moyennes: Template[] = [
  {
    id: "moy.simple",
    theme: T,
    subtheme: "Moyenne arithmétique",
    level: 1,
    gen: (rng): Draft =>
      until(rng, () => {
        const n = rng.pick([4, 5]);
        const notes = Array.from({ length: n }, () => rng.int(6, 18));
        const s = sum(notes);
        if ((s * 2) % n !== 0) return null;
        const ans = s / n;
        const mediane = (Math.max(...notes) + Math.min(...notes)) / 2;
        const qui = rng.pick(PRENOMS);
        return {
          params: { notes: notes.join(" ; ") },
          statement: `${qui} a obtenu les notes suivantes en ${rng.pick(MATIERES)} : ${notes.join(" ; ")}. Quelle est sa moyenne ?`,
          answer: N(ans),
          distractors: [N(mediane), N(Math.round((s / (n - 1)) * 2) / 2), N(Math.round((s / (n + 1)) * 2) / 2)],
          near: nearBy(N, ans, 0.5),
          steps: [
            `Somme des notes : ${notes.join(" + ")} = ${s}.`,
            `Moyenne : ${s} ÷ ${n} = ${nb(ans)}.`,
          ],
          trap: mediane !== ans ? `La moyenne n'est pas le milieu entre la plus haute et la plus basse note (${nb(mediane)}).` : undefined,
          tip: `Choisis une note de référence proche (par exemple ${Math.round(ans)}) et additionne seulement les écarts : s'ils se compensent, c'est la moyenne.`,
          notion: "Moyenne = somme des valeurs ÷ nombre de valeurs.",
          check: notes.reduce((a, b) => a + b / n, 0),
        };
      }),
  },
  {
    id: "moy.note-manquante",
    theme: T,
    subtheme: "Trouver la valeur manquante",
    level: 2,
    gen: (rng): Draft =>
      until(rng, () => {
        const n = rng.pick([3, 4, 5, 6]);
        const m = rng.int(8, 14);
        const cible = m + rng.pick([-1, 1, 1, 2]);
        const x = n * cible - (n - 1) * m;
        if (x < 2 || x > 20) return null;
        const qui = rng.pick(PRENOMS);
        const piege = 2 * cible - m;
        return {
          params: { n, m, cible },
          statement: `Après ${n - 1} contrôles, ${qui} a ${m} de moyenne. Quelle note faut-il obtenir au ${n}e contrôle pour que la moyenne passe à ${cible} ?`,
          answer: N(x),
          distractors: [N(piege), N(cible), N(cible + (cible - m)), N(x - 1)],
          near: nearBy(N, x, 1),
          steps: [
            `Total actuel : ${n - 1} × ${m} = ${(n - 1) * m} points.`,
            `Total nécessaire pour ${cible} de moyenne sur ${n} contrôles : ${n} × ${cible} = ${n * cible} points.`,
            `Note à obtenir : ${n * cible} − ${(n - 1) * m} = ${x}.`,
          ],
          trap: `Faire comme si la nouvelle note comptait autant que toutes les anciennes réunies conduit à ${piege}.`,
          tip: `Chaque contrôle précédent est à ${Math.abs(cible - m)} point${Math.abs(cible - m) > 1 ? "s" : ""} de la cible : ${cible} ${cible > m ? "+" : "−"} ${n - 1} × ${Math.abs(cible - m)} = ${x}.`,
          notion: "Raisonner en totaux : total = moyenne × effectif.",
          check: cible + (n - 1) * (cible - m),
        };
      }),
  },
  {
    id: "moy.ponderee",
    theme: T,
    subtheme: "Moyenne pondérée",
    level: 2,
    gen: (rng): Draft =>
      until(rng, () => {
        const mat = rng.shuffle(MATIERES).slice(0, 3);
        const coefs = [rng.int(1, 5), rng.int(1, 5), rng.int(1, 5)];
        const notes = [rng.int(6, 18), rng.int(6, 18), rng.int(6, 18)];
        const sc = sum(coefs);
        const pts = sum(notes.map((x, i) => x * coefs[i]));
        if ((pts * 2) % sc !== 0) return null;
        const ans = pts / sc;
        const simple = sum(notes) / 3;
        if (Math.abs(simple - ans) < 0.4 || new Set(coefs).size === 1) return null;
        const qui = rng.pick(PRENOMS);
        return {
          params: { notes: notes.join(";"), coefs: coefs.join(";") },
          statement: `${qui} a obtenu ${notes[0]} en ${mat[0]} (coefficient ${coefs[0]}), ${notes[1]} en ${mat[1]} (coefficient ${coefs[1]}) et ${notes[2]} en ${mat[2]} (coefficient ${coefs[2]}). Quelle est sa moyenne générale ?`,
          answer: N(ans),
          distractors: [N(Math.round(simple * 2) / 2), N(Math.round((pts / (sc + 1)) * 2) / 2)],
          near: nearBy(N, ans, 0.5),
          steps: [
            `Points : ${notes.map((x, i) => `${x} × ${coefs[i]}`).join(" + ")} = ${pts}.`,
            `Somme des coefficients : ${coefs.join(" + ")} = ${sc}.`,
            `Moyenne : ${pts} ÷ ${sc} = ${nb(ans)}.`,
          ],
          trap: `La moyenne simple des trois notes (${nb(simple)}) ignore les coefficients.`,
          tip: "La moyenne pondérée se rapproche toujours de la note qui a le plus gros coefficient : élimine les propositions du mauvais côté.",
          notion: "Moyenne pondérée = somme (note × coefficient) ÷ somme des coefficients.",
          check: notes.reduce((a, x, i) => a + (x * coefs[i]) / sc, 0),
        };
      }),
  },
  {
    id: "moy.deux-groupes",
    theme: T,
    subtheme: "Moyenne de deux groupes",
    level: 3,
    gen: (rng): Draft =>
      until(rng, () => {
        const n1 = rng.pick([10, 12, 15, 16, 18, 20, 24, 30]);
        const n2 = rng.pick([10, 12, 15, 16, 18, 20, 24, 30]);
        const m1 = rng.int(16, 30) / 2;
        const m2 = rng.int(16, 30) / 2;
        if (n1 === n2 || m1 === m2 || !Number.isInteger(m1 + m2)) return null;
        const tot = n1 * m1 + n2 * m2;
        if ((tot * 10) % (n1 + n2) !== 0) return null;
        const ans = tot / (n1 + n2);
        const simple = (m1 + m2) / 2;
        if (Math.abs(ans - simple) < 0.25) return null;
        return {
          params: { n1, n2, m1, m2 },
          statement: `À un partiel, les ${n1} étudiants du groupe A ont obtenu ${nb(m1)} de moyenne et les ${n2} étudiants du groupe B ont obtenu ${nb(m2)}. Quelle est la moyenne de l'ensemble des étudiants ?`,
          answer: N(ans),
          distractors: [N(simple), N(Math.round(((n1 * m2 + n2 * m1) / (n1 + n2)) * 10) / 10)],
          near: nearBy(N, ans, 0.3),
          steps: [
            `Total des points du groupe A : ${n1} × ${nb(m1)} = ${nb(n1 * m1)}.`,
            `Total des points du groupe B : ${n2} × ${nb(m2)} = ${nb(n2 * m2)}.`,
            `Moyenne générale : ${nb(tot)} ÷ ${n1 + n2} = ${nb(ans)}.`,
          ],
          trap: `La moyenne des deux moyennes (${nb(simple)}) n'est juste que si les groupes ont le même effectif.`,
          tip: `Le résultat est forcément plus proche de la moyenne du groupe le plus nombreux (${n1 > n2 ? "A" : "B"}).`,
          notion: "Moyenne de plusieurs groupes = moyenne pondérée par les effectifs.",
          check: (n1 / (n1 + n2)) * m1 + (n2 / (n1 + n2)) * m2,
        };
      }),
  },
  {
    id: "moy.groupe-inconnu",
    theme: T,
    subtheme: "Retrouver la moyenne d'un sous-groupe",
    level: 3,
    gen: (rng): Draft =>
      until(rng, () => {
        const n1 = rng.pick([10, 12, 15, 16, 18, 20, 24, 30]);
        const n2 = rng.pick([10, 12, 15, 16, 18, 20, 24, 30]);
        const m1 = rng.int(16, 30) / 2;
        const m2 = rng.int(16, 30) / 2;
        if (n1 === n2 || m1 === m2) return null;
        const tot = n1 * m1 + n2 * m2;
        if ((tot * 2) % (n1 + n2) !== 0) return null;
        const g = tot / (n1 + n2);
        const piege = 2 * g - m1;
        return {
          params: { n1, n2, m1, g },
          statement: `Une promotion de ${n1 + n2} étudiants a obtenu ${nb(g)} de moyenne à un examen. Les ${n1} étudiants en alternance ont obtenu ${nb(m1)} de moyenne. Quelle est la moyenne des ${n2} autres étudiants ?`,
          answer: N(m2),
          distractors: [N(piege), N(g), N(m2 + (m2 > g ? 1 : -1))],
          near: nearBy(N, m2, 0.5),
          steps: [
            `Total des points de la promotion : ${n1 + n2} × ${nb(g)} = ${nb(tot)}.`,
            `Total des alternants : ${n1} × ${nb(m1)} = ${nb(n1 * m1)}.`,
            `Total des autres : ${nb(tot)} − ${nb(n1 * m1)} = ${nb(n2 * m2)}.`,
            `Moyenne des autres : ${nb(n2 * m2)} ÷ ${n2} = ${nb(m2)}.`,
          ],
          trap: `${nb(piege)} suppose que les deux groupes ont le même effectif, ce qui n'est pas le cas.`,
          tip: `Les alternants sont ${m1 > g ? "au-dessus" : "en dessous"} de la moyenne générale : les autres sont donc ${m1 > g ? "en dessous" : "au-dessus"}. Élimine d'abord les propositions impossibles.`,
          notion: "Total d'un groupe = moyenne × effectif ; les totaux s'additionnent, pas les moyennes.",
          check: ((n1 + n2) * g - n1 * m1) / n2,
        };
      }),
  },
  {
    id: "moy.nouvel-arrivant",
    theme: T,
    subtheme: "Effet d'une valeur ajoutée",
    level: 3,
    gen: (rng): Draft =>
      until(rng, (): Draft | null => {
      const n = rng.pick([4, 9, 19, 24]);
      const m = rng.int(36, 64) * 50;
      const d = rng.pick([10, 20, 50]);
      const k = rng.pick([-3, -2, -1, 1, 2, 3]);
      const x = m + k * (n + 1) * d;
      const ans = m + k * d;
      if (x < 1400 || x > 8000) return null;
      const inverse = rng.bool(0.4);
      if (inverse) {
        return {
          params: { n, m, ans, question: "salaire du nouvel arrivant" },
          statement: `Le salaire moyen des ${n} employés d'une agence est de ${eur(m)}. Après l'arrivée d'un nouvel employé, le salaire moyen passe à ${eur(ans)}. Quel est le salaire du nouvel employé ?`,
          answer: E(x),
          distractors: [E(ans), E(m + k * n * d), E(m + 2 * k * d), E(2 * ans - m)],
          near: nearBy(E, x, d * 5),
          steps: [
            `Masse salariale avant : ${n} × ${eur(m)} = ${eur(n * m)}.`,
            `Masse salariale après : ${n + 1} × ${eur(ans)} = ${eur((n + 1) * ans)}.`,
            `Salaire du nouvel employé : ${eur((n + 1) * ans)} − ${eur(n * m)} = ${eur(x)}.`,
          ],
          trap: `Le nouvel employé ne gagne pas ${eur(ans)} : pour déplacer la moyenne de ${n + 1} personnes, son salaire doit s'en écarter beaucoup plus.`,
          tip: `La moyenne bouge de ${eur(Math.abs(k * d))} pour ${n + 1} personnes : le nouvel arrivant est à ${n + 1} × ${eur(Math.abs(k * d))} de l'ancienne moyenne.`,
          notion: "Total = moyenne × effectif, avant et après.",
          check: (n + 1) * ans - n * m,
        };
      }
      return {
        params: { n, m, x, question: "nouvelle moyenne" },
        statement: `Le salaire moyen des ${n} employés d'une agence est de ${eur(m)}. Un nouvel employé est recruté avec un salaire de ${eur(x)}. Quel est le nouveau salaire moyen ?`,
        answer: E(ans),
        distractors: [E((m + x) / 2), E(m), E(m + 2 * k * d)],
        near: nearBy(E, ans, d),
        steps: [
          `Masse salariale avant : ${n} × ${eur(m)} = ${eur(n * m)}.`,
          `Masse salariale après : ${eur(n * m)} + ${eur(x)} = ${eur(n * m + x)}.`,
          `Nouvelle moyenne : ${eur(n * m + x)} ÷ ${n + 1} = ${eur(ans)}.`,
        ],
        trap: `La moyenne entre l'ancien salaire moyen et le nouveau salaire (${eur((m + x) / 2)}) donnerait au nouvel arrivant le même poids qu'aux ${n} autres réunis.`,
        tip: `Répartis l'écart : le nouvel employé est à ${eur(Math.abs(x - m))} de la moyenne, à partager entre ${n + 1} personnes.`,
        notion: "Ajouter une valeur déplace la moyenne de (écart à la moyenne) ÷ (nouvel effectif).",
        check: (n * m + x) / (n + 1),
      };
      }),
  },
];
