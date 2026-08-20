---
title: "Chapter 3: Farming Mechanics & Botanical Species"
created: "1970-01-01T00:00:00Z"
updated: "1970-01-01T00:00:00Z"
slug: "farming-and-botany"
---

# 📖 Chapter 3: Farming Mechanics & Botanical Species

Welcome to **Chapter 3**! Unlike standard sandbox engines focused solely on block destruction, Block Garden features an intricate **plant cultivation and farming engine** (`src/core/systems/plantGrowth.mjs`).

---

## 🌾 1. Soil Hydration & Growth Requirements

Every plant species in Block Garden defines specific growth requirements for soil composition, moisture level, and light exposure.

```text
[Seed Placed on Soil Block]
            │
            ▼
   (Valid Soil Type?)
    ├── No  ──► [Plant Fails to Root]
    └── Yes
         │
         ▼
(Adequate BFS Light Level?)
    ├── No  ──► [Growth Stagnates]
    └── Yes
         │
         ▼
(Water Proximity Check)
    ├── Near Water ──► [Hydrated Fast Growth] ──┐
    └── Dry Soil   ──► [Standard Growth]      ──┴──► [Stage Advancement & Bloom]
```

### Cultivation Factors:

1. **Soil Types**: Plants require designated base blocks, such as Dirt, Tilled Farmland, Sand, Clay, or Water.
2. **Soil Hydration**: Farmland tilled near water channels becomes hydrated soil, accelerating growth ticks.
3. **BFS Light Thresholds**: Photosynthetic flora (wheat, sunflowers, roses) require a minimum light level calculated by the BFS lighting system (`LightMap`). Subterranean mushrooms thrive in low-light environments.
4. **Water Proximity**: Aquatic species (Kelp, Water Lilies) require submerged voxel coordinates.

---

## 🌿 2. Botanical Species Catalog (20+ Varieties)

Block Garden includes 20+ distinct botanical species across several plant categories:

| Category    | Species Name       | Growth Stages | Base Soil / Placement  | Special Properties & Drops                   |
| :---------- | :----------------- | :-----------: | :--------------------- | :------------------------------------------- |
| **Crops**   | **Wheat**          |       4       | Tilled Soil            | Produces Wheat grain & Seeds for replanting  |
| **Crops**   | **Corn**           |       5       | Hydrated Tilled Soil   | Tall 2-block crop yielding Corn cobs         |
| **Crops**   | **Carrots**        |       4       | Tilled Soil            | Multi-harvest root crop                      |
| **Crops**   | **Pumpkins**       |       4       | Dirt / Farmland        | Sprawling vine crop yielding carving blocks  |
| **Flowers** | **Rose**           |       3       | Grass / Dirt           | Vibrant red blossom for decorative gardens   |
| **Flowers** | **Sunflower**      |       4       | Grass / Dirt           | Tall 2-block flower tracking sun orientation |
| **Trees**   | **Birch**          |       6       | Dirt / Grass           | White bark trunk with dense leaf foliage     |
| **Trees**   | **Willow**         |       6       | Grass near Water       | Drooping vine foliage with hanging leaves    |
| **Desert**  | **Cactus**         |       4       | Sand                   | Spiky stem growing up to 3 blocks high       |
| **Desert**  | **Agave**          |       3       | Sand / Red Sand        | Desert succulent plant                       |
| **Exotic**  | **Bamboo**         |       5       | Grass / Clay           | Fast-growing multi-segment stalks            |
| **Fungi**   | **Red Mushroom**   |       3       | Low-light Dirt/Stone   | Subterranean fungus                          |
| **Fungi**   | **Brown Mushroom** |       3       | Low-light Dirt/Stone   | Shady area ground cover                      |
| **Aquatic** | **Kelp**           |       5       | Submerged Water / Sand | Underwater seaweed forest stalk              |
| **Aquatic** | **Water Lily**     |       2       | Water Surface          | Floating pad for water gardens               |

---

## 🧪 3. Growth Cycles & Seed Propagation

- **Age Progression**: `plantGrowth.mjs` runs age progression checks during game ticks, advancing plants through visual growth stages.
- **Harvesting Mechanics**: Mining a fully mature plant drops mature crops plus bonus seed drops to sustain expanding agricultural plots.
- **Plant Persistence**: Crop positions and growth stages are fully preserved across world saves (`.bgs`/`.pdf`).

---

⬅️ [Previous Page](/main/controls) | ➡️ [Next Page](/main/api-examples)
