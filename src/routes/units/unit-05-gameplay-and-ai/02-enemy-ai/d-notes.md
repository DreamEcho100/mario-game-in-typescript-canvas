# Topic 02: Enemy AI - Quick Reference

---

## Basic Patrol

```typescript
class PatrolEnemy {
  direction: number = 1; // 1 or -1
  speed: number = 50;
  
  update(dt: number) {
    this.x += this.speed * this.direction * dt;
    
    if (this.shouldTurn()) {
      this.direction *= -1;
    }
  }
}
```

---

## Edge Detection

```typescript
shouldTurnAtEdge(tilemap: Tilemap): boolean {
  const checkX = this.x + this.direction * this.width;
  const checkY = this.y + this.height + 5;
  return !tilemap.isSolid(checkX, checkY);
}
```

---

## Chase Player

```typescript
chase(player: Player, dt: number) {
  const direction = player.x > this.x ? 1 : -1;
  this.x += this.chaseSpeed * direction * dt;
}

distanceTo(player: Player): number {
  const dx = player.x - this.x;
  const dy = player.y - this.y;
  return Math.sqrt(dx * dx + dy * dy);
}
```

---

## Line of Sight

```typescript
canSeePlayer(player: Player, tilemap: Tilemap): boolean {
  // Check distance
  if (this.distanceTo(player) > this.visionRange) return false;
  
  // Check angle
  const angle = Math.atan2(player.y - this.y, player.x - this.x);
  if (Math.abs(angle - this.facingAngle) > this.visionAngle) return false;
  
  // Check walls
  return !tilemap.raycast(this.x, this.y, player.x, player.y);
}
```

---

## State Machine

```typescript
enum State { Idle, Patrol, Chase, Attack }

class StateMachineEnemy {
  state: State = State.Patrol;
  stateTime: number = 0;
  
  update(dt: number, player: Player) {
    this.stateTime += dt;
    
    switch (this.state) {
      case State.Patrol:
        this.updatePatrol(player);
        break;
      case State.Chase:
        this.updateChase(player);
        break;
      // ...
    }
  }
  
  changeState(newState: State) {
    this.state = newState;
    this.stateTime = 0;
  }
}
```

---

## Jumping AI

```typescript
class JumpingEnemy {
  jumpForce: number = -300;
  canJump: boolean = true;
  
  shouldJump(tilemap: Tilemap): boolean {
    const obstacleX = this.x + this.direction * (this.width + 5);
    return tilemap.isSolid(obstacleX, this.y);
  }
  
  jump() {
    if (this.canJump) {
      this.velocityY = this.jumpForce;
      this.canJump = false;
    }
  }
}
```

---

## Ranged Attack

```typescript
class RangedEnemy {
  shootCooldown: number = 0;
  shootInterval: number = 2.0;
  
  update(dt: number, player: Player) {
    this.shootCooldown -= dt;
    
    if (this.shouldShoot(player)) {
      this.shoot(player);
      this.shootCooldown = this.shootInterval;
    }
  }
  
  shoot(player: Player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const angle = Math.atan2(dy, dx);
    
    const projectile = new Projectile(
      this.x, this.y, angle, 200
    );
  }
}
```

---

## Flying Enemy

```typescript
class FlyingEnemy {
  baseY: number;
  time: number = 0;
  
  update(dt: number) {
    this.time += dt;
    
    // Hover
    this.y = this.baseY + Math.sin(this.time * 2) * 20;
    
    // No gravity applied
  }
}
```

---

## Stomping

```typescript
checkStomp(player: Player): boolean {
  return (
    player.y + player.height <= this.y + 10 &&
    player.velocityY > 0 &&
    player.x < this.x + this.width &&
    player.x + player.width > this.x
  );
}

onStomp(player: Player) {
  this.defeated = true;
  player.velocityY = -250; // Bounce
  score.add(100);
}
```

---

## Common Values

| Enemy Type | Speed | Range | Attack Interval |
|------------|-------|-------|-----------------|
| Goomba | 50 | - | - |
| Chase | 100 | 200 | - |
| Ranged | 30 | 300 | 2.0s |
| Flying | 50 | 250 | - |
| Boss | varies | varies | 1-3s |

| AI Behavior | Typical Range |
|-------------|---------------|
| Vision Range | 200-300px |
| Chase Range | 150-250px |
| Attack Range | 50-100px (melee), 200-400px (ranged) |
| Flee Range | 100-150px |

---

## State Transitions

```
Common State Flow:

Patrol → Alert → Chase → Attack
  ↑                         ↓
  ←──────── Return ─────────┘

Or with Flee:

Patrol → Alert → Chase → Attack
  ↑        ↓
  └── Flee (if low health)
```

---

## Performance Tips

**Spatial Culling:**
```typescript
isNearCamera(camera: Camera): boolean {
  const buffer = 100;
  return (
    this.x > camera.x - buffer &&
    this.x < camera.x + camera.width + buffer
  );
}
```

**Update Frequency:**
```typescript
// Update AI less frequently if far from player
const updateInterval = this.distanceTo(player) < 300 ? 0.016 : 0.1;
```

---

## Best Practices

✅ **Do:**
- Start with simple patrol
- Use state machines for complex AI
- Optimize with spatial culling
- Add visual feedback for state
- Test AI balance carefully

❌ **Don't:**
- Update all enemies every frame
- Use complex pathfinding for simple enemies
- Make enemies unfair or frustrating
- Forget to handle edge cases
- Skip collision with other enemies
