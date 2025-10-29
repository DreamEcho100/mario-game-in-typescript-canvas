# Platformer Physics - FAQ

## Q1: What order should I update physics?
**A**:
1. Horizontal movement
2. Gravity
3. Collision detection & resolution
4. Jump mechanics
5. Reset input flags

## Q2: Why use jump buffering?
**A**: Makes controls feel more responsive. Player can press jump slightly before landing, and it will execute on landing. Removes the need for frame-perfect timing.

## Q3: What is coyote time?
**A**: Grace period after walking off a ledge where you can still jump. Named after Wile E. Coyote running off a cliff. Typically 100-150ms.

## Q4: How do I tune the "feel" of my platformer?
**A**: Adjust these in order:
1. **JUMP_FORCE** - Height of jump
2. **GRAVITY** - How fast you fall
3. **GROUND_ACCEL** - How responsive movement feels
4. **GROUND_FRICTION** - How quickly you stop
5. **COYOTE_TIME** - How forgiving jumps are

## Q5: What's the difference between ground and air control?
**A**:
- **Ground**: High acceleration, low friction (responsive)
- **Air**: Low acceleration, high friction (momentum-based)

This makes ground movement snappy while air movement preserves momentum.

## Q6: Why does my jump feel "floaty"?
**A**: Too much gravity delay. Try:
- Increase `GRAVITY`
- Decrease `JUMP_FORCE`
- Lower `JUMP_RELEASE_MULTIPLIER`

## Q7: How do I make movement feel "tight" like Mario?
**A**:
```typescript
GROUND_ACCEL = 3000  // High
GROUND_FRICTION = 0.75  // Low
JUMP_FORCE = -500
COYOTE_TIME = 120
```

## Q8: How do I make movement feel "floaty" like Celeste?
**A**:
```typescript
GROUND_ACCEL = 1500
AIR_FRICTION = 0.98  // Very high
JUMP_FORCE = -400
JUMP_RELEASE_MULTIPLIER = 0.5  // Easy variable height
```

## Q9: Should I use acceleration or instant velocity?
**A**: **Acceleration** for smooth, polished feel. Instant velocity only for very arcade-y games.

## Q10: How many jumps should I allow?
**A**: 
- **1 jump**: Realistic, challenging
- **2 jumps**: Standard platformer (double jump)
- **Infinite**: Special abilities only (jetpack, fly mode)

## Q11: Why does my player get stuck on corners?
**A**: Implement **corner correction** - push player up slightly when near platform edge:
```typescript
if (nearCorner && movingToward) {
  this.y -= 2;
}
```

## Q12: How do I handle slopes?
**A**: Calculate height at player's X position:
```typescript
const groundY = slope.getHeightAt(player.x);
if (player.bottom >= groundY) {
  player.y = groundY - player.height / 2;
}
```

## Q13: What's the best way to handle input?
**A**: Use a `Set` for keys and edge detection for jumps:
```typescript
const keys = new Set<string>();

keydown: keys.add(key)
keyup: keys.delete(key)

if (keys.has(' ') && !wasJumping) {
  player.jumpPressed = true;
}
```

## Q14: Why do my collisions feel "sticky"?
**A**: Velocity not being set to zero on collision:
```typescript
if (collidingHorizontal) this.velocityX = 0;
if (collidingVertical) this.velocityY = 0;
```

## Q15: Should I use deltaTime for all movement?
**A**: **YES!** Always multiply velocity by `dt` to ensure frame-rate independence:
```typescript
this.x += this.velocityX * (dt / 1000);
```

## Q16: How do I make one-way platforms?
**A**: Only collide if player is above and falling:
```typescript
if (player.bottom <= platform.top + 5 && player.velocityY >= 0) {
  // Allow collision
}
```

## Q17: How do I implement wall jump?
**A**:
```typescript
// Detect wall touch
const touchingLeftWall = /* collision check */;
const touchingRightWall = /* collision check */;

if (jumpPressed && touchingLeftWall) {
  this.velocityX = 300;  // Push away
  this.velocityY = -400; // Jump up
}
```

## Q18: What's a good terminal velocity?
**A**: 400-600 pixels/second. Higher = less "floaty", lower = more hang time.

## Q19: How do I make dash feel good?
**A**:
- Short duration (200ms)
- High speed (2-3× run speed)
- Cancel gravity during dash
- Visual trail effect
- Cooldown (1 second)

## Q20: Should collision happen before or after movement?
**A**: **After**. Move first, then resolve collisions:
```typescript
player.move(dt);
player.resolveCollisions(platforms);
```

## Q21: How do I optimize for many platforms?
**A**: Use **spatial partitioning**:
- Grid-based: O(1) lookup
- Quadtree: Dynamic subdivision
- Only check nearby platforms

## Q22: What's the best jump buffer time?
**A**: 100-150ms. Too short = frustrating, too long = feels unresponsive.

## Q23: Why does jump height vary?
**A**: Frame-rate dependency. Always use:
```typescript
this.velocityY += this.GRAVITY * (dt / 1000);
```

## Q24: How do I make moving platforms?
**A**: Transfer platform velocity to player when standing on it:
```typescript
if (playerOnPlatform) {
  player.x += platform.velocityX * dt;
}
```

## Q25: Should I separate X and Y collision resolution?
**A**: **YES** for platformers. Resolve X first, then Y:
```typescript
player.moveX(dt);
player.resolveHorizontal(platforms);
player.moveY(dt);
player.resolveVertical(platforms);
```

## Q26: How do I prevent tunneling (fast objects passing through walls)?
**A**:
- Cap max velocity
- Swept collision detection
- Smaller timesteps
- Check midpoint

## Q27: What's a good FOV for platformer camera?
**A**: Show 1.5-2× the player's jump height vertically, slightly more horizontally.

## Q28: How do I make camera feel smooth?
**A**: Use **lerp** with dead zone:
```typescript
if (distanceToPlayer > deadZone) {
  camera.x += (player.x - camera.x) * 0.1;
}
```

## Q29: Should I use physics engine or custom physics?
**A**: 
- **Custom**: Better for precise platformer feel
- **Physics engine**: Better for complex interactions

Most famous platformers use custom physics.

## Q30: How do I know if my physics feel good?
**A**: Playtest! If it's fun to just move around (before adding enemies/goals), your physics are good.
