---
name: messaging
description: Draws custom 3D voxel text messages in the sky of the live Block Garden world.
user-invocable: true
metadata:
  allowed-tools: messaging
  execution:
    type: tools
    tools:
      - name: messaging
        input: {}
---

# 💬 Voxel Sky Messaging

The **Messaging** skill writes custom voxel text messages in the sky of the Block Garden world using `Messaging.mjs`.

## Capabilities

- **Custom Text**: Render single-line or multi-line messages overhead.
- **Custom Font Blocks**: Select block materials for letters (e.g. Snow, Gold, Iron) and background contrast (e.g. Coal, Air, Obsidian).
- **Flexible Orientation**: Adjust coordinates and rotation angles (e.g. 180° facing the default player spawn).

## Usage

Execute `/messaging` to draw the default greeting, or pass custom text and block configurations via the `messaging` tool:

```
/messaging
```

### Examples via Tool Execution

- Single greeting: `messaging({ message: "Hello World", onBlock: "Gold", offBlock: "Air" })`
- Multi-line message: `messaging({ msgOne: "Welcome", msgTwo: "Explorer", onBlock: "Snow", offBlock: "Coal" })`

## Prerequisites & Environment

- **Interactive Canvas Requirement**: Requires the `<block-garden>` 3D game canvas to be loaded in a browser page or tab.
- **Graceful Detection**: If the 3D world is not running, the tool returns actionable instructions rather than failing or timing out.
