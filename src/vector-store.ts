import { Pool } from "pg";
import { OllamaEmbeddings } from "@langchain/ollama";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseBarsCsv, type Bar } from "./bars.js";

const EMBEDDING_DIMENSIONS = 768;

export const defaultDatabaseUrl =
  process.env.DATABASE_URL ?? "postgresql://solita:solita@localhost:5433/bars";

export function createPool(databaseUrl = defaultDatabaseUrl): Pool {
  return new Pool({ connectionString: databaseUrl, max: 5 });
}

export function createEmbeddings() {
  return new OllamaEmbeddings({
    model: process.env.EMBEDDING_MODEL ?? "nomic-embed-text",
    baseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  });
}

export async function ensureBarsTable(pool: Pool): Promise<void> {
  await pool.query("CREATE EXTENSION IF NOT EXISTS vector");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bars (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name text NOT NULL,
      description text NOT NULL,
      rating numeric(2, 1) NOT NULL,
      price_sek integer NOT NULL,
      embedding vector(${EMBEDDING_DIMENSIONS}) NOT NULL
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS bars_embedding_hnsw_idx
    ON bars
    USING hnsw (embedding vector_cosine_ops)
  `);
}

export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export async function replaceBars(
  pool: Pool,
  bars: Bar[],
  embeddings: number[][],
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE bars RESTART IDENTITY");

    for (const [index, bar] of bars.entries()) {
      await client.query(
        `INSERT INTO bars (name, description, rating, price_sek, embedding)
         VALUES ($1, $2, $3, $4, $5::vector)`,
        [
          bar.name,
          bar.description,
          bar.rating,
          bar.priceSek,
          toVectorLiteral(embeddings[index]),
        ],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function queryNearestBars(
  pool: Pool,
  embedding: number[],
  limit = 5,
): Promise<Bar[]> {
  const result = await pool.query(
    `SELECT name, description, rating, price_sek
     FROM bars
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [toVectorLiteral(embedding), limit],
  );

  return result.rows.map((row) => ({
    name: row.name,
    description: row.description,
    rating: Number(row.rating),
    priceSek: Number(row.price_sek),
  }));
}

export async function ingestBarsFromCsv(
  csvPath = path.resolve("stockholm_bars.csv"),
  pool = createPool(),
  embeddingsModel = createEmbeddings(),
): Promise<number> {
  const csv = await readFile(csvPath, "utf8");
  const bars = parseBarsCsv(csv);
  await ensureBarsTable(pool);

  const embeddings = await embeddingsModel.embedDocuments(
    bars.map((bar) => `${bar.name}. ${bar.description}`),
  );
  await replaceBars(pool, bars, embeddings);
  return bars.length;
}
