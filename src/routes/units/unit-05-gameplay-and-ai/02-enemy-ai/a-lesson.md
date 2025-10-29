# Topic 02: Enemy AI

**Unit 05: Gameplay, AI & Interactions | Topic 02 of 04**

> **Learning Objective:** Master the implementation of enemy AI systems including patrol behaviors, chase mechanics, jump AI, attack patterns, and state machines for creating engaging enemy encounters in your Mario-style platformer.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Basic AI Patterns](#basic-ai-patterns)
4. [State Machines](#state-machines)
5. [Pathfinding](#pathfinding)
6. [Advanced Behaviors](#advanced-behaviors)
7. [Performance Considerations](#performance-considerations)
8. [Application to Mario Game](#application-to-mario-game)
9. [Summary](#summary)
10. [Next Steps](#next-steps)

---

## Introduction

### What and Why

Enemy AI creates challenge and engagement:

- **Creates obstacles** that require skill to overcome
- **Adds variety** through different behavior patterns
- **Enables difficulty progression** from easy to hard
- **Makes levels dynamic** and unpredictable
- **Rewards player skill** in pattern recognition

In Super Mario Bros., enemies like Goombas, Koopas, and Hammer Bros each have distinct behaviors that create unique challenges.

### What You'll Learn

By the end of this lesson, you will be able to:

- ✅ Implement patrol AI (walk back and forth)
- ✅ Create chase mechanics (follow the player)
- ✅ Build jump AI (platform navigation)
- ✅ Design attack patterns (projectiles, charges)
- ✅ Use state machines for complex behaviors
- ✅ Add line-of-sight detection
- ✅ Implement basic pathfinding
- ✅ Create enemy variants with different AI
- ✅ Optimize AI performance for many enemies

### Prerequisites

Before starting this topic, you should understand:

- **Entity management** (Unit 03, Topic 03)
- **Collision detection** (Unit 04, Topic 02)
- **State management** (Unit 01, Topic 04)
- **Physics systems** (Unit 02)

### Time Investment

- **Reading:** 90 minutes
- **Exercises:** 4-5 hours
- **Practice Project:** 6-8 hours

---

## Core Concepts

### AI Fundamentals

#### 1. **Perception**

Enemies need to sense their environment:

```
Enemy Vision Cone:

         Player
           👤
          / \
         /   \
        /     \
       /  🔍  \  ← Vision cone
      /         \
     +-----------+
     |    👾    |
     |  Enemy   |
     +-----------+
```

**Common perception types:**
- **Distance check** - Is player close?
- **Line of sight** - Can enemy see player?
- **Hearing** - Did player make noise?
- **Tile checks** - Is there a wall/pit ahead?

#### 2. **Decision Making**

Based on perception, choose actions:

```
Decision Tree:

Can see player?
├── Yes → Is player close?
│   ├── Yes → ATTACK
│   └── No → CHASE
└── No → Is at edge?
    ├── Yes → TURN AROUND
    └── No → PATROL
```

#### 3. **Action Execution**

Perform the chosen behavior:

```typescript
enum EnemyAction {
  Idle,
  Patrol,
  Chase,
  Attack,
  Flee,
  Dead
}
```

---

## Basic AI Patterns

### Pattern 1: Simple Patrol (Goomba)

Most basic enemy: walks back and forth.

```typescript
class PatrolEnemy {
  x: number;
  y: number;
  width: number = 32;
  height: number = 32;
  velocityX: number = 50;
  velocityY: number = 0;
  direction: number = 1; // 1 = right, -1 = left

  update(deltaTime: number, tilemap: Tilemap): void {
    // Move horizontally
    this.x += this.velocityX * this.direction * deltaTime;

    // Apply gravity
    this.velocityY += 500 * deltaTime;
    this.y += this.velocityY * deltaTime;

    // Ground collision
    if (this.y > 550) {
      this.y = 550;
      this.velocityY = 0;
    }

    // Turn around at edges or walls
    if (this.shouldTurnAround(tilemap)) {
      this.direction *= -1;
    }
  }

  shouldTurnAround(tilemap: Tilemap): boolean {
    // Check for edge
    const nextX = this.x + this.direction * this.width;
    const belowY = this.y + this.height + 5;
    
    if (!tilemap.isSolid(nextX, belowY)) {
      return true; // Edge detected
    }

    // Check for wall
    const wallX = this.x + this.direction * (this.width + 5);
    if (tilemap.isSolid(wallX, this.y)) {
      return true; // Wall detected
    }

    return false;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'brown';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
```

---

### Pattern 2: Chase Player

Enemy follows player when in range.

```typescript
class ChaseEnemy extends PatrolEnemy {
  chaseRange: number = 200;
  chaseSpeed: number = 100;
  patrolSpeed: number = 50;

  update(deltaTime: number, player: Player, tilemap: Tilemap): void {
    const distanceToPlayer = this.distanceTo(player);

    if (distanceToPlayer < this.chaseRange) {
      // Chase mode
      this.chase(player, deltaTime);
    } else {
      // Patrol mode
      this.velocityX = this.patrolSpeed;
      super.update(deltaTime, tilemap);
    }
  }

  chase(player: Player, deltaTime: number): void {
    // Move toward player
    if (player.x < this.x) {
      this.direction = -1;
    } else {
      this.direction = 1;
    }

    this.velocityX = this.chaseSpeed;
    this.x += this.velocityX * this.direction * deltaTime;
  }

  distanceTo(player: Player): number {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
```

---

### Pattern 3: Jump AI

Enemy can jump over obstacles or onto platforms.

```typescript
class JumpingEnemy extends PatrolEnemy {
  jumpForce: number = -300;
  isGrounded: boolean = false;

  update(deltaTime: number, tilemap: Tilemap): void {
    super.update(deltaTime, tilemap);

    // Check if should jump
    if (this.isGrounded && this.shouldJump(tilemap)) {
      this.jump();
    }
  }

  shouldJump(tilemap: Tilemap): boolean {
    // Jump if there's an obstacle ahead
    const obstacleX = this.x + this.direction * (this.width + 10);
    const obstacleY = this.y;

    return tilemap.isSolid(obstacleX, obstacleY);
  }

  jump(): void {
    this.velocityY = this.jumpForce;
    this.isGrounded = false;
  }
}
```

---

### Pattern 4: Ranged Attacker

Enemy shoots projectiles at player.

```typescript
class Projectile {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  width: number = 8;
  height: number = 8;

  constructor(x: number, y: number, angle: number, speed: number) {
    this.x = x;
    this.y = y;
    this.velocityX = Math.cos(angle) * speed;
    this.velocityY = Math.sin(angle) * speed;
  }

  update(deltaTime: number): void {
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

class RangedEnemy extends PatrolEnemy {
  shootCooldown: number = 0;
  shootInterval: number = 2.0; // Shoot every 2 seconds
  projectiles: Projectile[] = [];
  attackRange: number = 300;

  update(deltaTime: number, player: Player, tilemap: Tilemap): void {
    super.update(deltaTime, tilemap);

    // Update cooldown
    this.shootCooldown -= deltaTime;

    // Shoot at player if in range
    const distance = this.distanceTo(player);
    if (distance < this.attackRange && this.shootCooldown <= 0) {
      this.shoot(player);
      this.shootCooldown = this.shootInterval;
    }

    // Update projectiles
    this.projectiles = this.projectiles.filter(p => {
      p.update(deltaTime);
      return this.isOnScreen(p);
    });
  }

  shoot(player: Player): void {
    // Calculate angle to player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const angle = Math.atan2(dy, dx);

    // Create projectile
    const projectile = new Projectile(this.x, this.y, angle, 200);
    this.projectiles.push(projectile);
  }

  isOnScreen(projectile: Projectile): boolean {
    return projectile.x >= 0 && projectile.x <= 800;
  }

  distanceTo(player: Player): number {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
```

---

## State Machines

For complex behaviors, use state machines:

```typescript
enum EnemyState {
  Idle,
  Patrol,
  Alert,
  Chase,
  Attack,
  Flee,
  Stunned,
  Dead
}

class StateMachineEnemy {
  x: number = 0;
  y: number = 0;
  state: EnemyState = EnemyState.Patrol;
  stateTime: number = 0;

  update(deltaTime: number, player: Player, tilemap: Tilemap): void {
    this.stateTime += deltaTime;

    switch (this.state) {
      case EnemyState.Patrol:
        this.updatePatrol(deltaTime, player, tilemap);
        break;
      case EnemyState.Alert:
        this.updateAlert(deltaTime, player);
        break;
      case EnemyState.Chase:
        this.updateChase(deltaTime, player, tilemap);
        break;
      case EnemyState.Attack:
        this.updateAttack(deltaTime, player);
        break;
      case EnemyState.Flee:
        this.updateFlee(deltaTime, player, tilemap);
        break;
      case EnemyState.Stunned:
        this.updateStunned(deltaTime);
        break;
    }
  }

  changeState(newState: EnemyState): void {
    console.log(`State: ${EnemyState[this.state]} → ${EnemyState[newState]}`);
    this.state = newState;
    this.stateTime = 0;
  }

  updatePatrol(deltaTime: number, player: Player, tilemap: Tilemap): void {
    // Simple patrol logic
    this.x += 50 * deltaTime;

    // If player is close, become alert
    if (this.distanceTo(player) < 150) {
      this.changeState(EnemyState.Alert);
    }
  }

  updateAlert(deltaTime: number, player: Player): void {
    // Stop and look around for 1 second
    if (this.stateTime > 1.0) {
      this.changeState(EnemyState.Chase);
    }
  }

  updateChase(deltaTime: number, player: Player, tilemap: Tilemap): void {
    // Move toward player faster
    const direction = player.x > this.x ? 1 : -1;
    this.x += 100 * direction * deltaTime;

    // If close enough, attack
    if (this.distanceTo(player) < 50) {
      this.changeState(EnemyState.Attack);
    }

    // If player escapes, return to patrol
    if (this.distanceTo(player) > 300) {
      this.changeState(EnemyState.Patrol);
    }
  }

  updateAttack(deltaTime: number, player: Player): void {
    // Attack animation lasts 0.5 seconds
    if (this.stateTime > 0.5) {
      // Damage player
      if (this.distanceTo(player) < 50) {
        player.takeDamage();
      }
      this.changeState(EnemyState.Chase);
    }
  }

  updateFlee(deltaTime: number, player: Player, tilemap: Tilemap): void {
    // Run away from player
    const direction = player.x > this.x ? -1 : 1;
    this.x += 150 * direction * deltaTime;

    // If far enough, return to patrol
    if (this.distanceTo(player) > 400) {
      this.changeState(EnemyState.Patrol);
    }
  }

  updateStunned(deltaTime: number): void {
    // Stunned for 2 seconds
    if (this.stateTime > 2.0) {
      this.changeState(EnemyState.Patrol);
    }
  }

  distanceTo(player: Player): number {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Different color based on state
    switch (this.state) {
      case EnemyState.Patrol:
        ctx.fillStyle = 'brown';
        break;
      case EnemyState.Alert:
        ctx.fillStyle = 'orange';
        break;
      case EnemyState.Chase:
        ctx.fillStyle = 'red';
        break;
      case EnemyState.Attack:
        ctx.fillStyle = 'darkred';
        break;
      case EnemyState.Flee:
        ctx.fillStyle = 'yellow';
        break;
      case EnemyState.Stunned:
        ctx.fillStyle = 'gray';
        break;
    }

    ctx.fillRect(this.x, this.y, 32, 32);
  }
}
```

---

## Line of Sight

Check if enemy can actually see the player:

```typescript
class VisionEnemy {
  visionRange: number = 200;
  visionAngle: number = Math.PI / 3; // 60 degrees

  canSeePlayer(player: Player, tilemap: Tilemap): boolean {
    // Check distance
    const distance = this.distanceTo(player);
    if (distance > this.visionRange) return false;

    // Check angle
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const angleToPlayer = Math.atan2(dy, dx);
    const facingAngle = this.direction > 0 ? 0 : Math.PI;

    const angleDiff = Math.abs(angleToPlayer - facingAngle);
    if (angleDiff > this.visionAngle) return false;

    // Check line of sight (no walls blocking)
    return !tilemap.raycast(
      this.x + this.width / 2,
      this.y + this.height / 2,
      player.x + player.width / 2,
      player.y + player.height / 2
    );
  }

  distanceTo(player: Player): number {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
```

---

## Pathfinding

For smarter navigation:

```typescript
class PathfindingEnemy {
  path: {x: number, y: number}[] = [];
  pathIndex: number = 0;

  findPathToPlayer(player: Player, tilemap: Tilemap): void {
    // Simplified A* pathfinding
    const start = {
      x: Math.floor(this.x / 32),
      y: Math.floor(this.y / 32)
    };
    const goal = {
      x: Math.floor(player.x / 32),
      y: Math.floor(player.y / 32)
    };

    this.path = this.aStar(start, goal, tilemap);
    this.pathIndex = 0;
  }

  followPath(deltaTime: number): void {
    if (this.pathIndex >= this.path.length) return;

    const target = this.path[this.pathIndex];
    const targetX = target.x * 32;
    const targetY = target.y * 32;

    // Move toward current waypoint
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      // Reached waypoint, move to next
      this.pathIndex++;
    } else {
      // Move toward waypoint
      this.x += (dx / distance) * 100 * deltaTime;
      this.y += (dy / distance) * 100 * deltaTime;
    }
  }

  aStar(start: {x: number, y: number}, goal: {x: number, y: number}, tilemap: Tilemap): {x: number, y: number}[] {
    // Simplified A* implementation
    // (In real game, use proper A* library or implementation)
    return [start, goal]; // Placeholder
  }
}
```

---

## Flying Enemies

Enemies that don't follow ground physics:

```typescript
class FlyingEnemy {
  x: number;
  y: number;
  targetY: number;
  hoverAmplitude: number = 20;
  hoverSpeed: number = 2;
  time: number = 0;

  update(deltaTime: number, player: Player): void {
    this.time += deltaTime;

    // Hover up and down
    this.targetY = this.y + Math.sin(this.time * this.hoverSpeed) * this.hoverAmplitude;

    // Move toward player horizontally
    if (this.distanceTo(player) < 300) {
      const direction = player.x > this.x ? 1 : -1;
      this.x += 50 * direction * deltaTime;
    }
  }

  distanceTo(player: Player): number {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'purple';
    ctx.fillRect(this.x, this.targetY, 32, 32);
  }
}
```

---

## Boss Patterns

Complex multi-phase boss fights:

```typescript
enum BossPhase {
  Phase1,
  Phase2,
  Phase3
}

class BossEnemy {
  health: number = 100;
  phase: BossPhase = BossPhase.Phase1;
  attackPattern: number = 0;
  attackCooldown: number = 0;

  update(deltaTime: number, player: Player): void {
    // Update phase based on health
    if (this.health < 70 && this.phase === BossPhase.Phase1) {
      this.changePhase(BossPhase.Phase2);
    } else if (this.health < 30 && this.phase === BossPhase.Phase2) {
      this.changePhase(BossPhase.Phase3);
    }

    // Execute attack pattern based on phase
    this.attackCooldown -= deltaTime;
    if (this.attackCooldown <= 0) {
      this.executeAttack(player);
      this.attackCooldown = this.getAttackInterval();
    }
  }

  changePhase(newPhase: BossPhase): void {
    console.log(`Boss entering phase ${newPhase + 1}`);
    this.phase = newPhase;
    this.attackPattern = 0;
  }

  executeAttack(player: Player): void {
    switch (this.phase) {
      case BossPhase.Phase1:
        this.phase1Attack(player);
        break;
      case BossPhase.Phase2:
        this.phase2Attack(player);
        break;
      case BossPhase.Phase3:
        this.phase3Attack(player);
        break;
    }
  }

  phase1Attack(player: Player): void {
    // Simple projectile
    console.log('Phase 1: Single projectile');
  }

  phase2Attack(player: Player): void {
    // Triple projectile spread
    console.log('Phase 2: Triple shot');
  }

  phase3Attack(player: Player): void {
    // Charge attack + projectiles
    console.log('Phase 3: Charge + barrage');
  }

  getAttackInterval(): number {
    switch (this.phase) {
      case BossPhase.Phase1: return 3.0;
      case BossPhase.Phase2: return 2.0;
      case BossPhase.Phase3: return 1.0;
    }
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.defeat();
    }
  }

  defeat(): void {
    console.log('Boss defeated!');
  }
}
```

---

## Performance Considerations

### Optimization Techniques

1. **Update only nearby enemies**
```typescript
class EnemyManager {
  enemies: Enemy[] = [];

  update(deltaTime: number, camera: Camera, player: Player): void {
    for (const enemy of this.enemies) {
      // Only update if on screen or nearby
      if (this.isNearCamera(enemy, camera)) {
        enemy.update(deltaTime, player);
      }
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

2. **Spatial partitioning**
```typescript
class EnemyGrid {
  grid: Map<string, Enemy[]> = new Map();
  cellSize: number = 128;

  getCell(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return `${cx},${cy}`;
  }

  getNearbyEnemies(x: number, y: number): Enemy[] {
    const cell = this.getCell(x, y);
    return this.grid.get(cell) || [];
  }
}
```

---

## Application to Mario Game

### Goomba

```typescript
class Goomba extends PatrolEnemy {
  // Simple patrol, turn at edges
  defeated: boolean = false;

  onStomp(): void {
    this.defeated = true;
    // Play squish animation
  }
}
```

### Koopa Troopa

```typescript
class Koopa extends PatrolEnemy {
  inShell: boolean = false;
  shellSpeed: number = 200;

  onStomp(): void {
    if (!this.inShell) {
      this.inShell = true;
      this.velocityX = 0;
    } else {
      // Kick shell
      this.velocityX = this.shellSpeed;
    }
  }
}
```

### Hammer Bro

```typescript
class HammerBro extends JumpingEnemy {
  hammers: Projectile[] = [];

  update(deltaTime: number, player: Player): void {
    super.update(deltaTime, player);

    // Throw hammers
    if (this.canSeePlayer(player)) {
      this.throwHammer(player);
    }
  }
}
```

---

## Summary

### What You've Learned

- ✅ Basic patrol AI patterns
- ✅ Chase and follow behaviors
- ✅ Jump and obstacle navigation
- ✅ Attack patterns and projectiles
- ✅ State machine architecture
- ✅ Line of sight detection
- ✅ Basic pathfinding concepts
- ✅ Performance optimization for many enemies

### Key Takeaways

1. **Start simple** - Patrol is often enough
2. **Use state machines** for complex behaviors
3. **Add variety** with different AI types
4. **Optimize** by culling off-screen enemies
5. **Test balance** - make enemies challenging but fair

---

## Next Steps

**Next Topic:** Scoring and Lives System

Continue to `03-scoring-and-lives/a-lesson.md` to learn about:
- Score tracking and display
- Life system implementation
- High score persistence
- Score multipliers and combos
