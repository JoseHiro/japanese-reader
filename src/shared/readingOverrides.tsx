import { createContext, useContext, type ReactNode } from "react";

// Article-scoped `{ surface → correct reading }` map derived from the
// current article's annotations. Used by Furigana to override kuromoji's
// default reading for names / compounds it misreads (e.g. 錦織 →
// にしきおり; correct: にしこり).
export const ReadingOverridesContext = createContext<Record<string, string>>({});

export function ReadingOverridesProvider({
  value,
  children,
}: {
  value: Record<string, string>;
  children: ReactNode;
}) {
  return (
    <ReadingOverridesContext.Provider value={value}>
      {children}
    </ReadingOverridesContext.Provider>
  );
}

export function useReadingOverrides(): Record<string, string> {
  return useContext(ReadingOverridesContext);
}
