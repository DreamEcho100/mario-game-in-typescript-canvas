# Tilemaps & Level Design - Exercises

## Exercise 1: Basic Tilemap ⭐

**Goal**: Create a simple tilemap with walls.

**Requirements**:
- 10×10 grid
- Walls around edges (tile = 1)
- Empty center (tile = 0)
- Draw tiles with different colors

---

## Exercise 2: Player Movement in Tilemap ⭐

**Goal**: Move player with WASD, no collision yet.

**Requirements**:
- Player starts at (64, 64)
- WASD movement
- Display player position in grid coordinates

---

## Exercise 3: Tilemap Collision Detection ⭐⭐

**Goal**: Stop player from walking through walls.

**Requirements**:
- Check only tiles near player
- Horizontal collision resolution
- Vertical collision resolution
- Can't move into solid tiles

---

## Exercise 4: Gravity in Tilemap ⭐⭐

**Goal**: Add gravity and jumping.

**Requirements**:
- Player falls with gravity
- Lands on solid tiles
- Jump with spacebar
- Ground detection working

---

## Exercise 5: Complete Platformer Level ⭐⭐

**Goal**: Design a playable level.

**Requirements**:
- At least 3 platforms at different heights
- Starting platform
- Goal area
- Gaps player must jump across

---

## Exercise 6: Camera Following ⭐⭐

**Goal**: Camera follows player in large level.

**Requirements**:
- Level larger than screen (25×18 tiles)
- Camera centers on player
- Camera clamped to level bounds
- Smooth following

---

## Exercise 7: Different Tile Types ⭐⭐⭐

**Goal**: Add multiple tile types with different behaviors.

**Requirements**:
- 0 = Empty
- 1 = Solid block
- 2 = One-way platform
- 3 = Damaging tile (hurts player)
- 4 = Bouncy tile

---

## Exercise 8: Collectibles in Tilemap ⭐⭐⭐

**Goal**: Place coins in level for player to collect.

**Requirements**:
- Coins represented by tile type 5
- Player collects on touch
- Coin disappears (set to 0)
- Display coin count
- Win when all coins collected

---

## Exercise 9: Level Editor ⭐⭐⭐

**Goal**: Click to place/remove tiles.

**Requirements**:
- Click tile to toggle solid/empty
- Number keys to select tile type
- Save level to JSON
- Load level from JSON

---

## Exercise 10: Multiple Levels ⭐⭐⭐⭐

**Goal**: Switch between different levels.

**Requirements**:
- At least 3 different levels
- Goal tile (tile = 9) to complete level
- Load next level when goal reached
- Reset player position on level load

---

## Bonus Challenge 1: Tile Sprites ⭐⭐⭐⭐

**Requirements**:
- Load tileset image
- Draw tiles from sprite sheet
- Different sprite for each tile type
- Animated tiles (water, lava)

---

## Bonus Challenge 2: Parallax Background ⭐⭐⭐⭐

**Requirements**:
- Background layer moves slower than foreground
- Multiple background layers at different speeds
- Seamless scrolling

---

## Bonus Challenge 3: Procedural Level Generation ⭐⭐⭐⭐⭐

**Requirements**:
- Generate random playable level
- Ensure player can reach all areas
- Random platform placement
- Always winnable
