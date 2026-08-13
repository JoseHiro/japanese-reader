// Small inline stroke icons (inherit color + size from the parent via
// currentColor and a CSS-set width/height). Shared across the app.
import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function IconArticle() {
  return (
    <svg {...base}>
      <path d="M6 3h8l5 5v13H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  );
}

export function IconWordList() {
  return (
    <svg {...base}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4" cy="6" r="1.4" />
      <circle cx="4" cy="12" r="1.4" />
      <circle cx="4" cy="18" r="1.4" />
    </svg>
  );
}

export function IconVocabQuiz() {
  return (
    <svg {...base}>
      <path d="M12 20h8" />
      <path d="M16 4.5a2.12 2.12 0 0 1 3 3L8 18.5l-4 1 1-4z" />
    </svg>
  );
}

export function IconReadingQuiz() {
  return (
    <svg {...base}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
      <path d="M9.6 8.8a2.4 2.4 0 0 1 4.2 1.5c0 1.6-2.4 2-2.4 3.2" />
      <path d="M11.4 16.2h.01" />
    </svg>
  );
}

export function IconSun() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function IconMoon() {
  return (
    <svg {...base}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export function IconUser() {
  return (
    <svg {...base}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

export function IconLogout() {
  return (
    <svg {...base}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function IconChevronLeft() {
  return (
    <svg {...base}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function IconChevronRight() {
  return (
    <svg {...base}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function IconTranslate() {
  return (
    <svg {...base}>
      <path d="M3 5h9M7 3v2c0 5-2 8-5 9M5 9c0 3 3 5 7 6" />
      <path d="M14 20l4-9 4 9M15 17h6" />
    </svg>
  );
}
