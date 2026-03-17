import { Window } from "happy-dom";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DIST_BUNDLE_PATH = resolve(process.cwd(), "dist/sim-returns.js");

export async function ensureBuiltBundleExists() {
  await access(DIST_BUNDLE_PATH);
}

export async function loadBuiltAppBundle() {
  await ensureBuiltBundleExists();
  installBrowserGlobals();
  await import(pathToFileURL(DIST_BUNDLE_PATH).href);
}

export function createMountedApp(currentYear = 2030) {
  document.body.innerHTML = "";
  const element = document.createElement("sim-returns-app");
  element.setAttribute("data-current-year", String(currentYear));
  document.body.append(element);
  return element;
}

export async function runDefaultScenarioAndMeasure(currentYear = 2030) {
  await loadBuiltAppBundle();
  const element = createMountedApp(currentYear);
  const startTime = performance.now();
  let firstVisibleUpdateMs = null;

  element.shadowRoot?.querySelector("[data-action='run']")?.dispatchEvent(new Event("click"));

  for (let attempt = 0; attempt < 10000; attempt += 1) {
    const progress = element.shadowRoot
      ?.querySelector("[data-testid='run-progress']")
      ?.textContent?.trim();
    const status = element.shadowRoot
      ?.querySelector("[data-testid='run-status-badge']")
      ?.textContent?.trim();

    if (
      firstVisibleUpdateMs == null &&
      progress != null &&
      progress !== "0 / 100" &&
      progress !== "100 / 100"
    ) {
      firstVisibleUpdateMs = performance.now() - startTime;
    }

    if (status === "completed") {
      const completionMs = performance.now() - startTime;

      return {
        completionMs,
        firstVisibleUpdateMs: firstVisibleUpdateMs ?? completionMs,
        progress: progress ?? "unknown",
        status,
      };
    }

    await waitForMacrotask();
  }

  throw new Error("Timed out waiting for the default scenario to complete.");
}

function installBrowserGlobals() {
  if (globalThis.window != null && globalThis.document != null) {
    return;
  }

  const window = new Window();
  const matchMedia = () => ({
    addEventListener() {},
    matches: true,
    media: "",
    onchange: null,
    removeEventListener() {},
  });

  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.customElements = window.customElements;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.Node = window.Node;
  globalThis.Event = window.Event;
  globalThis.CustomEvent = window.CustomEvent;
  globalThis.MutationObserver = window.MutationObserver;
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);
  globalThis.ShadowRoot = window.ShadowRoot;
  globalThis.SVGElement = window.SVGElement;
  globalThis.Element = window.Element;
  globalThis.devicePixelRatio = 1;
  globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
  globalThis.matchMedia = matchMedia;
}

function waitForMacrotask() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
