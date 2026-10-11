import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { refuseNonBar } from "./tools.js";

describe("refuse_non_bar", () => {
  it("returns its result as the final agent answer", () => {
    assert.equal(refuseNonBar.returnDirect, true);
  });

  it("rejects a missing topic", async () => {
    await assert.rejects(() => refuseNonBar.invoke({}));
  });

  it("returns the hardcoded Stockholm-only refusal for any topic", async () => {
    const text = await refuseNonBar.invoke({ topic: "what is gravity?" });
    assert.equal(text, "I can only help with bars in Stockholm.");
  });
});
