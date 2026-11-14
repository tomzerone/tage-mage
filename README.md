# Cap 600 — préparation au TAGE MAGE

Plateforme privée d'entraînement au TAGE MAGE. Voir `PROJECT_STATUS.md` pour l'état du projet.

## Commandes

```bash
npm install     # installer les dépendances
npm run dev     # lancer le site en local (http://localhost:3000)
npm test        # tester les générateurs (3 000 tirages par modèle)
npm run build   # construire la version de production
```

## Organisation

- `src/lib/engine/` — moteur des générateurs : aléa reproductible, fractions exactes, mise en forme, assemblage des questions.
- `src/lib/calcul/` — modèles de questions de Calcul, un fichier par thème.
- `src/components/` — composants d'interface partagés.
- `src/app/` — pages : accueil, entraînement, sous-test chronométré.
- `tests/` — tests automatisés des générateurs.

Projet personnel indépendant, sans lien avec la FNEGE. TAGE MAGE® est une marque déposée de la FNEGE.
