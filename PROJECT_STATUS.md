# État du projet — Cap 600

Dernière mise à jour : 14/11/2026

## Technique
- Next.js 16 (App Router, export statique) + React 19 + TypeScript + Tailwind CSS 4.
- Polices embarquées via npm : Geist (interface), Instrument Serif (titres).
- Tests : Vitest (`npm test`).
- Hébergement : GitHub Pages, déployé par `.github/workflows/deploy.yml` à chaque envoi sur `main` (tests, puis build, puis mise en ligne).
- `BASE_PATH=/tage-mage` au build tant que le site est servi sous `…github.io/tage-mage` ; à vider le jour où un domaine personnalisé est branché.
- Attention : Next.js 16 diffère des versions précédentes ; lire `node_modules/next/dist/docs/` avant de toucher au cadre (voir `AGENTS.md`).

## Format de l'épreuve pris en compte
- 6 sous-tests × 15 questions × 20 min. 5 propositions, une seule correcte.
- Aucune pénalité pour une mauvaise réponse (vérifié sur tagemage.fr le 14/11/2026).

## Fait
- Moteur de génération : aléa reproductible (modèle + graine = même question), fractions exactes, 5 propositions distinctes garanties.
- 51 modèles de Calcul sur 8 thèmes × 3 niveaux, avec raisonnement, piège, astuce et notion à retenir.
- 157 tests automatisés : 3 000 tirages par modèle, recalcul indépendant de la réponse, reproductibilité.
- Écrans : accueil avec progression, réglage d'une série, série corrigée, bilan, sous-test 15 questions / 20 min.
- Chronomètre calculé à partir d'une heure de fin enregistrée (résiste à la veille et au rechargement).
- Progression enregistrée sur l'appareil (clés `cap600.*` du stockage local).

## Limites connues
- La progression ne suit pas d'un appareil à l'autre (comptes à venir).
- Pas encore de bouton « Signaler une erreur ».
- Thèmes de Calcul non couverts : géométrie, probabilités, dénombrement, calcul mental, conversions, suites, mélanges.
- En sous-test, le temps par question est une moyenne (durée totale ÷ 15).

## Suite prévue
1. Calcul étendu, Conditions minimales, Logique (séries croisées).
2. Comptes et base de données, signalement des erreurs.
3. Banque de questions pour Compréhension, Raisonnement et Expression.
4. Examens blancs complets, tableau de bord, carnet d'erreurs, répétition espacée.
