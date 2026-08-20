/**
 * Block Garden Responsive Adapter for ShadowClaw
 * Dynamically handles container resizing, CSS custom property calculations,
 * grid alignment, and canvas aspect ratio dispatching for <block-garden>.
 */
(function initBlockGardenAdapter() {
  function debounce(fn, delay = 16) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function setupResponsiveElement(el) {
    if (!el || el._bgAdapterInitialized) return;
    el._bgAdapterInitialized = true;
    if (!el.hasAttribute("data-no-nav")) {
      el.setAttribute("data-no-nav", "");
    }

    // Intercept focusout to prevent <block-garden> from stealing focus
    // back to canvas when user clicks, taps, or tabs outside the element.
    function preventFocusStealing(e) {
      const related = e.relatedTarget || document.activeElement;
      if (!related || (!el.contains(related) && related !== el)) {
        e.stopImmediatePropagation();
      }
    }

    el.addEventListener("focusout", preventFocusStealing, true);

    function attachShadowFocusGuard() {
      if (el.shadowRoot && !el._bgShadowGuardAttached) {
        el._bgShadowGuardAttached = true;
        el.shadowRoot.addEventListener("focusout", preventFocusStealing, true);
      }
    }

    attachShadowFocusGuard();

    // Release active element focus when interacting with elements outside block-garden
    function handleOutsideInteraction(e) {
      const target = e.target;
      if (target && !el.contains(target) && target !== el) {
        const active = el.shadowRoot?.activeElement || document.activeElement;
        if (active && (el.contains(active) || active === el)) {
          if (typeof active.blur === "function") {
            active.blur();
          }
        }
      }
    }

    document.addEventListener("pointerdown", handleOutsideInteraction, true);
    document.addEventListener("touchstart", handleOutsideInteraction, true);
    document.addEventListener("mousedown", handleOutsideInteraction, true);

    function applyResponsiveProperties() {
      attachShadowFocusGuard();
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement
        ? el.parentElement.getBoundingClientRect()
        : rect;
      const width = Math.floor(
        parentRect.width || rect.width || window.innerWidth || 800,
      );
      const height = Math.floor(rect.height || 600);
      const gridWidth = Math.max(0, width - 16); // Account for 0.5rem margin on each side of .ui-grid
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

      // Synchronize internal canvas if shadowRoot is attached
      if (el.shadowRoot) {
        const canvas =
          el.shadowRoot.getElementById("canvas") ||
          el.shadowRoot.querySelector("canvas");
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

      // Dispatch resize event so Three.js / WebGL viewport and camera aspect update
      window.dispatchEvent(new Event("resize"));
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

    window.addEventListener("resize", debouncedUpdate);

    // Initial calculations
    applyResponsiveProperties();
    requestAnimationFrame(() => applyResponsiveProperties());

    let pollCount = 0;
    const pollInterval = setInterval(() => {
      pollCount++;
      applyResponsiveProperties();
      if (pollCount > 30) clearInterval(pollInterval);
    }, 50);
  }

  function initFullscreenControls() {
    const fullscreenBtns = document.querySelectorAll(
      '[data-action="toggle-fullscreen"], #bg-fullscreen-btn',
    );
    const expandBtns = document.querySelectorAll(
      '[data-action="toggle-expand"], [data-action="toggle-fill-iframe"], #bg-expand-btn',
    );

    function isCurrentlyFullscreen(container) {
      return (
        document.fullscreenElement === container ||
        document.fullscreenElement === document.documentElement ||
        document?.webkitFullscreenElement === container ||
        (container && container.classList.contains("is-fullscreen"))
      );
    }

    function isCurrentlyMaximized(container) {
      return container && container.classList.contains("is-maximized");
    }

    function updateFullscreenUI(container, active) {
      fullscreenBtns.forEach((btn) => {
        const expandIcon = btn.querySelector(".fullscreen-icon-expand");
        const compressIcon = btn.querySelector(".fullscreen-icon-compress");
        const textEl = btn.querySelector(".game-fullscreen-text");

        if (expandIcon) expandIcon.style.display = active ? "none" : "block";
        if (compressIcon)
          compressIcon.style.display = active ? "block" : "none";
        if (textEl)
          textEl.textContent = active ? "Exit Fullscreen" : "Fullscreen";
        btn.setAttribute("aria-pressed", String(active));
        btn.title = active
          ? "Exit Fullscreen (Esc / F)"
          : "Toggle Fullscreen Window (F)";
      });

      window.dispatchEvent(new Event("resize"));
    }

    function updateExpandUI(container, active) {
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

      window.dispatchEvent(new Event("resize"));
    }

    async function toggleFullscreen(container) {
      if (!container) return;

      const inFs = isCurrentlyFullscreen(container);
      if (inFs) {
        if (document.fullscreenElement || document?.webkitFullscreenElement) {
          try {
            const exit =
              document.exitFullscreen || document?.webkitExitFullscreen;
            if (exit) await exit.call(document);
          } catch (e) {}
        }
        container.classList.remove("is-fullscreen");
        updateFullscreenUI(container, false);
      } else {
        if (container.classList.contains("is-maximized")) {
          container.classList.remove("is-maximized");
          updateExpandUI(container, false);
        }

        let nativeSucceeded = false;
        const request =
          container.requestFullscreen || container?.webkitRequestFullscreen;

        if (request) {
          try {
            await request.call(container);
            nativeSucceeded = true;
          } catch (e) {
            // Native fullscreen blocked by iframe or browser policy, fallback to CSS fullscreen
          }
        }
        if (!nativeSucceeded) {
          container.classList.add("is-fullscreen");
        }
        updateFullscreenUI(container, true);
      }
    }

    function toggleExpand(container) {
      if (!container) return;

      const inExp = isCurrentlyMaximized(container);
      if (inExp) {
        container.classList.remove("is-maximized");
        updateExpandUI(container, false);
      } else {
        if (document.fullscreenElement || document?.webkitFullscreenElement) {
          try {
            const exit =
              document.exitFullscreen || document?.webkitExitFullscreen;
            if (exit) void exit.call(document);
          } catch (e) {}
        }
        if (container.classList.contains("is-fullscreen")) {
          container.classList.remove("is-fullscreen");
          updateFullscreenUI(container, false);
        }

        container.classList.add("is-maximized");
        updateExpandUI(container, true);
      }
    }

    fullscreenBtns.forEach((btn) => {
      if (btn._bgFsInitialized) return;
      btn._bgFsInitialized = true;

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const container =
          btn.closest(".game-frame-container") ||
          document.querySelector(".game-frame-container");
        void toggleFullscreen(container);
      });
    });

    expandBtns.forEach((btn) => {
      if (btn._bgExpInitialized) return;
      btn._bgExpInitialized = true;

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const container =
          btn.closest(".game-frame-container") ||
          document.querySelector(".game-frame-container");
        toggleExpand(container);
      });
    });

    if (!window._bgFsGlobalListenersInstalled) {
      window._bgFsGlobalListenersInstalled = true;

      const onFsChange = () => {
        const container = document.querySelector(".game-frame-container");
        if (container) {
          const isFs = Boolean(
            document.fullscreenElement || document?.webkitFullscreenElement,
          );
          if (!isFs && !container.classList.contains("is-fullscreen")) {
            updateFullscreenUI(container, false);
          } else if (isFs) {
            updateFullscreenUI(container, true);
          }
        }
      };

      document.addEventListener("fullscreenchange", onFsChange);
      document.addEventListener("webkitfullscreenchange", onFsChange);

      window.addEventListener("keydown", (e) => {
        const container = document.querySelector(".game-frame-container");
        if (!container) return;

        if (e.key === "Escape") {
          let handled = false;
          if (container.classList.contains("is-maximized")) {
            container.classList.remove("is-maximized");
            updateExpandUI(container, false);
            handled = true;
          }
          if (container.classList.contains("is-fullscreen")) {
            container.classList.remove("is-fullscreen");
            updateFullscreenUI(container, false);
            handled = true;
          }
          if (handled) return;
        }

        // 'F' or 'f' hotkey to toggle fullscreen when not editing text and container/game is focused
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
            container.classList.contains("is-fullscreen") ||
            container.classList.contains("is-maximized");

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

  function scanElements() {
    const gardenEls = document.querySelectorAll("block-garden");
    gardenEls.forEach(setupResponsiveElement);
    initFullscreenControls();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scanElements);
  } else {
    scanElements();
  }

  if (typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver(() => {
      scanElements();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
})();
