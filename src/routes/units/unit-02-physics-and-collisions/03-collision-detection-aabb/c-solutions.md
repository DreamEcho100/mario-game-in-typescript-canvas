# Collision Detection AABB - Solutions

## Solution 1: Basic AABB Detection ⭐

```typescript
class Rectangle {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}
  
  get left(): number { return this.x - this.width / 2; }
  get right(): number { return this.x + this.width / 2; }
  get top(): number { return this.y - this.height / 2; }
  get bottom(): number { return this.y + this.height / 2; }
  
  collidesWith(other: Rectangle): boolean {
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }
  
  draw(ctx: CanvasRenderingContext2D, color: string): void {
    ctx.fillStyle = color;
    ctx.fillRect(this.left, this.top, this.width, this.height);
  }
}

const rect1 = new Rectangle(200, 200, 100, 100);
const rect2 = new Rectangle(400, 300, 100, 100);

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  rect2.x = e.clientX - rect.left;
  rect2.y = e.clientY - rect.top;
});

function draw(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const isColliding = rect1.collidesWith(rect2);
  
  rect1.draw(ctx, isColliding ? 'red' : 'blue');
  rect2.draw(ctx, isColliding ? 'red' : 'green');
  
  requestAnimationFrame(draw);
}
draw();
```

---

## Solution 3: Collision Resolution - Vertical ⭐⭐

```typescript
class Player {
  x = 100;
  y = 100;
  width = 32;
  height = 32;
  velocityY = 0;
  
  readonly GRAVITY = 980;
  
  get left(): number { return this.x - this.width / 2; }
  get right(): number { return this.x + this.width / 2; }
  get top(): number { return this.y - this.height / 2; }
  get bottom(): number { return this.y + this.height / 2; }
  
  update(dt: number): void {
    // Apply gravity
    this.velocityY += this.GRAVITY * (dt / 1000);
    this.y += this.velocityY * (dt / 1000);
  }
  
  resolveVerticalCollision(platform: Rectangle): void {
    if (!this.collidesWith(platform)) return;
    
    const overlapTop = this.bottom - platform.top;
    const overlapBottom = platform.bottom - this.top;
    
    if (overlapTop < overlapBottom) {
      // Colliding from top
      this.y = platform.top - this.height / 2;
      this.velocityY = 0;
    } else {
      // Colliding from bottom
      this.y = platform.bottom + this.height / 2;
      this.velocityY = 0;
    }
  }
  
  collidesWith(other: Rectangle): boolean {
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }
}
```

---

## Solution 5: Full AABB Resolution ⭐⭐

```typescript
class Player {
  x = 400;
  y = 100;
  width = 32;
  height = 32;
  velocityX = 0;
  velocityY = 0;
  
  readonly GRAVITY = 980;
  readonly MOVE_SPEED = 250;
  
  horizontalInput = 0;
  
  get left(): number { return this.x - this.width / 2; }
  get right(): number { return this.x + this.width / 2; }
  get top(): number { return this.y - this.height / 2; }
  get bottom(): number { return this.y + this.height / 2; }
  
  update(dt: number): void {
    // Horizontal movement
    this.velocityX = this.horizontalInput * this.MOVE_SPEED;
    this.x += this.velocityX * (dt / 1000);
    
    // Gravity
    this.velocityY += this.GRAVITY * (dt / 1000);
    this.y += this.velocityY * (dt / 1000);
  }
  
  resolveCollision(platform: GameObject): void {
    if (!this.collidesWith(platform)) return;
    
    // Calculate all overlaps
    const overlapLeft = this.right - platform.left;
    const overlapRight = platform.right - this.left;
    const overlapTop = this.bottom - platform.top;
    const overlapBottom = platform.bottom - this.top;
    
    // Find minimum overlap on each axis
    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);
    
    // Resolve on axis with smallest overlap
    if (minOverlapX < minOverlapY) {
      // Horizontal collision
      if (overlapLeft < overlapRight) {
        this.x = platform.left - this.width / 2;
      } else {
        this.x = platform.right + this.width / 2;
      }
      this.velocityX = 0;
    } else {
      // Vertical collision
      if (overlapTop < overlapBottom) {
        this.y = platform.top - this.height / 2;
        this.velocityY = 0;
      } else {
        this.y = platform.bottom + this.height / 2;
        this.velocityY = 0;
      }
    }
  }
  
  collidesWith(other: GameObject): boolean {
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }
}
```

---

## Solution 6: Circle Collision ⭐⭐

```typescript
class Circle {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  
  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.velocityX = (Math.random() - 0.5) * 200;
    this.velocityY = (Math.random() - 0.5) * 200;
  }
  
  collidesWith(other: Circle): boolean {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distanceSquared = dx * dx + dy * dy;
    const minDistance = this.radius + other.radius;
    return distanceSquared < minDistance * minDistance;
  }
  
  resolveCollision(other: Circle): void {
    if (!this.collidesWith(other)) return;
    
    // Calculate separation vector
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return; // Prevent division by zero
    
    // Normalize
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Push apart
    const overlap = this.radius + other.radius - distance;
    this.x -= nx * overlap / 2;
    this.y -= ny * overlap / 2;
    other.x += nx * overlap / 2;
    other.y += ny * overlap / 2;
    
    // Exchange velocities (simplified elastic collision)
    const tempVx = this.velocityX;
    const tempVy = this.velocityY;
    this.velocityX = other.velocityX;
    this.velocityY = other.velocityY;
    other.velocityX = tempVx;
    other.velocityY = tempVy;
  }
  
  update(dt: number): void {
    this.x += this.velocityX * (dt / 1000);
    this.y += this.velocityY * (dt / 1000);
    
    // Bounce off walls
    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
      this.velocityX *= -1;
    }
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
      this.velocityY *= -1;
    }
  }
  
  draw(ctx: CanvasRenderingContext2D, colliding: boolean): void {
    ctx.fillStyle = colliding ? 'red' : 'blue';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

---

## Solution 7: Circle-Rectangle Collision ⭐⭐⭐

```typescript
function checkCircleRectCollision(
  circle: { x: number; y: number; radius: number },
  rect: { left: number; right: number; top: number; bottom: number }
): boolean {
  // Find closest point on rectangle to circle
  const closestX = Math.max(rect.left, Math.min(circle.x, rect.right));
  const closestY = Math.max(rect.top, Math.min(circle.y, rect.bottom));
  
  // Calculate distance
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  const distanceSquared = dx * dx + dy * dy;
  
  return distanceSquared < circle.radius * circle.radius;
}

class CirclePlayer {
  x = 100;
  y = 100;
  radius = 16;
  velocityX = 0;
  velocityY = 0;
  
  readonly GRAVITY = 980;
  readonly MOVE_SPEED = 250;
  
  update(dt: number): void {
    this.velocityY += this.GRAVITY * (dt / 1000);
    this.x += this.velocityX * (dt / 1000);
    this.y += this.velocityY * (dt / 1000);
  }
  
  resolveCollision(platform: Rectangle): void {
    if (!checkCircleRectCollision(this, platform)) return;
    
    // Find closest point
    const closestX = Math.max(platform.left, Math.min(this.x, platform.right));
    const closestY = Math.max(platform.top, Math.min(this.y, platform.bottom));
    
    // Calculate push direction
    const dx = this.x - closestX;
    const dy = this.y - closestY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) {
      // Circle center inside rectangle
      // Push out based on closest edge
      const distLeft = this.x - platform.left;
      const distRight = platform.right - this.x;
      const distTop = this.y - platform.top;
      const distBottom = platform.bottom - this.y;
      
      const minDist = Math.min(distLeft, distRight, distTop, distBottom);
      
      if (minDist === distLeft) this.x = platform.left - this.radius;
      else if (minDist === distRight) this.x = platform.right + this.radius;
      else if (minDist === distTop) this.y = platform.top - this.radius;
      else this.y = platform.bottom + this.radius;
    } else {
      // Push circle out along collision normal
      const overlap = this.radius - distance;
      const nx = dx / distance;
      const ny = dy / distance;
      
      this.x += nx * overlap;
      this.y += ny * overlap;
      
      // Stop velocity if moving into platform
      if (nx * this.velocityX + ny * this.velocityY < 0) {
        if (Math.abs(ny) > Math.abs(nx)) {
          this.velocityY = 0;
        } else {
          this.velocityX = 0;
        }
      }
    }
  }
}
```

---

## Solution 8: One-Way Platforms ⭐⭐⭐

```typescript
class OneWayPlatform extends GameObject {
  resolveCollision(player: Player): void {
    // Only collide if player is above and moving down
    if (player.bottom <= this.top + 5 && player.velocityY >= 0) {
      if (player.collidesWith(this)) {
        player.y = this.top - player.height / 2;
        player.velocityY = 0;
        player.isGrounded = true;
      }
    }
  }
}

class Player {
  wantsFallThrough = false;
  
  handleInput(keys: Set<string>): void {
    this.wantsFallThrough = keys.has('s') || keys.has('ArrowDown');
  }
  
  resolveOneWayPlatform(platform: OneWayPlatform): void {
    // Don't collide if wanting to fall through
    if (this.wantsFallThrough && this.isGrounded) {
      return;
    }
    
    platform.resolveCollision(this);
  }
}
```

---

## Solution 9: Moving Platforms ⭐⭐⭐

```typescript
class MovingPlatform extends GameObject {
  startX: number;
  endX: number;
  speed: number;
  direction: number = 1;
  
  constructor(startX: number, y: number, endX: number, width: number, height: number) {
    super((startX + endX) / 2, y, width, height);
    this.startX = startX;
    this.endX = endX;
    this.x = startX;
    this.speed = 100;
  }
  
  update(dt: number): void {
    this.x += this.direction * this.speed * (dt / 1000);
    
    if (this.x >= this.endX || this.x <= this.startX) {
      this.direction *= -1;
      this.x = Math.max(this.startX, Math.min(this.endX, this.x));
    }
  }
  
  resolvePlayerCollision(player: Player): void {
    const wasColliding = player.collidesWith(this);
    const prevX = this.x;
    
    // Standard collision resolution
    player.resolveCollision(this);
    
    // If player is on top, move with platform
    if (wasColliding && player.isGrounded) {
      const platformMovement = this.x - prevX;
      player.x += platformMovement;
    }
  }
}
```

---

## Key Takeaways

1. **AABB**: Check overlap on both axes
2. **Resolve**: Push out on axis with minimum overlap
3. **Circle**: Distance < sum of radii
4. **Circle-Rect**: Find closest point, check distance
5. **One-Way**: Only collide from specific direction
6. **Moving Platforms**: Transfer platform velocity to player
