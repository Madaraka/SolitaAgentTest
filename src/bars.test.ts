import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatBarResults, parseBarsCsv, searchBars } from "./bars.js";

const sampleCsv = `name,description,rating,price_sek
Kråkboet,"Cramped, candlelit dive bar on Södermalm",4.1,59
Glasögat,"Polished cocktail lounge in Östermalm",4.6,145
`;

describe("parseBarsCsv", () => {
  it("parses quoted descriptions that contain commas", () => {
    const bars = parseBarsCsv(sampleCsv);

    assert.equal(bars.length, 2);
    assert.deepEqual(bars[0], {
      name: "Kråkboet",
      description: "Cramped, candlelit dive bar on Södermalm",
      rating: 4.1,
      priceSek: 59,
    });
  });
});

describe("searchBars", () => {
  it("embeds the query and returns the closest bars", async () => {
    const results = await searchBars("cheap dive bar", {
      embed: async () => [0.1, 0.2],
      query: async () => [
        {
          name: "Kråkboet",
          description: "Cramped dive bar",
          rating: 4.1,
          priceSek: 59,
        },
      ],
    });

    assert.deepEqual(results, [
      {
        name: "Kråkboet",
        description: "Cramped dive bar",
        rating: 4.1,
        priceSek: 59,
      },
    ]);
  });
});

describe("formatBarResults", () => {
  it("turns bar rows into a readable tool response", () => {
    const text = formatBarResults([
      {
        name: "Kråkboet",
        description: "Cramped dive bar",
        rating: 4.1,
        priceSek: 59,
      },
    ]);

    assert.match(text, /Kråkboet/);
    assert.match(text, /59 SEK/);
  });
});
