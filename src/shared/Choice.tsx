import type { ButtonHTMLAttributes, ReactNode } from "react";

// One answer choice / chip, shared by every objective quiz (単語クイズ,
// 文法選択, 助詞クイズ, 並べ替え) so they look and respond the same:
// grey filled box, pointer + hover/press/focus states, and green/red once
// graded. `Choices` is the wrapping row.

export type ChoiceState = "correct" | "wrong" | "placed";

export function Choice({
  state,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { state?: ChoiceState; children: ReactNode }) {
  const cls = ["choice", state, className].filter(Boolean).join(" ");
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}

export function Choices({
  label,
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={["choices", className].filter(Boolean).join(" ")} aria-label={label}>
      {children}
    </div>
  );
}
