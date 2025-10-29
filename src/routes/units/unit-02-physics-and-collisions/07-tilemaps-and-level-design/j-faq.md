# Tilemaps & Level Design - FAQ

## Q1: What is a tilemap?
**A**: A 2D grid where each cell contains a number representing a tile type (0 = empty, 1 = solid, etc.). It's the standard way to build platformer levels.

## Q2: Why use tilemaps instead of individual platforms?
**A**:
- **Efficient**: Store level as simple 2D array
- **Fast**: Only check tiles near player
- **Easy**: Edit level by changing numbers
- **Standard**: Compatible with tools like Tiled

## Q3: How do I convert world position to grid position?
**A**:
```typescript
col = Math.floor(worldX / tileSize)
row = Math.floor(worldY / tileSize)
```

## Q4: How do I convert grid position to world position?
**A**:
```typescript
worldX = col * tileSize
worldY = row * tileSize
```

## Q5: Should I check collision with every tile?
**A**: **NO!** Only check tiles the player overlaps:
```typescript
leftTile = floor(player.left / tileSize)
rightTile = floor(player.right / tileSize)
// Only check tiles in this range
```

## Q6: What tile size should I use?
**A**: 16, 32, or 64 pixels are common. 32 is a good default for platformers.

## Q7: Should player size equal tile size?
**A**: **No**, make player slightly smaller (28 instead of 32) for smoother collision around corners.

## Q8: How do I handle different tile types?
**A**: Use different numbers for each type, then check in collision:
```typescript
if (tile === 1) // Solid
if (tile === 2) // One-way platform
if (tile === 3) // Damage
```

## Q9: How do I make one-way platforms in tilemap?
**A**: Only collide if player is above and falling:
```typescript
if (tile === 2 && player.velocityY >= 0 && player.bottom <= tileTop + 5) {
  // Allow collision
}
```

## Q10: How big should my level be?
**A**: Start small (20×15 tiles), then expand. Large levels need camera following.

## Q11: How do I implement camera following?
**A**: Center camera on player, then clamp to level bounds:
```typescript
camera.x = player.x - canvas.width / 2
camera.x = clamp(0, levelWidth - canvas.width)
```

## Q12: Can I have multiple layers?
**A**: Yes! Use separate 2D arrays for background, collision, foreground.

## Q13: How do I save/load levels?
**A**: Convert 2D array to JSON:
```typescript
const json = JSON.stringify(tilemap.data);
localStorage.setItem('level', json);
```

## Q14: How do I use tile sprites instead of colors?
**A**: Load sprite sheet, draw from it:
```typescript
ctx.drawImage(
  spriteSheet,
  tileId * 16, 0, 16, 16,  // Source
  x, y, tileSize, tileSize  // Dest
);
```

## Q15: What's the best way to design levels?
**A**:
1. Start simple (introduce one mechanic)
2. Gradually increase difficulty
3. Add checkpoints
4. Test thoroughly

## Q16: How do I add collectibles?
**A**: Use a tile type (5 = coin), check for overlap, set to 0 when collected.

## Q17: Can I make a level editor?
**A**: Yes! Click to place tiles, save to JSON, load from JSON.

## Q18: How do I handle slopes in tilemap?
**A**: Complex. Either:
- Use multiple small tiles for stairs
- Add slope data to tiles (advanced)
- Use non-tilemap collision for slopes

## Q19: Should I separate X and Y collision?
**A**: **YES!** Always resolve horizontal first, then vertical:
```typescript
player.x += velocityX * dt;
resolveTilemapCollisionX();
player.y += velocityY * dt;
resolveTilemapCollisionY();
```

## Q20: How do I optimize for large levels?
**A**: Already optimized! Only checking tiles near player is O(1) per frame.

## Q21: Can I use Tiled Map Editor?
**A**: Yes! Export as JSON, load the layer data into your tilemap.

## Q22: How do I handle animated tiles?
**A**: Store animation frame in separate variable, increment each frame:
```typescript
animFrame = (animFrame + 1) % numFrames;
drawTile(tileId + animFrame);
```

## Q23: Should tiles be centered or top-left?
**A**: **Top-left** is standard for tilemaps. Easier math.

## Q24: How do I add parallax backgrounds?
**A**: Separate background layer that scrolls slower:
```typescript
bgX = camera.x * 0.5;  // Half speed
```

## Q25: Can I generate levels procedurally?
**A**: Yes! Use algorithms like:
- Random placement with rules
- Cellular automata
- BSP (Binary Space Partitioning)

## Q26: How do I ensure generated levels are winnable?
**A**: 
- Check reachability (can player get from start to end?)
- Validate jump distances
- Test programmatically

## Q27: What's a good level size for beginners?
**A**: 15-20 tiles wide, 10-12 tiles tall. Fits on screen without camera.

## Q28: How do I add breakable tiles?
**A**: Check tile on collision, set to 0 if breakable:
```typescript
if (tile === 6) { // Breakable
  tilemap.data[row][col] = 0;
}
```

## Q29: Can I have tiles bigger than the grid?
**A**: Yes, but complex. Mark multiple grid cells, or use separate entity system for large objects.

## Q30: Should I use tilemaps for everything?
**A**: 
- **YES**: Walls, floors, platforms
- **NO**: Enemies, player, moving objects (use entities)
- **MAYBE**: Decorations, collectibles (either works)
