---
title: "Chapter 8: Agent Skills, Declarative Tools & Slash Commands"
created: "1970-01-01T00:00:00Z"
updated: "1970-01-01T00:00:00Z"
slug: "agent-skills-and-tools"
---

## 🤖 Chapter 8: Agent Skills, Declarative Tools & Slash Commands

Welcome to **Chapter 8**! The Block Garden Knowledge Hub integrates seamlessly with **ShadowClaw**, exposing an in-browser agentic architecture driven by bundled **Agent Skills**, **Declarative Tools**, and user-invocable **Slash Commands**. This chapter details the technical integration between Block Garden's WebGL game engine and ShadowClaw's sandboxed worker environment.

---

## 📐 Decoupled Architecture: Engine & Presentation

To allow external agents, web workers, and headless runtimes to execute tools without DOM dependencies, Block Garden separates core engine execution from UI presentation:

- **Core Engine Script (`block-garden.js`)**: Pure ESM containing module loaders, constants, parameter parsers, and tool execution handlers (`executeOreScan`, `runFireworks`, `runKonamiCode`, `handleToolCommand`). Zero DOM or browser dependencies.
- **Portable Custom Element Factory (`.agents/scripts/main/block-garden-element.js`)**: Web component lifecycle, dynamic mounting (`ensureBlockGardenDefined`, `createBlockGarden`, `renderBlockGarden`), context discovery, and BroadcastChannel bridge installer.
- **Presentation Adapter (`.agents/scripts/main/block-garden-adapter.js`)**: Handles on-page `<block-garden>` canvas sizing, responsive layout, CSS variables, fullscreen controls, iframe dialog interception, and DOM event listeners.

> [!NOTE]
> **Headless-First by Design**: Graphical presentation is completely optional. All Block Garden skills and tools run headlessly in AI agent tool runners, Web Workers, Node.js scripts, and CLI pipelines with zero DOM or HTML dependencies. The presentation adapter (`block-garden-adapter.js`) and `<block-garden>` custom element exist solely to provide an optional interactive 3D WebGL viewport when embedded in web pages or dashboards.

---

## 🌐 Agent Skills Discovery via Well-Known URI

External agents and peer ShadowClaw instances discover and consume the skills, declarative tools, and portable scripts headlessly over HTTP via the standard discovery index:

```
/.well-known/agent-skills/index.json
```

Conforming to the [Agent Skills Discovery RFC](https://github.com/cloudflare/agent-skills-discovery-rfc), this index provides:

- **Relative URL Resolution**: Resolves against `/.well-known/agent-skills/` (`../../.agents/...`), ensuring portability across GitHub Pages subpaths, custom domains, or local dev servers.
- **SHA-256 Digest Integrity**: Verifiable checksums for all skills, tools, and scripts.
- **Dependency Mapping**: Automatically indexes tool schemas and executable scripts.

---

### 🏗️ 1. Architecture: Cross-Frame Communication Bridge

Because ShadowClaw executes agent tool logic within an isolated Web Worker context without direct DOM access, communication between the AI assistant (`BlockGardener`) and the active 3D `<block-garden>` WebGL viewport uses a bi-directional **`BroadcastChannel` Bridge** inside `.agents/scripts/main/block-garden-adapter.js`:

```text
┌───────────────────────────┐                ┌───────────────────────────┐
│   ShadowClaw Agent Tool   │                │   Host Page / Adapter     │
│  (Isolated Web Worker)    │                │   (Main Thread & WebGL)   │
└─────────────┬─────────────┘                └─────────────┬─────────────┘
              │                                            │
              │  postMessage({ type, requestId, params })  │
              ├───────────────────────────────────────────►│
              │   BroadcastChannel("block-garden-commands")│  Executes Engine API /
              │                                            │  scanForOres / Fireworks
              │                                            │
              │  postMessage({ requestId, result })        │
              │◄───────────────────────────────────────────┤
              │   BroadcastChannel("block-garden-results") │
```

#### Bridge Wiring & Listener Guard

In `.agents/scripts/main/block-garden-adapter.js`, listeners are registered with a singleton guard to prevent duplicate handlers during SPA navigation:

```javascript
if (
  typeof BroadcastChannel !== "undefined" &&
  !globalThis._bgBroadcastBridgeInstalled
) {
  globalThis._bgBroadcastBridgeInstalled = true;
  const _bgCommandChannel = new BroadcastChannel(EVENTS.COMMANDS_CHANNEL);
  _bgCommandChannel.onmessage = async (evt) => {
    const { type, requestId, params } = evt.data || {};
    if (!type || !requestId) return;
    const _bgResultsChannel = new BroadcastChannel(EVENTS.RESULTS_CHANNEL);
    let result = "";
    try {
      const ctx = findBlockGardenContext();
      result = await handleToolCommand(type, params, ctx);
    } catch (err) {
      result = "Error: " + (err.message || String(err));
    }
    _bgResultsChannel.postMessage({ requestId, result });
    _bgResultsChannel.close();
  };
}
```

---

### 🧭 2. Bundled Agent Skills & Slash Commands

Agent Skills provide deterministic execution pipelines and guidance for the AI assistant. Each skill is marked `user-invocable: true` and can be triggered directly in chat using slash commands:

#### 1. 🧭 Scan for Nearby Ores (`/scan-for-nearby-ores`)

- **Declarative Tool**: `scan_for_nearby_ores`
- **Capabilities**: Scans loaded 3D voxel chunks within a configured radius (default: 16 blocks) around player coordinates. Returns detailed breakdowns of nearby Coal, Iron, Gold, Copper, Silver, Diamond, and Emerald deposits.

#### 2. 🎆 Voxel Fireworks Display (`/fireworks`)

- **Declarative Tool**: `fireworks`
- **Capabilities**: Dynamically imports `Fireworks.mjs` and ignites real-time 3D voxel fireworks particle physics bursts into the sky above the player.

#### 3. 🎮 Secret Konami Code Unlocker (`/konami-code`)

- **Declarative Tool**: `konami_code`
- **Capabilities**: Automates execution of the iconic cheat code sequence ($\uparrow \uparrow \downarrow \downarrow \leftarrow \rightarrow \leftarrow \rightarrow \text{B } \text{A}$) to instantly unlock Dev Mode, fast growth, solid cloud toggles, and hidden UI menu items.

---

### 🛠️ 3. Declarative Tools Inventory

The hub exposes three declarative tools registered in `shadow-claw.config.json` under `enabledTools`:

| Tool Name                  | Purpose & Execution Behavior                                                          |
| :------------------------- | :------------------------------------------------------------------------------------ |
| **`scan_for_nearby_ores`** | Scans loaded voxel chunks around player coordinates and returns formatted ore totals. |
| **`fireworks`**            | Triggers a 3D voxel fireworks particle burst in the WebGL world.                      |
| **`konami_code`**          | Triggers the secret Konami Code sequence and unlocks developer settings.              |

---

### ⚙️ 4. Initial Tool Enablement & Site Configuration

Site configuration (`shadow-claw.config.json`) automatically enables these tools and loads the presentation adapter:

```json
{
  "customElements": {
    "scripts": [
      {
        "src": ".agents/scripts/main/block-garden-adapter.js",
        "hasInit": true
      },
      "https://kherrick.github.io/block-garden/block-garden-bundle-min.mjs"
    ]
  },
  "enabledTools": ["scan_for_nearby_ores", "fireworks", "konami_code"]
}
```

---

⬅️ [Previous Page](/main/web-platform-and-performance) | ➡️ [Next Page](/main/memory)
