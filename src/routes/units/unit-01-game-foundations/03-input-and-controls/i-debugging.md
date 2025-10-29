# Input & Controls - Debugging Guide

**Unit 01: Game Foundations | Topic 03**

> Real bugs, real solutions.

---

## Bug #1: Keys Don't Work at All

### Symptoms
- No response to keyboard input
- Console shows no errors
- Event listeners seem to be attached

### Diagnosis

**Check 1: Is canvas focused?**
```typescript
console.log(document.activeElement); // What element has focus?
```

**Check 2: Are events actually firing?**
```typescript
document.addEventListener('keydown', (e) => {
    console.log('Key pressed:', e.key); // Does this log?
});
```

### Root Cause

Canvas doesn't have focus by default. Keyboard events go to `document`, but if another element (like an input field) has focus, events might be captured.

### Solution

```typescript
// Option 1: Always listen on document (recommended)
document.addEventListener('keydown', ...);

// Option 2: Make canvas focusable
canvas.tabIndex = 1; // Makes canvas focusable
canvas.focus();

// Option 3: Focus canvas on click
canvas.addEventListener('click', () => {
    canvas.focus();
});
```

### Prevention

Always attach keyboard listeners to `document`, not `canvas`. Canvas is for rendering, document is for global input.

---

## Bug #2: Arrow Keys Scroll the Page

### Symptoms
- Arrow keys move the player AND scroll the page
- Player movement is choppy
- Page jumps around while playing

### Diagnosis

```typescript
document.addEventListener('keydown', (e) => {
    console.log('Default prevented?', e.defaultPrevented);
});
```

### Root Cause

Arrow keys have default browser behavior (scroll). Space also scrolls. You must prevent this.

### Solution

```typescript
document.addEventListener('keydown', (e) => {
    // Prevent default for game keys
    const GAME_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
    
    if (GAME_KEYS.includes(e.key)) {
        e.preventDefault(); // ← Critical!
    }
    
    // Your input handling
    keys.add(e.key);
});
```

### Prevention

**Always** call `e.preventDefault()` for keys used in your game. Do this in the event listener, before any other logic.

---

## Bug #3: Holding Space Spawns Many Objects

### Symptoms
- Press Space once → 5 circles spawn
- Holding Space → objects spam continuously
- Should spawn one object per press

### Diagnosis

```typescript
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        console.log('Space pressed');
        // If this logs repeatedly while holding, that's the issue
    }
});
```

### Root Cause

**Problem 1:** Using `keydown` directly for spawning (key repeat triggers it)

**Problem 2:** Not tracking "just pressed this frame"

### Solution

```typescript
class KeyboardManager {
    private keys: Set<string> = new Set();
    private keysPressed: Set<string> = new Set();
    
    constructor() {
        document.addEventListener('keydown', (e) => {
            // Only add to pressed if wasn't already down
            if (!this.keys.has(e.key)) {
                this.keysPressed.add(e.key);
            }
            this.keys.add(e.key);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
    }
    
    isPressed(key: string): boolean {
        return this.keysPressed.has(key);
    }
    
    update() {
        this.keysPressed.clear(); // Clear each frame!
    }
}

// Usage
function gameLoop() {
    if (keyboard.isPressed(' ')) {
        spawnCircle(); // Only fires once per press
    }
    
    keyboard.update(); // Don't forget!
}
```

### Prevention

- Use `isPressed()` for single actions (jump, shoot)
- Use `isDown()` for continuous actions (move)
- Always call `update()` each frame

---

## Bug #4: Multiple Keys Don't Work Simultaneously

### Symptoms
- Can move right OR jump, but not both at once
- Diagonal movement doesn't work
- Only one key detected at a time

### Diagnosis

```typescript
document.addEventListener('keydown', (e) => {
    console.log('Keys down:', Array.from(keys));
    // Should show multiple keys when both pressed
});
```

### Root Cause

**Hardware limitation:** Some cheap keyboards have "key rollover" limits (can't detect 3+ keys).

**Software bug:** Using `if/else` instead of separate `if` statements.

### Solution

```typescript
// ❌ Bad: Only one branch executes
if (input.isDown('ArrowRight')) {
    x += speed;
} else if (input.isDown(' ')) {
    jump();
}

// ✅ Good: Both can execute
if (input.isDown('ArrowRight')) {
    x += speed;
}
if (input.isPressed(' ')) { // Separate if!
    jump();
}
```

**For hardware limits:**
```typescript
// Test key rollover
document.addEventListener('keydown', (e) => {
    console.log('Simultaneous keys:', keys.size);
});
// Try pressing: Right + Up + Space
// If size never exceeds 2, keyboard has 2-key rollover limit
```

**Workaround:** Offer WASD alternative to arrows (different key zones).

### Prevention

- Use separate `if` statements, not `if/else`
- Support multiple key bindings (arrows AND WASD)
- Test with 3+ keys pressed simultaneously

---

## Bug #5: Mouse Position is Wrong

### Symptoms
- Click on player → detects click 50px to the right
- Mouse position offset from visual location
- Works correctly only when canvas is at top-left of page

### Diagnosis

```typescript
canvas.addEventListener('click', (e) => {
    console.log('clientX:', e.clientX, 'clientY:', e.clientY);
    console.log('Canvas rect:', canvas.getBoundingClientRect());
    console.log('Calculated X:', e.clientX - canvas.getBoundingClientRect().left);
});
```

### Root Cause

`e.clientX/Y` are viewport coordinates, not canvas coordinates. Must account for canvas position on page.

### Solution

```typescript
// ❌ Wrong
mouse.x = e.clientX;
mouse.y = e.clientY;

// ✅ Correct
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});
```

**If canvas is CSS-scaled:**
```typescript
const rect = canvas.getBoundingClientRect();
const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;

mouse.x = (e.clientX - rect.left) * scaleX;
mouse.y = (e.clientY - rect.top) * scaleY;
```

### Prevention

Always use `getBoundingClientRect()` to convert mouse coordinates. Recalculate if window resizes:

```typescript
window.addEventListener('resize', () => {
    // Update mouse conversion logic
});
```

---

## Bug #6: "this is undefined" in Event Handler

### Symptoms
```
TypeError: Cannot read property 'keys' of undefined
    at onKeyDown
```
- Event fires, but `this` is `undefined`
- Class methods don't have access to instance properties

### Diagnosis

```typescript
class Input {
    constructor() {
        document.addEventListener('keydown', this.onKeyDown);
    }
    
    onKeyDown(e: KeyboardEvent) {
        console.log(this); // undefined!
        this.keys.add(e.key); // Error
    }
}
```

### Root Cause

Event listeners lose `this` context. When browser calls `this.onKeyDown`, it doesn't know what `this` should be.

### Solution

**Option 1: Bind (recommended)**
```typescript
constructor() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
}
```

**Option 2: Arrow function**
```typescript
constructor() {
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
}
```

**Option 3: Make method an arrow function**
```typescript
class Input {
    private onKeyDown = (e: KeyboardEvent) => {
        this.keys.add(e.key); // this works!
    }
}
```

### Prevention

Always bind event handlers or use arrow functions when attaching class methods to events.

---

## Bug #7: Input Lag / Delayed Response

### Symptoms
- Press jump → player jumps 100-200ms later
- Controls feel sluggish
- Input works but feels "muddy"

### Diagnosis

```typescript
const inputLag = new InputLagMeter();

document.addEventListener('keydown', (e) => {
    inputLag.recordInput(e.key, performance.now());
});

// In game loop
if (keyboard.isPressed(' ')) {
    const lag = performance.now() - inputLag.getInputTime(' ');
    console.log('Input lag:', lag, 'ms');
}
```

### Root Cause

**1. Running game at low FPS:** Input checked once per frame. If running at 30 FPS, that's 33ms between checks.

**2. Processing input before clearing screen:** Visual feedback delayed.

**3. Not using `isPressed`, using `isDown` with timer:** Misses single-frame inputs.

### Solution

```typescript
// ✅ Correct order
function gameLoop(deltaTime: number) {
    // 1. Process input FIRST
    if (keyboard.isPressed(' ')) {
        player.jump();
    }
    
    // 2. Update game state
    player.update(deltaTime);
    
    // 3. Render
    renderer.draw();
    
    // 4. Clear input state
    keyboard.update();
    
    requestAnimationFrame(gameLoop);
}
```

**Measure input lag:**
```typescript
class InputLagMeter {
    measure(inputTime: number): number {
        return performance.now() - inputTime;
    }
}

// Target: < 100ms (60 FPS = 16ms per frame)
```

### Prevention

- Run at 60 FPS minimum
- Process input at start of frame
- Use `isPressed()` for instant actions
- Consider input buffering for 150ms window

---

## Bug #8: Jump Doesn't Work Sometimes

### Symptoms
- Press Space while walking off platform → no jump
- Jump works fine on flat ground
- Inconsistent: sometimes works, sometimes doesn't

### Diagnosis

```typescript
// Add logging
if (keyboard.isPressed(' ')) {
    console.log('Space pressed');
    console.log('isGrounded:', player.isGrounded);
    console.log('Can jump?', player.isGrounded);
    
    if (player.isGrounded) {
        player.jump();
    } else {
        console.log('DENIED: Not grounded');
    }
}
```

### Root Cause

No **coyote time** or **input buffering**. Player presses jump slightly after leaving ground, or slightly before landing. Both feel like they "should" work.

### Solution

**Add Coyote Time (100ms grace period):**
```typescript
class Player {
    private coyoteTime = 0;
    
    update(deltaTime: number) {
        if (this.isGrounded) {
            this.coyoteTime = 0;
        } else {
            this.coyoteTime += deltaTime;
        }
        
        // Can jump if grounded OR recently grounded
        const canJump = this.isGrounded || this.coyoteTime < 0.1;
        
        if (keyboard.isPressed(' ') && canJump) {
            this.jump();
        }
    }
}
```

**Add Input Buffering (150ms window):**
```typescript
// Record jump press even if can't jump yet
if (keyboard.isPressed(' ')) {
    inputBuffer.recordInput('jump', currentTime);
}

// When landing, check for buffered jump
if (this.isGrounded) {
    if (inputBuffer.consumeInput('jump', currentTime)) {
        this.jump();
    }
}
```

### Prevention

Always add both coyote time AND input buffering for platformers. Together they make controls feel responsive and fair.

---

## Bug #9: Player Moves at Different Speeds

### Symptoms
- Player moves faster diagonally
- Right+Up is faster than just Right
- Speed is inconsistent

### Diagnosis

```typescript
const axis = getMovementAxis();
const length = Math.sqrt(axis.x * axis.x + axis.y * axis.y);
console.log('Movement vector length:', length);
// Should always be 0 or 1, not 1.41
```

### Root Cause

When moving diagonally, both X and Y are 1, giving a vector length of √(1² + 1²) = 1.41. Player moves 41% faster!

### Solution

```typescript
function getMovementAxis() {
    let x = 0, y = 0;
    
    if (input.isDown('ArrowRight')) x += 1;
    if (input.isDown('ArrowLeft')) x -= 1;
    if (input.isDown('ArrowUp')) y -= 1;
    if (input.isDown('ArrowDown')) y += 1;
    
    // Normalize diagonal movement
    if (x !== 0 && y !== 0) {
        const len = Math.sqrt(x * x + y * y); // len = 1.41
        x /= len; // x = 0.707
        y /= len; // y = 0.707
        // New length: sqrt(0.707² + 0.707²) = 1 ✓
    }
    
    return {x, y};
}
```

### Prevention

Always normalize diagonal input vectors. Formula:
```
if (x ≠ 0 AND y ≠ 0):
    len = √(x² + y²)
    x = x / len
    y = y / len
```

---

## Bug #10: Context Menu Opens on Right-Click

### Symptoms
- Right-click in canvas → browser context menu appears
- Can't use right mouse button for gameplay
- Menu blocks game

### Diagnosis

Is `contextmenu` event prevented?

### Root Cause

Browser's default behavior for right-click is to show context menu. Must be explicitly prevented.

### Solution

```typescript
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
```

**For all mouse buttons:**
```typescript
canvas.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Prevents context menu AND text selection
});
```

### Prevention

Always prevent context menu if using right mouse button for gameplay.

---

## Debugging Tools

### 1. Visual Input Display

```typescript
function drawInputDebug(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 300, 150);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    let y = 30;
    
    // Held keys
    const heldKeys = Array.from(keyboard['keys']); // Access private for debug
    ctx.fillText(`Held: ${heldKeys.join(', ') || 'none'}`, 20, y);
    y += 20;
    
    // Just pressed
    const pressed = Array.from(keyboard['keysPressed']);
    ctx.fillStyle = 'yellow';
    ctx.fillText(`Pressed: ${pressed.join(', ') || 'none'}`, 20, y);
    y += 20;
    
    // Mouse
    ctx.fillStyle = 'white';
    ctx.fillText(`Mouse: (${mouse.x}, ${mouse.y})`, 20, y);
    y += 20;
    
    // Mouse buttons
    const buttons = [];
    if (mouse.isButtonDown(0)) buttons.push('L');
    if (mouse.isButtonDown(1)) buttons.push('M');
    if (mouse.isButtonDown(2)) buttons.push('R');
    ctx.fillText(`Buttons: ${buttons.join(', ') || 'none'}`, 20, y);
    
    ctx.restore();
}
```

### 2. Input History Graph

```typescript
class InputHistory {
    private history: Array<{time: number, key: string}> = [];
    private readonly MAX_AGE = 2; // seconds
    
    record(key: string, time: number) {
        this.history.push({time, key});
        
        // Remove old
        this.history = this.history.filter(
            entry => time - entry.time < this.MAX_AGE
        );
    }
    
    draw(ctx: CanvasRenderingContext2D, currentTime: number) {
        const startX = 10;
        const startY = 500;
        const pixelsPerSecond = 200;
        
        this.history.forEach(entry => {
            const age = currentTime - entry.time;
            const x = startX + age * pixelsPerSecond;
            
            ctx.fillStyle = 'white';
            ctx.fillText(entry.key, x, startY);
        });
    }
}
```

### 3. Input Lag Meter

```typescript
class InputLagMeter {
    private inputs: Map<string, number> = new Map();
    
    recordInput(key: string) {
        this.inputs.set(key, performance.now());
    }
    
    recordResponse(key: string): number {
        const inputTime = this.inputs.get(key);
        if (inputTime) {
            const lag = performance.now() - inputTime;
            this.inputs.delete(key);
            return lag;
        }
        return 0;
    }
}

// Usage
if (keyboard.isPressed(' ')) {
    lagMeter.recordInput('jump');
    player.jump();
    const lag = lagMeter.recordResponse('jump');
    console.log(`Jump lag: ${lag.toFixed(2)}ms`);
}
```

---

## Testing Checklist

### Basic Functionality
- [ ] Keys tracked correctly
- [ ] Mouse position accurate
- [ ] Multiple keys work simultaneously
- [ ] isPressed() works (no spam)
- [ ] isReleased() works

### Edge Cases
- [ ] Page doesn't scroll with arrow keys
- [ ] Works when canvas is scrolled
- [ ] Works when canvas is CSS-scaled
- [ ] Works after tab switch
- [ ] No context menu on right-click

### Feel
- [ ] Input lag < 100ms
- [ ] Diagonal movement normalized
- [ ] Buffering makes controls responsive
- [ ] Coyote time makes platforming fair

### Robustness
- [ ] No "this is undefined" errors
- [ ] update() called each frame
- [ ] Event listeners properly bound
- [ ] Works on different keyboards

---

**Next:** Common questions in `j-faq.md`! 🎮