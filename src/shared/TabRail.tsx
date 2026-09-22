import { useEffect, useState, type ReactNode } from "react";

export interface TabDef {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: string;
  /** Show a small ✓ next to the label to mark this tab as completed. */
  done?: boolean;
}

export interface TabGroup {
  id: string;
  /** Optional header shown above this group's tabs. */
  label?: string;
  /** When true (and `label` is set) the header becomes a chevron toggle. */
  collapsible?: boolean;
  tabs: TabDef[];
}

const COLLAPSED_STORAGE_KEY = "yomu-tabgroups-collapsed";

function loadCollapsed(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(COLLAPSED_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

// Reusable in-page tab rail (vertical on desktop, horizontal on mobile).
// Tabs are organized into named groups so learners can collapse the ones
// they're not currently focused on (e.g. hide 練習 while reading).
export function TabRail({
  groups,
  active,
  onChange,
}: {
  groups: TabGroup[];
  active: string;
  onChange: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(loadCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, JSON.stringify(collapsed));
    } catch {}
  }, [collapsed]);

  function toggle(groupId: string) {
    setCollapsed((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  }

  return (
    <nav className="tab-rail" aria-label="ページ内タブ">
      {groups.map((g, gi) => {
        const isCollapsed = !!collapsed[g.id];
        const header = g.label ? (
          g.collapsible ? (
            <button
              type="button"
              className="tab-group-header"
              onClick={() => toggle(g.id)}
              aria-expanded={!isCollapsed}
            >
              <span className="tab-group-chevron" aria-hidden>
                {isCollapsed ? "▸" : "▾"}
              </span>
              <span className="tab-group-label">{g.label}</span>
            </button>
          ) : (
            <div className="tab-group-header static">
              <span className="tab-group-label">{g.label}</span>
            </div>
          )
        ) : null;

        return (
          <div
            key={g.id}
            className={"tab-group" + (gi > 0 ? " tab-group-gap" : "")}
          >
            {header}
            {!isCollapsed &&
              g.tabs.map((t) => (
                <button
                  key={t.id}
                  className={"tab-btn" + (active === t.id ? " active" : "")}
                  aria-current={active === t.id ? "page" : undefined}
                  onClick={() => onChange(t.id)}
                >
                  <span className="tab-icon">{t.icon}</span>
                  <span className="tab-label">{t.label}</span>
                  {t.done && (
                    <span className="tab-done" aria-label="完了" title="完了">
                      ✓
                    </span>
                  )}
                  {t.badge && <span className="tab-badge">{t.badge}</span>}
                </button>
              ))}
          </div>
        );
      })}
    </nav>
  );
}
