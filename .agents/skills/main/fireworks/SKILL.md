---
name: fireworks
description: Launches real-time 3D voxel fireworks particle physics displays in the sky using Block Garden's API.
user-invocable: true
metadata:
  allowed-tools: fireworks
  execution:
    type: tools
    tools:
      - name: fireworks
        input:
          count: 5
---

# 🎆 Voxel Fireworks Particle Display

The **Fireworks** skill triggers real-time 3D voxel fireworks particle physics in the sky using `Fireworks.mjs`.

## API Engine Capabilities

- **Particle Physics**: Simulates velocity, gravity, and particle decay using glowing glass and gold voxel blocks.
- **Dynamic Module Loading**: Loads `Fireworks.mjs` directly into the live WebGL game loop.

## Usage

Run `/fireworks` to launch a fireworks display:

```
/fireworks
```
