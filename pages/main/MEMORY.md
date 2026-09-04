---
title: "Block Garden Memory"
created: "1970-01-01T00:00:00Z"
updated: "1970-01-01T00:00:00Z"
slug: "block-garden-memory"
---

## 🧠 Block Garden Agent Memory Index

Central routing directory for AI agents (including Prompt API built-in models) to locate enabled tools, skills, game features, and subsystem documentation.

---

## 🛠️ Enabled Tools & 🧭 Skills

Enabled via `shadow-claw.config.json` (`enabledTools`) and discoverable headlessly over HTTP via `/.well-known/agent-skills/index.json`.

### Declarative Tools

- **`scan_for_nearby_ores`**: Scans 3D voxel chunks for mineral deposits
- **`fireworks`**: Ignites 3D voxel fireworks particle physics
- **`konami_code`**: Unlocks secret Dev Mode & cheat controls

### Agent Skills & Slash Commands

- **`/scan-for-nearby-ores`**: Ore locator chunk scanning workflow
- **`/fireworks`**: Voxel fireworks display launcher
- **`/konami-code`**: Secret Konami code execution sequence

### Architecture & Discovery

- **Core Engine Script (`block-garden.js`)**: Decoupled, portable ESM containing tool execution handlers, module URLs, and event constants.
- **Custom Element Factory (`block-garden-element.js`)**: Portable component factory, context resolver, and bridge installer.
- **Presentation Adapter (`.agents/scripts/main/block-garden-adapter.js`)**: Bridges on-page custom elements, UI controls, and BroadcastChannel events.
- **Discovery Endpoint**: `/.well-known/agent-skills/index.json` provides RFC-compliant discovery with SHA-256 digests and dependency mapping.

---

## 📚 Complete Documentation Index

- **Chapter 1**: [Architecture & Procedural Engine](/main/about)
- **Chapter 2**: [Gameplay Controls, Modes & Saves](/main/controls)
- **Chapter 3**: [Farming Mechanics & Botanical Species](/main/farming-and-botany)
- **Chapter 4**: [Public Modding API & Script Gallery](/main/api-examples)
- **Chapter 5**: [Video Demos & Media Showcase](/main/demos-and-media)
- **Chapter 6**: [PDF World Saves & Postcard Gallery](/main/world-saves-and-pdfs)
- **Chapter 7**: [Web Platform Breakdown & Performance Engineering](/main/web-platform-and-performance)
- **Chapter 8**: [Agent Skills, Declarative Tools & Slash Commands](/main/agent-skills-and-tools)

---

⬅️ [Previous Page](/main/agent-skills-and-tools)
