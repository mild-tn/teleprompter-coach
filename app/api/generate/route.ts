import { NextRequest, NextResponse } from "next/server";
import {
  fetchFromSource,
  suggestSourceForGenre,
  type ContentSourceId,
} from "@/lib/contentSources";

const VALID_SOURCES: ContentSourceId[] = [
  "shortstories",
  "wikipedia",
  "literature",
];

export async function POST(req: NextRequest) {
  const { level, genre, contentSource } = await req.json();

  const sourceId: ContentSourceId =
    contentSource && VALID_SOURCES.includes(contentSource)
      ? contentSource
      : suggestSourceForGenre(genre ?? "random");

  try {
    const passage = await fetchFromSource(
      sourceId,
      genre ?? "random",
      level ?? "intermediate",
    );
    return NextResponse.json(passage);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch passage";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
