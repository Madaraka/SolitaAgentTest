import { createAgent } from "langchain";

import { refuseNonBar, searchStockholmBars } from "./tools.js";
import { parseAgentResult } from "./agent-result.js";
import { ChatOllama } from "@langchain/ollama";

const SYSTEM_PROMPT = `
  You are a helpful agent that can only answer questions about bars in the city of Stockholm. Be concise and accurate.
  Always call the tool search_stockholm_bars before answering a bar question, and use the results of that tool call to answer the question.
  If the user asks about a bar that is not in Stockholm, say that you are limited to answering questions about bars in Stockholm.
  If asked about something that is not a bar, call refuse_non_bar once with the user's topic. Do not answer, calculate, or explain the off-topic question yourself. Do not call refuse_non_bar again after it returns.
`;

const model = new ChatOllama({ model: "llama3.1", temperature: 0, baseUrl: "http://localhost:11434" });

const agent = createAgent({
  name: "solita",
  model,
  tools: [searchStockholmBars, refuseNonBar],
  systemPrompt: SYSTEM_PROMPT,
});

export async function invokeAgent(prompt: string): Promise<string> {
  console.log(`[agent] prompt="${prompt}"`);
  const result = await agent.invoke(
    { messages: [{ role: "user", content: prompt }] },
    { recursionLimit: 8 },
  );
  const serialized = JSON.stringify(result.messages);
  console.log(`[agent] used search_stockholm_bars=${serialized.includes("search_stockholm_bars")}`);
  console.log(`[agent] used refuse_non_bar=${serialized.includes("refuse_non_bar")}`);
  return parseAgentResult(result);
}
