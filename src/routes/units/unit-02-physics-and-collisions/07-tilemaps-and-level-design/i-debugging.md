# Tilemaps & Level Design - Debugging Guide

## Bug 1: Player Falls Through Floor

**Symptoms**: Player doesn't stop on ground tiles

**Diagnosis**:
- Not checking Y collision
- `isGrounded` not set
- Overlap calculation wrong

**Solution**: Ensure Y collision sets `isGrounded = true` and stops velocity

---

## Bug 2: Player Gets Stuck in Walls

**Symptoms**: Player can't move after hitting wall

**Diagnosis**: Not pushing player completely out of tile

**Solution**:
```typescript
this.x = tileLeft - this.width / 2; // Push completely out
```

---

## Bug 3: Player Size Issues

**Symptoms**: Gets stuck on corners, collision feels wrong

**Solution**: Make player slightly smaller than tile
```typescript
width = 28;  // Not 32!
height = 28;
```

---

## Bug 4: Wrong Tile Checked

**Symptoms**: Collision happens at wrong position

**Diagnosis**: Using wrong coordinate conversion

**Solution**:
```typescript
// Wrong
const col = worldX / tileSize;

// Right
const col = Math.floor(worldX / tileSize);
```

---

## Bug 5: Checking All Tiles (Slow)

**Symptoms**: Game lags with large levels

**Solution**: Only check tiles near player
```typescript
const leftTile = Math.floor(player.left / tileSize);
const rightTile = Math.floor(player.right / tileSize);
// Not: for (all rows) for (all cols)
```

---

## Bug 6: Camera Shows Outside Level

**Symptoms**: Black area visible at edges

**Solution**: Clamp camera
```typescript
camera.x = Math.max(0, Math.min(camera.x, levelW - canvasW));
```

---

## Bug 7: Tile Drawing Offset

**Symptoms**: Tiles and collision don't match

**Diagnosis**: Camera not applied to drawing

**Solution**:
```typescript
camera.apply(ctx);
tilemap.draw(ctx);
player.draw(ctx);
camera.restore(ctx);
```

---

## Bug 8: Out of Bounds Error

**Symptoms**: Crash when accessing tile

**Solution**: Bounds check in getTile
```typescript
if (row < 0 || row >= height || col < 0 || col >= width) {
  return -1;
}
```

---

## Bug 9: Collectibles Not Working

**Symptoms**: Player overlaps coin but doesn't collect

**Diagnosis**: Checking wrong tiles or not removing coin

**Solution**: Check tiles player overlaps and set to 0

---

## Bug 10: Level Editor Click Wrong Tile

**Symptoms**: Click places tile at wrong position

**Solution**: Add camera offset to click position
```typescript
const worldX = clickX + camera.x;
const worldY = clickY + camera.y;
```
