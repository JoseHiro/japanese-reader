// Japanese→English dictionary lookup backed by a compact JMdict export
// (public/dict-en/jmdict.json: dictionary-form → up to 3 short glosses).
// Loaded lazily on the first word lookup and cached for the session.

type GlossMap = Record<string, string[]>;

let dictPromise: Promise<GlossMap> | null = null;

export function loadDictionary(): Promise<GlossMap> {
  if (!dictPromise) {
    dictPromise = fetch(`${import.meta.env.BASE_URL}dict-en/jmdict.json`).then(
      (r) => {
        if (!r.ok) throw new Error(`dictionary fetch failed: ${r.status}`);
        return r.json();
      },
    );
  }
  return dictPromise;
}

/** Looks up glosses by dictionary form, then surface, then reading. */
export async function lookupGlosses(
  base: string,
  surface: string,
  reading: string,
): Promise<string[] | null> {
  const dict = await loadDictionary();
  return dict[base] ?? dict[surface] ?? (reading ? dict[reading] : undefined) ?? null;
}
