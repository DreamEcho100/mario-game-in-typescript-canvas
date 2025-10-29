# Lesson: Advanced Movement Mechanics

## Introduction

Now that you have a solid platformer with basic movement, jumping, and collision, it's time to add **advanced movement mechanics** that make your game feel dynamic and exciting:

- **Wall Jump** - Leap off walls to reach higher areas
- **Dash** - Quick burst of speed in any direction  
- **Wall Slide** - Slow fall when touching walls
- **Ledge Grab** - Hang onto ledges and pull up
- **Ground Pound** - Slam down from the air
- **Double Jump with Air Control** - Enhanced mid-air mobility

These mechanics transform a basic platformer into something that feels modern, responsive, and fun to master.

---

## 1. Wall Jump

### Concept

When touching a wall, player can jump away from it:
- Detect wall collision
- Jump adds horizontal velocity away from wall
- Jump adds vertical velocity upward
- Optional: Wall slide (slow fall) while touching wall

### Implementation

```typescript
class Player {
  // ... existing properties ...
  
  readonly WALL_JUMP_FORCE_X = 300;  // Push away from wall
  readonly WALL_JUMP_FORCE_Y = -400; // Jump height
  readonly WALL_SLIDE_SPEED = 100;   // Slower than normal fall
  
  touchingLeftWall = false;
  touchingRightWall = false;
  
  update(dt: number, platforms: Platform[]): void {
    const dtSec = dt / 1000;
    
    // Reset wall touch
    this.touchingLeftWall = false;
    this.touchingRightWall = false;
    
    // Horizontal movement
    this.velocityX = this.horizontalInput * this.MAX_RUN_SPEED;
    this.x += this.velocityX * dtSec;
    this.resolveCollisionX(platforms);
    
    // Gravity
    this.velocityY += this.GRAVITY * dtSec;
    
    // Wall slide: slower fall when touching wall and holding toward it
    if ((this.touchingLeftWall && this.horizontalInput < 0) ||
        (this.touchingRightWall && this.horizontalInput > 0)) {
      if (this.velocityY > this.WALL_SLIDE_SPEED) {
        this.velocityY = this.WALL_SLIDE_SPEED;
      }
    }
    
    this.y += this.velocityY * dtSec;
    this.resolveCollisionY(platforms);
    
    // Wall jump
    if (this.jumpPressed && !this.isGrounded) {
      if (this.touchingLeftWall) {
        this.velocityX = this.WALL_JUMP_FORCE_X;  // Push right
        this.velocityY = this.WALL_JUMP_FORCE_Y;  // Jump up
        this.touchingLeftWall = false;
      } else if (this.touchingRightWall) {
        this.velocityX = -this.WALL_JUMP_FORCE_X; // Push left
        this.velocityY = this.WALL_JUMP_FORCE_Y;  // Jump up
        this.touchingRightWall = false;
      }
    }
  }
  
  resolveCollisionX(platforms: Platform[]): void {
    for (const platform of platforms) {
      if (!this.collidesWith(platform)) continue;
      
      const overlapLeft = this.right - platform.left;
      const overlapRight = platform.right - this.left;
      
      if (overlapLeft < overlapRight) {
        // Hit left side of platform
        this.x = platform.left - this.width / 2;
        this.velocityX = 0;
        this.touchingRightWall = true;  // Player's right side touching
      } else {
        // Hit right side of platform
        this.x = platform.right + this.width / 2;
        this.velocityX = 0;
        this.touchingLeftWall = true;   // Player's left side touching
      }
    }
  }
}
```

### Visual Feedback

```typescript
draw(ctx: CanvasRenderingContext2D): void {
  // Change color when wall sliding
  if (this.touchingLeftWall || this.touchingRightWall) {
    ctx.fillStyle = '#FFA726'; // Orange when on wall
  } else {
    ctx.fillStyle = this.isGrounded ? '#4CAF50' : '#2196F3';
  }
  
  ctx.fillRect(this.left, this.top, this.width, this.height);
  
  // Wall slide particles
  if ((this.touchingLeftWall || this.touchingRightWall) && this.velocityY > 0) {
    // Spawn dust particles
  }
}
```

---

## 2. Dash Mechanic

### Concept

Quick burst of speed in the direction player is facing or moving:
- Short duration (200ms)
- High speed (2-3× normal)
- Cooldown period (1 second)
- Cancel gravity during dash
- Optional: Invincibility frames

### Implementation

```typescript
class Player {
  readonly DASH_SPEED = 500;
  readonly DASH_DURATION = 200; // milliseconds
  readonly DASH_COOLDOWN = 1000; // milliseconds
  
  isDashing = false;
  dashTimer = 0;
  dashCooldown = 0;
  dashDirectionX = 0;
  dashDirectionY = 0;
  
  update(dt: number, platforms: Platform[]): void {
    const dtSec = dt / 1000;
    
    // Update cooldown
    if (this.dashCooldown > 0) {
      this.dashCooldown -= dt;
    }
    
    // Start dash
    if (keys.has('Shift') && this.dashCooldown <= 0 && !this.isDashing) {
      this.startDash();
    }
    
    // During dash
    if (this.isDashing) {
      this.dashTimer -= dt;
      
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      } else {
        // Override normal movement
        this.velocityX = this.dashDirectionX * this.DASH_SPEED;
        this.velocityY = this.dashDirectionY * this.DASH_SPEED;
        
        this.x += this.velocityX * dtSec;
        this.y += this.velocityY * dtSec;
        
        // Still check collision during dash
        this.resolveCollisionX(platforms);
        this.resolveCollisionY(platforms);
        
        return; // Skip normal physics
      }
    }
    
    // Normal movement when not dashing
    // ... rest of update code ...
  }
  
  startDash(): void {
    this.isDashing = true;
    this.dashTimer = this.DASH_DURATION;
    this.dashCooldown = this.DASH_COOLDOWN;
    
    // Dash in direction of input (or facing direction if no input)
    if (this.horizontalInput !== 0 || this.verticalInput !== 0) {
      // Normalize direction
      const magnitude = Math.sqrt(
        this.horizontalInput ** 2 + this.verticalInput ** 2
      );
      this.dashDirectionX = this.horizontalInput / magnitude;
      this.dashDirectionY = this.verticalInput / magnitude;
    } else {
      // Dash in facing direction
      this.dashDirectionX = this.facingDirection;
      this.dashDirectionY = 0;
    }
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // Dash trail effect
    if (this.isDashing) {
      ctx.globalAlpha = 0.3;
      for (let i = 1; i <= 4; i++) {
        const trailX = this.x - this.dashDirectionX * i * 12;
        const trailY = this.y - this.dashDirectionY * i * 12;
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(
          trailX - this.width / 2,
          trailY - this.height / 2,
          this.width,
          this.height
        );
      }
      ctx.globalAlpha = 1.0;
    }
    
    // Player
    ctx.fillStyle = this.isDashing ? '#FFD700' : '#4CAF50';
    ctx.fillRect(this.left, this.top, this.width, this.height);
    
    // Cooldown indicator
    if (this.dashCooldown > 0) {
      const cooldownPercent = this.dashCooldown / this.DASH_COOLDOWN;
      ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
      ctx.fillRect(
        this.left,
        this.top - 8,
        this.width * (1 - cooldownPercent),
        4
      );
    }
  }
}
```

---

## 3. Ground Pound

### Concept

Slam downward from the air:
- Activated in mid-air only
- Fast downward speed
- Stun/bounce on landing
- Can break certain blocks

### Implementation

```typescript
class Player {
  readonly GROUND_POUND_SPEED = 800;
  readonly GROUND_POUND_BOUNCE = -300;
  
  isGroundPounding = false;
  groundPoundLandingTimer = 0;
  
  update(dt: number, platforms: Platform[]): void {
    const dtSec = dt / 1000;
    
    // Start ground pound
    if (keys.has('s') && !this.isGrounded && !this.isGroundPounding) {
      this.isGroundPounding = true;
    }
    
    // During ground pound
    if (this.isGroundPounding) {
      this.velocityX = 0; // No horizontal movement
      this.velocityY = this.GROUND_POUND_SPEED;
      
      this.y += this.velocityY * dtSec;
      
      // Check landing
      const wasGrounded = this.isGrounded;
      this.resolveCollisionY(platforms);
      
      if (this.isGrounded && !wasGrounded) {
        // Just landed
        this.isGroundPounding = false;
        this.velocityY = this.GROUND_POUND_BOUNCE; // Bounce up
        this.groundPoundLandingTimer = 200; // Stun briefly
        
        // Check for breakable blocks below
        this.checkGroundPoundDamage(platforms);
      }
      
      return; // Skip normal physics
    }
    
    // Landing stun
    if (this.groundPoundLandingTimer > 0) {
      this.groundPoundLandingTimer -= dt;
      this.velocityX = 0;
      return;
    }
    
    // Normal movement
    // ... rest of update ...
  }
  
  checkGroundPoundDamage(platforms: Platform[]): void {
    // Check tiles directly below player
    const belowTiles = platforms.filter(p => 
      p.top >= this.bottom && 
      p.top < this.bottom + 20 &&
      p.left < this.right &&
      p.right > this.left
    );
    
    for (const tile of belowTiles) {
      if (tile.breakable) {
        tile.break();
      }
    }
  }
}
```

---

## 4. Ledge Grab & Climb

### Concept

Grab onto ledges and pull up:
- Detect when near ledge edge
- Snap to ledge position
- Hold to hang, press up to climb

### Implementation

```typescript
class Player {
  isHangingOnLedge = false;
  ledgeGrabPlatform: Platform | null = null;
  ledgeGrabSide: 'left' | 'right' = 'right';
  
  readonly LEDGE_GRAB_RANGE = 8; // pixels
  readonly CLIMB_UP_SPEED = 200;
  
  update(dt: number, platforms: Platform[]): void {
    const dtSec = dt / 1000;
    
    // Check for ledge grab
    if (!this.isGrounded && !this.isHangingOnLedge && this.velocityY > 0) {
      this.checkLedgeGrab(platforms);
    }
    
    // Hanging on ledge
    if (this.isHangingOnLedge) {
      // Lock position
      this.velocityX = 0;
      this.velocityY = 0;
      
      // Climb up
      if (keys.has('w') || keys.has('ArrowUp')) {
        this.climbLedge();
      }
      
      // Let go
      if (keys.has('s') || keys.has('ArrowDown')) {
        this.isHangingOnLedge = false;
        this.ledgeGrabPlatform = null;
      }
      
      return; // Skip normal physics
    }
    
    // Normal movement
    // ...
  }
  
  checkLedgeGrab(platforms: Platform[]): void {
    for (const platform of platforms) {
      // Check if hands are near platform top
      const handsY = this.top + 8; // Hands are 8px from top
      
      if (Math.abs(handsY - platform.top) < this.LEDGE_GRAB_RANGE) {
        // Check if at right edge
        if (Math.abs(this.right - platform.right) < this.LEDGE_GRAB_RANGE &&
            this.velocityX > 0) {
          this.grabLedge(platform, 'right');
          break;
        }
        // Check if at left edge
        if (Math.abs(this.left - platform.left) < this.LEDGE_GRAB_RANGE &&
            this.velocityX < 0) {
          this.grabLedge(platform, 'left');
          break;
        }
      }
    }
  }
  
  grabLedge(platform: Platform, side: 'left' | 'right'): void {
    this.isHangingOnLedge = true;
    this.ledgeGrabPlatform = platform;
    this.ledgeGrabSide = side;
    
    // Snap to ledge position
    if (side === 'right') {
      this.x = platform.right - this.width / 2 - 2;
    } else {
      this.x = platform.left + this.width / 2 + 2;
    }
    this.y = platform.top + 8;
  }
  
  climbLedge(): void {
    if (!this.ledgeGrabPlatform) return;
    
    // Move up and onto platform
    this.y = this.ledgeGrabPlatform.top - this.height / 2 - 2;
    
    if (this.ledgeGrabSide === 'right') {
      this.x = this.ledgeGrabPlatform.right - this.width / 2 - 8;
    } else {
      this.x = this.ledgeGrabPlatform.left + this.width / 2 + 8;
    }
    
    this.isHangingOnLedge = false;
    this.ledgeGrabPlatform = null;
    this.isGrounded = true;
  }
}
```

---

## Complete Example: Player with All Advanced Mechanics

```typescript
class AdvancedPlayer {
  // Position
  x: number;
  y: number;
  width = 32;
  height = 48;
  
  // Velocity
  velocityX = 0;
  velocityY = 0;
  
  // Basic movement
  readonly GRAVITY = 1400;
  readonly MAX_RUN_SPEED = 250;
  readonly JUMP_FORCE = -450;
  
  // Wall jump
  readonly WALL_JUMP_FORCE_X = 300;
  readonly WALL_JUMP_FORCE_Y = -400;
  readonly WALL_SLIDE_SPEED = 100;
  touchingLeftWall = false;
  touchingRightWall = false;
  
  // Dash
  readonly DASH_SPEED = 500;
  readonly DASH_DURATION = 200;
  readonly DASH_COOLDOWN = 1000;
  isDashing = false;
  dashTimer = 0;
  dashCooldown = 0;
  dashDirectionX = 0;
  dashDirectionY = 0;
  
  // Ground pound
  readonly GROUND_POUND_SPEED = 800;
  readonly GROUND_POUND_BOUNCE = -300;
  isGroundPounding = false;
  groundPoundStunTimer = 0;
  
  // State
  isGrounded = false;
  horizontalInput = 0;
  verticalInput = 0;
  jumpPressed = false;
  
  update(dt: number, platforms: Platform[]): void {
    const dtSec = dt / 1000;
    
    // Dash cooldown
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    
    // Stun from ground pound
    if (this.groundPoundStunTimer > 0) {
      this.groundPoundStunTimer -= dt;
      return;
    }
    
    // Start dash
    if (keys.has('Shift') && this.dashCooldown <= 0 && !this.isDashing) {
      this.startDash();
    }
    
    // Dash movement (overrides everything)
    if (this.isDashing) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      } else {
        this.velocityX = this.dashDirectionX * this.DASH_SPEED;
        this.velocityY = this.dashDirectionY * this.DASH_SPEED;
        this.x += this.velocityX * dtSec;
        this.y += this.velocityY * dtSec;
        return;
      }
    }
    
    // Start ground pound
    if (keys.has('s') && !this.isGrounded && !this.isGroundPounding) {
      this.isGroundPounding = true;
    }
    
    // Ground pound movement
    if (this.isGroundPounding) {
      this.velocityX = 0;
      this.velocityY = this.GROUND_POUND_SPEED;
      this.y += this.velocityY * dtSec;
      
      const wasGrounded = this.isGrounded;
      this.resolveCollisionY(platforms);
      
      if (this.isGrounded && !wasGrounded) {
        this.isGroundPounding = false;
        this.velocityY = this.GROUND_POUND_BOUNCE;
        this.groundPoundStunTimer = 200;
      }
      return;
    }
    
    // Normal movement
    this.touchingLeftWall = false;
    this.touchingRightWall = false;
    
    // Horizontal
    this.velocityX = this.horizontalInput * this.MAX_RUN_SPEED;
    this.x += this.velocityX * dtSec;
    this.resolveCollisionX(platforms);
    
    // Gravity
    this.velocityY += this.GRAVITY * dtSec;
    
    // Wall slide
    if ((this.touchingLeftWall && this.horizontalInput < 0) ||
        (this.touchingRightWall && this.horizontalInput > 0)) {
      if (this.velocityY > this.WALL_SLIDE_SPEED) {
        this.velocityY = this.WALL_SLIDE_SPEED;
      }
    }
    
    this.y += this.velocityY * dtSec;
    this.resolveCollisionY(platforms);
    
    // Jumping
    if (this.jumpPressed) {
      if (this.isGrounded) {
        this.velocityY = this.JUMP_FORCE;
      } else if (this.touchingLeftWall) {
        this.velocityX = this.WALL_JUMP_FORCE_X;
        this.velocityY = this.WALL_JUMP_FORCE_Y;
      } else if (this.touchingRightWall) {
        this.velocityX = -this.WALL_JUMP_FORCE_X;
        this.velocityY = this.WALL_JUMP_FORCE_Y;
      }
    }
  }
  
  startDash(): void {
    this.isDashing = true;
    this.dashTimer = this.DASH_DURATION;
    this.dashCooldown = this.DASH_COOLDOWN;
    
    const magnitude = Math.sqrt(
      this.horizontalInput ** 2 + this.verticalInput ** 2
    );
    
    if (magnitude > 0) {
      this.dashDirectionX = this.horizontalInput / magnitude;
      this.dashDirectionY = this.verticalInput / magnitude;
    } else {
      this.dashDirectionX = 1;
      this.dashDirectionY = 0;
    }
  }
  
  // ... collision methods ...
}
```

---

## Tuning Tips

### Wall Jump Feel
- **High horizontal push** = Easy to chain wall jumps
- **Low horizontal push** = Tight, challenging wall jumps
- **Slow wall slide** = More time to react
- **Fast wall slide** = More skill required

### Dash Feel
- **Short duration** (150ms) = Precise, technical
- **Long duration** (300ms) = Forgiving, accessible
- **Long cooldown** (2s) = Strategic resource
- **Short cooldown** (500ms) = Core movement mechanic

### Ground Pound Feel
- **High bounce** = Get back to platforms easily
- **Low bounce** = Commit to the slam
- **Long stun** = Risky move
- **Short stun** = Fluid combo tool

---

## Summary

Advanced movement mechanics transform your platformer from functional to **exceptional**:

- ✅ **Wall Jump** - Vertical mobility and skill expression
- ✅ **Dash** - Speed and positioning tool
- ✅ **Ground Pound** - Downward option and environmental interaction
- ✅ **Ledge Grab** - Precision and recovery mechanic

**Key concepts**:
1. Each mechanic has clear **activation conditions**
2. Mechanics **override normal physics** during execution
3. Visual and audio **feedback** is essential
4. **Tuning** determines if mechanic feels good

**Next**: Add particle effects and visual feedback for these moves! 🎮✨
