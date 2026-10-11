type ContentBlock = {
  type?: string;
  text?: string;
};

export type AgentMessage = {
  type?: string;
  content?: unknown;
  tool_calls?: unknown[];
  _getType?: () => string;
};

export type AgentResult = {
  structuredResponse?: { answer?: string };
  messages?: AgentMessage[];
};

function messageType(message: AgentMessage): string {
  if (typeof message.type === "string") {
    return message.type;
  }
  if (typeof message._getType === "function") {
    return message._getType();
  }
  return "";
}

function contentToText(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((block: ContentBlock) => (typeof block?.text === "string" ? block.text : ""))
      .join("")
      .trim();
  }

  return "";
}

export function parseAgentResult(result: AgentResult): string {
  const structured = result.structuredResponse?.answer?.trim();
  if (structured) {
    return structured;
  }

  const messages = result.messages ?? [];
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (messageType(message) !== "ai") {
      continue;
    }

    const text = contentToText(message.content);
    if (text) {
      return text;
    }
  }

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (messageType(message) !== "tool") {
      continue;
    }

    const text = contentToText(message.content);
    if (text) {
      return text;
    }
  }

  throw new Error("Agent result did not contain a final answer");
}
