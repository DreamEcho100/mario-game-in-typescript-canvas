# Topic 03: Camera Systems - Exercises

Complete these exercises to master camera implementation.

---

## Exercise 1: Simple Following Camera
Create a camera that centers on the player.

**Requirements:**
- Camera position calculated from player center
- Apply camera transformation to context
- Draw world and UI correctly

---

## Exercise 2: Bounded Camera
Add bounds to prevent showing outside the level.

**Requirements:**
- Clamp camera X and Y to valid ranges
- Handle levels smaller than viewport
- Test with different level sizes

---

## Exercise 3: Smooth Camera with Lerp
Implement smooth following using linear interpolation.

**Requirements:**
- Lerp factor of 0.1
- Frame-independent smoothing
- Snap function for instant positioning

---

## Exercise 4: Deadzone Camera
Create a deadzone where the camera doesn't move.

**Requirements:**
- 100x80px deadzone in center
- Camera only moves when player exits deadzone
- Smooth movement when following

---

## Exercise 5: Look-Ahead Camera
Make camera anticipate player movement direction.

**Requirements:**
- Look ahead 80px horizontally
- Smooth look-ahead transition
- Reset when player stops

---

## Exercise 6: Camera Shake
Add screen shake for impacts.

**Requirements:**
- Shake intensity and duration parameters
- Random shake direction
- Decay over time

---

## Exercise 7: Complete Mario Camera
Combine all features into one camera system.

**Requirements:**
- Bounds, smoothing, deadzone, look-ahead, shake
- 60 FPS performance
- Clean API

---

## Exercise 8: Visibility Culling
Only draw entities visible to camera.

**Requirements:**
- `isVisible()` method
- Skip drawing off-screen entities
- Measure performance improvement

---

## Exercise 9: Camera Zones
Implement room-based camera constraints.

**Requirements:**
- Define camera zones in level
- Transition between zones
- Lock camera in small rooms

---

## Exercise 10: Vertical Platforming Camera
Optimize camera for vertical levels.

**Requirements:**
- Larger vertical deadzone
- Look-ahead on Y-axis
- Ceiling/floor bias

---

See `c-solutions.md` for complete implementations.
