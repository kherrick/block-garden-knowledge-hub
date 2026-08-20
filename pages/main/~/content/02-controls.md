---
title: "Chapter 2: Controls, Modes & Save Ecosystem"
created: "1970-01-01T00:00:00Z"
updated: "1970-01-01T00:00:00Z"
slug: "controls"
---

# 📖 Chapter 2: Controls, Modes & Save Ecosystem

Welcome to **Chapter 2**! Here you will find the complete reference for playing Block Garden across Desktop and Mobile devices, switching game modes, and taking advantage of Block Garden's privacy-first save ecosystem.

---

## 🕹️ 1. Input Controls Reference

### Desktop Keyboard & Mouse

| Action              | Primary Key       | Alternate Key | Description                                                 |
| :------------------ | :---------------- | :------------ | :---------------------------------------------------------- |
| **Move Forward**    | `W`               | `Up Arrow`    | Walk forward in camera direction                            |
| **Move Backward**   | `S`               | `Down Arrow`  | Walk backward                                               |
| **Strafe Left**     | `A`               | `Left Arrow`  | Walk left                                                   |
| **Strafe Right**    | `D`               | `Right Arrow` | Walk right                                                  |
| **Jump / Ascend**   | `Space`           | —             | Jump upward or ascend in flight mode                        |
| **Descend / Sneak** | `Shift`           | —             | Sneak or descend in flight mode                             |
| **Toggle Flight**   | `K`               | —             | Toggle Creative free-flight mode                            |
| **Break Block**     | `Left Click`      | Hold `Enter`  | Mine targeted block                                         |
| **Place Block**     | `Right Click`     | `Enter`       | Place active block at crosshair                             |
| **Cycle Material**  | `~` or `` ` ``    | Mouse Wheel   | Cycle through hotbar items                                  |
| **Hotbar Slots**    | `1` – `9`         | —             | Directly select hotbar slot                                 |
| **Open Inventory**  | `E`               | `I`           | Toggle full material inventory                              |
| **Toggle Hotbar**   | `M`               | —             | Show / hide hotbar UI overlay                               |
| **World Gen Menu**  | `Ctrl` + `S`      | —             | Open world generator configuration                          |
| **Pointer Lock**    | `Click 3D Canvas` | —             | Lock mouse cursor for 3D FPS camera (Press `Esc` to unlock) |

### Mobile Touch Controls (Powered by Hammer.js)

| Action            | Gesture              | Description                                     |
| :---------------- | :------------------- | :---------------------------------------------- |
| **Look / Camera** | Touch & Drag         | Smooth 360° camera rotation                     |
| **Place Block**   | Single Tap           | Places active block on selected voxel face      |
| **Break Block**   | Tap & Hold           | Mines block under touch target                  |
| **Navigation**    | On-Screen Touch Pads | Move, jump, and access hotbar on mobile screens |

---

## 🎮 2. Game Modes

Block Garden features two primary modes selectable in the Settings menu:

1. **Non-Creative Mode (Default)**: Resource progression survival mode. Dig for dirt, stone, and sand; mine coal, iron, gold, copper, silver, and diamond veins; harvest seeds to sustain crop yields.
2. **Creative Mode**: Unlimited block supplies, instant block breaking, and free-flight mode (`K`) enabled for high-altitude construction.

---

## 💾 3. Offline-First Storage & PDF Postcard Protocol

Block Garden is completely **cloud-free and privacy-first**. Your progress remains entirely on your device or in self-describing save files.

```text
[World State JSON] ──► [CompressionStream gzip] ──┬──► [localforage IndexedDB]
                                                  ├──► [.bgs Binary Save]
                                                  └──► [PNG tEXt Chunk "gamestate"]
                                                            │
                                                            ▼
                                                    [pdf-lib Postcard PDF]
                                                            │
                                                            ▼
                                                    [Web Share Target API]
```

### Save File Formats

- **IndexedDB**: Saves automatically persist in local storage via `localforage`, compressed with native `CompressionStream("gzip")`.
- **`.bgs` Binaries**: Lightweight gzip-compressed binary world files.
- **PDF Postcards (`.pdf`)**: Using `pdf-lib`, Block Garden generates a self-describing PDF printable postcard. It contains a rendered screenshot, seed metadata, game stats, controls guide, and a PNG attachment holding the gzip game state inside custom `tEXt` PNG chunks.
- **Share Target Protocol**: On PWA-supported mobile and desktop browsers, shared `.bgs` or `.pdf` files can be handed directly to Block Garden via native OS Share actions.

---

## 🗺️ 4. Included Pre-Packaged Worlds & YouTube Demos

Jump straight into pre-built worlds using seed links or downloadable PDF game saves:

- 🌿 **[The Garden](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/The-Garden.pdf)**: A sprawling botanical garden showcase.
- 🕳️ **[Caves](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Caves.pdf)**: Deep subterranean cavern structures and mineral deposits.
- 🌸 **[Flowers](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Flowers.pdf)**: High-density floral biomes.
- ☁️ **[Gateway To The Clouds](https://kherrick.github.io/block-garden/?gettingStarted=false&gameSave=https://kherrick.github.io/block-garden/assets/game-saves/Gateway-To-The-Clouds.pdf)**: Skyward tower reaching cloud level.

### Video Demonstrations

- 🎆 [Fireworks Mod Video Demo](https://www.youtube.com/watch?v=1aW5C7A9wSk)
- 🌱 [Random Plant Growth Video Demo](https://www.youtube.com/watch?v=eRDM5INHyKA)
- ☁️ [Gateway To The Clouds Video Demo](https://www.youtube.com/watch?v=OIdKx0u8REA)

---

⬅️ [Previous Page](/main/about) | ➡️ [Next Page](/main/farming-and-botany)
