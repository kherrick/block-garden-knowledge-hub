---
title: "Chapter 6: PDF World Saves & Postcard Gallery"
created: "1970-01-01T00:00:00Z"
updated: "1970-01-01T00:00:00Z"
slug: "world-saves-and-pdfs"
---

## 📖 Chapter 6: PDF World Saves & Postcard Gallery

Welcome to **Chapter 6**! Block Garden features a revolutionary **PDF Save Game format**. World saves are exported as human-readable PDF postcards containing rendered screenshots, world statistics, and a complete gzip-compressed game state embedded inside custom PNG image chunks.

---

## 💾 1. Technical PDF Architecture

When you export a save game to PDF in Block Garden (`src/ui/dialog/storage.mjs`):

```text
[World State JSON] ──► [CompressionStream gzip]
                             │
                             ▼
                    [Canvas Screenshot]
                             │
                             ▼
              [Embed State in PNG tEXt Chunk]
                             │
                             ▼
                [pdf-lib Document Creation]
                             │
                             ▼
              [Self-Describing PDF Postcard]
```

1. **Gzip Compression**: The active voxel grid and world metadata are encoded to JSON and compressed into a binary blob using `CompressionStream("gzip")`.
2. **Custom PNG `tEXt` Chunk**: Block Garden hand-rolls PNG chunk structures (calculating 32-bit CRC checksums) to attach the gzip binary into a custom `tEXt` keyword chunk named `"gamestate"`.
3. **Branded PDF Generation**: Using `pdf-lib`, the engine renders a document with clickable link annotations, world stats, controls guide, and attaches the state-bearing PNG as a file attachment.
4. **Instant In-Browser Import**: Dragging or opening any `.pdf` save file into Block Garden extracts the PNG attachment via `extractJsonFromPng` and restores the world instantly!

---

## 🖼️ 2. Official PDF Game Save Gallery

Click any world card below to launch Block Garden with the PDF save pre-loaded:

---

### 1. 🌿 [The Garden PDF Save](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/The-Garden.pdf)

A sprawling botanical sanctuary showcasing lush crop fields, structured water channels, and flower gardens.

- 🕹️ **[Play Live with "The Garden" PDF](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/The-Garden.pdf)**
- 📄 **Direct PDF Download**: [`The-Garden.pdf`](https://kherrick.github.io/block-garden/assets/game-saves/The-Garden.pdf)

[![The Garden Screenshot](https://kherrick.github.io/block-garden/assets/screenshots/block-garden-screenshot-the-garden-400x400.png)](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/The-Garden.pdf)

---

### 2. 🕳️ [Caves PDF Save](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Caves.pdf)

Deep subterranean cavern structures featuring illuminated mining shafts, lava protection zone barriers, and mineral deposits.

- 🕹️ **[Play Live with "Caves" PDF](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Caves.pdf)**
- 📄 **Direct PDF Download**: [`Caves.pdf`](https://kherrick.github.io/block-garden/assets/game-saves/Caves.pdf)

[![Caves Screenshot](https://kherrick.github.io/block-garden/assets/screenshots/block-garden-screenshot-caves-400x400.png)](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Caves.pdf)

---

### 3. 🌸 [Flowers PDF Save](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Flowers.pdf)

A high-density floral biome showcase packed with vibrant rose beds, sunflowers, and decorative plant growth.

- 🕹️ **[Play Live with "Flowers" PDF](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Flowers.pdf)**
- 📄 **Direct PDF Download**: [`Flowers.pdf`](https://kherrick.github.io/block-garden/assets/game-saves/Flowers.pdf)

[![Flowers Screenshot](https://kherrick.github.io/block-garden/assets/screenshots/block-garden-screenshot-flowers-400x400.png)](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Flowers.pdf)

---

### 4. ☁️ [Gateway To The Clouds PDF Save](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Gateway-To-The-Clouds.pdf)

An architectural sky tower rising from sea level through the cloud layer into aerial garden platforms.

- 🕹️ **[Play Live with "Gateway To The Clouds" PDF](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Gateway-To-The-Clouds.pdf)**
- 📄 **Direct PDF Download**: [`Gateway-To-The-Clouds.pdf`](https://kherrick.github.io/block-garden/assets/game-saves/Gateway-To-The-Clouds.pdf)

[![Gateway To The Clouds Screenshot](https://kherrick.github.io/block-garden/assets/screenshots/block-garden-screenshot-gateway-to-the-clouds-400x400.png)](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Gateway-To-The-Clouds.pdf)

---

⬅️ [Previous Page](/main/demos-and-media) | ➡️ [Next Page](/main/web-platform-and-performance)
