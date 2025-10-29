# Particle Systems - Solutions

## Solution 1: Basic Particle ⭐

```typescript
class Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  lifetime: number;
  maxLifetime: number;
  
  constructor(x: number, y: number, vx: number, vy: number, lifetime: number) {
    this.x = x;
    this.y = y;
    this.velocityX = vx;
    this.velocityY = vy;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
  }
  
  update(dt: number): boolean {
    this.x += this.velocityX * (dt / 1000);
    this.y += this.velocityY * (dt / 1000);
    this.lifetime -= dt;
    return this.lifetime <= 0;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    const alpha = this.lifetime / this.maxLifetime;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
    ctx.restore();
  }
}
```

## Solution 3: Landing Dust ⭐⭐

```typescript
function spawnLandingDust(x: number, y: number): void {
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI - Math.PI / 2;
    const speed = 50 + Math.random() * 50;
    
    particles.add(new Particle(
      x,
      y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      400 + Math.random() * 200,
      3,
      '#CCCCCC',
      200
    ));
  }
}
```

## Solution 6: Screen Shake ⭐⭐

```typescript
class Camera {
  shakeIntensity = 0;
  shakeX = 0;
  shakeY = 0;
  
  shake(intensity: number): void {
    this.shakeIntensity = intensity;
  }
  
  update(dt: number): void {
    if (this.shakeIntensity > 0) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= 0.9;
      
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
```

See main lesson for complete implementations!
