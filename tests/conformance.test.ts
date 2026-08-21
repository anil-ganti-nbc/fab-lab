import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FAB_LAB_ID,
  PRACTICE_QUERY_PARAM,
  SOURCE_APP_DAU,
  adaptFabResultMessage,
  buildFabLaunchUrl,
  canLaunchLab,
  getCompatibleLabs,
  getLab,
  readPracticeParam,
} from "../../dau-practice-labs/src/practice-labs/index.ts";

import { buildPracticeResult, parsePracticeSearch } from "../src/lib/practice/index.ts";

const LAUNCH_BASE = "http://localhost:8092/";

function dauRequest(overrides = {}) {
  return {
    schemaVersion: 1,
    sourceApp: SOURCE_APP_DAU,
    labId: FAB_LAB_ID,
    conceptId: "semi-rayleigh",
    lessonId: "semi-rayleigh-10",
    practiceType: "rayleigh",
    goal: "Three knobs, one bill — read a litho briefing honestly.",
    parameters: { questions: 4 },
    ...overrides,
  };
}

describe("dau-practice-labs contract conformance", () => {
  it("registry marks fab-lab launchable, resolvable, and compatible with its courses", () => {
    const lab = getLab(FAB_LAB_ID);
    assert.ok(lab, "fab-lab must be registered");
    assert.equal(lab.status, "implemented-external");
    assert.ok(canLaunchLab(FAB_LAB_ID));
    assert.ok(lab.launchUrl, "launchable lab must declare a launchUrl");
    const compatible = getCompatibleLabs("semi-process", "semi-wafer");
    assert.ok(compatible.some((entry) => entry.labId === FAB_LAB_ID));
  });

  it("contract-built launch URL decodes into a valid fab payload", () => {
    const built = buildFabLaunchUrl(LAUNCH_BASE, dauRequest());
    assert.ok(built.ok, `adapter rejected DAU request: ${built.ok ? "" : built.message}`);
    const token = readPracticeParam(new URL(built.data).search) ?? "";
    const parsed = parsePracticeSearch(token, undefined as never);
    assert.ok(parsed.ok, `fab rejected contract payload: ${parsed.ok ? "" : parsed.error}`);
    if (parsed.ok && parsed.value) {
      assert.equal(parsed.value.sourceApp, "dau");
      assert.equal(parsed.value.conceptId, "semi-rayleigh");
      assert.equal(parsed.value.practiceType, "rayleigh");
      assert.equal((parsed.value.parameters as { questions?: number }).questions, 4);
    }
  });

  it("bench result adapts into the canonical DAU envelope", () => {
    const built = buildFabLaunchUrl(LAUNCH_BASE, dauRequest());
    assert.ok(built.ok);
    const token = readPracticeParam(new URL(built.data).search) ?? "";
    const parsed = parsePracticeSearch(token, undefined as never);
    assert.ok(parsed.ok && parsed.value);

    const result = buildPracticeResult({
      conceptId: parsed.value.conceptId,
      lessonId: parsed.value.lessonId,
      completed: true,
      attempts: 2,
      timeSpentMs: 41_000,
      selfRating: 3,
    });
    assert.ok(result.ok);

    const adapted = adaptFabResultMessage(
      { type: "fab-lab:practice-result", result: result.value },
      { conceptId: "semi-rayleigh", lessonId: "semi-rayleigh-10" },
    );
    assert.ok(adapted.ok, `host rejected fab result: ${adapted.ok ? "" : adapted.message}`);
    if (adapted.ok) {
      assert.equal(adapted.data.type, "dau:practice-result");
      assert.equal(adapted.data.adaptedFrom, "fab-lab");
      assert.equal(adapted.data.result.labId, FAB_LAB_ID);
    }
  });

  it("rejects wrong labs, foreign ids, and mismatched results", () => {
    assert.equal(buildFabLaunchUrl(LAUNCH_BASE, dauRequest({ labId: "chudbox" })).ok, false);
    assert.equal(
      buildFabLaunchUrl(LAUNCH_BASE, dauRequest({ conceptId: "horo-rate", lessonId: "horo-rate-10" })).ok,
      false,
    );
    assert.equal(buildFabLaunchUrl(LAUNCH_BASE, dauRequest({ practiceType: "regulate" })).ok, false);

    const result = buildPracticeResult({
      conceptId: "semi-rayleigh",
      lessonId: "semi-euv-20",
      completed: true,
      attempts: 1,
      timeSpentMs: 100,
    });
    assert.ok(result.ok);
    const adapted = adaptFabResultMessage(
      { type: "fab-lab:practice-result", result: result.value },
      { lessonId: "semi-rayleigh-10" },
    );
    assert.equal(adapted.ok, false);
    if (!adapted.ok) assert.equal(adapted.code, "mismatch");
  });

  it("query param name matches the shared contract", () => {
    assert.equal(PRACTICE_QUERY_PARAM, "practice");
  });
});
