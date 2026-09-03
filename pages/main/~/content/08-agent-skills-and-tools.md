---
title: "Chapter 8: Agent Skills, Declarative Tools & Slash Commands"
created: "1970-01-01T00:00:00Z"
updated: "1970-01-01T00:00:00Z"
slug: "agent-skills-and-tools"
---

## 🤖 Chapter 8: Agent Skills, Declarative Tools & Slash Commands

Welcome to **Chapter 8**! The Block Garden Knowledge Hub integrates seamlessly with **ShadowClaw**, exposing an in-browser agentic architecture driven by bundled **Agent Skills**, **Declarative Tools**, and user-invocable **Slash Commands**. This chapter details the technical integration between Block Garden's WebGL game engine and ShadowClaw's sandboxed worker environment.

---

### 🏗️ 1. Architecture: Cross-Frame Communication Bridge

Because ShadowClaw executes agent tool logic within an isolated Web Worker context without direct DOM access, communication between the AI assistant (`BlockGardener`) and the active 3D `<block-garden>` WebGL viewport uses a bi-directional **`BroadcastChannel` Bridge** inside `block-garden-adapter.js`:

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

#### Bridge Design Highlights:

- **Asynchronous Command Execution**: Tools post JSON payload requests containing unique `requestId` tokens to the `"block-garden-commands"` channel.
- **Engine API Delegation**: `block-garden-adapter.js` intercepts messages on the main thread, dynamically imports Block Garden modules (e.g. `oreLocator.mjs`, `Fireworks.mjs`, `KonamiCode.mjs`), and executes native game logic against `window.blockGarden`.
- **Structured Data Returns**: Execution results and telemetry return to the worker thread via `"block-garden-results"` and render into chat threads.
- **Sandboxed Iframe Navigation Interception**: In sandboxed `srcdoc` preview iframes (`about:srcdoc`), `block-garden-adapter.js` attaches capture-phase click handlers to Getting Started dialog game-save links (`h4 a`, `img`). This intercepts links before `block-garden`'s bubbling `location.href` handlers fire, prompting user confirmation and delegating navigation via `win.open(targetUrl, '_blank')` using `allow-popups-to-escape-sandbox`.
- **Opaque-Origin Sandbox & Storage Proxying**: `shadow-claw.config.json` enforces opaque-origin isolation without `allow-same-origin`, relying on ShadowClaw's `postMessage` storage bridge for IndexedDB game saves while permitting `cdn.jsdelivr.net` for external dependencies.

---

### 🧭 2. Bundled Agent Skills & Slash Commands

Agent Skills under `.agents/skills/main/` provide deterministic execution pipelines and guidance for the AI assistant. Each skill is marked `user-invocable: true` and can be triggered directly in chat using slash commands:

#### 1. 🧭 Scan for Nearby Ores (`/scan-for-nearby-ores`)

- **Skill File**: `.agents/skills/main/scan-for-nearby-ores/SKILL.md`
- **Slash Command**: `/scan-for-nearby-ores`
- **Capabilities**: Scans loaded 3D voxel chunks within a configured radius (default: 16 blocks) around player coordinates. Returns detailed breakdowns of nearby Coal, Iron, Gold, Copper, Silver, Diamond, and Emerald deposits.

#### 2. 🎆 Voxel Fireworks Display (`/fireworks`)

- **Skill File**: `.agents/skills/main/fireworks/SKILL.md`
- **Slash Command**: `/fireworks`
- **Capabilities**: Dynamically imports `Fireworks.mjs` and ignites real-time 3D voxel fireworks particle physics bursts into the sky above the player.

#### 3. 🎮 Secret Konami Code Unlocker (`/konami-code`)

- **Skill File**: `.agents/skills/main/konami-code/SKILL.md`
- **Slash Command**: `/konami-code`
- **Capabilities**: Automates execution of the iconic cheat code sequence ($\uparrow \uparrow \downarrow \downarrow \leftarrow \rightarrow \leftarrow \rightarrow \text{B } \text{A}$) to instantly unlock Dev Mode, fast growth, solid cloud toggles, and hidden UI menu items.

---

### 🛠️ 3. Declarative Tools Inventory

Declarative tools under `.agents/tools/main/` define executable JSON tool definitions that map directly to the engine bridge:

| Tool Name                  | Schema File                                    | Description & Execution Payload                                                       |
| :------------------------- | :--------------------------------------------- | :------------------------------------------------------------------------------------ |
| **`scan_for_nearby_ores`** | `.agents/tools/main/scan_for_nearby_ores.json` | Scans loaded voxel chunks around player coordinates and returns formatted ore totals. |
| **`fireworks`**            | `.agents/tools/main/fireworks.json`            | Triggers a 3D voxel fireworks particle burst in the WebGL world.                      |
| **`konami_code`**          | `.agents/tools/main/konami_code.json`          | Triggers the secret Konami Code sequence and unlocks developer settings.              |

---

### ⚙️ 4. Initial Tool Enablement & Skill Purge Markers

Site configuration (`shadow-claw.config.json`) automatically enables these tools on initial site boot:

```json
{
  "shadowClawVersion": "5d7fc4ee2bffe38568a20ed4995af20066ca4d38",
  "enabledTools": ["scan_for_nearby_ores", "fireworks", "konami_code"]
}
```

To ensure newly published skills and declarative tools are re-seeded into the browser OPFS storage on static site deployments, a purge marker file (`RESET.md` or `purge-skills.md`) under `.agents/skills/main/` specifies a unique `purge-id`:

```markdown
---
slug: "shadow-claw--purge-skills"
purge-id: "2026-08-23T22:21:00Z"
---
```

---

⬅️ [Previous Page](/main/web-platform-and-performance) | ➡️ [Next Page](/main/memory)
