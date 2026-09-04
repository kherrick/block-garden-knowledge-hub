/**
 * Block Garden Portable Custom Element & UI Mounting Factory
 *
 * Provides reusable web component lifecycle, mounting, responsive canvas calculations,
 * focus guards, context discovery, and BroadcastChannel bridge installation for <block-garden>.
 * Can be imported and mounted by any external web application, modal dialog,
 * HUD overlay, or knowledge hub.
 */

import {
  CHANNELS,
  EVENTS,
  handleToolCommand,
  executeOreScan,
  runFireworks,
  runKonamiCode,
} from "./block-garden.js";

export const BUNDLE_URL =
  "https://kherrick.github.io/block-garden/block-garden-bundle-min.mjs";

export const SELECTORS = {
  GAME_CONTAINER: ".game-frame-container",
  BLOCK_GARDEN: "block-garden",
};

/**
 * Ensures the <block-garden> custom element is registered.
 *
 * @returns {Promise<boolean>} Resolves to true if defined.
 */
export async function ensureBlockGardenDefined() {
  if (typeof customElements === "undefined") return false;
  if (customElements.get("block-garden")) return true;

  try {
    await import(BUNDLE_URL);
  } catch (e) {
    console.warn("Failed to load block-garden bundle:", e);
  }

  if (!customElements.get("block-garden")) {
    await customElements.whenDefined("block-garden").catch(() => {});
  }
  return Boolean(customElements.get("block-garden"));
}

/**
 * Extracts context (element, shadowRoot, global context, blockGarden instance) from an element.
 *
 * @param {HTMLElement} el
 * @returns {{ el: HTMLElement, shadow: ShadowRoot|null, win: any, bg: any }}
 */
export function getContextFromElement(el) {
  const win = el?.ownerDocument?.defaultView || globalThis;
  return {
    el,
    shadow: el?.shadowRoot || null,
    win,
    bg: win?.blockGarden || globalThis?.blockGarden || null,
  };
}

/**
 * Searches the DOM, shadow roots, and iframes for an active <block-garden> instance.
 *
 * @returns {{ el: HTMLElement|null, shadow: ShadowRoot|null, win: Window, bg: any }}
 */
export function findBlockGardenContext() {
  if (typeof document === "undefined") {
    return {
      el: null,
      shadow: null,
      win: globalThis,
      bg: globalThis?.blockGarden || null,
    };
  }

  try {
    const iframeEl = document
      .querySelector("shadow-claw")
      ?.shadowRoot?.querySelector("shadow-claw-pages")
      ?.shadowRoot?.querySelector("[data-pages-iframe]")
      ?.contentDocument?.querySelector(SELECTORS.BLOCK_GARDEN);
    if (iframeEl) return getContextFromElement(iframeEl);
  } catch (e) {}

  const bgEl = document.querySelector(SELECTORS.BLOCK_GARDEN);
  if (bgEl) return getContextFromElement(bgEl);

  return {
    el: null,
    shadow: null,
    win: globalThis,
    bg: globalThis?.blockGarden || null,
  };
}

/**
 * Creates and configures a <block-garden> DOM element.
 *
 * @param {object} [options]
 * @returns {HTMLElement|null}
 */
export function createBlockGarden(options = {}) {
  if (typeof document === "undefined") return null;

  const el = document.createElement("block-garden");
  if (options.seed) el.setAttribute("seed", options.seed);
  if (options.generator) el.setAttribute("generator", options.generator);
  if (options.id) el.id = options.id;

  return el;
}

/**
 * Wires responsive container calculations and canvas aspect ratio handlers.
 *
 * @param {HTMLElement} el The <block-garden> element
 * @returns {Function} Cleanup function
 */
export function wireResponsiveProperties(el) {
  if (!el || typeof globalThis === "undefined") return () => {};

  function getCanvas(shadow) {
    return shadow
      ? shadow.getElementById("canvas") || shadow.querySelector("canvas")
      : null;
  }

  function applyResponsiveProperties() {
    const rect = el.getBoundingClientRect();
    const parentRect = el.parentElement
      ? el.parentElement.getBoundingClientRect()
      : rect;
    const width = Math.floor(
      parentRect.width || rect.width || globalThis.innerWidth || 800,
    );
    const height = Math.floor(rect.height || 600);
    const gridWidth = Math.max(0, width - 16);
    const gridHeight = Math.max(0, height - 16);
    const isMobile = width < 859;

    const props = {
      "--bg-ui-host-width": `${width}px`,
      "--bg-ui-host-height": `${height}px`,
      "--bg-ui-host-overflow": "hidden",
      "--bg-ui-grid-width": `${gridWidth}px`,
      "--bg-ui-grid-height": `${gridHeight}px`,
      "--bg-ui-grid-corner-max-height": `${gridHeight}px`,
      "--bg-ui-touch-controls-position": "absolute",
      "--bg-ui-touch-controls-width": "100%",
      "--bg-ui-touch-controls-bottom": isMobile ? "2rem" : "4rem",
    };

    for (const [prop, val] of Object.entries(props)) {
      el.style.setProperty(prop, val);
    }
    el.style.transform = "translateZ(0)";

    if (el.shadowRoot) {
      const canvas = getCanvas(el.shadowRoot);
      if (canvas) {
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.maxWidth = "100%";
        canvas.style.maxHeight = "100%";
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      }

      const uiGrid = el.shadowRoot.querySelector(".ui-grid");
      if (uiGrid) {
        uiGrid.style.width = `${gridWidth}px`;
        uiGrid.style.height = `${gridHeight}px`;
      }
    }

    globalThis.dispatchEvent?.(new Event("resize"));
  }

  let timer = null;
  const debouncedUpdate = () => {
    clearTimeout(timer);
    timer = setTimeout(applyResponsiveProperties, 20);
  };

  let ro = null;
  if (typeof ResizeObserver !== "undefined") {
    ro = new ResizeObserver(debouncedUpdate);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
  }

  globalThis.addEventListener?.("resize", debouncedUpdate);
  applyResponsiveProperties();
  requestAnimationFrame(applyResponsiveProperties);

  return () => {
    clearTimeout(timer);
    globalThis.removeEventListener?.("resize", debouncedUpdate);
    if (ro) ro.disconnect();
  };
}

/**
 * Installs the BroadcastChannel bridge for Block Garden commands.
 *
 * @param {object} [options]
 * @param {string} [options.commandChannelName]
 * @param {string} [options.resultChannelName]
 * @param {boolean} [options.force=false]
 * @returns {BroadcastChannel|null}
 */
export function installBlockGardenBridge(options = {}) {
  if (typeof globalThis.BroadcastChannel === "undefined") {
    return null;
  }
  if (globalThis._bgBroadcastBridgeInstalled && !options.force) {
    return null;
  }
  globalThis._bgBroadcastBridgeInstalled = true;

  const commandChannelName =
    options.commandChannelName || EVENTS.COMMANDS_CHANNEL || CHANNELS.COMMANDS;
  const resultChannelName =
    options.resultChannelName || EVENTS.RESULTS_CHANNEL || CHANNELS.RESULTS;

  const commandChannel = new BroadcastChannel(commandChannelName);
  commandChannel.onmessage = async (evt) => {
    const { type, requestId, params } = evt.data || {};
    if (!type || !requestId) return;

    const resultChannel = new BroadcastChannel(resultChannelName);
    let result = "";
    try {
      const ctx = findBlockGardenContext();
      result = await handleToolCommand(type, params, ctx);
    } catch (err) {
      result = "Error: " + (err.message || String(err));
    }
    resultChannel.postMessage({ requestId, result });
    resultChannel.close();
  };

  return commandChannel;
}

/**
 * Mounts and configures a <block-garden> element into a container with full responsive wiring.
 *
 * @param {HTMLElement|string} container
 * @param {object} [options]
 * @returns {{ element: HTMLElement|null, cleanup: Function }}
 */
export function renderBlockGarden(container, options = {}) {
  if (typeof document === "undefined")
    return { element: null, cleanup: () => {} };

  const target =
    typeof container === "string"
      ? document.querySelector(container)
      : container;
  if (!target) return { element: null, cleanup: () => {} };

  const el = createBlockGarden(options);
  target.appendChild(el);

  const cleanupResponsive = wireResponsiveProperties(el);

  if (options.installBridge !== false) {
    installBlockGardenBridge();
  }

  return {
    element: el,
    cleanup: () => {
      cleanupResponsive();
      if (el.parentNode) el.parentNode.removeChild(el);
    },
  };
}

export default {
  BUNDLE_URL,
  SELECTORS,
  ensureBlockGardenDefined,
  getContextFromElement,
  findBlockGardenContext,
  createBlockGarden,
  wireResponsiveProperties,
  installBlockGardenBridge,
  renderBlockGarden,
};
