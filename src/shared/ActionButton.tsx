import type { ReactNode } from "react";

// Compact icon + label button for the action bar next to the article title
// (Article / Copy results / Review mistakes / Mark done). Labels collapse to
// icon-only on narrow screens; `label` stays as the accessible name and tooltip.

export type ActionTone = "default" | "success" | "warning";

export function ActionButton({
  icon,
  label,
  onClick,
  tone = "default",
  active = false,
  badge,
  pressed,
  title,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tone?: ActionTone;
  /** Filled variant of the tone (e.g. review mode is on). */
  active?: boolean;
  /** Small count shown after the label, e.g. number of mistakes. */
  badge?: number;
  /** For toggles: rendered as aria-pressed. */
  pressed?: boolean;
  title?: string;
}) {
  const cls = ["action-btn", tone !== "default" && tone, active && "active"]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type="button"
      className={cls}
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={badge !== undefined ? `${label} (${badge})` : label}
      title={title ?? label}
    >
      <span className="action-icon">{icon}</span>
      <span className="action-label">{label}</span>
      {badge !== undefined && <span className="action-badge">{badge}</span>}
    </button>
  );
}

export function ActionBar({ children }: { children: ReactNode }) {
  return <div className="ah-actions" role="toolbar">{children}</div>;
}
