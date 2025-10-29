# Input & Controls - Exercises

**Unit 01: Game Foundations | Topic 03**

> Build muscle memory by implementing real input systems!

---

## Exercise 1: Basic Keyboard State ⭐

**Objective:** Track keyboard state properly.

**Requirements:**
- Create a `KeyboardManager` class
- Track which keys are currently down
- Add `isDown(key)` method
- Test with arrow keys to move a square

**Starter Code:**
```typescript
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

class KeyboardManager {
    // TODO: Implement keyboard tracking
}

const keyboard = new KeyboardManager();
let squareX = 400;
let squareY = 300;
const SPEED = 200;

function gameLoop(timestamp: number) {
    const deltaTime = 0.016; // Simplified for now
    
    // TODO: Check keyboard state and move square
    
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(squareX - 25, squareY - 25, 50, 50);
    
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
```

**Test:**
- Arrow keys should move the square smoothly
- Multiple keys should work simultaneously (diagonal)
- Movement should be continuous while held

---

## Exercise 2: Just Pressed Detection ⭐⭐

**Objective:** Detect single frame key presses.

**Requirements:**
- Extend `KeyboardManager` with `isPressed(key)` method
- Track keys that were just pressed this frame
- Clear pressed state each frame with `update()`
- Press Space to spawn a circle, hold arrows to move it

**Expected Behavior:**
- Holding Space doesn't spam circles
- Each Space press creates exactly one circle
- Circles stay after creation

**Hint:** You need a separate `Set<string>` for just-pressed keys.

---

## Exercise 3: Mouse Tracking ⭐

**Objective:** Get accurate mouse position on canvas.

**Requirements:**
- Create `MouseManager` class
- Track mouse X and Y position
- Handle `mousemove` event
- Draw a crosshair at mouse position

**Considerations:**
- Account for canvas offset: `getBoundingClientRect()`
- Update position continuously
- Handle mouse leaving canvas

---

## Exercise 4: Mouse Button States ⭐⭐

**Objective:** Track left, right, and middle mouse buttons.

**Requirements:**
- Extend `MouseManager` with button tracking
- Support `isButtonDown(button)` and `isButtonPressed(button)`
- Left click = paint white
- Right click = paint red
- Middle click = erase (black)

**Mouse Button Constants:**
```typescript
const MOUSE_LEFT = 0;
const MOUSE_MIDDLE = 1;
const MOUSE_RIGHT = 2;
```

**Test:**
- Click and drag to paint
- Right-click doesn't open context menu
- Single clicks work (isPressed)

---

## Exercise 5: Input Buffer ⭐⭐⭐

**Objective:** Buffer jump inputs for responsive platformer controls.

**Requirements:**
- Create `InputBuffer` class
- `recordInput(action, time)` - store input
- `consumeInput(action, time)` - use buffered input if recent
- Buffer window: 150ms

**Scenario:**
- Player presses jump while in air
- When they land, execute buffered jump
- Old inputs (>150ms) are ignored

**Code Structure:**
```typescript
class InputBuffer {
    private buffer: Map<string, number> = new Map();
    private readonly BUFFER_TIME = 0.15;
    
    recordInput(action: string, time: number) { /* ... */ }
    consumeInput(action: string, currentTime: number): boolean { /* ... */ }
    cleanOld(currentTime: number) { /* ... */ }
}
```

---

## Exercise 6: Coyote Time ⭐⭐⭐

**Objective:** Allow jumping for short time after leaving platform.

**Requirements:**
- Track time since last grounded
- Allow jump within 100ms of leaving ground
- Show visual indicator of coyote time (change player color)

**Implementation Tips:**
```typescript
private coyoteTime = 0;

update(deltaTime: number) {
    if (this.isGrounded) {
        this.coyoteTime = 0;
    } else {
        this.coyoteTime += deltaTime;
    }
    
    const canJump = this.isGrounded || this.coyoteTime < 0.1;
    // ...
}
```

---

## Exercise 7: Variable Height Jump ⭐⭐⭐

**Objective:** Jump height depends on how long Space is held.

**Requirements:**
- Initial jump velocity: -600 px/s
- If Space held: apply additional upward force
- Max hold time: 300ms
- If Space released early: cut velocity in half

**Behavior:**
- Tap Space = short hop
- Hold Space = high jump
- Release during ascent = stops rising quickly

---

## Exercise 8: Unified Input Manager ⭐⭐

**Objective:** Combine keyboard, mouse, and touch in one interface.

**Requirements:**
- Create `InputManager` class that contains:
  - `keyboard: KeyboardManager`
  - `mouse: MouseManager`
- Add convenience methods:
  - `getMovementAxis()` - returns {x, y} from WASD/arrows
  - `getJumpInput()` - checks Space, W, or Up
- Single `update()` call updates all sub-managers

**Usage Example:**
```typescript
const input = new InputManager(canvas);

function gameLoop() {
    const axis = input.getMovementAxis();
    player.x += axis.x * SPEED * deltaTime;
    player.y += axis.y * SPEED * deltaTime;
    
    if (input.getJumpInput()) {
        player.jump();
    }
    
    input.update();
}
```

---

## Exercise 9: Key Remapping ⭐⭐⭐

**Objective:** Let players customize controls.

**Requirements:**
- Create `ConfigurableInput` class
- Default bindings:
  - moveLeft: ['ArrowLeft', 'a']
  - moveRight: ['ArrowRight', 'd']
  - jump: [' ', 'w']
- Methods:
  - `isActionDown(action)` - check if any bound key is down
  - `rebind(action, keys)` - change key bindings
  - `saveBindings()` / `loadBindings()` - use localStorage

**Test:**
- Arrow keys and WASD both work by default
- Rebind jump to 'x' - Space stops working, X works
- Reload page - bindings persist

---

## Exercise 10: Touch Virtual Joystick ⭐⭐⭐

**Objective:** Create on-screen joystick for mobile.

**Requirements:**
- Draw base circle (static) and stick circle (moves)
- Touch inside base = activate joystick
- Drag = move stick (clamped to max distance)
- `getAxis()` returns {x, y} from -1 to 1
- Release = stick snaps back to center

**Visual:**
```
    Base (translucent)
        |
     Stick (opaque, follows touch)
```

**Calculations:**
```typescript
// Distance from base to touch
dx = touchX - baseX;
dy = touchY - baseY;
dist = sqrt(dx² + dy²);

// Clamp to max distance
if (dist > maxDist) {
    dx = (dx / dist) * maxDist;
    dy = (dy / dist) * maxDist;
}

// Normalize to -1..1
axis.x = dx / maxDist;
axis.y = dy / maxDist;
```

---

## Exercise 11: Multi-Key Detection ⭐⭐

**Objective:** Detect simultaneous key presses for combos.

**Requirements:**
- Detect these combos:
  - Down + Attack = slide
  - Up + Attack = uppercut
  - Left/Right + Jump = long jump
- Show combo name on screen when executed
- Combos should work with buffering

**Hint:** Check multiple conditions in update:
```typescript
if (input.isDown('ArrowDown') && input.isPressed('x')) {
    this.slide();
}
```

---

## Exercise 12: Input Recording/Playback ⭐⭐⭐⭐

**Objective:** Record player inputs and replay them.

**Requirements:**
- Press 'R' to start recording
- Capture all inputs with timestamps
- Press 'R' again to stop
- Press 'P' to playback recording
- Ghost player replays exact inputs

**Data Structure:**
```typescript
interface InputFrame {
    time: number;
    keys: string[];
    mouseX?: number;
    mouseY?: number;
}

class InputRecorder {
    private recording: InputFrame[] = [];
    private isRecording = false;
    private startTime = 0;
    
    // ...
}
```

---

## Exercise 13: Gamepad Support ⭐⭐⭐⭐

**Objective:** Add basic gamepad/controller support.

**Requirements:**
- Detect gamepad connection
- Read analog stick for movement (axis 0 and 1)
- Button 0 (A) = jump
- Add deadzone (0.15) to prevent drift

**Gamepad API Basics:**
```typescript
const gamepads = navigator.getGamepads();
const gp = gamepads[0]; // First connected gamepad

if (gp) {
    const x = gp.axes[0]; // Left stick X
    const y = gp.axes[1]; // Left stick Y
    const jump = gp.buttons[0].pressed; // A button
}
```

---

## Exercise 14: Context-Sensitive Controls ⭐⭐⭐

**Objective:** Controls change based on game state.

**Requirements:**
- **Menu state:** Arrow keys navigate, Enter selects
- **Playing state:** Arrow keys move player, Space jumps
- **Paused state:** Only ESC works (unpause)
- Switch between states with keys

**Implementation:**
```typescript
enum GameState {
    Menu,
    Playing,
    Paused
}

class Game {
    private state = GameState.Menu;
    
    update() {
        switch (this.state) {
            case GameState.Menu:
                this.updateMenu();
                break;
            case GameState.Playing:
                this.updateGame();
                break;
            // ...
        }
    }
}
```

---

## Exercise 15: Input Debug Overlay ⭐⭐

**Objective:** Visual display of all input state for debugging.

**Requirements:**
- Show all keys currently down
- Show mouse position and buttons
- Show input buffer state
- Show coyote time remaining
- Toggle overlay with backtick (`)

**Display Format:**
```
=== Input Debug ===
Keys: [ArrowRight, Space]
Mouse: (450, 320) Buttons: [0]
Buffer: jump (80ms ago)
Coyote: 0.05s remaining
```

---

## 🎯 Challenge Projects

### Challenge 1: Fighting Game Inputs

Implement a fighting game combo system:
- Detect directional inputs: ↓↘→ + Punch = Hadouken
- Time window: 0.5 seconds for sequence
- Show input history on screen
- Multiple special moves with different inputs

### Challenge 2: Rhythm Game Input

Create a rhythm game input system:
- Detect input timing accuracy (Perfect, Good, Miss)
- Perfect: ±50ms, Good: ±100ms
- Visual feedback for timing
- Calculate score based on accuracy

### Challenge 3: Accessibility Options

Add accessibility features:
- Sticky keys (hold key for short time = toggle)
- Key repeat rate adjustment
- One-handed mode (remapped controls)
- Button mashing assistance (single press = multiple inputs)

---

## Testing Checklist

✅ **Keyboard:**
- [ ] Keys tracked correctly (isDown)
- [ ] Just pressed detection (isPressed)
- [ ] Multiple keys simultaneously
- [ ] Arrow keys don't scroll page

✅ **Mouse:**
- [ ] Accurate position on canvas
- [ ] Works with canvas at any position
- [ ] Button states correct
- [ ] No context menu on right-click

✅ **Touch:**
- [ ] Touch position accurate
- [ ] Multi-touch works
- [ ] Virtual joystick responsive
- [ ] No zoom/scroll on touch

✅ **Features:**
- [ ] Input buffering works
- [ ] Coyote time feels good
- [ ] Variable jump height intuitive
- [ ] Remapping persists

---

## Common Mistakes

### 1. Not Preventing Default
```typescript
// ❌ Arrow keys scroll the page
document.addEventListener('keydown', (e) => {
    keys.add(e.key);
});

// ✅ Prevent scrolling
document.addEventListener('keydown', (e) => {
    if (e.key.startsWith('Arrow')) {
        e.preventDefault();
    }
    keys.add(e.key);
});
```

### 2. Forgetting to Update Input
```typescript
// ❌ isPressed never clears
function gameLoop() {
    if (input.isPressed('Space')) jump();
    // Forgot: input.update();
}

// ✅ Clear frame state
function gameLoop() {
    if (input.isPressed('Space')) jump();
    input.update(); // Clear isPressed, isReleased
}
```

### 3. Wrong Mouse Coordinates
```typescript
// ❌ Wrong if canvas is positioned
mouse.x = e.clientX;
mouse.y = e.clientY;

// ✅ Account for canvas position
const rect = canvas.getBoundingClientRect();
mouse.x = e.clientX - rect.left;
mouse.y = e.clientY - rect.top;
```

### 4. Using keyCode (Deprecated)
```typescript
// ❌ Deprecated
if (e.keyCode === 32) // Space

// ✅ Use key property
if (e.key === ' ') // Space
```

### 5. Not Binding Event Handlers
```typescript
// ❌ 'this' is undefined
class Input {
    constructor() {
        document.addEventListener('keydown', this.onKeyDown);
    }
    onKeyDown(e) {
        this.keys.add(e.key); // Error: this is undefined!
    }
}

// ✅ Bind or use arrow function
constructor() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    // or
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
}
```

---

## Tips for Success

1. **Test edge cases:**
   - Rapid key presses
   - Multiple keys at once
   - Tab switching and returning
   - Canvas scrolled/positioned

2. **Feel matters:**
   - Input buffer makes controls feel responsive
   - Coyote time makes platforming forgiving
   - Variable jump gives player control

3. **Debug visually:**
   - Draw indicators for buffered inputs
   - Show coyote time with color changes
   - Display input state on screen

4. **Support multiple inputs:**
   - WASD + Arrow keys
   - Space + W + Up for jump
   - Players have preferences!

---

**Next:** Check your solutions in `c-solutions.md`! 🎮