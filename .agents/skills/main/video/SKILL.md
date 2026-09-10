---
name: video
description: Creates an in-world real-time camera video display screen in Block Garden, streaming webcam frames directly into 3D voxels.
user-invocable: true
metadata:
  allowed-tools: video
  execution:
    type: tools
    tools:
      - name: video
        input: {}
---

# 📹 Live Voxel Video Screen

The **Video** skill constructs a live camera video screen in Block Garden using `Video.mjs`, streaming real-time video frames onto a 3D block canvas.

## Capabilities

- **Real-Time Frame Mapping**: Captures webcam stream frames, applies gamma correction, and quantizes pixels into block IDs at a configurable frame rate (default: 2 FPS).
- **In-World Interactive Controls**: Mining the green Grass block STARTS the video capture; mining the red Rose block STOPS the video feed.
- **Configurable Dimensions**: Customize screen resolution (e.g. 24x18, 48x36, 64x48 blocks), position, and camera direction (`user` or `environment`).
- **Live Stream Controls**: Adjust capture frame rate (`setFPS`) or brightness (`setGamma`) on the fly.

## Usage

Execute `/video` to spawn the video screen and control buttons:

```
/video
```

### Examples via Tool Execution

- Auto-start capture immediately: `video({ autoStart: true, width: 48, height: 36, fps: 2 })`
- Adjust running feed frame rate: `video({ action: "setFPS", fps: 5 })`
- Stop active camera stream: `video({ action: "stop" })`

## Prerequisites & Environment

- **Camera Permission**: Accessing the webcam requires granting browser media device permissions.
- **Interactive Canvas Requirement**: Requires the `<block-garden>` 3D game canvas to be loaded in a browser page or tab.
- **Graceful Detection**: If the 3D world is not running, the tool returns actionable instructions rather than failing or timing out.
