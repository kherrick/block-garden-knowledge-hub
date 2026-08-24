---
name: scan-for-nearby-ores
description: Scans loaded Block Garden voxel chunks for nearby ore deposits around player coordinates.
user-invocable: true
metadata:
  allowed-tools: scan_for_nearby_ores
  execution:
    type: tools
    tools:
      - name: scan_for_nearby_ores
        input:
          radius: 16
---

# 🧭 Scan For Nearby Ores

The **Scan For Nearby Ores** skill scans loaded voxel chunks in Block Garden to locate nearby ore deposits (Gold, Iron, Coal, Diamond, Emerald) within a search radius of player coordinates.

## Usage

Execute `/scan-for-nearby-ores` to perform a proximity scan of surrounding chunks:

```
/scan-for-nearby-ores
```
