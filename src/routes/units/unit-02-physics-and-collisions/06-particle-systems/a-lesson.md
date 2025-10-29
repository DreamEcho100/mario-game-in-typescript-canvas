# Lesson: Particle Systems & Visual Effects

## Building on What You Know

This lesson combines concepts from multiple previous topics:

### From Unit 01-01: Canvas Rendering

You'll use **everything you learned about drawing**:

```typescript
// From Unit 01-01: You learned these canvas methods
ctx.fillRect(x, y, size, size);        // Draw particle square
ctx.arc(x, y, radius, 0, Math.PI * 2); // Draw particle circle
ctx.globalAlpha = 0.5;                 // Fade out particle
ctx.save() / ctx.restore();            // Save state for effects
```

Particles are just **hundreds of tiny shapes drawn every frame** using techniques from Unit 01-01!

### From Unit 02-01: Velocity

Each particle has velocity and moves just like your player:

```typescript
// From Unit 02-01: You learned velocity = position change
particle.x += particle.velocityX * deltaTime;
particle.y += particle.velocityY * deltaTime;
```

### From Unit 02-02: Gravity

Many particles (like debris) fall with gravity:

```typescript
// From Unit 02-02: You learned gravity = downward acceleration
particle.velocityY += GRAVITY * deltaTime;
```

**The magic:** Take simple drawing + velocity + gravity = **beautiful visual effects!**

---

## Introduction

Great gameplay needs **visual feedback**. When your player jumps, dashes, or lands, particles and effects make the action **feel good**. In this topic, you'll learn:

- **Particle Systems** - Managing hundreds of small visual elements
- **Juice** - Polish that makes games feel responsive
- **Effect Types** - Dust, trails, explosions, sparkles
- **Performance** - Keeping 60 FPS with many particles
- **Object Pooling** - Reusing particles for efficiency

These techniques transform your game from functional to **satisfying**.

---

## What Are Particles?

**Particles** are small, short-lived visual elements:
- Dust clouds when landing
- Trail effects when dashing
- Sparkles when collecting coins
- Explosion debris when breaking blocks

Each particle:
- Has position, velocity, lifetime
- Updates each frame (moves, fades)
- Dies after lifetime expires
- Is cheap to render (small, simple)

---

## Basic Particle Class

```typescript
class Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  lifetime: number;
  maxLifetime: number;
  size: number;
  color: string;
  gravity: number;
  
  constructor(
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    lifetime: number,
    size: number = 4,
    color: string = '#FFFFFF',
    gravity: number = 0
  ) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.size = size;
    this.color = color;
    this.gravity = gravity;
  }
  
  update(dt: number): boolean {
    const dtSec = dt / 1000;
    
    // Move
    this.x += this.velocityX * dtSec;
    this.y += this.velocityY * dtSec;
    
    // Gravity
    this.velocityY += this.gravity * dtSec;
    
    // Age
    this.lifetime -= dt;
    
    // Dead?
    return this.lifetime <= 0;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // Fade out over lifetime
    const alpha = this.lifetime / this.maxLifetime;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
    ctx.restore();
  }
}
```

---

## Particle System Manager

```typescript
class ParticleSystem {
  particles: Particle[] = [];
  
  add(particle: Particle): void {
    this.particles.push(particle);
  }
  
  addMultiple(particles: Particle[]): void {
    this.particles.push(...particles);
  }
  
  update(dt: number): void {
    // Update all particles, remove dead ones
    this.particles = this.particles.filter(p => !p.update(dt));
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    for (const particle of this.particles) {
      particle.draw(ctx);
    }
  }
  
  clear(): void {
    this.particles = [];
  }
  
  get count(): number {
    return this.particles.length;
  }
}

// Global particle system
const particles = new ParticleSystem();
```

---

## Effect 1: Dust Cloud (Landing)

```typescript
function spawnLandingDust(x: number, y: number): void {
  const particleCount = 8;
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI - Math.PI / 2; // Spread upward
    const speed = 50 + Math.random() * 50;
    
    particles.add(new Particle(
      x,
      y,
      Math.cos(angle) * speed,  // velocityX
      Math.sin(angle) * speed,  // velocityY
      400 + Math.random() * 200, // lifetime (400-600ms)
      3 + Math.random() * 2,     // size
      '#CCCCCC',                 // gray dust
      200                        // light gravity
    ));
  }
}

// Call when player lands
if (player.isGrounded && !wasGrounded) {
  spawnLandingDust(player.x, player.bottom);
}
```

---

## Effect 2: Dash Trail

```typescript
function spawnDashTrail(x: number, y: number, width: number, height: number): void {
  particles.add(new Particle(
    x,
    y,
    0, // No velocity (stays in place)
    0,
    150, // Short lifetime
    width,
    '#FFD700', // Gold
    0 // No gravity
  ));
}

// Call during dash every few frames
if (player.isDashing && frameCount % 2 === 0) {
  spawnDashTrail(player.x, player.y, player.width, player.height);
}
```

---

## Effect 3: Coin Sparkle

```typescript
function spawnCoinSparkle(x: number, y: number): void {
  const particleCount = 12;
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const speed = 100 + Math.random() * 50;
    
    particles.add(new Particle(
      x,
      y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      600,
      2,
      Math.random() > 0.5 ? '#FFD700' : '#FFFF00', // Gold/yellow
      -100 // Slight upward pull
    ));
  }
}
```

---

## Effect 4: Block Break Debris

```typescript
function spawnBlockDebris(x: number, y: number, color: string): void {
  const pieceCount = 16;
  
  for (let i = 0; i < pieceCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 100 + Math.random() * 200;
    
    particles.add(new Particle(
      x,
      y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed - 200, // Initial upward velocity
      800 + Math.random() * 400,
      4 + Math.random() * 4,
      color,
      600 // Strong gravity
    ));
  }
}
```

---

## Effect 5: Jump Dust

```typescript
function spawnJumpDust(x: number, y: number): void {
  for (let i = 0; i < 6; i++) {
    const offsetX = (Math.random() - 0.5) * 20;
    
    particles.add(new Particle(
      x + offsetX,
      y,
      (Math.random() - 0.5) * 30,
      -50 - Math.random() * 30,
      300,
      2,
      '#CCCCCC',
      100
    ));
  }
}
```

---

## Advanced: Object Pooling

For performance, **reuse** particles instead of creating new ones:

```typescript
class ParticlePool {
  particles: Particle[] = [];
  activeParticles: Particle[] = [];
  inactiveParticles: Particle[] = [];
  
  readonly POOL_SIZE = 500;
  
  constructor() {
    // Pre-allocate particles
    for (let i = 0; i < this.POOL_SIZE; i++) {
      const p = new Particle(0, 0, 0, 0, 0);
      this.particles.push(p);
      this.inactiveParticles.push(p);
    }
  }
  
  spawn(
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    lifetime: number,
    size: number,
    color: string,
    gravity: number
  ): Particle | null {
    // Get inactive particle
    const particle = this.inactiveParticles.pop();
    if (!particle) return null; // Pool exhausted
    
    // Reset properties
    particle.x = x;
    particle.y = y;
    particle.velocityX = velocityX;
    particle.velocityY = velocityY;
    particle.lifetime = lifetime;
    particle.maxLifetime = lifetime;
    particle.size = size;
    particle.color = color;
    particle.gravity = gravity;
    
    this.activeParticles.push(particle);
    return particle;
  }
  
  update(dt: number): void {
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const particle = this.activeParticles[i];
      const isDead = particle.update(dt);
      
      if (isDead) {
        // Return to pool
        this.activeParticles.splice(i, 1);
        this.inactiveParticles.push(particle);
      }
    }
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    for (const particle of this.activeParticles) {
      particle.draw(ctx);
    }
  }
}

const particlePool = new ParticlePool();
```

---

## Screen Shake

Add impact to actions:

```typescript
class Camera {
  shakeIntensity = 0;
  shakeDecay = 0.9;
  shakeX = 0;
  shakeY = 0;
  
  shake(intensity: number): void {
    this.shakeIntensity = intensity;
  }
  
  update(dt: number): void {
    if (this.shakeIntensity > 0) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= this.shakeDecay;
      
      if (this.shakeIntensity < 0.1) {
        this.shakeIntensity = 0;
        this.shakeX = 0;
        this.shakeY = 0;
      }
    }
  }
  
  apply(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(-this.x + this.shakeX, -this.y + this.shakeY);
  }
}

// Use it
camera.shake(10); // Ground pound
camera.shake(5);  // Coin collect
camera.shake(20); // Explosion
```

---

## Flash Effects

```typescript
class FlashEffect {
  active = false;
  duration = 0;
  color = 'white';
  
  start(duration: number, color: string = 'white'): void {
    this.active = true;
    this.duration = duration;
    this.color = color;
  }
  
  update(dt: number): void {
    if (this.active) {
      this.duration -= dt;
      if (this.duration <= 0) {
        this.active = false;
      }
    }
  }
  
  draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    if (this.active) {
      ctx.save();
      ctx.globalAlpha = this.duration / 100; // Fade out
      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }
}

const flash = new FlashEffect();

// Use it
flash.start(100, 'white'); // Damage
flash.start(150, 'yellow'); // Coin collect
```

---

## Complete Game Loop with Effects

```typescript
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const particles = new ParticleSystem();
const camera = new Camera();
const flash = new FlashEffect();

let lastTime = performance.now();

function gameLoop(currentTime: number): void {
  const dt = currentTime - lastTime;
  lastTime = currentTime;
  
  // Update
  player.update(dt, platforms);
  particles.update(dt);
  camera.update(dt);
  flash.update(dt);
  
  // Check events
  if (player.isGrounded && !player.wasGrounded) {
    spawnLandingDust(player.x, player.bottom);
    camera.shake(3);
  }
  
  if (player.isDashing && frameCount % 2 === 0) {
    spawnDashTrail(player.x, player.y, player.width, player.height);
  }
  
  if (player.collected Coin) {
    spawnCoinSparkle(coin.x, coin.y);
    camera.shake(5);
    flash.start(100, 'yellow');
  }
  
  // Draw
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  camera.apply(ctx);
  
  // World
  tilemap.draw(ctx);
  player.draw(ctx);
  particles.draw(ctx);
  
  camera.restore(ctx);
  
  // UI (not affected by camera)
  flash.draw(ctx, canvas);
  drawUI(ctx);
  
  requestAnimationFrame(gameLoop);
}
```

---

## Performance Tips

### 1. **Limit Active Particles**
```typescript
const MAX_PARTICLES = 500;
if (particles.count < MAX_PARTICLES) {
  spawnParticle();
}
```

### 2. **Use Object Pooling**
Reuse particles instead of creating new ones.

### 3. **Batch Rendering**
Draw all particles of same type together.

### 4. **Cull Off-Screen**
Don't draw particles outside camera view.

### 5. **Simplify Far Particles**
Render distant particles as single pixels.

---

## Juice Checklist

✅ **Landing** - Dust cloud, camera shake
✅ **Jumping** - Small dust puff
✅ **Dashing** - Trail effect, speed lines
✅ **Coin collect** - Sparkle burst, flash, shake
✅ **Block break** - Debris, shake
✅ **Damage** - Flash red, shake
✅ **Wall slide** - Dust particles
✅ **Ground pound** - Large dust, big shake

---

## Summary

Particles and effects make your game feel **responsive and satisfying**:

- ✅ **Particle System** - Manage hundreds of small elements
- ✅ **Common Effects** - Dust, trails, sparkles, debris
- ✅ **Screen Shake** - Add impact to actions
- ✅ **Flash Effects** - Visual feedback for events
- ✅ **Object Pooling** - Performance optimization

**Key concepts**:
1. Particles are small, short-lived, simple
2. Use effects for **feedback**, not decoration
3. **Performance matters** - pool and cull
4. **Juice** transforms good games into great ones

**Next**: Tilemaps for level design! 🎨✨
