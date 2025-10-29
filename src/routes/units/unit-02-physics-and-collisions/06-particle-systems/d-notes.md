# Particle Systems - Quick Notes

## Basic Particle

```typescript
class Particle {
  x, y, velocityX, velocityY;
  lifetime, maxLifetime;
  
  update(dt): boolean {
    x += velocityX * dt;
    y += velocityY * dt;
    lifetime -= dt;
    return lifetime <= 0; // Dead?
  }
  
  draw(ctx): void {
    alpha = lifetime / maxLifetime;
    ctx.globalAlpha = alpha;
    ctx.fillRect(x, y, size, size);
  }
}
```

## Particle System

```typescript
class ParticleSystem {
  particles = [];
  
  update(dt) {
    particles = particles.filter(p => !p.update(dt));
  }
}
```

## Landing Dust Pattern

```typescript
for (let i = 0; i < 8; i++) {
  angle = (i / 8) * PI - PI/2;
  speed = 50 + random() * 50;
  spawn(x, y, cos(angle) * speed, sin(angle) * speed);
}
```

## Screen Shake

```typescript
shake(intensity) {
  shakeIntensity = intensity;
}

update() {
  shakeX = (random() - 0.5) * shakeIntensity;
  shakeY = (random() - 0.5) * shakeIntensity;
  shakeIntensity *= 0.9;
}
```

## Common Values

```
Landing Dust: 8 particles, 400-600ms
Dash Trail: spawn every 2 frames, 150ms
Coin Sparkle: 12 particles, 600ms
Jump Dust: 6 particles, 300ms
Shake Intensity: 3-20
```
