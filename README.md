# 🌱 [Block Garden Knowledge Hub](https://kherrick.github.io/block-garden-knowledge-hub/)

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/kherrick/block-garden)
[![Live Game](https://img.shields.io/badge/Play_Live-Block_Garden-2e7d32?style=flat&logo=html5)](https://kherrick.github.io/block-garden/)

Welcome to the official **Block Garden Knowledge Hub**! This project is an exhaustive, interactive documentation portal and technical reference guide for **Block Garden**—a full-featured 3D voxel sandbox exploration, building, and farming game engine built entirely with modern vanilla Web technologies.

> 🚀 **Fast Links to the Block Garden Knowledge Hub Chapters**:
>
> - 🌐 **[Knowledge Hub Home Page](https://kherrick.github.io/block-garden-knowledge-hub/main)** (`/main`)
> - 📖 **[Chapter 1: Architecture & Procedural Engine](https://kherrick.github.io/block-garden-knowledge-hub/main/about)** (`/main/about`)
> - 🕹️ **[Chapter 2: Gameplay Controls, Game Modes & Save Ecosystem](https://kherrick.github.io/block-garden-knowledge-hub/main/controls)** (`/main/controls`)
> - 🌾 **[Chapter 3: Farming Mechanics & Botanical Species](https://kherrick.github.io/block-garden-knowledge-hub/main/farming-and-botany)** (`/main/farming-and-botany`)
> - 🔌 **[Chapter 4: Public Modding API & Script Gallery](https://kherrick.github.io/block-garden-knowledge-hub/main/api-examples)** (`/main/api-examples`)
> - 🎥 **[Chapter 5: Video Demos & Media Showcase](https://kherrick.github.io/block-garden-knowledge-hub/main/demos-and-media)** (`/main/demos-and-media`)
> - 📄 **[Chapter 6: PDF World Saves & Postcard Gallery](https://kherrick.github.io/block-garden-knowledge-hub/main/world-saves-and-pdfs)** (`/main/world-saves-and-pdfs`)
> - ⚡ **[Chapter 7: Web Platform Breakdown & Performance Engineering](https://kherrick.github.io/block-garden-knowledge-hub/main/web-platform-and-performance)** (`/main/web-platform-and-performance`)
> - 🤖 **[Chapter 8: Agent Skills, Declarative Tools & Slash Commands](https://kherrick.github.io/block-garden-knowledge-hub/main/agent-skills-and-tools)** (`/main/agent-skills-and-tools`)
> - 🧠 **[Technical Memory & Architecture Reference](https://kherrick.github.io/block-garden-knowledge-hub/main/memory)** (`/main/memory`)

---

## 📸 Media Showcase & Engine Assets

Below is the complete catalog of official **Block Garden** visual assets, animated demonstrations, screenshots, and downloadable PDF save postcards.

### 🎮 Gameplay Animation

![Block Garden Gameplay Animation](https://kherrick.github.io/block-garden/assets/block-garden-animation.gif)

### 🎆 Fireworks Particle Mod Demo

![Block Garden Fireworks Animation](https://kherrick.github.io/block-garden/assets/block-garden-fireworks.gif)

### 🏞️ Screenshots

[![Block Garden](https://kherrick.github.io/block-garden/assets/screenshots/block-garden-screenshot-2266x1440.png)](https://kherrick.github.io/block-garden/) | [![Block Garden Square](https://kherrick.github.io/block-garden/assets/screenshots/block-garden-screenshot-1621x1621.png)](https://kherrick.github.io/block-garden/)

### 💾 Included PDF Game Saves & Postcards

Click any world postcard below to launch Block Garden with the PDF save pre-loaded:

| World Name                   |                                                                                                                                              Screenshot Preview                                                                                                                                              |                                                                                Live Play Link                                                                                |                                                    PDF Download                                                    |
| :--------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------: |
| 🌿 **The Garden**            |                 [![The Garden](https://kherrick.github.io/block-garden/assets/screenshots/block-garden-screenshot-the-garden-400x400.png)](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/The-Garden.pdf)                  |     [Play "The Garden"](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/The-Garden.pdf)     |            [`The-Garden.pdf`](https://kherrick.github.io/block-garden/assets/game-saves/The-Garden.pdf)            |
| 🕳️ **Caves**                 |                         [![Caves](https://kherrick.github.io/block-garden/assets/screenshots/block-garden-screenshot-caves-400x400.png)](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Caves.pdf)                         |          [Play "Caves"](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Caves.pdf)          |                 [`Caves.pdf`](https://kherrick.github.io/block-garden/assets/game-saves/Caves.pdf)                 |
| 🌸 **Flowers**               |                      [![Flowers](https://kherrick.github.io/block-garden/assets/screenshots/block-garden-screenshot-flowers-400x400.png)](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Flowers.pdf)                      |        [Play "Flowers"](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Flowers.pdf)        |               [`Flowers.pdf`](https://kherrick.github.io/block-garden/assets/game-saves/Flowers.pdf)               |
| ☁️ **Gateway To The Clouds** | [![Gateway To The Clouds](https://kherrick.github.io/block-garden/assets/screenshots/block-garden-screenshot-gateway-to-the-clouds-400x400.png)](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Gateway-To-The-Clouds.pdf) | [Play "Gateway"](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Gateway-To-The-Clouds.pdf) | [`Gateway-To-The-Clouds.pdf`](https://kherrick.github.io/block-garden/assets/game-saves/Gateway-To-The-Clouds.pdf) |

---

## 🏛️ Core Capabilities & Architecture Summary

Block Garden stands out as a pioneering **Web-Platform-as-OS** reference implementation:

- 🌍 **Procedural 3D World Generation**: Multi-octave 3D Simplex noise with `alea` PRNG seed determinism.
- 🧵 **Multi-Threaded Worker Pool**: Chunk generation offloaded to Web Workers (`terrain.worker.mjs`), dynamically sized to `navigator.hardwareConcurrency`.
- ⛏️ **Depth-Based Ore Distribution**:
  - **Gold**: Depths 30–70 (`oreNoise > 0.8`)
  - **Iron**: Depths 20–60 (`oreNoise > 0.65`)
  - **Coal**: Depths 10–50 (`oreNoise > 0.55`)
  - Also includes Diamond, Silver, and Copper veins with a **Lava Protection Zone** ($Y \le 15$).
- 💡 **Volumetric BFS Lighting**: Per-voxel `Uint8Array` (`LightMap`) calculating 3D attenuation and boundary-aware cross-chunk light propagation.
- ⚡ **Zero-VDOM Signal Reactivity**: Driven by `signal-polyfill` (`Signal.State`, `Signal.Computed`), powering Shadow DOM Web Components without re-rendering overhead.
- 🌾 **Farming Engine & 20+ Botanical Species**: Evaluates soil types (dirt, farmland, sand, clay, water), soil hydration, BFS light levels, and growth ticks for wheat, corn, carrots, pumpkins, roses, sunflowers, bamboo, cacti, trees, mushrooms, and aquatic plants.
- 💾 **Privacy-First PDF Postcards**: World saves encoded to gzip JSON, embedded into custom PNG `tEXt` chunks (`gamestate`) with CRC32 checksums, and rendered onto printable PDF postcards with `pdf-lib`.
- 🔌 **Public Modding API**: Extensible runtime scripting API (`src/api/BlockGarden.mjs`) supporting one-click bookmarklets and live browser console script execution.
- 🛡️ **Hardened Sandboxed Iframe Support**: Operates within strict opaque-origin (`null`) iframe sandboxes without `allow-same-origin`, using parent `postMessage` storage proxying for IndexedDB game saves, `cdn.jsdelivr.net` CSP origin rules, and capture-phase click interception in `block-garden-adapter.js` to launch game-save URLs in new tabs (`win.open(..., '_blank')`) via `allow-popups-to-escape-sandbox`.

---

## 🕹️ Controls Reference

| Action              | Desktop Key                   | Mobile Gesture      | Description                    |
| :------------------ | :---------------------------- | :------------------ | :----------------------------- |
| **Move**            | `W` `A` `S` `D`               | On-Screen Touch Pad | Movement in 3D world           |
| **Look / Camera**   | `Arrow Keys` / Mouse Lock     | Touch Drag          | Rotate 360° camera             |
| **Jump / Ascend**   | `Space`                       | Touch Button        | Jump or fly upward             |
| **Descend / Sneak** | `Shift`                       | Touch Button        | Sneak or descend in flight     |
| **Toggle Flight**   | `K`                           | Touch Toggle        | Enable Creative flight mode    |
| **Break Block**     | `Left Click` (Hold) / `Enter` | Touch & Hold        | Mine targeted voxel block      |
| **Place Block**     | `Right Click` / `Enter`       | Single Tap          | Place selected hotbar material |
| **Cycle Material**  | `~` or `` ` ``                | Material Bar        | Switch active hotbar slot      |
| **Hotbar Slots**    | `1` – `9`                     | Hotbar Tap          | Direct hotbar slot selection   |
| **Inventory**       | `E` / `I`                     | UI Button           | Open material & seed inventory |
| **Hotbar Toggle**   | `M`                           | UI Button           | Show / hide hotbar UI          |
| **World Gen Menu**  | `Ctrl` + `S`                  | Menu                | Configure seed & generator     |
| **Konami Code**     | `↑↑↓↓←→←→BA`                  | —                   | Unlock Dev Mode & Ore Locator  |

---

## 🤖 Agent Skills & Declarative Tools

The Block Garden Knowledge Hub provides bundled **Agent Skills** and **Declarative Tools** under `.agents/` for the integrated ShadowClaw AI assistant (`BlockGardener`):

- 🧭 **`.agents/skills/main/scan-for-nearby-ores/SKILL.md`**: Scans loaded voxel chunks for nearby ore deposits around player coordinates (`/scan-for-nearby-ores`).
- 🎆 **`.agents/skills/main/fireworks/SKILL.md`**: Real-time 3D voxel fireworks particle physics display (`/fireworks`).
- 🎮 **`.agents/skills/main/konami-code/SKILL.md`**: Secret Konami Code sequence unlocker for dev mode & ore locator (`/konami-code`).
- 🧭 **`.agents/tools/main/scan_for_nearby_ores.json`**: Declarative tool scanning loaded voxel chunks for nearby ore deposits.
- 🎆 **`.agents/tools/main/fireworks.json`**: Declarative tool triggering 3D voxel fireworks particle bursts.
- 🎮 **`.agents/tools/main/konami_code.json`**: Declarative tool triggering Konami Code sequence and dev mode unlock.

---

## 📦 How to Run & Build

### Block Garden Knowledge Hub

This repository is a static `shadow-claw-template` project deployed automatically to GitHub Pages via GitHub Actions (`.github/workflows/deploy-pages.yml`). It does not use a local `npm` dev server or build script.

- 🌐 **Live Portal**: [kherrick.github.io/block-garden-knowledge-hub](https://kherrick.github.io/block-garden-knowledge-hub/)

---

## 🔗 Project Links

- 🎮 **Live Web Game**: [kherrick.github.io/block-garden](https://kherrick.github.io/block-garden/)
- ⚡ **Unbundled Runtime**: [kherrick.github.io/block-garden/index_unbundled.html](https://kherrick.github.io/block-garden/index_unbundled.html)
- 📦 **Block Garden Repo**: [github.com/kherrick/block-garden](https://github.com/kherrick/block-garden)
- 🕹️ **Itch.io Release**: [karlherrick.itch.io/block-garden](https://karlherrick.itch.io/block-garden)
- 🎨 **API Examples**: [kherrick.github.io/block-garden/src/api/examples/](https://kherrick.github.io/block-garden/src/api/examples/)
