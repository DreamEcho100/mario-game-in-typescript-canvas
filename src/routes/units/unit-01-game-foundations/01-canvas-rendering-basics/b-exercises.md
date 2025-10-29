# Canvas Rendering Basics - Exercises

**Unit 01: Game Foundations | Topic 01 | Practice Challenges**

> **Goal:** Apply what you learned in `a-lesson.md` through hands-on coding exercises. Start with simple tasks and progress to more complex challenges.

---

## How to Use These Exercises

1. **Read the objective** — Understand what you're building
2. **Check requirements** — Know what success looks like
3. **Try it yourself** — Code without looking at solutions
4. **Use hints** — If stuck, read the hints
5. **Compare solutions** — Check `c-solutions.md` when done
6. **Experiment** — Modify and extend your solution

**Time Estimate:** 2-3 hours for all exercises

---

## Exercise 1: Draw a Colored Square

### Objective
Create a canvas and draw a single colored square in the center.

### Requirements
- Canvas size: 400×400 pixels
- Square size: 50×50 pixels
- Color: Any color you like
- Square should be perfectly centered

### Hints
- Center X = (canvas.width - squareSize) / 2
- Center Y = (canvas.height - squareSize) / 2
- Use `fill Rect(x, y, width, height)`

### Bonus
- Add a stroke (outline) around the square
- Try different colors using hex, RGB, and HSL formats

---

## Exercise 2: Traffic Light

### Objective
Draw a vertical traffic light with three circles: red, yellow, and green.

### Requirements
- Black rectangular background (80×200 pixels)
- Three circles stacked vertically
- Colors: red (top), yellow (middle), green (bottom)
- Each circle has 25px radius
- Circles are centered horizontally in the rectangle

### Hints
- Draw the black rectangle first
- Use `ctx.arc()` for circles
- Full circle: 0 to `Math.PI * 2`
- Space circles evenly

### Bonus
- Make only one light "on" (brighter) and others dim
- Add a gray border around the traffic light box

---

## Exercise 3: Checkerboard Pattern

### Objective
Create an 8×8 checkerboard pattern like a chessboard.

### Requirements
- Canvas size: 400×400 pixels
- 8×8 grid (64 squares total)
- Alternate between two colors (traditionally black and white)
- Each cell is 50×50 pixels

### Hints
- Use nested loops: outer for rows, inner for columns
- Alternate colors based on (row + col) % 2
- Calculate position: `x = col * cellSize`, `y = row * cellSize`

### Bonus
- Add border lines between squares
- Use different color schemes (brown/beige for wood, etc.)
- Add coordinates (A1, B2, etc.) in each square

---

## Exercise 4: Gradient Sky

### Objective
Create a sky-like gradient that transitions from dark blue at the top to light blue at the bottom.

### Requirements
- Canvas size: 800×600 pixels
- Linear gradient from top to bottom
- Dark blue (#191970) at top
- Light blue (#87CEEB) at bottom
- Smooth transition

### Hints
- Use `ctx.createLinearGradient(x0, y0, x1, y1)`
- For vertical gradient: same X, different Y
- Add color stops at 0 (top) and 1 (bottom)

### Bonus
- Add a third color in the middle (lighter blue)
- Create a sunset gradient (orange/pink/purple)
- Add a white sun circle in the corner

---

## Exercise 5: Grid System

### Objective
Draw a grid overlay useful for level design and debugging.

### Requirements
- Canvas size: 800×600 pixels
- Grid lines every 50 pixels
- Light gray lines (#ddd)
- Lines 1px thick
- Both horizontal and vertical lines

### Hints
- Loop from 0 to canvas.width, step by gridSize
- Use `moveTo()` and `lineTo()` for each line
- Don't forget `ctx.stroke()` to actually draw

### Bonus
- Make every 5th line thicker (major grid lines)
- Add coordinate labels at intersections
- Color-code lines (horizontal vs vertical)

---

## Exercise 6: Simple Face

### Objective
Draw a simple smiley face using circles and arcs.

### Requirements
- Yellow circle for face (100px radius)
- Two black dots for eyes
- Arc for smile
- Centered on canvas

### Hints
- Draw face circle first (filled yellow)
- Eyes: smaller filled circles
- Smile: arc with specific start/end angles
- Use `ctx.beginPath()` before each shape

### Bonus
- Add eyebrows (short lines above eyes)
- Make face expressions: happy, sad, surprised
- Add a nose (small circle or triangle)

---

## Exercise 7: Loading Images

### Objective
Load and display an image on the canvas.

### Requirements
- Create or download a small image file (e.g., player sprite)
- Load the image asynchronously
- Display it at position (100, 100)
- Handle loading errors gracefully

### Hints
- Use `new Image()`
- Set `img.src` to the file path
- Draw in `img.onload` callback
- Add `img.onerror` handler

### Bonus
- Display "Loading..." text while image loads
- Scale the image to 2× its original size
- Draw multiple copies of the image

---

## Exercise 8: Text Score Display

### Objective
Create a game-like score display in the top-right corner.

### Requirements
- Canvas size: 800×600 pixels
- Text: "Score: 1000"
- Font: Bold 24px Arial
- Color: White
- Position: 20px from top-right corner

### Hints
- Use `ctx.textAlign = 'right'`
- X position: canvas.width - 20
- Use `fillText(text, x, y)`

### Bonus
- Add a semi-transparent black background behind text
- Display multiple stats (Lives, Time, Level)
- Use a custom font (e.g., Press Start 2P)

---

## Exercise 9: Rotating Square

### Objective
Draw a square rotated 45 degrees (diamond shape).

### Requirements
- Square size: 50×50 pixels
- Centered on canvas
- Rotated 45 degrees (π/4 radians)
- Any color

### Hints
- Use `ctx.save()` and `ctx.restore()`
- Translate to center of canvas first
- Then rotate
- Draw square centered on origin: `(-25, -25, 50, 50)`

### Bonus
- Draw multiple squares at different rotation angles
- Animate rotation (for next lesson!)
- Add a non-rotated square for comparison

---

## Exercise 10: Simple Platform Scene

### Objective
Create a simple platformer scene with ground, platforms, and a player.

### Requirements
- Sky (top 2/3 of canvas, light blue)
- Ground (bottom 1/3, brown)
- 2-3 floating platforms (rectangles)
- Player character (red rectangle, 32×48 pixels)
- All properly positioned

### Hints
- Draw background first (sky, then ground)
- Platforms: rectangles at various Y positions
- Player: standing on ground or platform
- Add outlines for better definition

### Bonus
- Add simple grass texture on ground (green lines)
- Draw coins above platforms
- Add a simple background element (sun, cloud)

---

## Exercise 11: Sprite Sheet Extraction

### Objective
Given a sprite sheet with multiple frames, extract and draw a specific frame.

### Requirements
- Create or download a sprite sheet (e.g., 4 frames of 32×32px each)
- Extract the 3rd frame
- Draw it scaled up to 64×64 pixels

### Hints
- Use 9-parameter `drawImage()`:
  `ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)`
- Source X = frameIndex × frameWidth
- Destination can be anywhere

### Bonus
- Draw all frames in a row
- Add frame number labels below each
- Highlight the selected frame with a border

---

## Exercise 12: Color Palette Creator

### Objective
Create a visual color palette showing different color formats.

### Requirements
- Display 5 colored squares
- Use different color formats:
  - Named color (e.g., "red")
  - Hex (#FF0000)
  - RGB (rgb(255, 0, 0))
  - RGBA with transparency
  - HSL (hsl(0, 100%, 50%))
- Label each square with its format

### Hints
- Arrange squares in a row or grid
- Use `fillText()` to add labels below each
- Leave space between squares

### Bonus
- Create a rainbow gradient using HSL
- Add opacity slider visualization (same color, different alphas)
- Show hex codes for each color

---

## Exercise 13: Performance Test

### Objective
Measure the performance difference between drawing methods.

### Requirements
- Test 1: Draw 1000 small filled rectangles
- Test 2: Draw 1000 stroked circles
- Measure and display time for each in milliseconds
- Use `performance.now()` for timing

### Hints
```typescript
const start = performance.now();
// ... drawing code ...
const end = performance.now();
const time = end - start;
```

### Bonus
- Test different batch sizes (100, 1000, 10000)
- Compare solid colors vs gradients
- Test image drawing performance
- Display results as a bar chart

---

## Exercise 14: Parallax Background Layers

### Objective
Create multiple background layers at different sizes (foundation for parallax scrolling).

### Requirements
- 3 layers: background, midground, foreground
- Different colors for each (darkest in back)
- Simple shapes (mountains, hills) on each layer
- All layers visible simultaneously

### Hints
- Draw back-to-front (painter's algorithm)
- Use different Y positions for each layer
- Mountains: triangles using `beginPath()` and `lineTo()`

### Bonus
- Add transparency to front layers (use rgba)
- Make shapes more complex (multiple triangles for mountain range)
- Add a sun/moon on the background layer

---

## Exercise 15: FPS Counter

### Objective
Create a frames-per-second (FPS) counter to display rendering performance.

### Requirements
- Display current FPS in top-left corner
- Update every frame
- Calculate: FPS = 1000 / deltaTime
- Show as integer (round down)

### Hints
- Calculate delta time: `currentTime - previousTime`
- Store previousTime globally
- Update in game loop
- Display with `fillText()`

### Bonus
- Calculate average FPS over last 60 frames
- Color-code FPS: green (>50), yellow (30-50), red (<30)
- Display frame time in milliseconds
- Add min/max FPS tracking

---

## Challenge Projects

These combine multiple concepts into larger mini-projects.

### Challenge A: Animated Rainbow (30-45 mins)

**Create a canvas that cycles through rainbow colors.**

Requirements:
- Full canvas changes color smoothly
- Cycle through HSL hue: 0° to 360°
- Smooth transition, no jumping
- Display current hue value

Concepts Used:
- HSL color format
- Animation loop (preview of next topic)
- Text rendering

### Challenge B: Simple Paint Tool (45-60 mins)

**Create a basic drawing tool where clicking draws circles.**

Requirements:
- Click anywhere to draw a colored circle
- Each circle is 10px radius
- Random colors for each circle
- Clear button to reset canvas

Concepts Used:
- Mouse event handling
- Drawing circles
- Color randomization
- Canvas clearing

### Challenge C: Tile Map Renderer (60-90 mins)

**Render a small tile-based level from a 2D array.**

Requirements:
- 2D array represents level (0=empty, 1=ground, 2=brick, etc.)
- Each tile is 32×32 pixels
- Different colors for different tile types
- At least 10×10 tile grid

Concepts Used:
- Nested loops
- Array indexing
- Coordinate calculations
- Batch drawing

Example tile array:
```typescript
const level = [
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,0,0,2,0,0],
  [0,0,0,0,0,0,0,2,0,0],
  [1,1,1,1,1,1,1,1,1,1],
];
```

Bonus:
- Add more tile types (water, lava, coin)
- Draw player character on the map
- Load level from JSON file

---

## Debugging Tips

### Common Issues

**Problem: Nothing appears on canvas**
- Check: Is canvas created in HTML?
- Check: Is script loading after canvas element?
- Check: Are there console errors (F12)?

**Problem: Image doesn't show**
- Check: Is image loaded (using `img.onload`)?
- Check: Is file path correct?
- Check: Image size and position within canvas bounds?

**Problem: Colors look wrong**
- Check: Are color values valid (0-255 for RGB)?
- Check: Hex colors have # prefix?
- Check: Alpha values are 0-1, not 0-255?

**Problem: Text is blurry**
- Check: Is font size appropriate?
- Check: Is `imageSmoothingEnabled` set correctly?
- Check: Are positions whole numbers?

### Testing Your Code

Always test:
1. **Edge cases**: Try position (0, 0) and (canvas.width, canvas.height)
2. **Size variations**: Very small and very large shapes
3. **Color limits**: Black, white, fully transparent
4. **Browser console**: Check for errors and warnings

---

## Self-Assessment

After completing these exercises, you should be able to:

- [ ] Create and configure a canvas element
- [ ] Draw basic shapes (rectangles, circles, lines)
- [ ] Apply colors using different formats
- [ ] Create and use gradients
- [ ] Load and draw images
- [ ] Render text with custom styling
- [ ] Use transformations (translate, rotate, scale)
- [ ] Measure and optimize rendering performance
- [ ] Build simple visual scenes
- [ ] Debug common canvas issues

**If you struggled with any area, review that section in `a-lesson.md` before moving on.**

---

## Next Steps

1. **Compare your solutions** with `c-solutions.md`
2. **Review key concepts** in `d-notes.md`
3. **Check common bugs** in `i-debugging.md`
4. **Read FAQ** if anything was unclear (`j-faq.md`)

Then proceed to:
**Unit 01, Topic 02: Game Loop and Timing**

---

**Great work!** You've practiced the fundamentals of canvas rendering. These skills are the building blocks of everything that follows. 🎨✨
