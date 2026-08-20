---
title: "Chapter 4: Public Modding API & Script Gallery"
created: "1970-01-01T00:00:00Z"
updated: "1970-01-01T00:00:00Z"
slug: "api-examples"
---

# 📖 Chapter 4: Public Modding API & Script Gallery

Welcome to **Chapter 4**! Block Garden is designed from the ground up as an **open, extensible Web engine**. Developers can write custom scripts, procedural shaders, and full interactive game mods using Block Garden's public API surface (`src/api/BlockGarden.mjs`).

---

## 🛠️ 1. The Block Garden Public API Surface

The public API (`src/api/BlockGarden.mjs`, ~764 lines) exposes clean JavaScript hooks into the world state, player controller, and rendering pipeline:

```javascript
import { BlockGarden } from "https://kherrick.github.io/block-garden/src/api/BlockGarden.mjs";

const api = new BlockGarden();

// 1. Inspect or modify world state
const world = api.getWorld();
api.setBlock(10, 64, 10, api.getBlockIdByName("Gold"));

// 2. Listen to player events
api.onBlockBreak((event) => {
  console.log(
    `Player mined block ${event.blockType} at`,
    event.x,
    event.y,
    event.z,
  );
});

// 3. Show custom toast notifications
api.showToast("Custom Mod Loaded!");

// 4. Generate in-world QR codes out of blocks
await api.drawQRCode("https://kherrick.github.io/block-garden/", 0, 70, 0);
```

### Key API Capabilities:

- **World & Block Manipulation**: `getWorld()`, `setWorld()`, `getBlock()`, `setBlock()`, `getBlockIdByName()`.
- **Event Listeners**: `onBlockBreak()`, player collision hooks, block place listeners.
- **Pixel Art & Color Matching**: Utility functions mapping arbitrary RGB pixel data to the nearest in-game block palette.
- **In-World QR Codes**: `drawQRCode(text, x, y, z, onBlock, offBlock)` programmatically generates scannable QR code structures using voxel blocks.
- **Unbundled Live Architecture**: Because source files are unbundled (`index_unbundled.html`), mods can be tested live without transpilation or build steps!

---

## 🎨 2. Shipped Mod Examples Gallery

Block Garden ships with a gallery of built-in ES module script examples under `src/api/examples/`. Each example can be run via live console injection or one-click bookmarklets:

| Example Mod          | Source Module                                                                                          | Feature Description                                                                                                                                                                |
| :------------------- | :----------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🌊 **Messaging**     | [`Messaging.mjs`](https://github.com/kherrick/block-garden/tree/main/src/api/examples/Messaging.mjs)   | Carves custom voxel text into the landscape, filled with animated water.                                                                                                           |
| 🎆 **Fireworks**     | [`Fireworks.mjs`](https://github.com/kherrick/block-garden/tree/main/src/api/examples/Fireworks.mjs)   | Spawns explosive particle trails and colorful block fireworks into the night sky.                                                                                                  |
| 🦠 **Game of Life**  | [`GOL.mjs`](https://github.com/kherrick/block-garden/tree/main/src/api/examples/GOL.mjs)               | Simulates Conway's Game of Life cellular automata on voxel block surfaces.                                                                                                         |
| ❌ **Tic-Tac-Toe**   | [`TicTacToe.mjs`](https://github.com/kherrick/block-garden/tree/main/src/api/examples/TicTacToe.mjs)   | Renders an interactive 3D block board game playable inside the world.                                                                                                              |
| 🖼️ **Photo Gallery** | [`Photo.mjs`](https://github.com/kherrick/block-garden/tree/main/src/api/examples/Photo.mjs)           | Samples image pixel colors and constructs high-detail voxel mosaic murals.                                                                                                         |
| 📹 **Video Player**  | [`Video.mjs`](https://github.com/kherrick/block-garden/tree/main/src/api/examples/Video.mjs)           | Streams real-time video frames rendered directly onto a wall of voxel blocks.                                                                                                      |
| 🔗 **Link**          | [`Link.mjs`](https://github.com/kherrick/block-garden/tree/main/src/api/examples/Link.mjs)             | Builds interactive 3D voxel link buttons in the game world.                                                                                                                        |
| 🎮 **Konami Code**   | [`KonamiCode.mjs`](https://github.com/kherrick/block-garden/tree/main/src/api/examples/KonamiCode.mjs) | Hidden feature-gating mechanism (`Up Up Down Down Left Right Left Right B A`) unlocking dev mode (AO debug, solid clouds, fast growth, fast movement, ore locator, custom colors). |

---

## ⚡ 3. Live Console & Bookmarklet Execution

You can run any mod script directly inside a live Block Garden session!

### Dynamic Console Injection

Open your browser developer console (`F12`) while playing Block Garden and paste:

```javascript
import("https://kherrick.github.io/block-garden/src/api/examples/Messaging.mjs").then(
  (mod) => {
    mod.run({
      text: "WELCOME TO BLOCK GARDEN",
      blockType: "water",
      x: 0,
      z: 0,
    });
  },
);
```

### One-Click Bookmarklet Pattern

Bookmarklets scrape the `<block-garden>` Shadow DOM root, close open modal dialogs, and inject the script module into the host page automatically:

```javascript
javascript: var el = (function f(e, n) {
  return !e
    ? null
    : e.tagName === n.toUpperCase() && e.shadowRoot
      ? e
      : [...(e.children || []), ...(e.shadowRoot ? [e.shadowRoot] : [])]
          .map((c) => f(c, n))
          .find(Boolean) || null;
})(globalThis.document.body, "block-garden")?.shadowRoot;
el.querySelector("dialog.examples-content")?.close();
var e;
((e = document.createElement("script")).setAttribute("type", "module"),
  (e.innerHTML =
    "(await import('https://kherrick.github.io/block-garden/src/api/examples/Fireworks.mjs')).demo()"),
  document.body.append(e));
```

Visit the [Live Examples Gallery](https://kherrick.github.io/block-garden/src/api/examples/index.html) to try all bookmarklets directly!

---

⬅️ [Previous Page](/main/farming-and-botany) | ➡️ [Next Page](/main/demos-and-media)
