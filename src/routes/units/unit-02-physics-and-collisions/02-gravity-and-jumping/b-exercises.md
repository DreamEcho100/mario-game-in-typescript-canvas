# Gravity and Jumping - Exercises

## Instructions
- Complete exercises in order
- Test in browser with real-time feedback
- Difficulty: ⭐ = Easy, ⭐⭐ = Medium, ⭐⭐⭐ = Hard
- Estimated time: 2-3 hours

---

## Exercise 1: Basic Gravity ⭐

**Goal**: Create a ball that falls with gravity and stops on the ground.

**Requirements**:
- Ball starts at y=100
- Gravity: 980 px/s²
- Ground at y=500
- Ball stops when hitting ground

**Starter Code**:
```typescript
class Ball {
  x = 400;
  y = 100;
  velocityY = 0;
  
  readonly GRAVITY = 980;
  readonly GROUND_Y = 500;
  
  update(deltaTime: number): void {
    // TODO: Apply gravity
    // TODO: Apply velocity
    // TODO: Check ground collision
  }
}
```

---

## Exercise 2: Simple Jump ⭐

**Goal**: Add jump ability (press Space to jump).

**Requirements**:
- Jump force: -450 px/s
- Can only jump when on ground
- Use spacebar to jump

---

## Exercise 3: Variable Jump Height ⭐⭐

**Goal**: Allow shorter jumps by releasing space early.

**Requirements**:
- Full jump when holding space
- Short jump when tapping space
- Jump release multiplier: 0.5

---

## Exercise 4: Terminal Velocity ⭐⭐

**Goal**: Limit maximum fall speed.

**Requirements**:
- Max fall speed: 600 px/s
- Show speed on screen
- Visual difference between normal and max speed falling

---

## Exercise 5: Jump Buffer ⭐⭐

**Goal**: Allow pressing jump before landing.

**Requirements**:
- Buffer duration: 100ms
- Jump executes on landing if buffered
- Show buffer timer on screen

---

## Exercise 6: Coyote Time ⭐⭐

**Goal**: Allow jumping shortly after leaving ground.

**Requirements**:
- Coyote duration: 150ms
- Can jump during coyote time
- Show coyote timer

---

## Exercise 7: Double Jump ⭐⭐

**Goal**: Allow one additional jump in mid-air.

**Requirements**:
- 2 total jumps (ground + air)
- Second jump slightly weaker (90% power)
- Show remaining jumps

---

## Exercise 8: Air Control ⭐⭐⭐

**Goal**: Add horizontal movement with different air/ground physics.

**Requirements**:
- Ground acceleration: 1200 px/s²
- Air acceleration: 600 px/s²
- Ground friction: 0.8
- Air friction: 0.95
- Max speed: 250 px/s

---

## Exercise 9: Complete Platformer Controller ⭐⭐⭐

**Goal**: Combine all mechanics into one polished controller.

**Requirements**:
- All previous features
- Smooth movement
- Responsive controls
- Visual feedback (animations/particles)

---

## Exercise 10: Wall Jump ⭐⭐⭐

**Goal**: Allow jumping off walls.

**Requirements**:
- Detect wall collision
- Wall jump pushes away from wall
- Can wall jump multiple times
- Wall slide (slower fall speed on walls)

---

## Bonus Challenges

### Challenge 1: Dash Ability
- Quick horizontal burst
- Cooldown system
- Can dash in air once

### Challenge 2: Glide
- Hold jump while falling to slow descent
- Limited glide duration
- Glide meter that recharges on ground

### Challenge 3: Grappling Hook
- Shoot hook to attach points
- Swing physics
- Release to maintain momentum
