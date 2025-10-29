# Topic 02: Enemy AI - Debugging

---

## Bug #1: Enemy Falls Through Floor

**Symptoms**: Enemy doesn't collide with ground properly

**Causes**:
- Not checking tile collision
- Wrong collision box
- Gravity too strong

**Fix**:
```typescript
update(deltaTime: number, tilemap: Tilemap): void {
  // Apply gravity
  this.velocityY += this.gravity * deltaTime;
  this.y += this.velocityY * deltaTime;
  
  // Check ground collision
  const tiles = tilemap.getTilesAround(this.x, this.y);
  for (const tile of tiles) {
    if (tile.solid && this.collidesWith(tile)) {
      this.y = tile.y - this.height;
      this.velocityY = 0;
      break;
    }
  }
}
```

---

## Bug #2: Enemy Doesn't Turn Around

**Symptoms**: Enemy walks off edges or into walls

**Causes**:
- Not checking for obstacles
- Wrong collision detection
- Direction not flipping

**Fix**:
```typescript
shouldTurn(tilemap: Tilemap): boolean {
  // Check wall
  const wallX = this.x + this.direction * (this.width + 5);
  if (tilemap.isSolid(wallX, this.y + this.height / 2)) {
    console.log('Wall detected, turning');
    return true;
  }
  
  // Check edge
  const edgeX = this.x + this.direction * this.width;
  const edgeY = this.y + this.height + 5;
  if (!tilemap.isSolid(edgeX, edgeY)) {
    console.log('Edge detected, turning');
    return true;
  }
  
  return false;
}

update(deltaTime: number, tilemap: Tilemap): void {
  if (this.shouldTurn(tilemap)) {
    this.direction *= -1;
  }
}
```

---

## Bug #3: Enemy Chases Through Walls

**Symptoms**: Enemy follows player even when walls block the path

**Causes**:
- Not checking line of sight
- No raycast for obstacles

**Fix**:
```typescript
canSeePlayer(player: Player, tilemap: Tilemap): boolean {
  // Distance check
  if (this.distanceTo(player) > this.visionRange) return false;
  
  // Raycast for walls
  const hasWall = tilemap.raycast(
    this.x + this.width / 2,
    this.y + this.height / 2,
    player.x + player.width / 2,
    player.y + player.height / 2
  );
  
  if (hasWall) {
    console.log('Wall blocking view');
    return false;
  }
  
  return true;
}
```

---

## Bug #4: Enemy Stutters or Jitters

**Symptoms**: Enemy movement not smooth

**Causes**:
- Not using deltaTime
- Direction flipping too often
- Frame rate issues

**Fix**:
```typescript
// Use deltaTime
this.x += this.speed * this.direction * deltaTime;

// Add cooldown to prevent rapid turning
this.turnCooldown -= deltaTime;
if (this.shouldTurn() && this.turnCooldown <= 0) {
  this.direction *= -1;
  this.turnCooldown = 0.5; // Half second cooldown
}
```

---

## Bug #5: Projectiles Spawn at Wrong Position

**Symptoms**: Bullets come from wrong part of enemy

**Causes**:
- Using enemy top-left corner
- Not accounting for sprite center

**Fix**:
```typescript
shoot(player: Player): void {
  // Spawn from center
  const centerX = this.x + this.width / 2;
  const centerY = this.y + this.height / 2;
  
  const dx = player.x - centerX;
  const dy = player.y - centerY;
  const angle = Math.atan2(dy, dx);
  
  this.projectiles.push(
    new Projectile(centerX, centerY, angle, 200)
  );
}
```

---

## Bug #6: State Machine Gets Stuck

**Symptoms**: Enemy stays in one state forever

**Causes**:
- No transition conditions
- Missing state changes
- Logic error in conditions

**Fix**:
```typescript
updateChase(deltaTime: number, player: Player): void {
  const distance = this.distanceTo(player);
  
  // Add explicit transitions
  if (distance > 300) {
    console.log('Player escaped, returning to patrol');
    this.changeState(EnemyState.Patrol);
    return;
  }
  
  if (distance < 50) {
    console.log('Close enough, attacking');
    this.changeState(EnemyState.Attack);
    return;
  }
  
  // Chase logic
  this.chase(player, deltaTime);
}
```

---

## Bug #7: Flying Enemy Drifts Away

**Symptoms**: Flying enemy doesn't maintain altitude

**Causes**:
- Gravity being applied
- No altitude correction
- Wrong hover calculation

**Fix**:
```typescript
class FlyingEnemy {
  baseY: number;
  time: number = 0;
  
  update(deltaTime: number): void {
    this.time += deltaTime;
    
    // Calculate hover without gravity
    this.y = this.baseY + Math.sin(this.time * 2) * 20;
    
    // DON'T apply gravity:
    // this.velocityY += gravity * deltaTime; // REMOVE THIS
  }
}
```

---

## Bug #8: Stomp Detection Not Working

**Symptoms**: Player can't defeat enemy by jumping on it

**Causes**:
- Wrong collision check
- Not checking vertical velocity
- Collision box too small

**Fix**:
```typescript
checkStomp(player: Player): boolean {
  // Must be above enemy
  const isAbove = player.y + player.height <= this.y + 10;
  
  // Must be falling
  const isFalling = player.velocityY > 0;
  
  // Must overlap horizontally
  const overlapsX = (
    player.x < this.x + this.width &&
    player.x + player.width > this.x
  );
  
  const canStomp = isAbove && isFalling && overlapsX;
  
  console.log(`Stomp check: above=${isAbove}, falling=${isFalling}, overlaps=${overlapsX}`);
  
  return canStomp;
}
```

---

## Bug #9: Too Many Enemies Cause Lag

**Symptoms**: Game slows down with many enemies

**Causes**:
- Updating all enemies every frame
- No spatial culling
- Inefficient collision checks

**Fix**:
```typescript
class EnemyManager {
  update(deltaTime: number, camera: Camera, player: Player): void {
    for (const enemy of this.enemies) {
      // Only update if near camera
      if (!this.isNearCamera(enemy, camera)) {
        continue;
      }
      
      enemy.update(deltaTime, player);
    }
  }
  
  isNearCamera(enemy: Enemy, camera: Camera): boolean {
    const buffer = 100;
    return (
      enemy.x > camera.x - buffer &&
      enemy.x < camera.x + camera.width + buffer
    );
  }
}
```

---

## Bug #10: Enemy AI Too Predictable

**Symptoms**: Player can easily exploit enemy patterns

**Causes**:
- No randomness
- Fixed timings
- Too simple logic

**Fix**:
```typescript
class UnpredictableEnemy extends PatrolEnemy {
  private randomOffset: number = Math.random() * 2;
  
  update(deltaTime: number, player: Player): void {
    // Add random variations
    const distanceThreshold = 200 + this.randomOffset * 50;
    
    if (this.distanceTo(player) < distanceThreshold) {
      // Sometimes wait before chasing
      if (Math.random() < 0.1) {
        this.changeState(EnemyState.Alert);
      } else {
        this.changeState(EnemyState.Chase);
      }
    }
  }
  
  shoot(player: Player): void {
    // Add slight inaccuracy
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const angle = Math.atan2(dy, dx);
    
    // Random offset ±15 degrees
    const inaccuracy = (Math.random() - 0.5) * (Math.PI / 12);
    const finalAngle = angle + inaccuracy;
    
    this.projectiles.push(
      new Projectile(this.x, this.y, finalAngle, 200)
    );
  }
}
```

---

## Debug Visualization

```typescript
// Show enemy state
ctx.fillStyle = 'white';
ctx.font = '12px Arial';
ctx.fillText(EnemyState[this.state], this.x, this.y - 10);

// Show vision range
ctx.strokeStyle = 'yellow';
ctx.beginPath();
ctx.arc(this.x, this.y, this.visionRange, 0, Math.PI * 2);
ctx.stroke();

// Show path
ctx.strokeStyle = 'lime';
ctx.beginPath();
for (let i = 0; i < this.path.length; i++) {
  const p = this.path[i];
  if (i === 0) ctx.moveTo(p.x, p.y);
  else ctx.lineTo(p.x, p.y);
}
ctx.stroke();

// Show attack range
ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
ctx.beginPath();
ctx.arc(this.x, this.y, this.attackRange, 0, Math.PI * 2);
ctx.fill();
```
