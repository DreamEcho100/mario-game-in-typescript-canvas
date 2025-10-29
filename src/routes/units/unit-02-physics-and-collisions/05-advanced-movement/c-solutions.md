# Advanced Movement - Solutions

## Solution 2: Wall Jump ⭐⭐

```typescript
class Player {
  touchingLeftWall = false;
  touchingRightWall = false;
  
  readonly WALL_JUMP_FORCE_X = 300;
  readonly WALL_JUMP_FORCE_Y = -400;
  
  resolveCollisionX(platforms: Platform[]): void {
    for (const platform of platforms) {
      if (!this.collidesWith(platform)) continue;
      
      const overlapLeft = this.right - platform.left;
      const overlapRight = platform.right - this.left;
      
      if (overlapLeft < overlapRight) {
        this.x = platform.left - this.width / 2;
        this.velocityX = 0;
        this.touchingRightWall = true;
      } else {
        this.x = platform.right + this.width / 2;
        this.velocityX = 0;
        this.touchingLeftWall = true;
      }
    }
  }
  
  update(dt: number): void {
    // ... movement code ...
    
    // Wall jump
    if (this.jumpPressed && !this.isGrounded) {
      if (this.touchingLeftWall) {
        this.velocityX = this.WALL_JUMP_FORCE_X;
        this.velocityY = this.WALL_JUMP_FORCE_Y;
      } else if (this.touchingRightWall) {
        this.velocityX = -this.WALL_JUMP_FORCE_X;
        this.velocityY = this.WALL_JUMP_FORCE_Y;
      }
    }
  }
}
```

## Solution 3: Basic Dash ⭐⭐

```typescript
class Player {
  readonly DASH_SPEED = 500;
  readonly DASH_DURATION = 200;
  readonly DASH_COOLDOWN = 1000;
  
  isDashing = false;
  dashTimer = 0;
  dashCooldown = 0;
  facingDirection = 1;
  
  update(dt: number): void {
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    
    if (keys.has('Shift') && this.dashCooldown <= 0 && !this.isDashing) {
      this.isDashing = true;
      this.dashTimer = this.DASH_DURATION;
      this.dashCooldown = this.DASH_COOLDOWN;
    }
    
    if (this.isDashing) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      } else {
        this.velocityX = this.facingDirection * this.DASH_SPEED;
        this.x += this.velocityX * (dt / 1000);
        return;
      }
    }
    
    // Normal movement...
  }
}
```

## Solution 5: Ground Pound ⭐⭐

```typescript
class Player {
  readonly GROUND_POUND_SPEED = 800;
  readonly GROUND_POUND_BOUNCE = -300;
  isGroundPounding = false;
  stunTimer = 0;
  
  update(dt: number): void {
    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      return;
    }
    
    if (keys.has('s') && !this.isGrounded && !this.isGroundPounding) {
      this.isGroundPounding = true;
    }
    
    if (this.isGroundPounding) {
      this.velocityX = 0;
      this.velocityY = this.GROUND_POUND_SPEED;
      this.y += this.velocityY * (dt / 1000);
      
      const wasGrounded = this.isGrounded;
      this.resolveCollisionY(platforms);
      
      if (this.isGrounded && !wasGrounded) {
        this.isGroundPounding = false;
        this.velocityY = this.GROUND_POUND_BOUNCE;
        this.stunTimer = 200;
      }
      return;
    }
    
    // Normal movement...
  }
}
```

See the main lesson file for complete implementations!
