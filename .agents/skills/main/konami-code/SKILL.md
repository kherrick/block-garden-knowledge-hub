---
name: konami-code
description: Executes the secret Konami Code sequence (↑ ↑ ↓ ↓ ← → ← → B A) to unlock dev mode, ore depth locator, fast growth, and hidden menu items.
user-invocable: true
metadata:
  allowed-tools: konami_code
  execution:
    type: tools
    tools:
      - name: konami_code
        input:
          autoExecute: true
---

# 🎮 Konami Code Secret Unlocker

The **Konami Code** skill executes the iconic cheat code sequence ($\uparrow \uparrow \downarrow \downarrow \leftarrow \rightarrow \leftarrow \rightarrow \text{B } \text{A}$) in Block Garden using `KonamiCode.mjs`.

## Unlocked Dev Mode Features

- ⛏️ **Ore Depth Scanner & Locator**: Highlights gold, iron, coal, and diamond vein spawn probabilities underground.
- ⚡ **Fast Movement & Flight**: Accelerates player speed and vertical mobility.
- 🌾 **Fast Plant Maturation**: Speeds up crop and flower growth updates.
- ☁️ **Solid Cloud Rendering**: Toggles volumetric cloud block collisions.
- 🎨 **Custom Ambient Occlusion (AO) & Shaders**: Unlocks advanced rendering settings in the UI menu.

## Usage

Execute `/konami-code` to trigger the sequence:

```
/konami-code
```
