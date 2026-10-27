import { useEffect, useRef, useState } from "react";
import { ActionButton } from "./ActionButton";
import { IconCheck, IconCopy } from "./icons";

// "Copy results": puts a plain-text report of the learner's answers on the
// clipboard so they can paste it to their teacher instead of screenshotting.

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older Safari / non-secure contexts: fall back to a hidden textarea.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

export function CopyResultsButton({ getText }: { getText: () => string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function onClick() {
    const ok = await copyText(getText());
    setStatus(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <span aria-live="polite" className="action-live">
      <ActionButton
        icon={status === "copied" ? <IconCheck /> : <IconCopy />}
        label={status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : "Copy results"}
        tone={status === "copied" ? "success" : status === "failed" ? "warning" : "default"}
        onClick={onClick}
        title="Copy the questions and your answers as text"
      />
    </span>
  );
}
