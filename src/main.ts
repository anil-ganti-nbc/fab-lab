import { DEMO_TOKEN, parsePracticeSearch } from "./lib/practice/codec";
import { newSession, completeSession, type SessionState } from "./lib/practice/session";
import type { PracticePayload } from "./lib/practice/schema";
import {
  mountFree,
  mountIdentify,
  mountRayleigh,
  mountSequence,
  mountYield,
  type ModuleCtx,
} from "./modules";

const DEMO_PAYLOAD: PracticePayload = {
  schemaVersion: 1,
  sourceApp: "dau",
  conceptId: "semi-rayleigh",
  lessonId: "semi-rayleigh-10",
  practiceType: "rayleigh",
  goal: "Three knobs, one bill — can you read a lithography briefing honestly?",
};

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  text = "",
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (text) node.textContent = text;
  return node;
}

function boot(): void {
  const app = document.getElementById("app");
  if (!app) return;

  const params = new URLSearchParams(window.location.search);
  const token = params.get("practice") ?? undefined;
  let payload: PracticePayload | null = null;
  let errorText: string | null = null;

  if (token === undefined || token === DEMO_TOKEN) {
    payload = DEMO_PAYLOAD;
  } else {
    const parsed = parsePracticeSearch(token, DEMO_PAYLOAD);
    if (parsed.ok && parsed.value) payload = parsed.value;
    else if (!parsed.ok) errorText = parsed.error;
    else errorText = "payload: empty practice parameter";
  }

  if (!payload) {
    payload = { ...DEMO_PAYLOAD };
    errorText = errorText ?? "payload rejected";
  }

  const session: SessionState = newSession(payload);

  const header = el("header", { class: "bar" });
  header.appendChild(el("p", { class: "kicker" }, `Practice · ${payload.conceptId} · ${payload.lessonId}`));
  header.appendChild(el("p", { class: "goal" }, payload.goal));
  if (errorText) {
    header.appendChild(el("p", { class: "hint" }, `⚠ ${errorText} — running the lab standalone.`));
  }
  app.appendChild(header);

  const main = el("main");
  const left = el("section", { class: "card" });
  left.appendChild(el("h2", { class: "label" }, "The wafer"));
  const waferArea = el("div");
  waferArea.id = "wafer-area";
  left.appendChild(waferArea);
  const right = el("section", { class: "card" });
  app.appendChild(main);
  main.append(left, right);

  renderWaferArt(waferArea);

  const moduleRoot = el("div", { class: "stack" });
  right.appendChild(moduleRoot);

  // Completion bar
  const bar = el("section", { class: "card" });
  bar.appendChild(el("h2", { class: "label" }, "How it felt"));
  const ratingRow = el("div", { class: "row" });
  let selfRating: 1 | 2 | 3 | null = null;
  for (const [value, label] of [[1, "Rough"], [2, "Ok"], [3, "Locked"]] as const) {
    const btn = el("button", { class: "btn" }, label);
    btn.addEventListener("click", () => {
      selfRating = value;
      for (const sibling of ratingRow.children) sibling.classList.remove("primary");
      btn.classList.add("primary");
    });
    ratingRow.appendChild(btn);
  }
  const completeBtn = el("button", { class: "btn primary" }, "Complete");
  completeBtn.disabled = true;
  completeBtn.addEventListener("click", () => {
    session.selfRating = selfRating;
    const result = completeSession(session, true);
    if (!result) return;
    completeBtn.disabled = true;
    showResult(right, result);
  });
  bar.append(ratingRow, completeBtn);
  right.appendChild(bar);

  const ctx: ModuleCtx = {
    payload,
    session,
    root: moduleRoot,
    onReady: (ready) => {
      completeBtn.disabled = !ready;
    },
  };
  switch (payload.practiceType) {
    case "rayleigh":
      mountRayleigh(ctx);
      break;
    case "yield":
      mountYield(ctx);
      break;
    case "sequence":
      mountSequence(ctx);
      break;
    case "identify":
      mountIdentify(ctx);
      break;
    default:
      mountFree(ctx);
  }

  app.appendChild(
    el("footer", { class: "status" }, "Fab Lab · standalone lab · implements the dau-practice-labs ?practice= contract"),
  );
}

function showResult(container: HTMLElement, result: NonNullable<ReturnType<typeof completeSession>>): void {
  container.querySelector(".result-panel")?.remove();
  const panel = el("section", { class: "card result-panel" });
  panel.appendChild(el("h2", { class: "label" }, "Result for DAU"));
  panel.appendChild(el("pre", { class: "result" }, JSON.stringify(result, null, 2)));
  const copy = el("button", { class: "btn" }, "Copy");
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result));
      copy.textContent = "Copied";
    } catch {
      copy.textContent = "Copy failed";
    }
  });
  panel.appendChild(copy);
  panel.appendChild(
    el("p", { class: "hint" }, "Fab Lab does not write DAU mastery, reviews, or quiz scores."),
  );
  container.appendChild(panel);
}

/** Decorative wafer: die grid with a few clustered defect dots. */
function renderWaferArt(area: HTMLElement): void {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 300 300");
  svg.setAttribute("class", "movement");

  svg.appendChild(
    (() => {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", "150");
      c.setAttribute("cy", "150");
      c.setAttribute("r", "140");
      c.setAttribute("fill", "#1a1712");
      c.setAttribute("stroke", "#3a352c");
      return c;
    })(),
  );

  let seed = 42;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  for (let gx = 0; gx < 10; gx += 1) {
    for (let gy = 0; gy < 10; gy += 1) {
      const x = 15 + gx * 27;
      const y = 15 + gy * 27;
      if (Math.hypot(x + 10 - 150, y + 10 - 150) > 132) continue;
      const rect = document.createElementNS(NS, "rect");
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", "24");
      rect.setAttribute("height", "24");
      rect.setAttribute("rx", "2");
      rect.setAttribute("fill", rand() < 0.9 ? "#26221c" : "#3d2b24");
      rect.setAttribute("stroke", "#14120f");
      svg.appendChild(rect);
    }
  }

  area.appendChild(svg);
}

boot();
