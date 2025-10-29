# Particle Systems - Exercises

## Exercise 1: Basic Particle ⭐

**Goal**: Create single particle that fades out.

**Requirements**:
- Position, velocity, lifetime
- Updates each frame
- Fades based on remaining lifetime
- Removes when dead

---

## Exercise 2: Particle System ⭐

**Goal**: Manage multiple particles.

**Requirements**:
- Array of particles
- Update all particles
- Remove dead particles
- Draw all particles

---

## Exercise 3: Landing Dust ⭐⭐

**Goal**: Dust cloud when player lands.

**Requirements**:
- Spawn 8 particles in arc pattern
- Gray color
- Spread outward and up
- 400-600ms lifetime

---

## Exercise 4: Dash Trail ⭐⭐

**Goal**: Trail effect during dash.

**Requirements**:
- Spawn particle every 2 frames during dash
- Player-sized particle at player position
- Fades quickly (150ms)
- Gold color

---

## Exercise 5: Coin Sparkle ⭐⭐

**Goal**: Burst when collecting coin.

**Requirements**:
- 12 particles in circle pattern
- Gold/yellow colors
- Explode outward
- Slight upward gravity

---

## Exercise 6: Screen Shake ⭐⭐

**Goal**: Camera shake on impact.

**Requirements**:
- Random offset to camera
- Decays over time
- Stronger shake = bigger action
- Stops when intensity < threshold

---

## Exercise 7: Flash Effect ⭐⭐⭐

**Goal**: Full screen flash.

**Requirements**:
- White flash on damage
- Yellow flash on coin collect
- Fades out quickly
- Drawn over everything

---

## Exercise 8: Object Pooling ⭐⭐⭐

**Goal**: Reuse particles for performance.

**Requirements**:
- Pre-allocate 500 particles
- Active/inactive lists
- Spawn reuses inactive particle
- Dead particles return to pool

---

## Exercise 9: Complete Juice ⭐⭐⭐

**Goal**: All effects working together.

**Requirements**:
- Landing dust + shake
- Dash trail
- Coin sparkle + flash + shake
- Jump dust
- Wall slide particles

---

## Exercise 10: Particle Types ⭐⭐⭐⭐

**Goal**: Multiple particle renderers.

**Requirements**:
- Circle particles
- Square particles
- Line particles (speed lines)
- Sprite particles (images)
