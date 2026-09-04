/**
 * Block Garden Responsive & Inter-Process Presentation Adapter for ShadowClaw
 * Dynamically handles container resizing, CSS custom property calculations,
 * grid alignment, canvas aspect ratio dispatching, iframe popup escape, and
 * BroadcastChannel tool integration for <block-garden>.
 *
 * ===========================================================================
 * SKILL EXECUTION MODES: HEADLESS (NON-GRAPHICAL) VS GRAPHICAL
 * ===========================================================================
 * This skill supports two distinct operational modes:
 *
 * 1. HEADLESS / PROGRAMMATIC MODE (Default & Non-Graphical):
 *    - NO DOM, NO HTML markup, NO canvas, and NO WebGL context required!
 *    - Ideal for AI agents, background Web Workers, Node.js scripts, and headless automation.
 *    - Method A (Direct ESM Import):
 *        import { executeOreScan, runFireworks, runKonamiCode, handleToolCommand } from "./block-garden.js";
 *        const scanResult = await executeOreScan({ radius: 16 });
 *    - Method B (Headless BroadcastChannel IPC):
 *        const cmdChan = new BroadcastChannel("block-garden-commands");
 *        const resChan = new BroadcastChannel("block-garden-results");
 *        resChan.onmessage = ({ data }) => console.log("Result:", data.result);
 *        cmdChan.postMessage({ type: "scan_for_nearby_ores", requestId: "1", params: { radius: 16 } });
 *
 * 2. GRAPHICAL / INTERACTIVE PRESENTATION MODE (Optional DOM Enhancement):
 *    - Used when rendering the interactive 3D voxel sandbox in a web page,
 *      iframe, game container, or custom dashboard.
 *    - All DOM elements listed below are OPTIONAL and progressively enhanced:
 *      if any control is omitted from the page, the adapter degrades gracefully.
 *
 *    OPTIONAL MARKUP & DOM PREREQUISITES FOR GRAPHICAL EMBEDDING:
 *    -----------------------------------------------------------------------
 *    a) Game Frame Container:
 *       - Element: <div class="game-frame-container" data-no-nav>...</div>
 *       - Purpose: Houses the viewport header and <block-garden> canvas.
 *       - Classes dynamically toggled by adapter:
 *         - .is-fullscreen: Toggled when native/CSS fullscreen window is active
 *         - .is-maximized: Toggled when "Fill Iframe" expands to fill parent bounds
 *
 *    b) Target Custom Element (<block-garden>):
 *       - Element: <block-garden id="live-block-garden" data-no-nav></block-garden>
 *       - Attributes (optional):
 *         - seed="..." (world generation seed)
 *         - generator="classic" | "simplex" | "flat"
 *         - data-no-nav: Prevents parent routing gestures from intercepting touch/clicks
 *       - Script: Ensure definition is loaded (via ./block-garden-element.js or external bundle).
 *
 *    c) Viewport Header & Control Buttons (Optional):
 *       - Expand / Fill Iframe Button:
 *         - Selector: [data-action="toggle-expand"], [data-action="toggle-fill-iframe"], or #bg-expand-btn
 *         - Sub-elements toggled:
 *           - .expand-icon-maximize (visible when normal)
 *           - .expand-icon-minimize (visible when maximized)
 *           - .game-expand-text (textContent toggled "Fill Iframe" / "Exit Fill")
 *       - Fullscreen Toggle Button:
 *         - Selector: [data-action="toggle-fullscreen"] or #bg-fullscreen-btn
 *         - Sub-elements toggled:
 *           - .fullscreen-icon-expand (visible when windowed)
 *           - .fullscreen-icon-compress (visible when fullscreen)
 *           - .game-fullscreen-text (textContent toggled "Fullscreen" / "Exit Fullscreen")
 *
 *    d) Keyboard Shortcuts (In Graphical Mode):
 *       - Press 'F' inside the viewport container to toggle Fullscreen mode.
 *       - Press 'Escape' to exit Fullscreen or Fill Iframe mode.
 *
 *    e) Toast Notifications & Iframe Popups:
 *       - Intercepts <dialog> and game save links within sandboxed iframes,
 *         dispatching saves to parent storage proxy and popups via globalThis.open(..., '_blank').
 *       - Dispatches visual toasts to #toastContainer if present.
 * ===========================================================================
 */
import {
  BASE_URL,
  MODULES,
  CHANNELS,
  EVENTS,
  runFireworks,
  runKonamiCode,
  executeOreScan,
  handleToolCommand,
} from "./block-garden.js";
import {
  findBlockGardenContext,
  installBlockGardenBridge,
} from "./block-garden-element.js";

const CLASSES = {
  FULLSCREEN: "is-fullscreen",
  MAXIMIZED: "is-maximized",
};

const SELECTORS = {
  GAME_CONTAINER: ".game-frame-container",
  FULLSCREEN_BTNS: '[data-action="toggle-fullscreen"], #bg-fullscreen-btn',
  EXPAND_BTNS:
    '[data-action="toggle-expand"], [data-action="toggle-fill-iframe"], #bg-expand-btn',
  BLOCK_GARDEN: "block-garden",
};

function debounce(fn, delay = 16) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function getCanvas(shadow) {
  return shadow
    ? shadow.getElementById("canvas") || shadow.querySelector("canvas")
    : null;
}

function dispatchCustomEvent(target, type, detail) {
  target.dispatchEvent(
    new CustomEvent(type, {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}

function saveLastToast(message, targetWin) {
  const toastObj = { message, timestamp: Date.now() };
  globalThis._lastBlockGardenToast = toastObj;
  if (targetWin && targetWin !== globalThis) {
    targetWin._lastBlockGardenToast = toastObj;
  }
  if (globalThis.parent && globalThis.parent !== globalThis) {
    try {
      globalThis.parent._lastBlockGardenToast = toastObj;
    } catch (e) {}
  }
}

function isInsideBlockGarden(el, node, e) {
  if (!node) return false;
  if (node === el || el.contains?.(node) || el.shadowRoot?.contains?.(node))
    return true;
  if (e && typeof e.composedPath === "function") {
    const path = e.composedPath();
    if (path.includes(el) || (el.shadowRoot && path.includes(el.shadowRoot))) {
      return true;
    }
  }
  return false;
}

function getFullscreenElement() {
  return document.fullscreenElement || document?.webkitFullscreenElement;
}

function isCurrentlyFullscreen(container) {
  const fsEl = getFullscreenElement();
  return (
    fsEl === container ||
    fsEl === document.documentElement ||
    Boolean(container?.classList.contains(CLASSES.FULLSCREEN))
  );
}

function isCurrentlyMaximized(container) {
  return Boolean(container?.classList.contains(CLASSES.MAXIMIZED));
}

function getContainer(btn) {
  return (
    btn?.closest(SELECTORS.GAME_CONTAINER) ||
    document.querySelector(SELECTORS.GAME_CONTAINER)
  );
}

function updateFullscreenUI(container, active) {
  const fullscreenBtns = document.querySelectorAll(SELECTORS.FULLSCREEN_BTNS);
  fullscreenBtns.forEach((btn) => {
    const expandIcon = btn.querySelector(".fullscreen-icon-expand");
    const compressIcon = btn.querySelector(".fullscreen-icon-compress");
    const textEl = btn.querySelector(".game-fullscreen-text");

    if (expandIcon) expandIcon.style.display = active ? "none" : "block";
    if (compressIcon) compressIcon.style.display = active ? "block" : "none";
    if (textEl) textEl.textContent = active ? "Exit Fullscreen" : "Fullscreen";
    btn.setAttribute("aria-pressed", String(active));
    btn.title = active
      ? "Exit Fullscreen (Esc / F)"
      : "Toggle Fullscreen Window (F)";
  });

  globalThis.dispatchEvent?.(new Event("resize"));
}

function updateExpandUI(container, active) {
  const expandBtns = document.querySelectorAll(SELECTORS.EXPAND_BTNS);
  expandBtns.forEach((btn) => {
    const maxIcon = btn.querySelector(".expand-icon-maximize");
    const minIcon = btn.querySelector(".expand-icon-minimize");
    const textEl = btn.querySelector(".game-expand-text");

    if (maxIcon) maxIcon.style.display = active ? "none" : "block";
    if (minIcon) minIcon.style.display = active ? "block" : "none";
    if (textEl) textEl.textContent = active ? "Exit Fill" : "Fill Iframe";
    btn.setAttribute("aria-pressed", String(active));
    btn.title = active ? "Exit Fill Iframe (Esc)" : "Fill Parent Iframe";
  });

  globalThis.dispatchEvent?.(new Event("resize"));
}

async function exitNativeFullscreen() {
  if (getFullscreenElement()) {
    try {
      const exit = document.exitFullscreen || document?.webkitExitFullscreen;
      if (exit) await exit.call(document);
    } catch (e) {}
  }
}

async function toggleFullscreen(container) {
  if (!container) return;

  if (isCurrentlyFullscreen(container)) {
    await exitNativeFullscreen();
    container.classList.remove(CLASSES.FULLSCREEN);
    updateFullscreenUI(container, false);
  } else {
    if (container.classList.contains(CLASSES.MAXIMIZED)) {
      container.classList.remove(CLASSES.MAXIMIZED);
      updateExpandUI(container, false);
    }

    let nativeSucceeded = false;
    const request =
      container.requestFullscreen || container?.webkitRequestFullscreen;

    if (request) {
      try {
        await request.call(container);
        nativeSucceeded = true;
      } catch (e) {}
    }
    if (!nativeSucceeded) {
      container.classList.add(CLASSES.FULLSCREEN);
    }
    updateFullscreenUI(container, true);
  }
}

function toggleExpand(container) {
  if (!container) return;

  if (isCurrentlyMaximized(container)) {
    container.classList.remove(CLASSES.MAXIMIZED);
    updateExpandUI(container, false);
  } else {
    void exitNativeFullscreen();
    if (container.classList.contains(CLASSES.FULLSCREEN)) {
      container.classList.remove(CLASSES.FULLSCREEN);
      updateFullscreenUI(container, false);
    }

    container.classList.add(CLASSES.MAXIMIZED);
    updateExpandUI(container, true);
  }
}

function setupResponsiveElement(el) {
  if (!el || el._bgAdapterInitialized) return;
  el._bgAdapterInitialized = true;
  if (!el.hasAttribute("data-no-nav")) {
    el.setAttribute("data-no-nav", "");
  }

  const win = el.ownerDocument?.defaultView || globalThis;

  if (win.location?.href === "about:srcdoc" && !win._bgHistoryPatched) {
    win._bgHistoryPatched = true;
    win.history.replaceState = function (data, unused, url) {
      console.warn(
        "[Block Garden Adapter] Prevented replaceState in srcdoc:",
        url,
      );
    };
  }

  let _canvasFocusPatched = false;
  let _canvasOrigFocus = null;
  let _isOutsideInteracting = false;

  function getOpenDialog() {
    return el.shadowRoot ? el.shadowRoot.querySelector("dialog[open]") : null;
  }

  function patchCanvasFocus() {
    if (_canvasFocusPatched || !el.shadowRoot) return;
    const cnvs = getCanvas(el.shadowRoot);
    if (!cnvs) return;

    _canvasOrigFocus = cnvs.focus.bind(cnvs);
    _canvasFocusPatched = true;

    cnvs.focus = function (...args) {
      if (getOpenDialog() || _isOutsideInteracting) return;
      _canvasOrigFocus(...args);
    };
  }

  function onDialogOpened(dialog) {
    if (dialog._bgAdapterGuardAttached) return;
    dialog._bgAdapterGuardAttached = true;

    if (!dialog.hasAttribute("tabindex")) {
      dialog.setAttribute("tabindex", "-1");
    }

    const closeBtn = dialog.querySelector("#closeGettingStarted");
    if (closeBtn) {
      closeBtn.removeAttribute("autofocus");
    }

    // -----------------------------------------------------------------------
    // Srcdoc Game-Save Navigation Bridge
    // -----------------------------------------------------------------------
    // In sandboxed srcdoc iframes, block-garden's Getting Started dialog
    // attaches click handlers that call `globalThis.location.href = url`
    // after a confirm(). This silently fails because the sandbox blocks
    // cross-origin navigation. We intercept these clicks via capture-phase
    // listeners (which fire BEFORE block-garden's bubbling handlers), show
    // our own confirm dialog, and relay the URL to the parent via
    // postMessage so it can rebuild the srcdoc with the correct params.
    // -----------------------------------------------------------------------
    if (win.location?.href === "about:srcdoc") {
      const isSrcdocNav = true;
      const content = dialog.querySelector(".getting-started-content");
      if (content && isSrcdocNav) {
        const headers = Array.from(content.querySelectorAll("h4"));
        headers.forEach((h4) => {
          const title = (h4.textContent || "").trim();

          const interceptNav = (anchorEl) => {
            if (!anchorEl || anchorEl._bgAdapterNavPatched) return;
            anchorEl._bgAdapterNavPatched = true;

            anchorEl.addEventListener(
              "click",
              (ev) => {
                ev.preventDefault();
                ev.stopImmediatePropagation();

                const targetUrl =
                  anchorEl.href || anchorEl.getAttribute("href");
                if (!targetUrl) return;

                const confirmed = globalThis.confirm(
                  `Leave your current game and load "${title}"?`,
                );

                if (confirmed) {
                  win.open(targetUrl, "_blank");
                }
              },
              true, // capture phase — fires BEFORE block-garden's handler
            );
          };

          // Patch anchors/images under each h4 game-save section
          Array.from(h4.querySelectorAll("a")).forEach(interceptNav);
          let sib = h4.nextElementSibling;
          while (sib && sib.tagName !== "H3" && sib.tagName !== "H4") {
            Array.from(sib.querySelectorAll("a")).forEach(interceptNav);
            // Also intercept clicks on images that are inside anchors
            Array.from(sib.querySelectorAll("img")).forEach((img) => {
              const parentA = img.closest("a");
              if (parentA) {
                interceptNav(parentA);
              } else {
                // Standalone image — patch it too
                if (!img._bgAdapterNavPatched) {
                  img._bgAdapterNavPatched = true;
                  img.style.cursor = "pointer";
                  img.addEventListener(
                    "click",
                    (ev) => {
                      ev.preventDefault();
                      ev.stopImmediatePropagation();

                      const confirmed = globalThis.confirm(
                        `Leave your current game and load "${title}"?`,
                      );

                      if (confirmed) {
                        // Find nearest anchor sibling
                        const nearestA = img.parentElement?.querySelector("a");
                        const targetUrl =
                          nearestA?.href || nearestA?.getAttribute("href");
                        if (targetUrl) {
                          win.open(targetUrl, "_blank");
                        }
                      }
                    },
                    true,
                  );
                }
              }
            });
            sib = sib.nextElementSibling;
          }
        });
      }
    }

    // -----------------------------------------------------------------------
    // Srcdoc Link-Block "Travel to World?" Navigation Bridge
    // -----------------------------------------------------------------------
    // Block Garden's link-block activation dialog (#confirmTravel) calls
    // `window.location.href = url` on confirmation, which silently fails
    // in sandboxed srcdoc iframes (no allow-same-origin). We intercept the
    // confirm button click in capture phase, extract the world name from
    // the dialog's <strong> tag, reconstruct the game-save URL using the
    // same formatName logic as block-garden, and open it in a new tab via
    // win.open() so it gets a full browser context.
    // -----------------------------------------------------------------------
    if (win.location?.href === "about:srcdoc") {
      const confirmBtn = dialog.querySelector("#confirmTravel");
      if (confirmBtn && !confirmBtn._bgAdapterNavPatched) {
        confirmBtn._bgAdapterNavPatched = true;

        confirmBtn.addEventListener(
          "click",
          (ev) => {
            ev.preventDefault();
            ev.stopImmediatePropagation();

            // Extract the world name from the dialog's <strong> tag
            // (e.g. "Would you like to travel to <strong>Gateway To The Clouds</strong>?")
            const strong = dialog.querySelector("strong");
            const worldName = strong?.textContent?.trim();

            if (worldName) {
              // Reconstruct the URL using the same formatName logic as
              // block-garden's interaction.mjs → formatWorldName.mjs:
              // capitalize each word, replace spaces with dashes, strip
              // non-alphanumeric characters
              const filename =
                worldName
                  .trim()
                  .replace(/[^a-zA-Z0-9\s-]/g, "")
                  .split(/\s+/)
                  .map(
                    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
                  )
                  .join("-") + ".pdf";
              const gameSaveUrl = `https://kherrick.github.io/block-garden/assets/game-saves/${filename}`;
              const targetUrl = new URL(
                "https://kherrick.github.io/block-garden/",
              );
              targetUrl.searchParams.set("gameSave", gameSaveUrl);
              targetUrl.searchParams.set("gettingStarted", "false");
              win.open(targetUrl.toString(), "_blank");
            }

            // Close the dialog
            if (dialog.open) {
              dialog.close();
            }
          },
          true, // capture phase — fires BEFORE block-garden's handler
        );
      }
    }

    requestAnimationFrame(() => {
      if (dialog.open) {
        dialog.focus();
      }
    });
  }

  function attachShadowFocusGuard() {
    if (el.shadowRoot && !el._bgShadowGuardAttached) {
      el._bgShadowGuardAttached = true;

      patchCanvasFocus();

      const observer = new MutationObserver(() => {
        const openDialog = getOpenDialog();
        if (openDialog) onDialogOpened(openDialog);
      });
      observer.observe(el.shadowRoot, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["open"],
      });
    }

    const alreadyOpen = getOpenDialog();
    if (alreadyOpen) onDialogOpened(alreadyOpen);
  }

  attachShadowFocusGuard();

  function handleOutsideInteraction(e) {
    if (getOpenDialog()) return;

    const target = e.target;
    if (isInsideBlockGarden(el, target, e)) return;

    _isOutsideInteracting = true;
    setTimeout(() => {
      _isOutsideInteracting = false;
    }, 150);

    const active = el.shadowRoot?.activeElement || document.activeElement;
    if (active && isInsideBlockGarden(el, active)) {
      if (typeof active.blur === "function") {
        active.blur();
      }
    }
  }

  ["pointerdown", "touchstart", "mousedown"].forEach((evt) => {
    document.addEventListener(evt, handleOutsideInteraction, true);
  });

  function applyResponsiveProperties() {
    attachShadowFocusGuard();
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
        el.classList.remove(
          "resolution",
          "resolution-400",
          "resolution-600",
          "resolution-800",
        );
      }

      const uiGrid = el.shadowRoot.querySelector(".ui-grid");
      if (uiGrid) {
        uiGrid.style.width = `${gridWidth}px`;
        uiGrid.style.height = `${gridHeight}px`;
      }
    }

    globalThis.dispatchEvent?.(new Event("resize"));
  }

  const debouncedUpdate = debounce(applyResponsiveProperties, 20);

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => {
      debouncedUpdate();
    });
    ro.observe(el);
    if (el.parentElement) {
      ro.observe(el.parentElement);
    }
  }

  globalThis.addEventListener?.("resize", debouncedUpdate);

  applyResponsiveProperties();
  requestAnimationFrame(() => applyResponsiveProperties());

  let pollCount = 0;
  const pollInterval = setInterval(() => {
    pollCount++;
    applyResponsiveProperties();
    if (pollCount > 30) clearInterval(pollInterval);
  }, 50);

  if (!el._hasBlockGardenBridge) {
    el._hasBlockGardenBridge = true;

    globalThis.addEventListener?.(EVENTS.TRIGGER_FIREWORKS, () => {
      runFireworks().catch((err) =>
        console.warn("Failed to launch fireworks demo:", err),
      );
    });

    globalThis.addEventListener?.(EVENTS.KONAMI, () => {
      runKonamiCode().catch((err) =>
        console.warn("Failed to launch Konami Code demo:", err),
      );
    });

    installBlockGardenBridge();

    globalThis.addEventListener?.(EVENTS.SCAN_ORES, async () => {
      console.log("1 - blockgarden:scanores event received");
      const ctx = findBlockGardenContext();
      console.log("2 - ctx: ", ctx);
      if (ctx.shadow) {
        const btn = ctx.shadow.getElementById("oreLocatorBtn");
        if (btn) {
          btn.click();
          return;
        }
      }
      try {
        await executeOreScan(ctx);
      } catch (err) {
        console.warn("Failed to run ore locator module scan:", err);
      }
    });

    function attachToastObserver() {
      const ctx = findBlockGardenContext();
      const targetEl = ctx.el || el;
      const shadow = targetEl?.shadowRoot;
      if (!shadow || targetEl._hasToastObserver)
        return Boolean(targetEl?._hasToastObserver);
      const toastContainer = shadow.getElementById("toastContainer");
      if (toastContainer) {
        targetEl._hasToastObserver = true;
        const observer = new MutationObserver(() => {
          const toastEl = toastContainer.querySelector(".toast__content");
          if (toastEl && toastEl.textContent) {
            const msg = toastEl.textContent.trim();
            saveLastToast(msg);
            dispatchCustomEvent(targetEl, EVENTS.TOAST, {
              message: msg,
              timestamp: Date.now(),
            });
          }
        });
        observer.observe(toastContainer, {
          childList: true,
          subtree: true,
          characterData: true,
        });
        targetEl._toastMutationObserver = observer;
        return true;
      }
      return false;
    }

    if (!attachToastObserver()) {
      const toastCheckInterval = setInterval(() => {
        if (attachToastObserver()) {
          clearInterval(toastCheckInterval);
        }
      }, 500);
    }

    const bridgeCheckInterval = setInterval(() => {
      if (
        globalThis.blockGarden &&
        globalThis.blockGarden.api &&
        typeof globalThis.blockGarden.api.onBlockBreak === "function"
      ) {
        clearInterval(bridgeCheckInterval);

        globalThis.blockGarden.api.onBlockBreak((x, y, z) => {
          dispatchCustomEvent(el, EVENTS.BLOCK_BREAK, {
            x,
            y,
            z,
            timestamp: Date.now(),
          });
        });

        setInterval(() => {
          if (globalThis.blockGarden && globalThis.blockGarden.state) {
            const st = globalThis.blockGarden.state;
            const playerPos = st.playerPos || { x: 0, y: 0, z: 0 };
            dispatchCustomEvent(el, EVENTS.TELEMETRY, {
              x: Math.round(playerPos.x || 0),
              y: Math.round(playerPos.y || 0),
              z: Math.round(playerPos.z || 0),
              isFlying: Boolean(st.isFlying),
              timestamp: Date.now(),
            });
          }
        }, 1000);
      }
    }, 500);
  }
}

function initFullscreenControls(
  root = typeof document !== "undefined" ? document : null,
) {
  if (!root) return;
  const fullscreenBtns = root.querySelectorAll(SELECTORS.FULLSCREEN_BTNS);
  const expandBtns = root.querySelectorAll(SELECTORS.EXPAND_BTNS);

  fullscreenBtns.forEach((btn) => {
    if (btn._bgFsInitialized) return;
    btn._bgFsInitialized = true;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      void toggleFullscreen(getContainer(btn));
    });
  });

  expandBtns.forEach((btn) => {
    if (btn._bgExpInitialized) return;
    btn._bgExpInitialized = true;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleExpand(getContainer(btn));
    });
  });

  if (!globalThis._bgFsGlobalListenersInstalled) {
    globalThis._bgFsGlobalListenersInstalled = true;

    const onFsChange = () => {
      const container = document.querySelector(SELECTORS.GAME_CONTAINER);
      if (container) {
        const isFs = Boolean(getFullscreenElement());
        if (!isFs && !container.classList.contains(CLASSES.FULLSCREEN)) {
          updateFullscreenUI(container, false);
        } else if (isFs) {
          updateFullscreenUI(container, true);
        }
      }
    };

    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);

    globalThis.addEventListener?.("keydown", (e) => {
      const container = document.querySelector(SELECTORS.GAME_CONTAINER);
      if (!container) return;

      if (e.key === "Escape") {
        let handled = false;
        if (container.classList.contains(CLASSES.MAXIMIZED)) {
          container.classList.remove(CLASSES.MAXIMIZED);
          updateExpandUI(container, false);
          handled = true;
        }
        if (container.classList.contains(CLASSES.FULLSCREEN)) {
          container.classList.remove(CLASSES.FULLSCREEN);
          updateFullscreenUI(container, false);
          handled = true;
        }
        if (handled) return;
      }

      if (
        (e.key === "f" || e.key === "F") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        const target = e.target;
        const tag = (
          target && target.tagName ? target.tagName : ""
        ).toLowerCase();
        const activeEl = document.activeElement;
        const isFocusedInContainer =
          container.contains(activeEl) ||
          container.contains(target) ||
          container.classList.contains(CLASSES.FULLSCREEN) ||
          container.classList.contains(CLASSES.MAXIMIZED);

        if (
          isFocusedInContainer &&
          tag !== "input" &&
          tag !== "textarea" &&
          tag !== "select" &&
          !target?.isContentEditable
        ) {
          void toggleFullscreen(container);
        }
      }
    });
  }
}

export function scanElements(
  root = typeof document !== "undefined" ? document : null,
) {
  if (!root) return;
  const gardenEls = root.querySelectorAll(SELECTORS.BLOCK_GARDEN);
  gardenEls.forEach(setupResponsiveElement);
  initFullscreenControls(root);
}

export function init(options = {}) {
  const root =
    options.root || (typeof document !== "undefined" ? document : null);
  if (!root) return;

  const scan = () => scanElements(root);

  if (root.readyState === "loading") {
    root.addEventListener("DOMContentLoaded", scan);
  } else {
    scan();
  }

  if (options.observe !== false && typeof MutationObserver !== "undefined") {
    const target = root.documentElement || root;
    const observer = new MutationObserver(() => scan());
    observer.observe(target, { childList: true, subtree: true });
  }
}

export {
  init as initBlockGardenAdapter,
  CLASSES,
  SELECTORS,
  setupResponsiveElement,
  toggleFullscreen,
  toggleExpand,
};
export default init;
