# Sprite Rendering - Exercises

## Exercise 1: Load and Draw Single Sprite ⭐

**Goal**: Load an image and draw it on canvas.

**Requirements**:
- Load an image asynchronously
- Draw it at position (100, 100)
- Handle loading errors

---

## Exercise 2: Draw from Sprite Sheet ⭐⭐

**Goal**: Extract a specific frame from a sprite sheet.

**Requirements**:
- Create a 128x32 sprite sheet with 4 frames (32x32 each)
- Draw frame 2 at (200, 200)
- Use 9-parameter drawImage()

---

## Exercise 3: Create Sprite Class ⭐⭐

**Goal**: Build reusable Sprite class.

**Requirements**:
- Store image, frameX, frameY, frameWidth, frameHeight
- Implement draw() method
- Test with multiple sprites

---

## Exercise 4: Horizontal Flip ⭐⭐

**Goal**: Flip sprite based on direction.

**Requirements**:
- Draw sprite facing right
- Draw same sprite facing left (flipped)
- Use ctx.scale(-1, 1)

---

## Exercise 5: Sprite Atlas Loader ⭐⭐⭐

**Goal**: Load sprite sheet + JSON atlas.

**Requirements**:
- Create JSON with frame definitions
- Load both image and JSON
- Get sprite by name

---

## Exercise 6: Asset Manager ⭐⭐⭐

**Goal**: Preload multiple sprite sheets.

**Requirements**:
- Load multiple images in parallel
- Store with string keys
- Provide get() method

---

## Exercise 7: Pixel-Perfect Rendering ⭐⭐

**Goal**: Ensure sprites stay crisp when scaled.

**Requirements**:
- Disable image smoothing
- Draw 16x16 sprite scaled to 64x64
- Verify pixels stay sharp

---

## Exercise 8: Offscreen Culling ⭐⭐⭐

**Goal**: Only draw visible sprites.

**Requirements**:
- Create 100 sprites in large world
- Implement camera system
- Only draw sprites in camera view

---

## Exercise 9: Sprite Rotation ⭐⭐⭐

**Goal**: Rotate sprites around center.

**Requirements**:
- Rotate sprite by angle (radians)
- Rotate around sprite center
- Animate rotation

---

## Exercise 10: Multiple Animations ⭐⭐⭐⭐

**Goal**: Switch between different sprite animations.

**Requirements**:
- Load idle, walk, jump sprites
- Switch based on player state
- Apply correct flipping

