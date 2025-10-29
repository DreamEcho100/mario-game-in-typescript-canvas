# Topic 02: Enemy AI - Solutions

Complete solutions for all enemy AI exercises.

---

## Exercise 1 Solution: Basic Patrol Enemy

```typescript
class PatrolEnemy {
  x: number;
  y: number;
  width: number = 32;
  height: number = 32;
  velocityX: number = 50;
  velocityY: number = 0;
  direction: number = 1;
  gravity: number = 500;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(deltaTime: number, tilemap: Tilemap): void {
    // Horizontal movement
    this.x += this.velocityX * this.direction * deltaTime;

    // Gravity
    this.velocityY += this.gravity * deltaTime;
    this.y += this.velocityY * deltaTime;

    // Ground collision
    const groundY = 550;
    if (this.y + this.height > groundY) {
      this.y = groundY - this.height;
      this.velocityY = 0;
    }

    // Wall collision
    if (this.checkWall(tilemap)) {
      this.direction *= -1;
    }
  }

  checkWall(tilemap: Tilemap): boolean {
    const checkX = this.x + (this.direction > 0 ? this.width : 0);
    return tilemap.isSolid(checkX, this.y + this.height / 2);
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'brown';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
```

---

## Exercise 2 Solution: Edge Detection

```typescript
class SmartPatrolEnemy extends PatrolEnemy {
  checkEdge(tilemap: Tilemap): boolean {
    // Check ground ahead
    const checkX = this.x + (this.direction > 0 ? this.width + 5 : -5);
    const checkY = this.y + this.height + 5;
    
    return !tilemap.isSolid(checkX, checkY);
  }

  update(deltaTime: number, tilemap: Tilemap): void {
    super.update(deltaTime, tilemap);

    // Turn at edges
    if (this.checkEdge(tilemap)) {
      this.direction *= -1;
    }
  }
}
```

---

## Exercise 3 Solution: Chase Player

```typescript
class ChaseEnemy extends SmartPatrolEnemy {
  chaseRange: number = 200;
  chasing: boolean = false;
  chaseSpeed: number = 100;

  update(deltaTime: number, player: Player, tilemap: Tilemap): void {
    const distance = this.distanceTo(player);

    if (distance < this.chaseRange) {
      this.chasing = true;
      this.chase(player, deltaTime);
    } else {
      this.chasing = false;
      super.update(deltaTime, tilemap);
    }
  }

  chase(player: Player, deltaTime: number): void {
    // Face player
    this.direction = player.x > this.x ? 1 : -1;
    
    // Move faster
    this.x += this.chaseSpeed * this.direction * deltaTime;
  }

  distanceTo(player: Player): number {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.chasing ? 'red' : 'brown';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
```

---

## Exercise 4 Solution: Line of Sight

```typescript
class VisionEnemy extends ChaseEnemy {
  visionRange: number = 250;
  visionAngle: number = Math.PI / 3; // 60 degrees

  canSeePlayer(player: Player, tilemap: Tilemap): boolean {
    const distance = this.distanceTo(player);
    if (distance > this.visionRange) return false;

    // Check angle
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const angleToPlayer = Math.atan2(dy, dx);
    const facingAngle = this.direction > 0 ? 0 : Math.PI;
    
    const angleDiff = Math.abs(angleToPlayer - facingAngle);
    if (angleDiff > this.visionAngle) return false;

    // Raycast for walls
    return !this.hasWallBetween(player, tilemap);
  }

  hasWallBetween(player: Player, tilemap: Tilemap): boolean {
    const centerX1 = this.x + this.width / 2;
    const centerY1 = this.y + this.height / 2;
    const centerX2 = player.x + player.width / 2;
    const centerY2 = player.y + player.height / 2;

    return tilemap.raycast(centerX1, centerY1, centerX2, centerY2);
  }

  update(deltaTime: number, player: Player, tilemap: Tilemap): void {
    if (this.canSeePlayer(player, tilemap)) {
      this.chasing = true;
      this.chase(player, deltaTime);
    } else {
      this.chasing = false;
      super.update(deltaTime, tilemap);
    }
  }
}
```

---

## Exercise 5 Solution: Jumping Enemy

```typescript
class JumpingEnemy extends SmartPatrolEnemy {
  jumpForce: number = -300;
  canJump: boolean = true;

  update(deltaTime: number, tilemap: Tilemap): void {
    super.update(deltaTime, tilemap);

    // Check if grounded
    this.canJump = this.velocityY === 0;

    // Jump over obstacles
    if (this.canJump && this.shouldJump(tilemap)) {
      this.jump();
    }
  }

  shouldJump(tilemap: Tilemap): boolean {
    const obstacleX = this.x + this.direction * (this.width + 5);
    const obstacleY = this.y;
    
    return tilemap.isSolid(obstacleX, obstacleY);
  }

  jump(): void {
    this.velocityY = this.jumpForce;
    this.canJump = false;
  }
}
```

---

## Exercise 6 Solution: Ranged Attacker

```typescript
class Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean = true;

  constructor(x: number, y: number, angle: number, speed: number) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  update(deltaTime: number): void {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Remove if off screen
    if (this.x < 0 || this.x > 800) this.alive = false;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

class RangedEnemy extends SmartPatrolEnemy {
  attackRange: number = 300;
  shootCooldown: number = 0;
  shootInterval: number = 2.0;
  projectiles: Projectile[] = [];

  update(deltaTime: number, player: Player, tilemap: Tilemap): void {
    super.update(deltaTime, tilemap);

    this.shootCooldown -= deltaTime;

    // Shoot at player
    if (this.distanceTo(player) < this.attackRange && this.shootCooldown <= 0) {
      this.shoot(player);
      this.shootCooldown = this.shootInterval;
    }

    // Update projectiles
    this.projectiles = this.projectiles.filter(p => {
      p.update(deltaTime);
      return p.alive;
    });
  }

  shoot(player: Player): void {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const angle = Math.atan2(dy, dx);

    this.projectiles.push(new Projectile(
      this.x + this.width / 2,
      this.y + this.height / 2,
      angle,
      200
    ));
  }

  render(ctx: CanvasRenderingContext2D): void {
    super.render(ctx);
    this.projectiles.forEach(p => p.render(ctx));
  }
}
```

---

## Exercise 7 Solution: State Machine

```typescript
enum EnemyState {
  Idle,
  Patrol,
  Alert,
  Chase,
  Attack
}

class StateMachineEnemy {
  x: number = 0;
  y: number = 0;
  state: EnemyState = EnemyState.Patrol;
  stateTime: number = 0;
  direction: number = 1;

  update(deltaTime: number, player: Player): void {
    this.stateTime += deltaTime;

    switch (this.state) {
      case EnemyState.Idle:
        if (this.stateTime > 2.0) this.changeState(EnemyState.Patrol);
        break;
        
      case EnemyState.Patrol:
        this.x += 50 * this.direction * deltaTime;
        if (this.distanceTo(player) < 150) this.changeState(EnemyState.Alert);
        break;
        
      case EnemyState.Alert:
        if (this.stateTime > 1.0) this.changeState(EnemyState.Chase);
        break;
        
      case EnemyState.Chase:
        this.direction = player.x > this.x ? 1 : -1;
        this.x += 100 * this.direction * deltaTime;
        if (this.distanceTo(player) < 50) this.changeState(EnemyState.Attack);
        if (this.distanceTo(player) > 300) this.changeState(EnemyState.Patrol);
        break;
        
      case EnemyState.Attack:
        if (this.stateTime > 0.5) this.changeState(EnemyState.Chase);
        break;
    }
  }

  changeState(newState: EnemyState): void {
    this.state = newState;
    this.stateTime = 0;
  }

  distanceTo(player: Player): number {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  render(ctx: CanvasRenderingContext2D): void {
    const colors = ['gray', 'brown', 'orange', 'red', 'darkred'];
    ctx.fillStyle = colors[this.state];
    ctx.fillRect(this.x, this.y, 32, 32);
  }
}
```

---

## Exercise 8 Solution: Flying Enemy

```typescript
class FlyingEnemy {
  x: number;
  y: number;
  baseY: number;
  time: number = 0;
  hoverHeight: number = 20;
  hoverSpeed: number = 2;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.baseY = y;
  }

  update(deltaTime: number, player: Player): void {
    this.time += deltaTime;

    // Hover up and down
    this.y = this.baseY + Math.sin(this.time * this.hoverSpeed) * this.hoverHeight;

    // Follow player horizontally
    if (Math.abs(player.x - this.x) < 300) {
      const direction = player.x > this.x ? 1 : -1;
      this.x += 50 * direction * deltaTime;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'purple';
    ctx.fillRect(this.x, this.y, 32, 32);
  }
}
```

---

## Exercise 9 Solution: Pathfinding Enemy

```typescript
class PathfindingEnemy {
  x: number;
  y: number;
  path: {x: number, y: number}[] = [];
  pathIndex: number = 0;

  findPath(player: Player, tilemap: Tilemap): void {
    // Simplified pathfinding
    this.path = [];
    this.pathIndex = 0;

    const start = {x: Math.floor(this.x / 32), y: Math.floor(this.y / 32)};
    const goal = {x: Math.floor(player.x / 32), y: Math.floor(player.y / 32)};

    // Simple direct path (real implementation would use A*)
    this.path.push(start);
    this.path.push(goal);
  }

  update(deltaTime: number, player: Player): void {
    if (this.path.length === 0) {
      this.findPath(player, null!);
    }

    if (this.pathIndex < this.path.length) {
      const target = this.path[this.pathIndex];
      const targetX = target.x * 32 + 16;
      const targetY = target.y * 32 + 16;

      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) {
        this.pathIndex++;
      } else {
        this.x += (dx / dist) * 80 * deltaTime;
        this.y += (dy / dist) * 80 * deltaTime;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'green';
    ctx.fillRect(this.x, this.y, 32, 32);

    // Draw path
    ctx.strokeStyle = 'lime';
    ctx.beginPath();
    for (let i = 0; i < this.path.length; i++) {
      const p = this.path[i];
      const px = p.x * 32 + 16;
      const py = p.y * 32 + 16;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
}
```

---

## Exercise 10 Solution: Coward Enemy

```typescript
class CowardEnemy extends SmartPatrolEnemy {
  fleeRange: number = 150;
  fleeing: boolean = false;

  update(deltaTime: number, player: Player, tilemap: Tilemap): void {
    const distance = this.distanceTo(player);

    if (distance < this.fleeRange) {
      this.fleeing = true;
      this.flee(player, deltaTime);
    } else {
      this.fleeing = false;
      super.update(deltaTime, tilemap);
    }
  }

  flee(player: Player, deltaTime: number): void {
    // Run away from player
    this.direction = player.x > this.x ? -1 : 1;
    this.x += 150 * this.direction * deltaTime;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.fleeing ? 'yellow' : 'orange';
    ctx.fillRect(this.x, this.y, 32, 32);
  }
}
```

---

## Exercise 11 Solution: Boss Enemy

```typescript
enum BossPhase {
  Phase1,
  Phase2,
  Phase3
}

class BossEnemy {
  x: number = 400;
  y: number = 200;
  health: number = 100;
  maxHealth: number = 100;
  phase: BossPhase = BossPhase.Phase1;
  attackTimer: number = 0;

  update(deltaTime: number, player: Player): void {
    // Update phase
    if (this.health < 70 && this.phase === BossPhase.Phase1) {
      this.phase = BossPhase.Phase2;
    } else if (this.health < 30 && this.phase === BossPhase.Phase2) {
      this.phase = BossPhase.Phase3;
    }

    // Attack pattern
    this.attackTimer -= deltaTime;
    if (this.attackTimer <= 0) {
      this.attack(player);
      this.attackTimer = this.getAttackInterval();
    }
  }

  attack(player: Player): void {
    console.log(`Boss ${BossPhase[this.phase]} attack!`);
  }

  getAttackInterval(): number {
    return [3.0, 2.0, 1.0][this.phase];
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      console.log('Boss defeated!');
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const colors = ['blue', 'orange', 'red'];
    ctx.fillStyle = colors[this.phase];
    ctx.fillRect(this.x, this.y, 64, 64);

    // Health bar
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y - 10, 64, 5);
    ctx.fillStyle = 'green';
    ctx.fillRect(this.x, this.y - 10, 64 * (this.health / this.maxHealth), 5);
  }
}
```

---

## Exercise 12 Solution: Stomping Mechanic

```typescript
class StompableEnemy extends PatrolEnemy {
  defeated: boolean = false;

  checkStomp(player: Player): boolean {
    if (this.defeated) return false;

    // Check if player is above and falling
    const isAbove = player.y + player.height <= this.y + 10;
    const isFalling = player.velocityY > 0;
    const overlapsX = (
      player.x < this.x + this.width &&
      player.x + player.width > this.x
    );

    if (isAbove && isFalling && overlapsX) {
      this.onStomp(player);
      return true;
    }
    return false;
  }

  onStomp(player: Player): void {
    this.defeated = true;
    player.velocityY = -250; // Bounce
    // Award points, play sound, etc.
  }

  update(deltaTime: number, tilemap: Tilemap): void {
    if (!this.defeated) {
      super.update(deltaTime, tilemap);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.defeated) {
      // Squished sprite
      ctx.fillStyle = 'brown';
      ctx.fillRect(this.x, this.y + 20, this.width, 12);
    } else {
      super.render(ctx);
    }
  }
}
```

---

## Performance Tips

- Update only enemies near camera
- Use spatial partitioning for collision checks
- Object pool for projectiles
- Simplify AI when off-screen
- Limit pathfinding frequency
