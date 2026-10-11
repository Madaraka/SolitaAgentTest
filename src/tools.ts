import { tool } from "langchain";
import * as z from "zod";
import { formatBarResults, searchBars } from "./bars.js";
import {
  createEmbeddings,
  createPool,
  queryNearestBars,
} from "./vector-store.js";

const pool = createPool();
const embeddings = createEmbeddings();

export const searchStockholmBars = tool(
  async ({ query }) => {
    console.log(`[search_stockholm_bars] query="${query}"`);
    const bars = await searchBars(query, {
      embed: (text) => embeddings.embedQuery(text),
      query: (embedding) => queryNearestBars(pool, embedding),
    });
    console.log(
      `[search_stockholm_bars] hits=${bars.map((bar) => bar.name).join(", ") || "(none)"}`,
    );
    return formatBarResults(bars);
  },
  {
    name: "search_stockholm_bars",
    description:
      "Search the Stockholm bars vector database for bars that match a vibe, neighbourhood, price, or drink style. Use this before answering questions about bars.",
    schema: z.object({
      query: z.string().describe("What kind of Stockholm bar the user wants"),
    }),
  },
);

export const refuseNonBar = tool(
  async ({ topic }) => {
    console.log(`[refuse_non_bar] topic="${topic}"`);
    return "I can only help with bars in Stockholm.";
  },
  {
    name: "refuse_non_bar",
    description:
      "Call this once when the user asks about anything that is not a bar. Pass the off-topic subject as topic. Do not use it for bar questions. Do not call it again after it returns.",
    schema: z.object({
      topic: z.string().describe("The non-bar thing the user asked about"),
    }),
    returnDirect: true,
  },
);
