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
  MESSAGING: `${BASE_URL}/src/api/examples/Messaging.mjs`,
  LINK: `${BASE_URL}/src/api/examples/Link.mjs`,
  TIC_TAC_TOE: `${BASE_URL}/src/api/examples/TicTacToe.mjs`,
  PHOTO: `${BASE_URL}/src/api/examples/Photo.mjs`,
  VIDEO: `${BASE_URL}/src/api/examples/Video.mjs`,
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
  MESSAGING: "blockgarden:messaging",
  LINK: "blockgarden:link",
  TIC_TAC_TOE: "blockgarden:tictactoe",
  PHOTO: "blockgarden:photo",
  VIDEO: "blockgarden:video",
  TOAST: "blockgarden:toast",
  BLOCK_BREAK: "blockgarden:blockbreak",
  TELEMETRY: "blockgarden:telemetry",
  COMMANDS_CHANNEL: CHANNELS.COMMANDS,
  RESULTS_CHANNEL: CHANNELS.RESULTS,
};

/**
 * Normalizes parameters from string/object format.
 *
 * @param {string|object} params
 * @returns {Record<string, any>}
 */
export function parseObjectParams(params) {
  if (!params) return {};
  let raw = params;
  if (typeof params === "object" && params !== null) {
    if (params.rawInput !== undefined) {
      if (typeof params.rawInput === "object" && params.rawInput !== null) {
        return { ...params, ...params.rawInput };
      }
      if (typeof params.rawInput === "string") {
        const trimmed = params.rawInput.trim();
        try {
          const parsed = JSON.parse(trimmed);
          if (typeof parsed === "object" && parsed !== null) {
            return { ...params, ...parsed };
          }
        } catch (e) {}
        raw = trimmed;
      }
    } else {
      return params;
    }
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "object" && parsed !== null) {
          return typeof params === "object" ? { ...params, ...parsed } : parsed;
        }
      } catch (e) {}
    }

    const isUrl =
      /^https?:\/\//i.test(trimmed) ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:");

    const base = typeof params === "object" ? { ...params } : {};
    return {
      ...base,
      rawInput: trimmed,
      text: trimmed,
      message: trimmed,
      ...(isUrl ? { url: trimmed, imageUrl: trimmed, videoUrl: trimmed } : {}),
    };
  }

  return typeof params === "object" ? params : {};
}

/**
 * Triggers the 3D voxel fireworks particle display.
 *
 * @param {object} [params] Optional show configuration
 */
export async function runFireworks(params) {
  const mod = await import(MODULES.FIREWORKS);
  if (params && typeof params === "object") {
    const parsed = parseObjectParams(params);
    if (parsed.count || parsed.colorPalette) {
      const api = new mod.Fireworks();
      if (typeof api.setFullscreen === "function") {
        try {
          await api.setFullscreen();
        } catch (_) {}
      }
      const count = Number(parsed.count) || 5;
      api.createFireworksShow({ count });
      if (api.gThis?.blockGarden) {
        api.gThis.blockGarden.demo = {
          ...(api.gThis.blockGarden.demo || {}),
          fireworksAPI: api,
        };
      }
      return;
    }
  }
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
 * Renders custom voxel text messaging in the sky.
 *
 * @param {string|object} [params]
 * @param {object} [ctx]
 * @returns {Promise<{ success: boolean, result: string }>}
 */
export async function runMessaging(params = {}, ctx) {
  const mod = await import(MODULES.MESSAGING);
  const api = new mod.Messaging();
  const targetWin = ctx?.win || globalThis;
  const bg = ctx?.bg || targetWin?.blockGarden || globalThis?.blockGarden;

  if (!bg) {
    return {
      success: false,
      result:
        "⚠️ Game not loaded yet. Please wait for Block Garden to initialize.",
    };
  }

  const parsed = parseObjectParams(params);
  let msgOne = parsed.msgOne;
  let msgTwo = parsed.msgTwo;

  if (msgOne === undefined && (parsed.message || parsed.text)) {
    const fullMsg = String(parsed.message || parsed.text).trim();
    if (fullMsg.includes("\n")) {
      const lines = fullMsg.split("\n");
      msgOne = lines[0].trim();
      msgTwo = lines.slice(1).join(" ").trim();
    } else {
      msgOne = fullMsg;
      msgTwo = "";
    }
  }

  // If nothing at all was provided, default to "Block" and "Garden"
  if (msgOne === undefined && msgTwo === undefined) {
    msgOne = "Block";
    msgTwo = "Garden";
  } else {
    msgOne = msgOne !== undefined ? String(msgOne) : "";
    msgTwo = msgTwo !== undefined ? String(msgTwo) : "";
  }

  const onBlock = parsed.onBlock || "Snow";
  const offBlock = parsed.offBlock || "Coal";
  const x1 = parsed.x1 !== undefined ? Number(parsed.x1) : 15;
  const y1 = parsed.y1 !== undefined ? Number(parsed.y1) : 76;
  const z1 = parsed.z1 !== undefined ? Number(parsed.z1) : 45;
  const x2 = parsed.x2 !== undefined ? Number(parsed.x2) : 15;
  const y2 = parsed.y2 !== undefined ? Number(parsed.y2) : 70;
  const z2 = parsed.z2 !== undefined ? Number(parsed.z2) : 45;
  const rotate = parsed.rotate !== undefined ? Number(parsed.rotate) : 180;

  await api.init(
    msgOne,
    msgTwo,
    onBlock,
    offBlock,
    x1,
    y1,
    z1,
    x2,
    y2,
    z2,
    rotate,
  );

  return {
    success: true,
    result: `💬 Message rendered in the sky: "${msgOne}"${msgTwo ? ` "${msgTwo}"` : ""} (${onBlock} on ${offBlock}) at (${x1}, ${y1}, ${z1}) facing ${rotate}°. Look up toward the clouds!`,
  };
}

/**
 * Creates an interactive clickable voxel link in the world.
 *
 * @param {string|object} [params]
 * @param {object} [ctx]
 * @returns {Promise<{ success: boolean, result: string }>}
 */
export async function runLink(params = {}, ctx) {
  const mod = await import(MODULES.LINK);
  const api = new mod.LinkDemo();
  const targetWin = ctx?.win || globalThis;
  const bg = ctx?.bg || targetWin?.blockGarden || globalThis?.blockGarden;

  if (!bg) {
    return {
      success: false,
      result:
        "⚠️ Game not loaded yet. Please wait for Block Garden to initialize.",
    };
  }

  const parsed = parseObjectParams(params);
  let url = parsed.url;
  let text = parsed.text || parsed.label;

  if (parsed.rawInput && typeof parsed.rawInput === "string") {
    const rawTrimmed = parsed.rawInput.trim();
    const urlMatch = rawTrimmed.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) {
      url = urlMatch[0];
      const remainder = rawTrimmed.replace(url, "").trim();
      if (remainder) {
        text = remainder;
      } else if (!parsed.label) {
        try {
          text = new URL(url).hostname;
        } catch (_) {
          text = url;
        }
      }
    }
  }

  url = url || "https://github.com/kherrick/block-garden";
  text = text || "Block Garden";

  const x = parsed.x !== undefined ? Number(parsed.x) : 20;
  const y = parsed.y !== undefined ? Number(parsed.y) : 60;
  const z = parsed.z !== undefined ? Number(parsed.z) : 25;
  const target = parsed.target || "_blank";
  const onBlockName = parsed.onBlock || "Gold";
  const offBlockName = parsed.offBlock || "Air";
  const replaceBlock = parsed.replaceBlock !== false;

  const onBlock = api.getBlockIdByName(onBlockName);
  const offBlock = api.getBlockIdByName(offBlockName);

  const link = api.createLink({
    text,
    url,
    x,
    y,
    z,
    target,
    onBlock: onBlock !== -1 ? onBlock : api.getBlockIdByName("Gold"),
    offBlock: offBlock !== -1 ? offBlock : api.getBlockIdByName("Air"),
    replaceBlock,
  });

  api.onBlockBreak((bx, by, bz) => {
    link.onBlockBreak(bx, by, bz);
  });

  if (api.shadow) {
    try {
      const { showToast } = await import(MODULES.TOAST);
      showToast(
        api.shadow,
        `Voxel link "${text}" created! Break a block to open.`,
      );
    } catch (e) {}
  }

  return {
    success: true,
    result: `🔗 Interactive voxel link "${text}" -> ${url} created at (${x}, ${y}, ${z}). Break any ${onBlockName} block to open the URL!`,
  };
}

/**
 * Creates or manages a 3D playable Tic-Tac-Toe game board in the world.
 *
 * @param {string|object} [params]
 * @param {object} [ctx]
 * @returns {Promise<{ success: boolean, result: string }>}
 */
export async function runTicTacToe(params = {}, ctx) {
  const mod = await import(MODULES.TIC_TAC_TOE);
  const api = new mod.TicTacToe();
  const targetWin = ctx?.win || globalThis;
  const bg = ctx?.bg || targetWin?.blockGarden || globalThis?.blockGarden;

  if (!bg) {
    return {
      success: false,
      result:
        "⚠️ Game not loaded yet. Please wait for Block Garden to initialize.",
    };
  }

  const parsed = parseObjectParams(params);

  // If action is "reset" and game instance already exists
  if (
    parsed.action === "reset" &&
    api.gThis?.blockGarden?.demo?.ticTacToe?.game
  ) {
    api.gThis.blockGarden.demo.ticTacToe.game.reset();
    return {
      success: true,
      result: "🔄 Tic-Tac-Toe board reset! Ready for a new match.",
    };
  }

  const worldWidth = api.config?.WORLD_WIDTH?.get?.() ?? 64;
  const centerX = Math.floor(worldWidth / 2);

  const x = parsed.x !== undefined ? Number(parsed.x) : centerX - 8;
  const y = parsed.y !== undefined ? Number(parsed.y) : 58;
  const z = parsed.z !== undefined ? Number(parsed.z) : 25;
  const cellSize = parsed.cellSize !== undefined ? Number(parsed.cellSize) : 5;
  const spacing = parsed.spacing !== undefined ? Number(parsed.spacing) : 2;
  const xBlockName = parsed.xBlock || "Coal";
  const oBlockName = parsed.oBlock || "Snow";
  const emptyBlockName = parsed.emptyBlock || "Ice";
  const borderBlockName = parsed.borderBlock || "Bedrock";
  const lineBlockName = parsed.lineBlock || "Gold";
  const showBorder = parsed.showBorder !== false;

  api.game = api.createTicTacToe({
    x,
    y,
    z,
    cellSize,
    spacing,
    xBlock: api.getBlockIdByName(xBlockName),
    oBlock: api.getBlockIdByName(oBlockName),
    emptyBlock: api.getBlockIdByName(emptyBlockName),
    borderBlock: api.getBlockIdByName(borderBlockName),
    lineBlock: api.getBlockIdByName(lineBlockName),
    showBorder,
  });

  api.onBlockBreak((bx, by, bz) => {
    api.game.onBlockBreak(bx, by, bz);
  });

  api.gThis.blockGarden.demo = {
    ...(api.gThis.blockGarden.demo || {}),
    ticTacToe: api,
  };

  if (api.shadow) {
    try {
      const { showToast } = await import(MODULES.TOAST);
      showToast(api.shadow, "Tic-Tac-Toe ready! Break blocks to place X or O.");
    } catch (e) {}
  }

  return {
    success: true,
    result: `🎮 Playable Tic-Tac-Toe game spawned at (${x}, ${y}, ${z})! Break cells to place X (${xBlockName}) or O (${oBlockName}). Break the Iron button above the board to reset.`,
  };
}

/**
 * Quantizes and renders an image into 3D voxel mosaic art.
 *
 * @param {string|object} [params]
 * @param {object} [ctx]
 * @returns {Promise<{ success: boolean, result: string }>}
 */
export async function runPhoto(params = {}, ctx) {
  const mod = await import(MODULES.PHOTO);
  const parsed = parseObjectParams(params);
  let imageUrl = parsed.imageUrl || parsed.url || "";

  if (!imageUrl && parsed.rawInput && typeof parsed.rawInput === "string") {
    const match = parsed.rawInput.trim().match(/https?:\/\/[^\s]+/i);
    if (match) imageUrl = match[0];
  }

  // If no imageUrl provided, fallback to built-in showcase demo
  if (!imageUrl) {
    await mod.demo();
    return {
      success: true,
      result:
        "📸 Showcase photo quantized and rendered in 3D voxels at (0, 80, 25) with color palette optimization!",
    };
  }

  const api = new mod.DrawBitmap();
  const targetWin = ctx?.win || globalThis;
  const bg = ctx?.bg || targetWin?.blockGarden || globalThis?.blockGarden;

  if (!bg) {
    return {
      success: false,
      result:
        "⚠️ Game not loaded yet. Please wait for Block Garden to initialize.",
    };
  }

  const optimizeColors =
    parsed.optimizeColors !== false && parsed.modifyWorldColors !== false;
  const size =
    parsed.size !== undefined
      ? Number(parsed.size)
      : parsed.maxSize !== undefined
        ? Number(parsed.maxSize)
        : 48;
  const x = parsed.x !== undefined ? Number(parsed.x) : 0;
  const y = parsed.y !== undefined ? Number(parsed.y) : 80;
  const z = parsed.z !== undefined ? Number(parsed.z) : 25;
  const rotation =
    parsed.rotation && typeof parsed.rotation === "object"
      ? parsed.rotation
      : { x: 0, y: 0, z: 0 };

  await api.drawQuantizedBitmap(
    imageUrl,
    optimizeColors,
    size,
    x,
    y,
    z,
    rotation,
  );

  api.gThis.blockGarden.demo = {
    ...(api.gThis.blockGarden.demo || {}),
    photo: api,
  };

  if (api.shadow) {
    try {
      const { showToast } = await import(MODULES.TOAST);
      showToast(api.shadow, "Photo rendered into 3D voxels!");
    } catch (e) {}
  }

  return {
    success: true,
    result: `📸 Image successfully quantized and rendered in 3D voxels at (${x}, ${y}, ${z}) (max dimension: ${size} blocks, color optimization: ${optimizeColors})!`,
  };
}

/**
 * Creates and streams a camera video feed screen in the 3D voxel world.
 *
 * @param {string|object} [params]
 * @param {object} [ctx]
 * @returns {Promise<{ success: boolean, result: string }>}
 */
export async function runVideo(params = {}, ctx) {
  const mod = await import(MODULES.VIDEO);
  const api = new mod.DrawVideo();
  const targetWin = ctx?.win || globalThis;
  const bg = ctx?.bg || targetWin?.blockGarden || globalThis?.blockGarden;

  if (!bg) {
    return {
      success: false,
      result:
        "⚠️ Game not loaded yet. Please wait for Block Garden to initialize.",
    };
  }

  const parsed = parseObjectParams(params);

  let videoUrl = parsed.videoUrl || parsed.url || parsed.src || "";
  if (!videoUrl && parsed.rawInput && typeof parsed.rawInput === "string") {
    const match = parsed.rawInput.trim().match(/https?:\/\/[^\s]+/i);
    if (match) videoUrl = match[0];
  }

  // Check if controlling existing video feed
  const existingFeed = api.gThis?.blockGarden?.demo?.video?.videoFeed;
  if (parsed.action && existingFeed) {
    if (parsed.action === "stop") {
      existingFeed.stopCamera();
      return { success: true, result: "🛑 Voxel video camera stopped." };
    }
    if (parsed.action === "start") {
      await existingFeed.startCapture();
      return {
        success: true,
        result: "📹 Voxel video camera capture started.",
      };
    }
    if (parsed.action === "setFPS" && parsed.fps) {
      existingFeed.setFPS(Number(parsed.fps));
      return {
        success: true,
        result: `🎥 Video frame rate set to ${parsed.fps} FPS.`,
      };
    }
    if (parsed.action === "setGamma" && parsed.gamma) {
      existingFeed.setGamma(Number(parsed.gamma));
      return {
        success: true,
        result: `🔆 Video gamma set to ${parsed.gamma}.`,
      };
    }
  }

  const worldWidth = api.config?.WORLD_WIDTH?.get?.() ?? 64;
  const centerX = Math.floor(worldWidth / 2);

  const width = parsed.width !== undefined ? Number(parsed.width) : 48;
  const height = parsed.height !== undefined ? Number(parsed.height) : 36;
  const fps = parsed.fps !== undefined ? Number(parsed.fps) : 2;
  const x =
    parsed.x !== undefined ? Number(parsed.x) : centerX - Math.floor(width / 2);
  const y = parsed.y !== undefined ? Number(parsed.y) : 55;
  const z = parsed.z !== undefined ? Number(parsed.z) : 25;
  const facingMode = parsed.facingMode || "user";
  const captureButtonBlock = api.getBlockIdByName(
    parsed.captureButtonBlock || "Grass",
  );
  const stopButtonBlock = api.getBlockIdByName(
    parsed.stopButtonBlock || "Rose",
  );
  const borderBlock = api.getBlockIdByName(parsed.borderBlock || "Stone");
  const emptyBlock = api.getBlockIdByName(parsed.emptyBlock || "Ice");
  const showBorder = parsed.showBorder !== false;
  const autoStart =
    parsed.autoStart !== undefined
      ? Boolean(parsed.autoStart)
      : Boolean(videoUrl);

  api.videoFeed = api.createVideoFeed({
    x,
    y,
    z,
    width,
    height,
    fps,
    facingMode,
    captureButtonBlock,
    stopButtonBlock,
    borderBlock,
    emptyBlock,
    showBorder,
    buttonSize: 4,
    buttonSpacing: 3,
  });

  // If a video URL is provided, enable playback from the video URL
  if (videoUrl) {
    const originalStart = api.videoFeed.startCapture;
    const originalStop = api.videoFeed.stopCamera;

    const startVideoUrlCapture = async () => {
      if (api.isCapturing) return;

      if (!api.videoElement) {
        api.videoElement = api.doc.createElement("video");
        api.videoElement.setAttribute("playsinline", "");
        api.videoElement.style.display = "none";
        api.doc.body.appendChild(api.videoElement);
      }
      if (!api.canvasElement) {
        api.canvasElement = api.doc.createElement("canvas");
        api.canvasElement.width = width;
        api.canvasElement.height = height;
      }
      if (!api.cachedPalette) {
        api.cachedPalette = api.getBlockColorPalette();
      }

      api.videoElement.crossOrigin = "anonymous";
      api.videoElement.src = videoUrl;
      api.videoElement.loop = true;
      api.videoElement.muted = true;
      api.videoElement.playsInline = true;

      try {
        await api.videoElement.play();
      } catch (err) {
        console.warn("Could not play video element directly:", err);
      }

      let stream = null;
      if (typeof api.videoElement.captureStream === "function") {
        try {
          stream = api.videoElement.captureStream();
        } catch (_) {}
      }

      const navMedia = targetWin?.navigator?.mediaDevices;
      const originalGUM = navMedia?.getUserMedia?.bind(navMedia);

      if (navMedia) {
        navMedia.getUserMedia = async () => {
          if (stream) return stream;
          return {
            getTracks: () => [
              { kind: "video", readyState: "live", stop: () => {} },
            ],
            getVideoTracks: () => [
              { kind: "video", readyState: "live", stop: () => {} },
            ],
          };
        };
      }

      try {
        await originalStart();
      } finally {
        if (navMedia && originalGUM) {
          navMedia.getUserMedia = originalGUM;
        }
      }

      if (api.videoElement.src !== videoUrl) {
        api.videoElement.srcObject = null;
        api.videoElement.crossOrigin = "anonymous";
        api.videoElement.src = videoUrl;
        api.videoElement.loop = true;
        api.videoElement.muted = true;
        api.videoElement.playsInline = true;
        await api.videoElement.play().catch(() => {});
      }
    };

    api.videoFeed.startCapture = startVideoUrlCapture;

    const stopVideoUrlCapture = () => {
      if (api.videoElement) {
        try {
          api.videoElement.pause();
          api.videoElement.removeAttribute("src");
          api.videoElement.load();
        } catch (_) {}
      }
      originalStop();
    };

    api.videoFeed.stopCamera = stopVideoUrlCapture;
  }

  api.onBlockBreak((bx, by, bz) => {
    api.videoFeed.onBlockBreak(bx, by, bz);
  });

  api.gThis.blockGarden.demo = {
    ...(api.gThis.blockGarden.demo || {}),
    video: api,
  };

  if (autoStart) {
    await api.videoFeed.startCapture();
  }

  if (api.shadow) {
    try {
      const { showToast } = await import(MODULES.TOAST);
      showToast(
        api.shadow,
        videoUrl
          ? "Video stream from URL initialized!"
          : "Video feed display initialized!",
      );
    } catch (e) {}
  }

  return {
    success: true,
    result: videoUrl
      ? `📹 Video URL (${videoUrl}) loaded into 3D voxel screen (${width}x${height} blocks @ ${fps} FPS) at (${x}, ${y}, ${z})! Break GRASS to play, ROSE to stop.`
      : `📹 Live voxel video feed screen (${width}x${height} blocks @ ${fps} FPS) placed at (${x}, ${y}, ${z})! Break the GRASS block to START the camera, or ROSE to STOP.${autoStart ? " (Camera auto-started)" : ""}`,
  };
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
    await runFireworks(params);
    return "🎆 Fireworks display launched in the voxel world at x = 0, z = 0 (look into the sky)!";
  }
  if (type === EVENTS.KONAMI || type === "konami_code") {
    await runKonamiCode();
    return "🎮 Konami Code sequence executed! Dev mode unlocked. Check the `Settings` menu for new options!";
  }
  if (type === EVENTS.MESSAGING || type === "messaging") {
    const res = await runMessaging(params, ctx);
    return res.result;
  }
  if (type === EVENTS.LINK || type === "link") {
    const res = await runLink(params, ctx);
    return res.result;
  }
  if (
    type === EVENTS.TIC_TAC_TOE ||
    type === "tic_tac_toe" ||
    type === "tictactoe"
  ) {
    const res = await runTicTacToe(params, ctx);
    return res.result;
  }
  if (type === EVENTS.PHOTO || type === "photo") {
    const res = await runPhoto(params, ctx);
    return res.result;
  }
  if (type === EVENTS.VIDEO || type === "video") {
    const res = await runVideo(params, ctx);
    return res.result;
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
  runMessaging,
  runLink,
  runTicTacToe,
  runPhoto,
  runVideo,
  parseOreScanParams,
  parseObjectParams,
  handleToolCommand,
};
