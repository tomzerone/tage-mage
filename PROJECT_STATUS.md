# PROJECT_STATUS — Cap 600 (plateforme TAGE MAGE)

Dernière mise à jour : 14/11/2026 · Phase en cours : **Phase 1 livrée dans le dépôt, mise en ligne Vercel à faire**

## Contexte
- Plateforme privée de préparation au TAGE MAGE pour Tom + ~10 amis. Examen visé : février-mars 2027.
- Tom n'est pas développeur et a demandé que Claude fasse tout ce qui est faisable : Claude écrit, teste et pousse le code ; Tom teste sur son téléphone.
- Tom garde la main sur : mots de passe et connexions, création de comptes, paiements.
- Budget : ≤ 10 €/mois d'infrastructure, ~10 €/an de domaine, API ponctuelle.
- Nom provisoire du site : « Cap 600 » (à confirmer au moment de choisir le domaine ; ne pas mettre « TAGE MAGE », marque de la FNEGE, dans le nom de domaine).

## Format officiel (vérifié sur tagemage.fr le 14/11/2026)
- 6 sous-tests × 15 questions × 20 min = 90 questions, 120 min, sans pause, sur papier, sans calculatrice.
- 5 propositions, 1 seule correcte. Pas de pénalité pour une mauvaise réponse. Score sur 600.
- 1 passage par trimestre civil depuis le 01/01/2026 ; score valable année n et n+1 ; 76 € en métropole.
- Non vérifié : le tableau officiel « calcul de la note finale » (page illisible le 14/11). Estimation pédagogique prévue : bonnes réponses ÷ 90 × 600, toujours étiquetée « estimation ».

## Stack (validée par Tom le 14/11/2026)
- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind CSS 4.
- Polices : Geist (interface) et Instrument Serif (titres), embarquées via npm (pas de téléchargement au build).
- Vitest pour les tests des générateurs.
- GitHub : dépôt privé `tomzerone/tage-mage`, branche `main`. L'application GitHub « Claude » est installée sur ce seul dépôt.
- À venir : Vercel (hébergement), Supabase (comptes et base, Phase 3).
- Attention : Next.js 16 diffère des versions précédentes ; lire `node_modules/next/dist/docs/` avant de toucher au cadre (voir `AGENTS.md`).

## Décisions
1. Phase 1 sans compte ni base : générateurs dans le navigateur, progression en stockage local (clés `cap600.*`).
2. Comptes + base avancés en Phase 3 (avant la banque IA).
3. Logique : générateurs au format réel de l'épreuve (séries croisées), suites simples en échauffement.
4. Banque IA : produite et vérifiée dans les sessions Claude du projet ; script API en option.
5. Chronomètre : heure de fin enregistrée, temps restant = heure de fin − maintenant (résiste à la veille et au rechargement).
6. Direction artistique : sobre, fond clair chaud + mode sombre automatique, noir pour les actions, bleu indigo pour la sélection, vert/rouge pour la correction. Tom jugera sur le site réel plutôt que sur une maquette.

## Fait
- Phase 0 : analyse structurelle du PDF, cartographie (voir CARTOGRAPHIE.md dans le projet Claude), vérification du format et des tarifs.
- Phase 1 :
  - Moteur de génération : aléa reproductible (modèle + graine = même question), fractions exactes, 5 propositions distinctes garanties, distracteurs pédagogiques puis valeurs voisines.
  - 51 modèles de Calcul sur 8 thèmes × 3 niveaux : pourcentages (8), intérêts (6), moyennes (6), proportionnalité (6), équations (6), fractions (6), vitesse et distance (8), temps de travail (5).
  - Chaque question : raisonnement pas à pas, piège, astuce de rapidité, notion à retenir, tous calculés à partir des valeurs tirées.
  - Tests : 157 tests, 3 000 tirages par modèle (unicité de la bonne réponse, propositions distinctes, textes propres, recalcul indépendant de la réponse, reproductibilité, répartition de la bonne réponse sur A–E).
  - Écrans : accueil avec progression réelle, réglage d'une série (thème, niveau, nombre), série avec correction immédiate, bilan avec révision, sous-test Calcul 15 questions / 20 min, résultat avec score brut sur 60.
  - Vérifié dans un navigateur mobile (390 px) : parcours complets, reprise après rechargement, fin automatique au temps écoulé, aucun débordement horizontal, mode sombre.

## Fichiers importants
- `src/lib/engine/` : `rng.ts`, `frac.ts`, `format.ts`, `build.ts`, `types.ts`.
- `src/lib/calcul/` : un fichier par thème + `index.ts` (catalogue, composition des séries et du sous-test).
- `src/lib/storage.ts` (stockage local), `src/lib/hooks.ts` (hydratation, horloge).
- `src/components/` : `ui.tsx`, `question.tsx`, `review.tsx`.
- `src/app/` : `page.tsx`, `exercices/`, `sous-test/`.
- `tests/generators.test.ts`.

## Commandes utiles
- `npm test` : tests des générateurs. `npm run build` : build de production. `npm run dev` : site en local.

## Problèmes connus / limites
- Pas encore en ligne : Tom doit créer son compte Vercel (connexion avec GitHub) et importer le dépôt.
- Progression stockée sur l'appareil : elle ne suit pas d'un téléphone à l'ordinateur avant la Phase 3.
- Pas encore de bouton « Signaler une erreur » (nécessite la base, Phase 3).
- Thèmes de Calcul pas encore couverts : géométrie, probabilités, dénombrement, calcul mental, conversions, suites, mélanges.
- Le temps par question en sous-test est une moyenne (durée totale ÷ 15), pas une mesure.
- Supabase gratuit : pause après 1 semaine sans activité, pas de sauvegarde automatique → prévoir un export hebdomadaire.
- Le livre (éd. 2023) est périmé sur le barème et le nombre de passages.
- Propriété intellectuelle : aucun énoncé, texte ou corrigé du livre n'est repris.

## Prochaines étapes
1. Mise en ligne sur Vercel, test par Tom sur son téléphone, retours sur le design et la difficulté.
2. Phase 2 : Calcul étendu (géométrie, probabilités…), Conditions minimales, Logique en séries croisées.
3. Phase 3 : comptes et base Supabase, signalement des erreurs.
