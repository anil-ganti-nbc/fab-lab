import type { PracticePayload, PracticeResult, SelfRating } from "./schema";
import { buildPracticeResult } from "./schema";

export const PRACTICE_RESULT_MESSAGE = "fab-lab:practice-result";

export interface SessionState {
  payload: PracticePayload;
  attempts: number;
  startedAt: number;
  selfRating: SelfRating | null;
  result: PracticeResult | null;
}

export function newSession(payload: PracticePayload): SessionState {
  return { payload, attempts: 0, startedAt: Date.now(), selfRating: null, result: null };
}

/** Record one graded attempt (wrong answer, re-regulation pass, etc.). */
export function countAttempt(session: SessionState): void {
  session.attempts += 1;
}

/**
 * Build + validate the result and deliver it the two ways the contract allows:
 * shown in the panel, and postMessage'd to the opener if one exists.
 */
export function completeSession(
  session: SessionState,
  completed: boolean,
): PracticeResult | null {
  const built = buildPracticeResult({
    conceptId: session.payload.conceptId,
    lessonId: session.payload.lessonId,
    completed,
    attempts: session.attempts,
    timeSpentMs: Math.max(0, Date.now() - session.startedAt),
    ...(session.selfRating ? { selfRating: session.selfRating } : {}),
  });
  if (!built.ok) return null;
  session.result = built.value;

  if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
    window.opener.postMessage(
      { type: PRACTICE_RESULT_MESSAGE, result: session.result },
      "*",
    );
  }
  return session.result;
}
