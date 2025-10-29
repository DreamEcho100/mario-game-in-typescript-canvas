# Advanced Movement - Quick Notes

## Wall Jump Pattern

```typescript
touchingLeftWall = false;
touchingRightWall = false;

// In resolveCollisionX:
if (overlapLeft < overlapRight) {
  this.touchingRightWall = true;
} else {
  this.touchingLeftWall = true;
}

// In update:
if (jumpPressed) {
  if (touchingLeftWall) velocityX = WALL_JUMP_FORCE_X;
  if (touchingRightWall) velocityX = -WALL_JUMP_FORCE_X;
}
```

## Dash Pattern

```typescript
if (dashKey && dashCooldown <= 0) {
  isDashing = true;
  dashTimer = DASH_DURATION;
  dashCooldown = DASH_COOLDOWN;
}

if (isDashing) {
  dashTimer -= dt;
  if (dashTimer <= 0) isDashing = false;
  else {
    velocityX = direction * DASH_SPEED;
    return; // Skip normal physics
  }
}
```

## Ground Pound Pattern

```typescript
if (downKey && !isGrounded) {
  isGroundPounding = true;
}

if (isGroundPounding) {
  velocityX = 0;
  velocityY = GROUND_POUND_SPEED;
  
  if (justLanded) {
    isGroundPounding = false;
    velocityY = BOUNCE_FORCE;
  }
}
```

## Common Values

```
WALL_JUMP_FORCE_X: 300
WALL_JUMP_FORCE_Y: -400
WALL_SLIDE_SPEED: 100
DASH_SPEED: 500
DASH_DURATION: 200ms
DASH_COOLDOWN: 1000ms
GROUND_POUND_SPEED: 800
```
