"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const noop = () => () => {};

/** Vrai uniquement dans le navigateur, après l'hydratation. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/**
 * Heure courante, rafraîchie régulièrement et au retour sur l'onglet.
 * Le chronomètre se calcule toujours à partir de cette heure et d'une heure de fin enregistrée :
 * une mise en veille ou un changement d'onglet ne le dérègle pas.
 */
export function useNow(active: boolean, intervalMs = 250): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    window.addEventListener("pageshow", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
      window.removeEventListener("pageshow", tick);
    };
  }, [active, intervalMs]);
  return now;
}

export function formatClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  if (m === 0) return `${s} s`;
  return `${m} min ${String(s % 60).padStart(2, "0")} s`;
}
