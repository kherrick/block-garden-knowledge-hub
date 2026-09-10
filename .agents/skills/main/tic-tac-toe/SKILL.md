---
name: tic-tac-toe
description: Creates an interactive, playable 3D voxel Tic-Tac-Toe minigame in Block Garden with player switching, win detection, and reset button.
user-invocable: true
metadata:
  allowed-tools: tic_tac_toe
  execution:
    type: tools
    tools:
      - name: tic_tac_toe
        input:
          action: "spawn"
---

# 🎮 Playable 3D Tic-Tac-Toe Minigame

The **Tic-Tac-Toe** skill constructs a fully interactive, two-player 3D voxel Tic-Tac-Toe board directly inside Block Garden using `TicTacToe.mjs`.

## Capabilities

- **Voxel Gameplay**: Mining/breaking any board cell cycles the mark: Empty $\to$ X (Coal) $\to$ O (Snow) $\to$ Empty.
- **Win Detection**: Automatically detects 3-in-a-row (rows, columns, diagonals) and draws an illuminated Gold winning line.
- **In-Game Reset**: Mining the Iron button positioned above the board resets the grid for a new game.
- **Customizable Appearance**: Configure board cell size, spacing, border blocks, and player mark materials.

## Usage

Execute `/tic-tac-toe` to spawn the game board in front of the player:

```
/tic-tac-toe
```

### Examples via Tool Execution

- Reset existing game: `tic_tac_toe({ action: "reset" })`
- Custom position and materials: `tic_tac_toe({ x: 24, y: 58, z: 25, xBlock: "Obsidian", oBlock: "Gold", emptyBlock: "Glass" })`

## Prerequisites & Environment

- **Interactive Canvas Requirement**: Requires the `<block-garden>` 3D game canvas to be loaded in a browser page or tab.
- **Graceful Detection**: If the 3D world is not running, the tool returns actionable instructions rather than failing or timing out.
