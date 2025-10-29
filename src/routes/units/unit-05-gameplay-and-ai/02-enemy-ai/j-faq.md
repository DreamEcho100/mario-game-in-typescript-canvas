# Topic 02: Enemy AI - FAQ

---

## Q1: Should all enemies use the same AI?

**A**: No! Variety creates better gameplay:

**Different AI types:**
- **Goomba:** Simple patrol (beginner-friendly)
- **Koopa:** Patrol + shell mechanic
- **Piranha Plant:** Stationary, timed attacks
- **Hammer Bro:** Ranged attacker with jumps
- **Boo:** Chase when not looking, stop when looking

Mix different types to keep gameplay interesting!

---

## Q2: How do I make AI feel "smart" without complex pathfinding?

**A**: Use simple tricks:

```typescript
// Predict player movement
const predictedX = player.x + player.velocityX * 0.5;
const predictedY = player.y + player.velocityY * 0.5;

// Aim at predicted position
const dx = predictedX - this.x;
const dy = predictedY - this.y;
const angle = Math.atan2(dy, dx);

// Add slight randomness
const inaccuracy = (Math.random() - 0.5) * 0.2;
this.shoot(angle + inaccuracy);
```

**Other tricks:**
- React to player actions (jump when player jumps)
- Use different speeds based on distance
- Add patrol points that flank player
- Change behavior when damaged

---

## Q3: Should enemies collide with each other?

**A**: Depends on game design:

**Yes (more realistic):**
```typescript
checkEnemyCollisions(enemies: Enemy[]): void {
  for (const other of enemies) {
    if (other === this) continue;
    
    if (this.collidesWith(other)) {
      // Simple push apart
      const dx = this.x - other.x;
      this.x += Math.sign(dx) * 2;
    }
  }
}
```

**No (Mario-style):**
- Enemies can overlap
- Simpler code
- Less performance cost
- Players don't notice

**Hybrid:**
- Some enemies collide (shells)
- Others don't (Goombas)

---

## Q4: How do I prevent enemies from shooting too much?

**A**: Use cooldowns and limits:

```typescript
class RangedEnemy {
  shootCooldown: number = 0;
  shootInterval: number = 2.0;
  maxProjectiles: number = 3;
  projectiles: Projectile[] = [];
  
  update(deltaTime: number, player: Player): void {
    this.shootCooldown -= deltaTime;
    
    // Only shoot if cooldown ready AND not too many projectiles
    if (this.shootCooldown <= 0 && 
        this.projectiles.length < this.maxProjectiles &&
        this.canSeePlayer(player)) {
      this.shoot(player);
      this.shootCooldown = this.shootInterval;
    }
  }
}
```

---

## Q5: Should enemies detect player above/below?

**A**: Usually yes, with limits:

```typescript
canSeePlayer(player: Player): boolean {
  const dx = Math.abs(player.x - this.x);
  const dy = Math.abs(player.y - this.y);
  
  // Horizontal range wider than vertical
  if (dx > 300) return false;
  if (dy > 150) return false;
  
  // Check line of sight
  return !this.hasWallBetween(player);
}
```

**Alternative:** Only detect on same platform:
```typescript
const onSamePlatform = Math.abs(player.y - this.y) < 50;
```

---

## Q6: How do I make a "sleeping" enemy that wakes up?

**A**: Use distance trigger + animation:

```typescript
class SleepingEnemy extends PatrolEnemy {
  awake: boolean = false;
  wakeDistance: number = 150;
  
  update(deltaTime: number, player: Player): void {
    if (!this.awake) {
      if (this.distanceTo(player) < this.wakeDistance) {
        this.awake = true;
        // Play wake animation
      }
      return;
    }
    
    // Normal AI when awake
    super.update(deltaTime, player);
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.awake) {
      // Draw sleeping sprite (Zzz)
      ctx.fillStyle = 'gray';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillText('Zzz', this.x, this.y - 10);
    } else {
      super.render(ctx);
    }
  }
}
```

---

## Q7: Should enemies have health or die in one hit?

**A**: Depends on difficulty and game style:

**One-hit (Mario-style):**
- Simpler code
- Faster gameplay
- Clear feedback
- Good for platformers

**Health system:**
```typescript
class ToughEnemy extends PatrolEnemy {
  health: number = 3;
  invincibleTime: number = 0;
  
  takeDamage(amount: number): void {
    if (this.invincibleTime > 0) return;
    
    this.health -= amount;
    this.invincibleTime = 0.5; // Brief invincibility
    
    if (this.health <= 0) {
      this.defeat();
    }
  }
  
  update(deltaTime: number): void {
    this.invincibleTime -= deltaTime;
    super.update(deltaTime);
  }
}
```

---

## Q8: How do I make enemies patrol between specific points?

**A**: Use waypoints:

```typescript
class WaypointEnemy {
  waypoints: {x: number, y: number}[] = [];
  currentWaypoint: number = 0;
  
  constructor(waypoints: {x: number, y: number}[]) {
    this.waypoints = waypoints;
    this.x = waypoints[0].x;
    this.y = waypoints[0].y;
  }
  
  update(deltaTime: number): void {
    const target = this.waypoints[this.currentWaypoint];
    
    // Move toward waypoint
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 5) {
      // Reached waypoint, go to next
      this.currentWaypoint = (this.currentWaypoint + 1) % this.waypoints.length;
    } else {
      this.x += (dx / distance) * 50 * deltaTime;
      this.y += (dy / distance) * 50 * deltaTime;
    }
  }
}

// Usage:
const enemy = new WaypointEnemy([
  {x: 100, y: 300},
  {x: 400, y: 300},
  {x: 400, y: 500},
  {x: 100, y: 500}
]);
```

---

## Q9: Should enemies respawn when player dies?

**A**: Usually yes:

```typescript
class EnemyManager {
  enemies: Enemy[] = [];
  initialEnemyData: {type: string, x: number, y: number}[] = [];
  
  reset(): void {
    this.enemies = [];
    
    // Respawn all enemies at original positions
    for (const data of this.initialEnemyData) {
      this.enemies.push(this.createEnemy(data));
    }
  }
  
  onPlayerDeath(): void {
    this.reset();
  }
}
```

**Exception:** Boss fights might keep progress

---

## Q10: How do I make AI harder as game progresses?

**A**: Difficulty scaling:

```typescript
class DifficultyManager {
  level: number = 1;
  
  getEnemySpeed(): number {
    return 50 + (this.level * 10); // Faster each level
  }
  
  getEnemyHealth(): number {
    return Math.min(1 + Math.floor(this.level / 3), 5); // More health
  }
  
  getSpawnRate(): number {
    return Math.max(3.0 - (this.level * 0.2), 1.0); // Spawn faster
  }
}

// When creating enemy:
const enemy = new Enemy();
enemy.speed = difficulty.getEnemySpeed();
enemy.health = difficulty.getEnemyHealth();
```

---

## Q11: Should enemies have knockback?

**A**: Good for feedback and gameplay:

```typescript
class KnockbackEnemy extends PatrolEnemy {
  knockbackX: number = 0;
  knockbackY: number = 0;
  
  applyKnockback(sourceX: number, amount: number): void {
    const direction = this.x > sourceX ? 1 : -1;
    this.knockbackX = direction * amount;
    this.knockbackY = -100; // Pop up slightly
  }
  
  update(deltaTime: number): void {
    // Apply knockback
    if (Math.abs(this.knockbackX) > 0) {
      this.x += this.knockbackX * deltaTime;
      this.knockbackX *= 0.9; // Friction
      
      if (Math.abs(this.knockbackX) < 5) {
        this.knockbackX = 0;
      }
    }
    
    this.y += this.knockbackY * deltaTime;
    this.knockbackY += 500 * deltaTime; // Gravity
    
    super.update(deltaTime);
  }
}
```

---

## Q12: How do I create "smart" bosses?

**A**: Multi-phase patterns + adaptation:

```typescript
class SmartBoss {
  phase: number = 0;
  attackPattern: string[] = ['shoot', 'charge', 'summon'];
  patternIndex: number = 0;
  playerJumpCount: number = 0;
  
  update(deltaTime: number, player: Player): void {
    // Adapt to player behavior
    if (this.playerJumpCount > 5) {
      // Player jumps a lot, use ground attacks
      this.attackPattern = ['stomp', 'shockwave'];
    }
    
    // Execute current attack
    this.executeAttack(this.attackPattern[this.patternIndex]);
    
    // Cycle through patterns
    if (this.attackFinished()) {
      this.patternIndex = (this.patternIndex + 1) % this.attackPattern.length;
    }
  }
}
```

---

## Q13: Should I use A* pathfinding?

**A**: Only if needed:

**Use simple chase for:**
- Straight-line pursuit
- Simple arena combat
- Flying enemies
- Mario-style platformers

**Use A* for:**
- Complex level layouts
- Tower defense
- Stealth games
- Top-down RPGs

**Middle ground:**
```typescript
// Simple "navigate around wall" logic
if (this.hasWallBetween(player)) {
  // Try going around
  const goUp = !tilemap.isSolid(this.x, this.y - 5);
  if (goUp) this.y -= 50 * deltaTime;
  else this.y += 50 * deltaTime;
} else {
  // Direct chase
  this.chase(player, deltaTime);
}
```

---

## Q14: How many enemy types should I have?

**A**: Quality over quantity:

**Recommended:**
- 3-5 basic enemy types
- 1-2 flying enemies
- 1-2 ranged enemies
- 1 mini-boss per world
- 1 final boss

**Each should feel different:**
- Different speed
- Different attack pattern
- Different weakness
- Different sprite/sound

---

## Q15: Should enemies avoid each other?

**A**: Only if it improves gameplay:

```typescript
avoidOthers(enemies: Enemy[], deltaTime: number): void {
  for (const other of enemies) {
    if (other === this) continue;
    
    const distance = this.distanceTo(other);
    if (distance < 50) {
      // Push apart
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const pushDistance = Math.sqrt(dx * dx + dy * dy);
      
      this.x += (dx / pushDistance) * 30 * deltaTime;
      this.y += (dy / pushDistance) * 30 * deltaTime;
    }
  }
}
```

**Usually not needed** for Mario-style games

---

## Best Practices

✅ **Do:**
- Start simple (patrol is often enough)
- Use state machines for clarity
- Add visual feedback for AI state
- Test difficulty balance
- Optimize with spatial culling
- Make enemies predictable but not boring

❌ **Don't:**
- Over-complicate AI
- Make enemies unfair
- Forget performance optimization
- Use complex pathfinding unnecessarily
- Make every enemy the same
- Forget to playtest extensively
