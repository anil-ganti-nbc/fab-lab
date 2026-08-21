import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildPracticeResult,
  parsePracticePayload,
} from "../src/lib/practice/schema.ts";
import {
  IDENTIFY_ITEMS,
  RAYLEIGH_ITEMS,
  SEQUENCE_STEPS,
  YIELD_ITEMS,
  type McqItem,
} from "../src/content/bank.ts";

const VALID = {
  schemaVersion: 1,
  sourceApp: "dau",
  conceptId: "semi-rayleigh",
  lessonId: "semi-rayleigh-10",
  practiceType: "rayleigh",
  goal: "Three knobs, one bill — read a litho briefing honestly.",
};

describe("practice payload schema", () => {
  it("accepts a well-formed DAU payload", () => {
    assert.ok(parsePracticePayload(VALID).ok);
  });

  it("rejects non-DAU source apps", () => {
    assert.equal(parsePracticePayload({ ...VALID, sourceApp: "vendor-x" }).ok, false);
  });

  it("rejects non-semi concept ids", () => {
    const parsed = parsePracticePayload({ ...VALID, conceptId: "horo-rate" });
    assert.equal(parsed.ok, false);
  });

  it("rejects mismatched lesson ids", () => {
    const parsed = parsePracticePayload({ ...VALID, lessonId: "semi-euv-10" });
    assert.equal(parsed.ok, false);
  });

  it("rejects unknown practice types", () => {
    const parsed = parsePracticePayload({ ...VALID, practiceType: "regulate" });
    assert.equal(parsed.ok, false);
  });
});

describe("practice result schema", () => {
  it("round-trips a completed result", () => {
    const built = buildPracticeResult({
      conceptId: "semi-rayleigh",
      lessonId: "semi-rayleigh-10",
      completed: true,
      attempts: 1,
      timeSpentMs: 30_000,
      selfRating: 2,
    });
    assert.ok(built.ok);
    if (built.ok) assert.equal(built.value.sourceApp, "fab-lab");
  });
});

describe("content bank integrity", () => {
  const pools: Array<[string, McqItem[]]> = [
    ["rayleigh", RAYLEIGH_ITEMS],
    ["yield", YIELD_ITEMS],
    ["identify", IDENTIFY_ITEMS],
  ];

  for (const [name, items] of pools) {
    it(`${name}: every item is well-formed and sourced`, () => {
      for (const item of items) {
        assert.ok(item.id, "missing id");
        assert.ok(item.source.startsWith("semi-"), `${item.id}: source must be a semi lesson`);
        assert.ok(item.prompt.length >= 12, `${item.id}: prompt too short`);
        assert.ok(item.choices.length >= 3, `${item.id}: needs at least 3 choices`);
        assert.ok(
          item.answerIndex >= 0 && item.answerIndex < item.choices.length,
          `${item.id}: answerIndex out of range`,
        );
        assert.ok(item.why.length >= 20, `${item.id}: explanation too thin`);
      }
    });

    it(`${name}: ids are unique`, () => {
      const ids = new Set(items.map((item) => item.id));
      assert.equal(ids.size, items.length);
    });

    it(`${name}: answers are not always the first choice`, () => {
      const positions = new Set(items.map((item) => item.answerIndex));
      assert.ok(positions.size > 1, "answer position should vary");
    });
  }

  it("sequence steps follow the integration order from semi-integration-10", () => {
    assert.deepEqual(
      SEQUENCE_STEPS.map((step) => step.id),
      ["isolation", "wells", "gate", "sd", "silicide"],
    );
  });
});
