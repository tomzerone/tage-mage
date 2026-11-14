export type Level = 1 | 2 | 3;

export type ThemeId =
  | "pourcentages"
  | "interets"
  | "moyennes"
  | "proportionnalite"
  | "equations"
  | "fractions"
  | "mouvement"
  | "travail";

export type Params = Record<string, number | string>;

/** Une valeur proposée : `v` sert à garantir l'unicité, `label` est ce que l'on affiche. */
export interface Val {
  v: number;
  label: string;
}

/** Ce que produit un modèle avant assemblage. */
export interface Draft {
  params: Params;
  statement: string;
  answer: Val;
  /** Distracteurs pédagogiques, du plus important au moins important. */
  distractors: Val[];
  /** Valeurs voisines de secours : near(1), near(-1), near(2)… */
  near: (k: number) => Val | null;
  steps: string[];
  trap?: string;
  tip: string;
  notion: string;
  /** Même réponse recalculée par une autre méthode : contrôlée par les tests. */
  check?: number;
  /** Autorise des propositions négatives ou nulles (évolutions en %). */
  allowNonPositive?: boolean;
}

export interface Template {
  id: string;
  theme: ThemeId;
  subtheme: string;
  level: Level;
  gen: (rng: import("./rng").Rng) => Draft;
}

export interface Question {
  templateId: string;
  seed: number;
  subtest: "calcul";
  theme: ThemeId;
  subtheme: string;
  level: Level;
  statement: string;
  choices: string[];
  correct: number;
  steps: string[];
  trap?: string;
  tip: string;
  notion: string;
  params: Params;
}
