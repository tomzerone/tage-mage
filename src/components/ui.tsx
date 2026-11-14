import Link from "next/link";
import type { ReactNode } from "react";

export function Page({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <main className={`mx-auto w-full min-w-0 flex-1 px-5 ${wide ? "max-w-3xl" : "max-w-2xl"}`}>{children}</main>;
}

export function Wordmark() {
  return (
    <Link href="/" className="inline-flex items-baseline gap-1.5 text-ink" aria-label="Cap 600, accueil">
      <span className="font-serif text-[1.6rem] leading-none tracking-tight">Cap</span>
      <span className="font-mono text-sm font-medium tabular-nums text-accent">600</span>
    </Link>
  );
}

export function Header({ right }: { right?: ReactNode }) {
  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 pb-2 pt-5">
      <Wordmark />
      {right}
    </header>
  );
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
};

const BTN: Record<NonNullable<BtnProps["variant"]>, string> = {
  primary: "bg-ink text-bg hover:opacity-90 disabled:opacity-30",
  secondary: "border border-line bg-surface text-ink hover:border-muted disabled:opacity-40",
  ghost: "text-muted hover:text-ink disabled:opacity-40",
};

export function Button({ children, onClick, disabled, variant = "primary", className = "", type = "button" }: BtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-[0.95rem] font-medium transition-[opacity,border-color,color,transform] duration-150 active:scale-[0.99] ${BTN[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function ButtonLink({ href, children, variant = "primary", className = "" }: { href: string; children: ReactNode; variant?: BtnProps["variant"]; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-[0.95rem] font-medium transition-[opacity,border-color,color] duration-150 ${BTN[variant ?? "primary"]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 rounded-full border px-4 text-sm transition-colors duration-150 ${
        active ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink hover:border-muted"
      }`}
    >
      {children}
    </button>
  );
}

/** Barre d'action collée en bas de l'écran sur mobile. */
export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 mt-8 border-t border-line bg-bg/90 backdrop-blur-md">
      <div className="pb-safe mx-auto flex w-full max-w-2xl items-center gap-3 px-5 pt-3">{children}</div>
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 font-serif text-3xl leading-none tabular-nums">{value}</div>
      {hint && <div className="mt-1.5 text-xs text-muted">{hint}</div>}
    </div>
  );
}

export function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}

export function Cross({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
