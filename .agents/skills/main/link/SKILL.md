---
name: link
description: Places an interactive 3D voxel link in the world that opens any destination URL when broken/mined by the player.
user-invocable: true
metadata:
  allowed-tools: link
  execution:
    type: tools
    tools:
      - name: link
        input: {}
---

# 🔗 Interactive Voxel Hyperlink

The **Link** skill creates interactive 3D voxel text links inside Block Garden using `Link.mjs`.

## Capabilities

- **Click-to-Navigate (Mining)**: When the player mines or punches any letter block of the link, Block Garden opens the configured URL in a new browser tab.
- **Auto-Restoration**: Automatically restores the mined blocks so the hyperlink remains interactive for subsequent clicks.
- **Custom URLs & Styling**: Configurable label text, target URL, block colors (default: Gold on Air), and world coordinates.

## Usage

Execute `/link` to spawn the default repository link, or pass custom configuration options via the `link` tool:

```
/link
```

### Examples via Tool Execution

- Custom website link: `link({ text: "Docs", url: "https://example.com/docs", x: 20, y: 60, z: 25 })`
- Custom block styling: `link({ text: "Play", url: "https://github.com", onBlock: "Emerald", offBlock: "Air" })`

## Prerequisites & Environment

- **Interactive Canvas Requirement**: Requires the `<block-garden>` 3D game canvas to be loaded in a browser page or tab.
- **Graceful Detection**: If the 3D world is not running, the tool returns actionable instructions rather than failing or timing out.
