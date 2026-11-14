"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BottomBar, Button, Chip } from "@/components/ui";
import { THEMES, compose, countTemplates, type Selection } from "@/lib/calcul";
import { KEYS, save, type ExoSession } from "@/lib/storage";

const LEVELS: { id: Selection["level"]; label: string; hint: string }[] = [
  { id: "mixte", label: "Mixte", hint: "Les trois niveaux mélangés" },
  { id: 1, label: "Niveau 1", hint: "Application directe d'une notion" },
  { id: 2, label: "Niveau 2", hint: "Plusieurs étapes, pièges classiques" },
  { id: 3, label: "Niveau 3", hint: "Notions combinées, distracteurs subtils" },
];
const COUNTS = [5, 10, 15, 20, 30];

export function Config() {
  const router = useRouter();
  const [theme, setTheme] = useState<Selection["theme"]>("tous");
  const [level, setLevel] = useState<Selection["level"]>("mixte");
  const [count, setCount] = useState(10);
  const models = countTemplates(theme, level);

  const start = () => {
    const sel: Selection = { theme, level, count };
    const now = Date.now();
    const session: ExoSession = {
      sel,
      refs: compose(sel),
      answers: [],
      index: 0,
      startedAt: now,
      questionStartedAt: now,
    };
    save(KEYS.exo, session);
    router.push("/exercices/session");
  };

  return (
    <>
      <Group title="Thème">
        <Chip active={theme === "tous"} onClick={() => setTheme("tous")}>
          Tous les thèmes
        </Chip>
        {THEMES.map((t) => (
          <Chip key={t.id} active={theme === t.id} onClick={() => setTheme(t.id)}>
            {t.label}
          </Chip>
        ))}
      </Group>
      <p className="mt-2.5 min-h-5 text-sm text-muted">{theme === "tous" ? "Les huit thèmes en alternance." : THEMES.find((t) => t.id === theme)?.short}</p>

      <Group title="Difficulté">
        {LEVELS.map((l) => (
          <Chip key={String(l.id)} active={level === l.id} onClick={() => setLevel(l.id)}>
            {l.label}
          </Chip>
        ))}
      </Group>
      <p className="mt-2.5 min-h-5 text-sm text-muted">{LEVELS.find((l) => l.id === level)?.hint}</p>

      <Group title="Nombre de questions">
        {COUNTS.map((c) => (
          <Chip key={c} active={count === c} onClick={() => setCount(c)}>
            {c}
          </Chip>
        ))}
      </Group>

      <BottomBar>
        <span className="flex-1 text-sm text-muted">
          {models} modèle{models > 1 ? "s" : ""} de questions pour ce réglage
        </span>
        <Button onClick={start} disabled={models === 0}>
          Commencer
        </Button>
      </BottomBar>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-8">
      <legend className="text-xs font-medium uppercase tracking-wider text-muted">{title}</legend>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}
