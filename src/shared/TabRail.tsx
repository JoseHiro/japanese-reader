import type { ReactNode } from "react";

export interface TabDef {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: string;
}

// Reusable in-page tab rail (vertical on desktop, horizontal on mobile).
export function TabRail({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <nav className="tab-rail" aria-label="ページ内タブ">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={"tab-btn" + (active === t.id ? " active" : "")}
          aria-current={active === t.id ? "page" : undefined}
          onClick={() => onChange(t.id)}
        >
          <span className="tab-icon">{t.icon}</span>
          <span className="tab-label">{t.label}</span>
          {t.badge && <span className="tab-badge">{t.badge}</span>}
        </button>
      ))}
    </nav>
  );
}
