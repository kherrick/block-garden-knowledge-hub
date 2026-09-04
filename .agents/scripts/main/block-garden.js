/**
 * Block Garden Core Tool Engine & Script Logic
 *
 * Portable ES module containing tool execution handlers, module URLs, event constants,
 * and command parsing for Block Garden.
 * Designed to execute cleanly in Web Workers, headless agents, and browser contexts.
 */

export const BASE_URL = "https://kherrick.github.io/block-garden";

export const MODULES = {
  FIREWORKS: `${BASE_URL}/src/api/examples/Fireworks.mjs`,
  KONAMI: `${BASE_URL}/src/api/examples/KonamiCode.mjs`,
  ORE_LOCATOR: `${BASE_URL}/src/utils/oreLocator.mjs`,
  TOAST: `${BASE_URL}/src/api/ui/toast.mjs`,
};

export const CHANNELS = {
  COMMANDS: "block-garden-commands",
  RESULTS: "block-garden-results",
};

export const EVENTS = {
  TRIGGER_FIREWORKS: "blockgarden:triggerfireworks",
  FIREWORKS: "blockgarden:fireworks",
  KONAMI: "blockgarden:konamicode",
  SCAN_ORES: "blockgarden:scanores",
  TOAST: "blockgarden:toast",
  BLOCK_BREAK: "blockgarden:blockbreak",
  TELEMETRY: "blockgarden:telemetry",
  COMMANDS_CHANNEL: CHANNELS.COMMANDS,
  RESULTS_CHANNEL: CHANNELS.RESULTS,
};

/**
 * Triggers the 3D voxel fireworks particle display.
 */
export async function runFireworks() {
  const mod = await import(MODULES.FIREWORKS);
  return mod.demo();
}

/**
 * Executes the secret Konami Code sequence to unlock dev mode.
 */
export async function runKonamiCode() {
  const mod = await import(MODULES.KONAMI);
  return mod.demo();
}

/**
 * Scans loaded voxel chunks around the player for ores.
 *
 * @param {object} [ctx] Optional game context containing { bg, shadow, win }
 * @param {number} [radiusOverride] Optional search radius in blocks
 * @returns {Promise<{ success: boolean, result: string }>}
 */
export async function executeOreScan(ctx, radiusOverride) {
  const targetWin = ctx?.win || globalThis;
  const bg = ctx?.bg || targetWin?.blockGarden || globalThis?.blockGarden;

  if (!bg?.state?.world) {
    return {
      success: false,
      result:
        "🧭 Game not loaded yet. Please wait for Block Garden to initialize.",
    };
  }

  const { scanForOres, formatOreScanResult } = await import(
    MODULES.ORE_LOCATOR
  );
  const radius = radiusOverride || bg.config?.oreLocatorRadius?.get?.() || 16;
  const oreCounts = scanForOres(
    bg.state.world,
    bg.state.x,
    bg.state.y,
    bg.state.z,
    radius,
  );
  const message = formatOreScanResult(oreCounts, radius);

  if (ctx?.shadow) {
    try {
      const { showToast } = await import(MODULES.TOAST);
      showToast(ctx.shadow, message, { duration: 5000 });
    } catch (e) {
      console.warn("Failed to display toast:", e);
    }
  }

  return { success: true, result: message };
}

/**
 * Normalizes parameters for scan_for_nearby_ores.
 *
 * @param {string|object} params
 * @returns {{ radius: number }}
 */
export function parseOreScanParams(params) {
  let radius = 16;
  let obj = {};

  if (typeof params === "string") {
    const trimmed = params.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        obj = JSON.parse(trimmed);
      } catch (e) {}
    } else {
      const match = trimmed.match(/\b\d+\b/);
      if (match) {
        radius = Number(match[0]);
      }
    }
  } else if (params && typeof params === "object") {
    obj =
      params.rawInput && typeof params.rawInput === "object"
        ? params.rawInput
        : params;
    if (typeof params.rawInput === "string") {
      const trimmed = params.rawInput.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          obj = JSON.parse(trimmed);
        } catch (e) {}
      }
    }
  }

  if (obj.radius !== undefined && !isNaN(Number(obj.radius))) {
    radius = Number(obj.radius);
  }

  return { radius };
}

/**
 * Universal tool command execution handler.
 *
 * @param {string} type
 * @param {string|object} params
 * @param {object} [ctx]
 * @returns {Promise<string>}
 */
export async function handleToolCommand(type, params, ctx) {
  if (type === EVENTS.SCAN_ORES || type === "scan_for_nearby_ores") {
    const { radius } = parseOreScanParams(params);
    const scanRes = await executeOreScan(ctx, radius);
    return scanRes.result;
  }
  if (type === EVENTS.FIREWORKS || type === "fireworks") {
    await runFireworks();
    return "🎆 Fireworks display launched in the voxel world at x = 0, z = 0 (look into the sky)!";
  }
  if (type === EVENTS.KONAMI || type === "konami_code") {
    await runKonamiCode();
    return "🎮 Konami Code sequence executed! Dev mode unlocked. Check the `Settings` menu for new options!";
  }
  throw new Error(`Unknown command: ${type}`);
}

export default {
  BASE_URL,
  MODULES,
  CHANNELS,
  EVENTS,
  runFireworks,
  runKonamiCode,
  executeOreScan,
  parseOreScanParams,
  handleToolCommand,
};
