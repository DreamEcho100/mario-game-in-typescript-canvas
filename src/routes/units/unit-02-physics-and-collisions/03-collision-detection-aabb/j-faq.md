# Collision Detection AABB - FAQ

## Q1: What does AABB stand for?
**A**: Axis-Aligned Bounding Box. "Axis-aligned" means the box edges are parallel to X and Y axes (no rotation).

## Q2: When should I use AABB vs Circle collision?
**A**:
- **AABB**: Platformers, tile-based games, walls
- **Circle**: Balls, smooth objects, top-down games
- **Both**: Hybrid games (circle player, rect platforms)

## Q3: How do I detect which side collided?
**A**: Check which overlap is smallest:
```typescript
if (minOverlapX < minOverlapY) {
  // Horizontal collision
} else {
  // Vertical collision
}
```

## Q4: Why use center coordinates?
**A**: Easier for rotation, scaling, and physics calculations. Most game engines use center-based coordinates.

## Q5: What's the difference between detection and resolution?
**A**:
- **Detection**: Are they overlapping? (Boolean)
- **Resolution**: Move them apart (Position correction)

## Q6: How do I make one-way platforms?
**A**: Only collide if player is above and falling:
```typescript
if (player.bottom <= platform.top + 5 && player.velocityY >= 0) {
  // Allow collision
}
```

## Q7: Why do fast objects pass through walls?
**A**: **Tunneling** - object moves so far in one frame it skips past the wall. Solutions:
- Limit max speed
- Swept collision detection
- Smaller deltaTime steps

## Q8: Should I check collision before or after moving?
**A**: **After moving**, then resolve:
```typescript
player.move(dt);
player.resolveCollision(platform);
```

## Q9: How do I optimize collision with many objects?
**A**: Use **spatial partitioning**:
- Grid-based
- Quadtree
- Only check nearby objects

## Q10: What's broad phase vs narrow phase?
**A**:
- **Broad phase**: Quick filter (spatial grid, distance check)
- **Narrow phase**: Precise check (AABB, circle, pixel)

Use broad phase to eliminate impossible collisions, then narrow phase for precision.
