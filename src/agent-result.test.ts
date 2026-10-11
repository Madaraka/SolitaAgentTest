import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseAgentResult } from "./agent-result.js";

describe("parseAgentResult", () => {
  it("uses structuredResponse.answer when present", () => {
    assert.equal(
      parseAgentResult({
        structuredResponse: { answer: "Try Tjuvjakt." },
        messages: [],
      }),
      "Try Tjuvjakt.",
    );
  });

  it("uses the last AI message string when structuredResponse is missing", () => {
    assert.equal(
      parseAgentResult({
        messages: [
          { type: "human", content: "best cocktail bar?" },
          { type: "ai", content: "", tool_calls: [{ name: "search_stockholm_bars" }] },
          { type: "tool", content: "Tjuvjakt (4.6/5, 128 SEK)" },
          { type: "ai", content: "Tjuvjakt is a strong cocktail option." },
        ],
      }),
      "Tjuvjakt is a strong cocktail option.",
    );
  });

  it("reads LangChain AIMessage objects via _getType", () => {
    assert.equal(
      parseAgentResult({
        messages: [
          { _getType: () => "human", content: "What is a good cocktail bar in Stockholm?" },
          {
            _getType: () => "ai",
            content: "",
            tool_calls: [{ name: "search_stockholm_bars" }],
          },
          {
            _getType: () => "tool",
            content: "Tjuvjakt (4.2/5, 138 SEK): Moody cocktail bar in Östermalm",
          },
          {
            _getType: () => "ai",
            content:
              "Based on the search results, some good cocktail bars in Stockholm are:\n\n* Tjuvjakt",
            tool_calls: [],
          },
        ],
      }),
      "Based on the search results, some good cocktail bars in Stockholm are:\n\n* Tjuvjakt",
    );
  });

  it("uses the last tool message when the agent exits after a tool", () => {
    assert.equal(
      parseAgentResult({
        messages: [
          { type: "human", content: "help me with my homework" },
          { type: "ai", content: "", tool_calls: [{ name: "refuse_non_bar" }] },
          { type: "tool", content: "I can only help with bars in Stockholm." },
        ],
      }),
      "I can only help with bars in Stockholm.",
    );
  });

  it("joins text blocks from an AI message content array", () => {
    assert.equal(
      parseAgentResult({
        messages: [
          {
            type: "ai",
            content: [
              { type: "text", text: "Tjuvjakt" },
              { type: "text", text: " is a good pick." },
            ],
          },
        ],
      }),
      "Tjuvjakt is a good pick.",
    );
  });
});
