import "dotenv/config";
import { createPool, ingestBarsFromCsv } from "./vector-store.js";

const pool = createPool();

try {
  const count = await ingestBarsFromCsv(undefined, pool);
  console.log(`Ingested ${count} bars into pgvector`);
} finally {
  await pool.end();
}
