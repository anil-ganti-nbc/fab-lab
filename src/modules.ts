/**
 * The five Fab Lab practice modules. Conceptual grading only: multiple choice,
 * ordering, and mapping — every item sourced from the content bank.
 */

import type { PracticePayload } from "./lib/practice/schema";
import { countAttempt, type SessionState } from "./lib/practice/session";
import {
  FREE_HINT,
  IDENTIFY_ITEMS,
  RAYLEIGH_ITEMS,
  SEQUENCE_STEPS,
  YIELD_ITEMS,
  type McqItem,
} from "./content/bank";

export interface ModuleCtx {
  payload: PracticePayload;
  session: SessionState;
  root: HTMLElement;
  onReady: (ready: boolean) => void;
}

function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  text = "",
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (text) node.textContent = text;
  return node;
}

function paramNumber(payload: PracticePayload, key: string, fallback: number): number {
  const value = payload.parameters?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Shared MCQ runner: deals items, tracks streak, reports readiness. */
function mountMcq(
  ctx: ModuleCtx,
  title: string,
  pool: McqItem[],
  needed: number,
): void {
  const deck = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(needed, pool.length));
  let index = 0;
  let correct = 0;

  const prompt = h("p", {}, "");
  const source = h("p", { class: "hint" }, "");
  const options = h("div", { class: "stack" });
  const feedback = h("p", { class: "hint" }, "");
  const progress = h("p", { class: "hint" }, `0 / ${deck.length}`);

  function show(): void {
    if (index >= deck.length) {
      ctx.onReady(true);
      feedback.textContent = "Module complete. Hit Complete.";
      return;
    }
    const item = deck[index];
    prompt.textContent = item.prompt;
    source.textContent = `from ${item.source}`;
    progress.textContent = `${correct} / ${deck.length}`;
    feedback.textContent = "";
    options.replaceChildren(
      ...item.choices.map((choice, choiceIndex) => {
        const btn = h("button", { class: "btn" }, choice);
        btn.addEventListener("click", () => {
          if (btn.disabled) return;
          if (choiceIndex === item.answerIndex) {
            btn.classList.add("correct");
            correct += 1;
            progress.textContent = `${correct} / ${deck.length}`;
            feedback.textContent = item.why;
            for (const sibling of options.children) {
              (sibling as HTMLButtonElement).disabled = true;
            }
            index += 1;
            window.setTimeout(show, 1400);
          } else {
            btn.classList.add("wrong");
            countAttempt(ctx.session);
            // Conceptual grading: the right answer is taught, not withheld.
            for (const sibling of options.children) {
              (sibling as HTMLButtonElement).disabled = true;
            }
            options.children[item.answerIndex].classList.add("correct");
            feedback.textContent = item.why;
            index += 1;
            window.setTimeout(show, 2200);
          }
        });
        return btn;
      }),
    );
  }

  ctx.root.append(h("h2", { class: "label" }, title), prompt, source, options, feedback, progress);
  show();
}

export function mountRayleigh(ctx: ModuleCtx): void {
  mountMcq(ctx, "Three knobs, one bill", RAYLEIGH_ITEMS, paramNumber(ctx.payload, "questions", 4));
}

export function mountYield(ctx: ModuleCtx): void {
  mountMcq(ctx, "Yield economics & defect classes", YIELD_ITEMS, paramNumber(ctx.payload, "questions", 4));
}

export function mountIdentify(ctx: ModuleCtx): void {
  mountMcq(ctx, "Unit-process literacy", IDENTIFY_ITEMS, paramNumber(ctx.payload, "questions", 4));
}

// ---------- sequence: click the flow in order ----------

export function mountSequence(ctx: ModuleCtx): void {
  const steps = [...SEQUENCE_STEPS];
  let nextIndex = 0;

  const prompt = h(
    "p",
    {},
    "A MOSFET is an order, not a pile of good unit processes. Click the flow in integration order.",
  );
  const feedback = h("p", { class: "hint" }, "");
  const board = h("div", { class: "stack" });

  const buttons = steps.map((step) => {
    const btn = h("button", { class: "btn" }, step.name);
    btn.addEventListener("click", () => {
      if (btn.disabled || ctx.session.result) return;
      const expected = steps[nextIndex];
      if (step.id === expected.id) {
        btn.classList.add("correct");
        btn.disabled = true;
        feedback.textContent = step.why;
        nextIndex += 1;
        if (nextIndex >= steps.length) {
          ctx.onReady(true);
          feedback.textContent = "Sequence survived its thermal budget. Hit Complete.";
        }
      } else {
        btn.classList.add("wrong");
        countAttempt(ctx.session);
        feedback.textContent =
          step.id === "silicide"
            ? "Not yet — a metal that sees a furnace spikes or melts. What still needs heat first?"
            : `Not yet — ask what must already exist for this step to mean anything.`;
        window.setTimeout(() => btn.classList.remove("wrong"), 700);
      }
    });
    return btn;
  });
  // Shuffle presentation; the click order is the graded thing.
  buttons.sort(() => Math.random() - 0.5);
  board.append(...buttons);

  ctx.root.append(h("h2", { class: "label" }, "Integration order"), prompt, board, feedback);
}

// ---------- free: wafer map explorer ----------

export function mountFree(ctx: ModuleCtx): void {
  const GRID = 12;
  let dieSize = 100; // mm^2-ish arbitrary units
  let defectDensity = 0.004; // per unit area

  const readout = h("div", { class: "readout" });
  const goodCell = (() => {
    const cell = h("div", { class: "cell" });
    cell.appendChild(h("div", { class: "num good" }, "—"));
    cell.appendChild(h("div", { class: "unit" }, "good die"));
    return cell;
  })();
  const totalCell = (() => {
    const cell = h("div", { class: "cell" });
    cell.appendChild(h("div", { class: "num" }, "—"));
    cell.appendChild(h("div", { class: "unit" }, "die on wafer"));
    return cell;
  })();
  const yieldCell = (() => {
    const cell = h("div", { class: "cell" });
    cell.appendChild(h("div", { class: "num" }, "—"));
    cell.appendChild(h("div", { class: "unit" }, "yield"));
    return cell;
  })();
  readout.append(goodCell, totalCell, yieldCell);

  const map = h("div", { class: "wafer-map" });
  const dieSlider = h("input", { type: "range", min: "25", max: "400", value: String(dieSize) });
  const defectSlider = h("input", { type: "range", min: "1", max: "20", value: String(defectDensity * 1000) });
  const dieLabel = h("p", { class: "hint" }, `Die size: ${dieSize}`);
  const defectLabel = h("p", { class: "hint" }, `Defect density: ${(defectDensity * 1000).toFixed(0)} /k`);

  function poissonYield(area: number, density: number): number {
    return Math.exp(-area * density);
  }

  function redraw(): void {
    // Die count falls as die grows (fixed wafer); yield follows Poisson.
    const total = Math.max(4, Math.round(30_000 / dieSize));
    const y = poissonYield(dieSize, defectDensity);
    const good = Math.round(total * y);
    (goodCell.querySelector(".num") as HTMLElement).textContent = String(good);
    (totalCell.querySelector(".num") as HTMLElement).textContent = String(total);
    (yieldCell.querySelector(".num") as HTMLElement).textContent = `${Math.round(y * 100)}%`;

    // Deterministic seeded draw so the same sliders always draw the same map.
    const cells: HTMLElement[] = [];
    let seed = dieSize * 7 + Math.round(defectDensity * 1000) * 13 + 5;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let i = 0; i < total; i += 1) {
      const cell = h("div", { class: `die ${rand() < y ? "good-die" : "bad-die"}` });
      cells.push(cell);
    }
    map.replaceChildren(...cells);
    dieLabel.textContent = `Die size: ${dieSize}`;
    defectLabel.textContent = `Defect density: ${(defectDensity * 1000).toFixed(0)} /k`;
  }

  dieSlider.addEventListener("input", () => {
    dieSize = Number(dieSlider.value);
    redraw();
  });
  defectSlider.addEventListener("input", () => {
    defectDensity = Number(defectSlider.value) / 1000;
    redraw();
  });

  ctx.root.append(
    h("h2", { class: "label" }, "Wafer map"),
    readout,
    map,
    dieSlider,
    dieLabel,
    defectSlider,
    defectLabel,
    h("p", { class: "hint" }, FREE_HINT),
  );
  ctx.onReady(true);
  redraw();
}
