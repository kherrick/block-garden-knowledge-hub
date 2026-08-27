---
title: "Chapter 1: Architecture & Procedural Engine"
created: "1970-01-01T00:00:00Z"
updated: "1970-01-01T00:00:00Z"
slug: "about"
---

## 📖 Chapter 1: Architecture & Procedural Engine

Welcome to **Chapter 1** of the Block Garden Knowledge Hub! This chapter provides a deep architectural breakdown of how Block Garden operates under the hood — from worker-threaded terrain synthesis to volumetric light propagation and zero-framework signal reactivity.

---

### 🌐 Project Links & Resources

- 🎮 **Live Web Game**: [block-garden](https://kherrick.github.io/block-garden/)
- ⚡ **Unbundled Live Runtime**: [block-garden/index_unbundled.html](https://kherrick.github.io/block-garden/index_unbundled.html)
- �️ **Angular Integration**: [kherrick.github.io/apps](https://kherrick.github.io/apps/playground/block-garden)
- 🕹️ **Itch.io Hub**: [karlherrick.itch.io/block-garden](https://karlherrick.itch.io/block-garden)
- 📦 **GitHub Repository**: [github.com/kherrick/block-garden](https://github.com/kherrick/block-garden)
- 📚 **Public API Examples**: [block-garden/src/api/examples/](https://kherrick.github.io/block-garden/src/api/examples/)
- 🎥 **YouTube Demos**:
  - [Fireworks Mod Demo](https://www.youtube.com/watch?v=1aW5C7A9wSk)
  - [Random Plant Growth Demo](https://www.youtube.com/watch?v=eRDM5INHyKA)
  - [Gateway To The Clouds Demo](https://www.youtube.com/watch?v=OIdKx0u8REA)

---

### 🏗️ 1. Procedural Noise & Multi-Threaded Chunk Generation

Block Garden generates infinite, deterministic 3D voxel landscapes from a single seed value using multi-layered noise functions in `src/core/world/generation/chunk.mjs`.

```text
  ┌──────────────────────────────┐
  │   Seed Value & PRNG (alea)   │
  └──────────────┬───────────────┘
                 │
                 ▼
  ┌──────────────────────────────┐
  │ 3D Simplex Noise (initNoise) │
  └──────┬───────┬───────┬───────┘
         │       │       │
         ▼       ▼       ▼
     ┌──────┐ ┌──────┐ ┌──────┐
     │ Base │ │ Cave │ │ Ore  │
     │Noise │ │Noise │ │Noise │
     └──┬───┘ └──┬───┘ └──┬───┘
        │        │        │
        └────────┼────────┘
                 ▼
      ┌────────────────────┐
      │  Chunk Assembler   │
      └──────────┬─────────┘
                 │
                 ▼
      ┌────────────────────┐
      │ Worker Pool Thread │
      └──────────┬─────────┘
                 │
                 ▼
  ┌──────────────────────────────┐
  │  Main Thread Render Queue    │
  └──────────────────────────────┘
```

#### Key Generation Mechanics:

1. **Seeded Noise Pipeline**: Seeded 3D Simplex noise (`src/utils/noise.mjs` using `alea` PRNG) ensures world seeds are 100% reproducible and shareable across devices.
2. **Layered Terrain Topography**: Blends base terrain noise, 3D mountain shaping, hilliness octaves, and lake depressions to create organic cliffs, valleys, and deep lakes.
3. **Subterranean Cavern Carving**: Carves complex tunnel networks and caverns while evaluating surface depth heuristics and enforcing a **Lava Protection Zone** (`Y = LAVA_HEIGHT + LAVA_PROTECTION_ZONE = 3 + 12 = 15`), ensuring caves never breach the deep lava layer.
4. **Y-Level Mineral Veins**: Ores are evaluated strictly by Y-level depth in order of rarity:
   - **Gold**: Depths 30–70 blocks, requiring high noise threshold (`oreNoise > 0.8`).
   - **Iron**: Depths 20–60 blocks (`oreNoise > 0.65`).
   - **Coal**: Depths 10–50 blocks (`oreNoise > 0.55`).
   - Also includes Diamond, Silver, and Copper veins.
5. **Off-Thread Worker Pool**: `ChunkManager` delegates chunk synthesis off the main UI thread to a dedicated pool of Web Workers (`terrain.worker.mjs`), sized dynamically to `navigator.hardwareConcurrency`.

---

### 💡 2. Volumetric BFS Flood-Fill Lighting System

Lighting in Block Garden (`src/core/world/lighting/lightSystem.mjs`) is calculated dynamically using a voxel-based Breadth-First Search (BFS) engine backed by a flat `Uint8Array` (`LightMap`).

- **Emissive Light Sources**: Torches, Lanterns, and Lightstones register as light sources with initial intensity levels.
- **3D Attenuation**: Light attenuates by 1 unit per voxel, traveling up to `MAX_LIGHT_LEVEL` through non-solid blocks.
- **Cross-Chunk Propagation**: When a block changes near a chunk boundary (`localX` or `localZ` within `MAX_LIGHT_RADIUS`), `updateLightOnBlockChange` automatically recalculates light levels for neighboring chunks for seamless lighting across chunk borders.

---

### 🎨 3. Greedy Meshing, Ambient Occlusion & Shader Pipelines

To achieve high rendering performance, the chunk mesher (`src/core/world/meshing/chunkMesher.mjs`) transforms raw block arrays into optimized GPU geometry:

- **Greedy Quad Merging**: Scans adjacent block faces and merges contiguous coplanar faces into single quads, reducing vertex counts dramatically.
- **Per-Vertex Ambient Occlusion**: Evaluates corner and edge occlusion around every face vertex to compute smooth ambient shadows without extra shadow mapping overhead.
- **Three-Pass WebGL Renderer**:
  1. **Opaque Pass**: Renders dirt, stone, ores, and solid terrain blocks.
  2. **Transparent Pass**: Handles depth-sorted leaves, glass, and semi-transparent foliage.
  3. **Water Pass**: Executes custom WebGL fragment shaders for wave motion and surface reflection effects.

---

### ⚡ 4. Fine-Grained Signal Reactivity (No Framework Overhead)

Rather than relying on heavy VDOM diffing frameworks (React, Vue), Block Garden uses standard Web Standards paired with TC39 `signal-polyfill` (`Signal.State` and `Signal.Computed`).

- **Surgical Updates**: Every state change (player inventory, camera coordinates, selected hotbar item, dialog visibility) mutates a `Signal.State`.
- **Zero VDOM Cost**: Web Components subscribe directly to computed signals, triggering microscopic DOM updates only where needed.
- **Unbundled Philosophy**: Available as unbundled raw ES6 modules (`index_unbundled.html`), allowing live runtime editing without transpilation or webpack compilation!

---

⬅️ [Previous Page](/main) | ➡️ [Next Page](/main/controls)
