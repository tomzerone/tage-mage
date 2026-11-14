# PROJECT_STATUS — Plateforme TAGE MAGE

Dernière mise à jour : 14/11/2026 · Phase en cours : **Phase 0 (conception) — en attente de validation de Tom**

## Contexte
- Plateforme privée de préparation au TAGE MAGE pour Tom + ~10 amis. Examen visé : février-mars 2027.
- Tom n'est pas développeur : petites étapes, fichiers complets, validation après chaque étape.
- Budget : ≤ 10 €/mois d'infrastructure, ~10 €/an de domaine, API ponctuelle.

## Format officiel (vérifié sur tagemage.fr le 14/11/2026)
- 6 sous-tests × 15 questions × 20 min = 90 questions, 120 min, sans pause, sur papier, sans calculatrice.
- 5 propositions, 1 seule correcte. Pas de pénalité pour une mauvaise réponse. Score sur 600.
- 1 passage par trimestre civil depuis le 01/01/2026 ; score valable année n et n+1 ; 76 € en métropole.
- Non vérifié : le tableau officiel « calcul de la note finale » (page illisible le 14/11). Estimation pédagogique retenue : bonnes réponses ÷ 90 × 600, toujours étiquetée « estimation ».

## Stack proposée (à valider)
- Next.js (App Router) + TypeScript + Tailwind CSS — site et interface.
- Supabase (Postgres, Auth, Row Level Security) — comptes, banque de questions, historique, signalements.
- Vercel (plan Hobby) — hébergement, déploiement automatique depuis GitHub.
- GitHub — stockage du code. Vitest — tests des générateurs.
- Cours et fiches : fichiers Markdown/MDX dans le dépôt.

## Décisions proposées (à valider)
1. Phase 1 sans compte ni base : générateurs dans le navigateur, progression en stockage local.
2. Comptes + base avancés en Phase 3 (avant la banque IA), au lieu de la Phase 6.
3. Logique : générateurs au format réel de l'épreuve (séries croisées), suites simples en échauffement.
4. Banque IA : produite et vérifiée dans les sessions Claude du projet (coût API nul) ; script API en option pour le volume.
5. Chronomètre : heure de fin enregistrée, temps restant = heure de fin − maintenant.

## Plan
- Phase 1 — V1 utilisable : 8 générateurs de Calcul × 3 niveaux, mode exercices, correction, sous-test chronométré, résultats.
- Phase 2 — Générateurs : Calcul étendu, Conditions minimales, Logique (séries croisées).
- Phase 3 — Comptes + base Supabase, enregistrement des tentatives.
- Phase 4 — Banque IA (Expression d'abord), import, signalements.
- Phase 5 — Six sous-tests, cours et fiches.
- Phase 6 — Examens blancs 90 questions.
- Phase 7 — Tableau de bord, carnet d'erreurs, répétition espacée, classement.
- Phase 8 — Domaine, sécurité, sauvegardes, finitions.

## Fait
- Analyse structurelle du PDF, extraction des notes fréquence/difficulté des fiches → voir CARTOGRAPHIE.md.
- Vérification du format officiel, des tarifs Supabase / Vercel / API / domaine.

## Problèmes connus / points d'attention
- GitHub pas encore relié à Claude (nécessaire pour que Claude pousse le code lui-même).
- Supabase gratuit : projet mis en pause après 1 semaine sans activité, pas de sauvegarde automatique → prévoir un export hebdomadaire.
- Le livre (éd. 2023) est périmé sur le barème et le nombre de passages.
- Propriété intellectuelle : aucun énoncé, texte ou corrigé du livre n'est repris ; contenu 100 % original.

## Prochaine étape
Validation de Tom → direction artistique (maquette cliquable) → Phase 1.
