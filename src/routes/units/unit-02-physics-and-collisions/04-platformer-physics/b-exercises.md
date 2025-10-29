# Platformer Physics - Exercises

## Exercise 1: Basic Platformer ⭐

**Goal**: Combine velocity, gravity, and collision.

**Requirements**:
- Player with WASD movement
- Gravity pulling down
- Floor platform
- Jump with spacebar

---

## Exercise 2: Multi-Platform Level ⭐⭐

**Goal**: Create a level with multiple platforms.

**Requirements**:
- At least 5 platforms at different heights
- Player can jump between them
- No falling through platforms

---

## Exercise 3: Add Jump Buffering ⭐⭐

**Goal**: Remember jump input before landing.

**Requirements**:
- 100ms jump buffer window
- Execute jump on landing if buffered
- Visual indicator when buffer active

---

## Exercise 4: Implement Coyote Time ⭐⭐

**Goal**: Grace period after walking off ledge.

**Requirements**:
- 150ms coyote time window
- Can still jump during coyote time
- Visual indicator (progress bar)

---

## Exercise 5: Double Jump ⭐⭐

**Goal**: Allow jumping in mid-air.

**Requirements**:
- Jump once while airborne
- Reset on landing
- Different animation/effect for double jump

---

## Exercise 6: Variable Jump Height ⭐⭐

**Goal**: Short tap = small jump, hold = high jump.

**Requirements**:
- Release jump early for shorter jump
- Smooth transition (not instant stop)
- Tune the release multiplier

---

## Exercise 7: Air Control ⭐⭐⭐

**Goal**: Different control in air vs ground.

**Requirements**:
- Faster acceleration on ground
- Slower acceleration in air
- Different friction values

---

## Exercise 8: Complete Platformer ⭐⭐⭐

**Goal**: All mechanics combined.

**Requirements**:
- Jump buffering
- Coyote time
- Double jump
- Variable jump height
- Air control
- Smooth movement

---

## Exercise 9: Add Dash Mechanic ⭐⭐⭐

**Goal**: Quick burst of speed in direction.

**Requirements**:
- Dash with Shift key
- Cooldown (1 second)
- Momentum boost
- Visual dash trail

---

## Exercise 10: Camera Follow ⭐⭐⭐

**Goal**: Camera smoothly follows player.

**Requirements**:
- Dead zone (don't move camera in center)
- Smooth lerp following
- Large level (bigger than screen)
- Camera bounds (don't show outside level)

---

## Bonus Challenge 1: Wall Jump ⭐⭐⭐⭐

**Requirements**:
- Detect when touching wall
- Jump away from wall
- Wall slide (slow fall when holding wall)
- Vertical walls on sides of platforms

---

## Bonus Challenge 2: Moving Platforms ⭐⭐⭐⭐

**Requirements**:
- Platform moves horizontally
- Player moves with platform
- Can jump off platform
- Multiple moving platforms

---

## Bonus Challenge 3: Complete Game Level ⭐⭐⭐⭐⭐

**Requirements**:
- Starting platform
- Goal platform
- Collectible items (coins)
- Death zone (fall off = respawn)
- Timer display
- Win screen
