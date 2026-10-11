import { parse } from "csv-parse/sync";

export type Bar = {
  name: string;
  description: string;
  rating: number;
  priceSek: number;
};

export type SearchBarsDeps = {
  embed: (query: string) => Promise<number[]>;
  query: (embedding: number[]) => Promise<Bar[]>;
};

export function parseBarsCsv(csv: string): Bar[] {
  const rows = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>;

  return rows.map((row) => ({
    name: row.name,
    description: row.description,
    rating: Number(row.rating),
    priceSek: Number(row.price_sek),
  }));
}

export async function searchBars(
  query: string,
  deps: SearchBarsDeps,
): Promise<Bar[]> {
  const embedding = await deps.embed(query);
  return deps.query(embedding);
}

export function formatBarResults(bars: Bar[]): string {
  if (bars.length === 0) {
    return "No matching Stockholm bars were found.";
  }

  return bars
    .map(
      (bar) =>
        `${bar.name} (${bar.rating}/5, ${bar.priceSek} SEK): ${bar.description}`,
    )
    .join("\n");
}
