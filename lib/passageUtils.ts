const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "from", "as", "is", "was", "are", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "must", "shall", "can", "it", "its", "he", "she", "they",
  "we", "you", "i", "his", "her", "their", "our", "your", "my", "this", "that",
  "these", "those", "not", "no", "so", "if", "then", "than", "when", "where",
  "who", "which", "what", "how", "all", "each", "every", "both", "few", "more",
  "most", "other", "some", "such", "only", "own", "same", "too", "very", "just",
  "also", "now", "here", "there", "up", "out", "about", "into", "over", "after",
  "before", "between", "through", "during", "without", "again", "once", "said",
]);

export type Level = "beginner" | "intermediate" | "advanced";

const LEVEL_WORD_RANGE: Record<Level, { min: number; max: number; sentences: number }> = {
  beginner: { min: 80, max: 180, sentences: 8 },
  intermediate: { min: 150, max: 280, sentences: 12 },
  advanced: { min: 220, max: 400, sentences: 18 },
};

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function trimToWordCount(text: string, min: number, max: number): string {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const picked: string[] = [];
  let words = 0;

  for (const sentence of sentences) {
    const sentenceWords = countWords(sentence);
    if (words + sentenceWords > max && words >= min) break;
    picked.push(sentence);
    words += sentenceWords;
    if (words >= max) break;
  }

  if (picked.length === 0 && sentences[0]) {
    const wordsArr = sentences[0].split(/\s+/);
    return wordsArr.slice(0, max).join(" ") + (wordsArr.length > max ? "…" : "");
  }

  return picked.join(" ");
}

export function splitIntoChunks(text: string, chunkCount = 3): string[] {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const source =
    paragraphs.length >= 2
      ? paragraphs
      : text
          .replace(/\s+/g, " ")
          .split(/(?<=[.!?])\s+/)
          .map((s) => s.trim())
          .filter(Boolean);

  if (source.length <= chunkCount) {
    return source.length > 0 ? source : [text.trim()];
  }

  const perChunk = Math.ceil(source.length / chunkCount);
  const chunks: string[] = [];

  for (let i = 0; i < source.length; i += perChunk) {
    const slice = source.slice(i, i + perChunk);
    chunks.push(Array.isArray(slice) ? slice.join(" ") : slice);
  }

  return chunks.slice(0, chunkCount);
}

export function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getLevelRange(level: string) {
  return LEVEL_WORD_RANGE[level as Level] ?? LEVEL_WORD_RANGE.intermediate;
}

export function preparePassageText(text: string, level: string): string {
  const { min, max } = getLevelRange(level);
  return trimToWordCount(text, min, max);
}

export function pickVocabCandidates(text: string, count = 5): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 5 && !STOP_WORDS.has(w));

  const unique = Array.from(new Set(words));
  unique.sort((a, b) => b.length - a.length);

  return unique.slice(0, count);
}

export async function fetchDefinitions(
  words: string[],
): Promise<{ word: string; definition: string }[]> {
  const results: { word: string; definition: string }[] = [];

  for (const word of words) {
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      );
      if (!res.ok) continue;

      const data = await res.json();
      const entry = data[0];
      const meaning = entry?.meanings?.[0]?.definitions?.[0]?.definition;
      if (meaning) {
        results.push({ word: entry.word ?? word, definition: meaning });
      }
    } catch {
      // skip failed lookups
    }
  }

  return results;
}

export async function buildVocab(
  text: string,
  count = 5,
): Promise<{ word: string; definition: string }[]> {
  const candidates = pickVocabCandidates(text, count + 3);
  const defined = await fetchDefinitions(candidates);

  if (defined.length >= count) return defined.slice(0, count);

  const fallback = candidates
    .filter((w) => !defined.some((d) => d.word.toLowerCase() === w))
    .slice(0, count - defined.length)
    .map((word) => ({ word, definition: "Key vocabulary from this passage." }));

  return [...defined, ...fallback].slice(0, count);
}
