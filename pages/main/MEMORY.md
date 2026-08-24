---
title: "Block Garden Memory"
created: "1970-01-01T00:00:00Z"
updated: "1970-01-01T00:00:00Z"
slug: "block-garden-memory"
---

## 🧠 Block Garden Memory & Architecture Reference

Welcome to the **Block Garden Premier Technical Memory**. This document captures the core architecture, procedural rules, lighting engines, reactivity primitives, persistence mechanisms, and modding interfaces for Block Garden.

---

## 🏛️ Core Architecture Summary

Block Garden is a 3D voxel sandbox exploration and farming game built with **Vanilla JavaScript (ES Modules)**, **Web Components (Shadow DOM)**, **WebGL**, and **Signal-based Reactivity** with zero framework dependencies.

- **Live Game**: [kherrick.github.io/block-garden](https://kherrick.github.io/block-garden/)
- **Itch.io Release**: [karlherrick.itch.io/block-garden](https://karlherrick.itch.io/block-garden)
- **Angular Integration**: [kherrick.github.io/apps](https://kherrick.github.io/apps/playground/block-garden)
- **GitHub Repository**: [github.com/kherrick/block-garden](https://github.com/kherrick/block-garden)
- **Unbundled Live Runtime**: [kherrick.github.io/block-garden/index_unbundled.html](https://kherrick.github.io/block-garden/index_unbundled.html)
- **API Examples**: [kherrick.github.io/block-garden/src/api/examples/](https://kherrick.github.io/block-garden/src/api/examples/)

---

## ⚡ Key Technical Systems

### 1. Procedural Noise & Worker Pool Terrain Generation

- Multi-octave 3D Simplex noise with `alea` PRNG initialized by world seed (`initNoise(seed)`).
- Layered noise fields blend base terrain height, 3D mountain shaping, hilliness, and lake depressions.
- Caves carved via 3D tunnel noise and cavern noise with mountain/shore entrance heuristics and a **Lava Protection Zone** preventing cave-lava intersection.
- Y-level mineral distribution (Coal, Iron, Gold, Copper, Silver, Diamond) checked in order of rarity.
- Chunk generation executed off the main thread in a pool of `terrain.worker.mjs` Web Workers (sized to `navigator.hardwareConcurrency` round-robin).

### 2. BFS Volumetric Light Engine

- Per-voxel light grid backed by a flat `Uint8Array` (`LightMap`).
- Emissive sources (Torch, Lantern, Lightstone) cached and propagated via 3D Breadth-First Search (BFS) with attenuation (-1 per block).
- Boundary-aware cross-chunk light propagation updates neighboring chunks within `MAX_LIGHT_RADIUS` seamlessly.

### 3. Greedy Meshing, Ambient Occlusion & 3-Pass Rendering

- Combines adjacent voxel faces into optimal quads via greedy meshing (~1700 line mesher).
- Calculates per-vertex ambient occlusion (AO) based on neighbor block face exposure.
- Three WebGL render passes: **Opaque**, **Transparent** (glass/leaves with depth sorting), and **Water** (animated wave/reflection shaders).

### 4. Surgical Signal Reactivity

- Built on `signal-polyfill` (`Signal.State` / `Signal.Computed`).
- Wraps game state, player position, inventory, and UI visibility.
- Updates only affected DOM nodes without VDOM diffing or full component re-renders.

### 5. Privacy-First Compressed Save & PDF Postcard Protocol

- Offline-first saves stored in IndexedDB via `localforage` compressed with native `CompressionStream("gzip")`.
- Export/import format options: `.bgs` gzip binaries, raw `.txt`, or `.pdf` files.
- PDF saves hand-roll PNG chunk construction (with CRC32) to embed gzip game state in custom `tEXt` chunks (`gamestate`), rendered onto branded cards with `pdf-lib`.
- Integrated with PWA Web Share Target protocol to receive `.bgs`/`.pdf` save files natively.

### 6. Public Extension & Modding API

- Public scripting API (`src/api/BlockGarden.mjs`) provides `getWorld()`, `setWorld()`, block placement/mining, `onBlockBreak()` hooks, toast notifications, color-matching tools, and `drawQRCode()`.
- Supports dynamic browser console script injection and one-click bookmarklets across shipped examples (Messaging, Fireworks, Game of Life, Tic-Tac-Toe, Video/Photo players, Konami Code).

---

## 🔑 Secret Dev Mode (Konami Code)

Entering the Konami code sequence (`Up Up Down Down Left Right Left Right B A`) unlocks developer tools:

- Examples Menu & Fast Growth Button
- Link Game Save & Random Plant Button
- AO Debug & Solid Clouds Toggles
- Fast Movement & Ore Locator Button
- Color Customization & Fullscreen Selector Option

---

⬅️ [Previous Page](/main/agent-skills-and-tools)
