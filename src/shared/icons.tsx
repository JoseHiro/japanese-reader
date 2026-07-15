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
