import {
  buildVocab,
  getLevelRange,
  preparePassageText,
  splitIntoChunks,
} from "./passageUtils";

export type ContentSourceId = "shortstories" | "wikipedia" | "literature";

export type PassageResult = {
  title: string;
  source: string;
  sourceUrl: string;
  chunks: string[];
  vocab: { word: string; definition: string }[];
};

export const CONTENT_SOURCES: {
  id: ContentSourceId;
  label: string;
  sub: string;
  icon: string;
  desc: string;
}[] = [
  {
    id: "shortstories",
    label: "Short Stories",
    sub: "Aesop's Fables & tales",
    icon: "📚",
    desc: "Random short stories from the free Short Stories API — great for fiction and beginner-friendly reading.",
  },
  {
    id: "wikipedia",
    label: "Wikipedia",
    sub: "Encyclopedia articles",
    icon: "🌐",
    desc: "Real Wikipedia articles matched to your genre — science, news, travel, health, technology, and more.",
  },
  {
    id: "literature",
    label: "Classic Literature",
    sub: "Public domain texts",
    icon: "📜",
    desc: "Passages from classic public-domain books via the Words API — best for advanced readers.",
  },
];

const GENRE_SEARCH: Record<string, string> = {
  news: "current events journalism",
  science: "natural science discovery",
  fiction: "short story folklore",
  business: "business economics",
  travel: "travel geography culture",
  health: "health medicine wellness",
  technology: "technology computer innovation",
  random: "interesting topic",
};

const WIKI_HEADERS = {
  "User-Agent": "TeleprompterCoach/1.0 (reading practice app)",
};

type ShortStory = {
  title: string;
  author: string;
  story: string;
  moral?: string;
};

async function fetchShortStory(): Promise<ShortStory> {
  const res = await fetch("https://shortstories-api.onrender.com/", {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Short Stories API unavailable");
  return res.json();
}

async function fetchWikipediaArticle(
  genre: string,
  level: string,
): Promise<{ title: string; text: string; url: string }> {
  const { sentences } = getLevelRange(level);
  const searchTerm = GENRE_SEARCH[genre] ?? GENRE_SEARCH.random;

  const searchRes = await fetch(
    `https://en.wikipedia.org/w/api.php?${new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: searchTerm,
      gsrlimit: "10",
      prop: "extracts",
      explaintext: "1",
      exsentences: String(sentences),
      format: "json",
      origin: "*",
    })}`,
    { headers: WIKI_HEADERS },
  );

  if (!searchRes.ok) throw new Error("Wikipedia search failed");

  const searchData = await searchRes.json();
  const pages = Object.values(searchData.query?.pages ?? {}) as {
    title: string;
    extract?: string;
  }[];

  const candidates = pages.filter((p) => p.extract && p.extract.length > 80);
  if (candidates.length === 0) {
    return fetchRandomWikipedia(level);
  }

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const title = pick.title;
  const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;

  return { title, text: pick.extract!, url };
}

async function fetchRandomWikipedia(
  level: string,
): Promise<{ title: string; text: string; url: string }> {
  const { sentences } = getLevelRange(level);

  const randomRes = await fetch(
    "https://en.wikipedia.org/api/rest_v1/page/random/summary",
    { headers: WIKI_HEADERS, redirect: "follow" },
  );
  if (!randomRes.ok) throw new Error("Wikipedia random fetch failed");

  const summary = await randomRes.json();
  const title: string = summary.title;
  const url: string = summary.content_urls?.desktop?.page ?? "";

  const extractRes = await fetch(
    `https://en.wikipedia.org/w/api.php?${new URLSearchParams({
      action: "query",
      titles: title,
      prop: "extracts",
      explaintext: "1",
      exsentences: String(sentences),
      format: "json",
      origin: "*",
    })}`,
    { headers: WIKI_HEADERS },
  );

  if (!extractRes.ok) throw new Error("Wikipedia extract failed");

  const extractData = await extractRes.json();
  const page = Object.values(extractData.query?.pages ?? {})[0] as {
    extract?: string;
  };

  const text = page?.extract ?? summary.extract ?? "";
  if (!text) throw new Error("No Wikipedia content found");

  return { title, text, url };
}

async function fetchLiteraturePassage(
  level: string,
): Promise<{ title: string; text: string; url: string }> {
  const paragraphCount = level === "beginner" ? 2 : level === "intermediate" ? 3 : 5;

  const res = await fetch(
    `https://words.biebersprojects.com/paragraphs/${paragraphCount}/`,
  );
  if (!res.ok) throw new Error("Literature API unavailable");

  const paragraphs: string[][] = await res.json();
  const text = paragraphs.map((p) => p.join(" ")).join("\n\n");

  const titles = [
    "Frankenstein",
    "Pride and Prejudice",
    "Moby-Dick",
    "A Tale of Two Cities",
    "The Adventures of Sherlock Holmes",
  ];
  const title = titles[Math.floor(Math.random() * titles.length)];

  return {
    title: `Excerpt from ${title}`,
    text,
    url: "https://words.biebersprojects.com/",
  };
}

async function buildPassage(
  title: string,
  source: string,
  sourceUrl: string,
  rawText: string,
  level: string,
): Promise<PassageResult> {
  const text = preparePassageText(rawText, level);
  const chunks = splitIntoChunks(text, 3);
  const vocab = await buildVocab(text, 5);

  return { title, source, sourceUrl, chunks, vocab };
}

export async function fetchFromSource(
  sourceId: ContentSourceId,
  genre: string,
  level: string,
): Promise<PassageResult> {
  if (sourceId === "shortstories") {
    const story = await fetchShortStory();
    const moral = story.moral ? `\n\nMoral: ${story.moral}` : "";
    return buildPassage(
      story.title,
      `Short Stories API · ${story.author}`,
      "https://shortstories-api.onrender.com/",
      story.story + moral,
      level,
    );
  }

  if (sourceId === "wikipedia") {
    const article = await fetchWikipediaArticle(genre, level);
    return buildPassage(
      article.title,
      "Wikipedia",
      article.url,
      article.text,
      level,
    );
  }

  if (sourceId === "literature") {
    if (level === "beginner") {
      const story = await fetchShortStory();
      return buildPassage(
        story.title,
        `Short Stories API · ${story.author}`,
        "https://shortstories-api.onrender.com/",
        story.story,
        level,
      );
    }

    const passage = await fetchLiteraturePassage(level);
    return buildPassage(
      passage.title,
      "Public Domain Literature",
      passage.url,
      passage.text,
      level,
    );
  }

  throw new Error(`Unknown source: ${sourceId}`);
}

export function suggestSourceForGenre(genre: string): ContentSourceId {
  if (genre === "fiction") return "shortstories";
  if (genre === "random") {
    const options: ContentSourceId[] = ["shortstories", "wikipedia", "literature"];
    return options[Math.floor(Math.random() * options.length)];
  }
  return "wikipedia";
}
