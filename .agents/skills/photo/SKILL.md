---
name: photo
description: Quantizes and renders any photo, image URL, or base64 data URI into 3D voxel pixel mosaic art in Block Garden.
user-invocable: true
metadata:
  allowed-tools: photo
  execution:
    type: tools
    tools:
      - name: photo
        input: {}
---

# 📸 Voxel Photo & Image Renderer

The **Photo** skill quantizes digital images into 3D voxel mosaics using Block Garden's color quantization engine from `Photo.mjs`.

## Capabilities

- **Any Image Source**: Accepts web image URLs, base64 data URIs, or renders the built-in showcase screenshot by default.
- **Color Quantization**: Downsamples image pixels and finds nearest-matching voxel blocks using Euclidean RGB distance algorithms.
- **Palette Optimization**: Dynamically optimizes game engine CSS custom property palettes to match image tones.
- **Position & Sizing**: Configurable target dimension (default: 48 blocks), coordinates, and 3D rotation angles.

## Usage

Execute `/photo` to render the default showcase photo:

```
/photo
```

### Examples via Tool Execution

- Custom web image: `photo({ imageUrl: "https://example.com/art.png", size: 64, x: 0, y: 80, z: 25 })`
- Without palette optimization: `photo({ imageUrl: "data:image/png;base64,...", optimizeColors: false })`

## Prerequisites & Environment

- **Interactive Canvas Requirement**: Requires the `<block-garden>` 3D game canvas to be loaded in a browser page or tab.
- **Graceful Detection**: If the 3D world is not running, the tool returns actionable instructions rather than failing or timing out.
