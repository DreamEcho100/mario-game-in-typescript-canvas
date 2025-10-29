# Input & Controls - Solutions

**Unit 01: Game Foundations | Topic 03**

> Complete solutions with explanations.

---

## Exercise 1: Basic Keyboard State ⭐

### Solution

```typescript
class KeyboardManager {
    private keys: Set<string> = new Set();
    
    constructor() {
        document.addEventListener('keydown', (e) => {
            // Prevent arrow keys from scrolling
            if (e.key.startsWith('Arrow')) {
                e.preventDefault();
            }
            this.keys.add(e.key);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
    }
    
    isDown(key: string): boolean {
        return this.keys.has(key);
    }
}

// Complete game code
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

const keyboard = new KeyboardManager();
let squareX = 400;
let squareY = 300;
const SPEED = 200;

let lastTime = 0;

function gameLoop(timestamp: number) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    
    // Movement
    if (keyboard.isDown('ArrowRight')) squareX += SPEED * deltaTime;
    if (keyboard.isDown('ArrowLeft')) squareX -= SPEED * deltaTime;
    if (keyboard.isDown('ArrowDown')) squareY += SPEED * deltaTime;
    if (keyboard.isDown('ArrowUp')) squareY -= SPEED * deltaTime;
    
    // Clear and draw
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(squareX - 25, squareY - 25, 50, 50);
    
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
```

### Explanation

**Key Concepts:**

1. **Set for state:** `Set<string>` efficiently stores unique keys
2. **Add on keydown:** When key pressed, add to set
3. **Remove on keyup:** When key released, remove from set
4. **Query state:** `has()` checks if key currently down

**Why this works:**
- State persists across frames
- Multiple keys work simultaneously
- No key repeat issues (OS doesn't control movement)

### Alternative: Map-Based

```typescript
class KeyboardManager {
    private keys: Map<string, boolean> = new Map();
    
    isDown(key: string): boolean {
        return this.keys.get(key) || false;
    }
}
```

Functionally identical, but `Set` is more semantic for "collection of pressed keys".

---

## Exercise 2: Just Pressed Detection ⭐⭐

### Solution

```typescript
class KeyboardManager {
    private keys: Set<string> = new Set();
    private keysPressed: Set<string> = new Set(); // NEW
    private keysReleased: Set<string> = new Set(); // NEW
    
    constructor() {
        document.addEventListener('keydown', (e) => {
            if (e.key.startsWith('Arrow') || e.key === ' ') {
                e.preventDefault();
            }
            
            // Only add to pressed if wasn't already down
            if (!this.keys.has(e.key)) {
                this.keysPressed.add(e.key);
            }
            
            this.keys.add(e.key);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
            this.keysReleased.add(e.key);
        });
    }
    
    isDown(key: string): boolean {
        return this.keys.has(key);
    }
    
    isPressed(key: string): boolean {
        return this.keysPressed.has(key);
    }
    
    isReleased(key: string): boolean {
        return this.keysReleased.has(key);
    }
    
    update() {
        // Clear frame-specific state
        this.keysPressed.clear();
        this.keysReleased.clear();
    }
}

// Usage: Spawn circles
const circles: Array<{x: number, y: number}> = [];
let circleX = 400;
let circleY = 300;

function gameLoop(deltaTime: number) {
    // Move current position with arrows
    if (keyboard.isDown('ArrowRight')) circleX += 200 * deltaTime;
    if (keyboard.isDown('ArrowLeft')) circleX -= 200 * deltaTime;
    if (keyboard.isDown('ArrowUp')) circleY -= 200 * deltaTime;
    if (keyboard.isDown('ArrowDown')) circleY += 200 * deltaTime;
    
    // Spawn circle on press (not hold!)
    if (keyboard.isPressed(' ')) {
        circles.push({x: circleX, y: circleY});
    }
    
    // Draw
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw all spawned circles
    ctx.fillStyle = 'white';
    circles.forEach(circle => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, 20, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw current position (red)
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(circleX, circleY, 20, 0, Math.PI * 2);
    ctx.fill();
    
    keyboard.update(); // IMPORTANT: Clear frame state
    requestAnimationFrame(gameLoop);
}
```

### Explanation

**Critical Check:**
```typescript
if (!this.keys.has(e.key)) {
    this.keysPressed.add(e.key);
}
```

This prevents key repeat from retriggering. Without this check, holding a key would add to `keysPressed` multiple times per second.

**Why `update()` is necessary:**

```
Frame 1: Space pressed → keysPressed.add('  ')
         gameLoop checks isPressed(' ') → TRUE → spawn circle
         update() → keysPressed.clear()

Frame 2: Space still held
         gameLoop checks isPressed(' ') → FALSE (cleared!)
         No new circle spawned ✓
```

---

## Exercise 3: Mouse Tracking ⭐

### Solution

```typescript
class MouseManager {
    x = 0;
    y = 0;
    
    constructor(canvas: HTMLCanvasElement) {
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.x = e.clientX - rect.left;
            this.y = e.clientY - rect.top;
        });
    }
}

// Usage: Crosshair
const mouse = new MouseManager(canvas);

function gameLoop() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Crosshair
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y - 20);
    ctx.lineTo(mouse.x, mouse.y + 20);
    ctx.stroke();
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(mouse.x - 20, mouse.y);
    ctx.lineTo(mouse.x + 20, mouse.y);
    ctx.stroke();
    
    // Center dot
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Show coordinates
    ctx.fillStyle = 'white';
    ctx.font = '16px monospace';
    ctx.fillText(`(${Math.round(mouse.x)}, ${Math.round(mouse.y)})`, 10, 20);
    
    requestAnimationFrame(gameLoop);
}
```

### Explanation

**Why `getBoundingClientRect()`?**

```typescript
// e.clientX and e.clientY are relative to viewport
// Canvas might not be at (0, 0)!

// If canvas is at (100, 50) on the page:
e.clientX = 250  // Position in viewport
rect.left = 100  // Canvas X position
mouse.x = 250 - 100 = 150 // Position ON CANVAS ✓
```

**Scaled Canvas Issue:**

If canvas is CSS-scaled:
```html
<canvas width="800" height="600" style="width: 400px"></canvas>
```

You need to scale coordinates:
```typescript
const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;
this.x = (e.clientX - rect.left) * scaleX;
this.y = (e.clientY - rect.top) * scaleY;
```

---

## Exercise 4: Mouse Button States ⭐⭐

### Solution

```typescript
const MOUSE_LEFT = 0;
const MOUSE_MIDDLE = 1;
const MOUSE_RIGHT = 2;

class MouseManager {
    x = 0;
    y = 0;
    private buttons: Map<number, boolean> = new Map();
    private buttonsPressed: Set<number> = new Set();
    
    constructor(canvas: HTMLCanvasElement) {
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.x = e.clientX - rect.left;
            this.y = e.clientY - rect.top;
        });
        
        canvas.addEventListener('mousedown', (e) => {
            if (!this.buttons.get(e.button)) {
                this.buttonsPressed.add(e.button);
            }
            this.buttons.set(e.button, true);
        });
        
        canvas.addEventListener('mouseup', (e) => {
            this.buttons.set(e.button, false);
        });
        
        // Prevent context menu on right-click
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    isButtonDown(button: number): boolean {
        return this.buttons.get(button) || false;
    }
    
    isButtonPressed(button: number): boolean {
        return this.buttonsPressed.has(button);
    }
    
    update() {
        this.buttonsPressed.clear();
    }
}

// Usage: Paint application
const mouse = new MouseManager(canvas);

function gameLoop() {
    // Paint with left button (hold)
    if (mouse.isButtonDown(MOUSE_LEFT)) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Paint red with right button
    if (mouse.isButtonDown(MOUSE_RIGHT)) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Erase with middle button
    if (mouse.isButtonDown(MOUSE_MIDDLE)) {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 20, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Clear entire canvas on middle click (press, not hold)
    if (mouse.isButtonPressed(MOUSE_MIDDLE)) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    mouse.update();
    requestAnimationFrame(gameLoop);
}
```

### Alternative: Drag Detection

```typescript
class MouseManager {
    isDragging = false;
    dragStartX = 0;
    dragStartY = 0;
    
    constructor(canvas: HTMLCanvasElement) {
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === MOUSE_LEFT) {
                this.isDragging = true;
                this.dragStartX = this.x;
                this.dragStartY = this.y;
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }
}
```

---

## Exercise 5: Input Buffer ⭐⭐⭐

### Solution

```typescript
class InputBuffer {
    private buffer: Map<string, number> = new Map();
    private readonly BUFFER_TIME = 0.15; // 150ms
    
    recordInput(action: string, time: number) {
        this.buffer.set(action, time);
    }
    
    consumeInput(action: string, currentTime: number): boolean {
        const pressTime = this.buffer.get(action);
        
        if (pressTime !== undefined) {
            const age = currentTime - pressTime;
            
            if (age < this.BUFFER_TIME) {
                // Input is recent, consume it
                this.buffer.delete(action);
                return true;
            }
        }
        
        return false;
    }
    
    cleanOld(currentTime: number) {
        for (const [action, time] of this.buffer.entries()) {
            if (currentTime - time > this.BUFFER_TIME) {
                this.buffer.delete(action);
            }
        }
    }
    
    // Debug helper
    getBufferState(): Map<string, number> {
        return new Map(this.buffer);
    }
}

// Usage: Platformer with buffered jump
class Player {
    x = 100;
    y = 400;
    velocityY = 0;
    isGrounded = false;
    
    private inputBuffer = new InputBuffer();
    private readonly JUMP_FORCE = -600;
    
    update(deltaTime: number, currentTime: number, keyboard: KeyboardManager) {
        // Gravity
        this.velocityY += 980 * deltaTime;
        this.y += this.velocityY * deltaTime;
        
        // Ground collision
        if (this.y > 400) {
            this.y = 400;
            this.velocityY = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
        
        // Record jump input
        if (keyboard.isPressed(' ')) {
            this.inputBuffer.recordInput('jump', currentTime);
        }
        
        // When landing, check for buffered jump
        if (this.isGrounded) {
            if (this.inputBuffer.consumeInput('jump', currentTime)) {
                this.jump();
                console.log('Executed buffered jump!');
            }
        }
        
        this.inputBuffer.cleanOld(currentTime);
    }
    
    jump() {
        this.velocityY = this.JUMP_FORCE;
        this.isGrounded = false;
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x - 20, this.y - 40, 40, 40);
    }
}

// Game loop
const player = new Player();
let currentTime = 0;

function gameLoop(deltaTime: number) {
    currentTime += deltaTime;
    
    player.update(deltaTime, currentTime, keyboard);
    
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx);
    
    // Debug display
    const bufferState = player.inputBuffer.getBufferState();
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    if (bufferState.has('jump')) {
        const age = currentTime - bufferState.get('jump')!;
        ctx.fillText(`Buffered jump (${(age * 1000).toFixed(0)}ms ago)`, 10, 20);
    }
    
    keyboard.update();
}
```

### Explanation

**How buffering helps:**

```
Without buffer:
  Frame 50: Player in air, presses jump → ignored ❌
  Frame 51: Player lands → no jump

With buffer (150ms window):
  Frame 50: Player in air, presses jump → recorded (time: 2.500s)
  Frame 51: Player lands, currentTime: 2.516s
           → Check buffer: 2.516 - 2.500 = 0.016s < 0.15s ✓
           → Execute jump! ✅
```

**Key insight:** Players often press jump **anticipating** landing, not reacting to it. Buffer makes controls feel responsive.

---

## Exercise 6: Coyote Time ⭐⭐⭐

### Solution

```typescript
class Player {
    private coyoteTime = 0;
    private readonly COYOTE_DURATION = 0.1; // 100ms grace period
    
    update(deltaTime: number, keyboard: KeyboardManager) {
        // Update coyote timer
        if (this.isGrounded) {
            this.coyoteTime = 0;
        } else {
            this.coyoteTime += deltaTime;
        }
        
        // Can jump if grounded OR within coyote time
        const canJump = this.isGrounded || this.coyoteTime < this.COYOTE_DURATION;
        
        if (keyboard.isPressed(' ') && canJump) {
            this.jump();
        }
        
        // ... rest of physics
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        // Visual feedback: yellow during coyote time
        if (!this.isGrounded && this.coyoteTime < this.COYOTE_DURATION) {
            ctx.fillStyle = 'yellow';
        } else if (this.isGrounded) {
            ctx.fillStyle = 'white';
        } else {
            ctx.fillStyle = 'gray';
        }
        
        ctx.fillRect(this.x - 20, this.y - 40, 40, 40);
        
        // Debug overlay
        ctx.fillStyle = 'white';
        ctx.font = '12px monospace';
        ctx.fillText(`Coyote: ${(this.coyoteTime * 1000).toFixed(0)}ms`, this.x - 30, this.y - 50);
    }
}
```

### Visual Demonstration

```
Player runs off platform:

Frame 1: On ground         [White] Coyote: 0ms
Frame 2: Just left ground  [Yellow] Coyote: 16ms ← Can still jump!
Frame 3: Still in coyote   [Yellow] Coyote: 32ms ← Can still jump!
Frame 4: Still in coyote   [Yellow] Coyote: 48ms ← Can still jump!
Frame 5: Still in coyote   [Yellow] Coyote: 64ms ← Can still jump!
Frame 6: Still in coyote   [Yellow] Coyote: 80ms ← Can still jump!
Frame 7: Still in coyote   [Yellow] Coyote: 96ms ← Can still jump!
Frame 8: Coyote expired    [Gray] Coyote: 112ms ✗ Too late
```

**Why 100ms?** It's long enough to feel forgiving but short enough players don't notice it consciously. Games like Celeste use similar values.

---

## Exercise 7: Variable Height Jump ⭐⭐⭐

### Solution

```typescript
class Player {
    private readonly JUMP_INITIAL_FORCE = -600;
    private readonly JUMP_HOLD_FORCE = -200; // Additional force per second while holding
    private readonly MAX_JUMP_TIME = 0.3; // 300ms max hold
    
    private jumpTime = 0;
    private isJumping = false;
    
    update(deltaTime: number, keyboard: KeyboardManager) {
        // Start jump
        if (keyboard.isPressed(' ') && this.isGrounded) {
            this.velocityY = this.JUMP_INITIAL_FORCE;
            this.isJumping = true;
            this.jumpTime = 0;
        }
        
        // Variable height: hold for extra force
        if (this.isJumping) {
            this.jumpTime += deltaTime;
            
            const jumpHeld = keyboard.isDown(' ');
            
            // Apply extra force while:
            // 1. Button is held
            // 2. Haven't exceeded max time
            // 3. Still moving upward
            if (jumpHeld && this.jumpTime < this.MAX_JUMP_TIME && this.velocityY < 0) {
                this.velocityY += this.JUMP_HOLD_FORCE * deltaTime;
            } else {
                this.isJumping = false;
            }
        }
        
        // Cut jump short if released early
        if (keyboard.isReleased(' ') && this.velocityY < 0) {
            this.velocityY *= 0.5; // Reduce upward velocity by 50%
            this.isJumping = false;
        }
        
        // Apply gravity
        this.velocityY += 980 * deltaTime;
        this.y += this.velocityY * deltaTime;
        
        // Ground collision
        if (this.y > 400) {
            this.y = 400;
            this.velocityY = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
    }
}
```

### Explanation

**Three jump scenarios:**

```typescript
// 1. Tap jump (instant release)
Frame 1: Press Space → velocityY = -600
Frame 2: Release Space → velocityY *= 0.5 → velocityY = -300
Result: Short hop

// 2. Hold jump (full 300ms)
Frame 1: Press Space → velocityY = -600
Frame 2-18: Hold Space → velocityY += -200 * 0.016 (each frame)
            Total added: -200 * 0.3 = -60
Result: High jump (velocityY reached ~-660)

// 3. Release mid-jump (150ms)
Frame 1: Press Space → velocityY = -600
Frame 2-9: Hold Space → velocityY += -200 * 0.016
Frame 10: Release Space → velocityY *= 0.5
Result: Medium jump
```

**Why this feels good:**
- Player has **control** over jump height
- Short hops for precision
- High jumps for reaching platforms
- Natural analog to real jumping

---

## Exercise 8: Unified Input Manager ⭐⭐

### Solution

```typescript
class InputManager {
    keyboard: KeyboardManager;
    mouse: MouseManager;
    
    constructor(canvas: HTMLCanvasElement) {
        this.keyboard = new KeyboardManager();
        this.mouse = new MouseManager(canvas);
    }
    
    update() {
        this.keyboard.update();
        this.mouse.update();
    }
    
    // Convenience: Get movement from WASD or arrows
    getMovementAxis(): {x: number, y: number} {
        let x = 0;
        let y = 0;
        
        // Right
        if (this.keyboard.isDown('ArrowRight') || this.keyboard.isDown('d')) {
            x += 1;
        }
        // Left
        if (this.keyboard.isDown('ArrowLeft') || this.keyboard.isDown('a')) {
            x -= 1;
        }
        // Down
        if (this.keyboard.isDown('ArrowDown') || this.keyboard.isDown('s')) {
            y += 1;
        }
        // Up
        if (this.keyboard.isDown('ArrowUp') || this.keyboard.isDown('w')) {
            y -= 1;
        }
        
        // Normalize diagonal movement (prevent 1.41x speed)
        if (x !== 0 && y !== 0) {
            const length = Math.sqrt(x * x + y * y);
            x /= length;
            y /= length;
        }
        
        return {x, y};
    }
    
    // Convenience: Check any jump key
    getJumpInput(): boolean {
        return this.keyboard.isPressed(' ') ||
               this.keyboard.isPressed('w') ||
               this.keyboard.isPressed('ArrowUp');
    }
    
    isJumpHeld(): boolean {
        return this.keyboard.isDown(' ') ||
               this.keyboard.isDown('w') ||
               this.keyboard.isDown('ArrowUp');
    }
}

// Usage
const input = new InputManager(canvas);

function gameLoop(deltaTime: number) {
    const axis = input.getMovementAxis();
    
    player.x += axis.x * 300 * deltaTime;
    player.y += axis.y * 300 * deltaTime;
    
    if (input.getJumpInput()) {
        player.jump();
    }
    
    input.update();
}
```

### Why Normalize Diagonal?

```
Without normalization:
  Right: x = 1, y = 0 → length = 1 → speed = 300px/s
  Down-Right: x = 1, y = 1 → length = 1.41 → speed = 423px/s ❌

With normalization:
  Down-Right: x = 1, y = 1 → length = 1.41
              x = 1/1.41 = 0.707
              y = 1/1.41 = 0.707
              → length = 1 → speed = 300px/s ✓
```

---

## Exercise 11: Multi-Key Detection ⭐⭐

### Solution

```typescript
class Player {
    private currentCombo = '';
    
    update(deltaTime: number, input: InputManager) {
        this.currentCombo = '';
        
        // Detect combos (check in priority order)
        
        // Down + Attack = Slide
        if (input.keyboard.isDown('ArrowDown') && input.keyboard.isPressed('x')) {
            this.slide();
            this.currentCombo = 'Slide';
        }
        // Up + Attack = Uppercut
        else if (input.keyboard.isDown('ArrowUp') && input.keyboard.isPressed('x')) {
            this.uppercut();
            this.currentCombo = 'Uppercut';
        }
        // Left/Right + Jump = Long Jump
        else if ((input.keyboard.isDown('ArrowLeft') || input.keyboard.isDown('ArrowRight')) 
                 && input.keyboard.isPressed(' ')) {
            this.longJump();
            this.currentCombo = 'Long Jump';
        }
        // Regular jump
        else if (input.keyboard.isPressed(' ')) {
            this.jump();
        }
    }
    
    slide() {
        this.velocityX = this.facing === 'right' ? 500 : -500;
        this.velocityY = 0;
        console.log('Slide!');
    }
    
    uppercut() {
        this.velocityY = -800;
        console.log('Uppercut!');
    }
    
    longJump() {
        this.velocityY = -500;
        this.velocityX = this.facing === 'right' ? 400 : -400;
        console.log('Long Jump!');
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        // ... draw player
        
        // Show combo
        if (this.currentCombo) {
            ctx.fillStyle = 'yellow';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.currentCombo, this.x, this.y - 60);
        }
    }
}
```

### Combo with Buffer

```typescript
class ComboBuffer {
    private inputSequence: Array<{key: string, time: number}> = [];
    private readonly MAX_SEQUENCE_TIME = 0.5; // 500ms window
    
    recordInput(key: string, time: number) {
        this.inputSequence.push({key, time});
        
        // Keep only recent inputs
        this.inputSequence = this.inputSequence.filter(
            input => time - input.time < this.MAX_SEQUENCE_TIME
        );
    }
    
    checkSequence(sequence: string[], currentTime: number): boolean {
        if (this.inputSequence.length < sequence.length) return false;
        
        const recent = this.inputSequence.slice(-sequence.length);
        
        // Check if keys match
        const matches = recent.every((input, i) => input.key === sequence[i]);
        
        // Check if within time window
        const timeSpan = currentTime - recent[0].time;
        
        if (matches && timeSpan < this.MAX_SEQUENCE_TIME) {
            // Consume sequence
            this.inputSequence = [];
            return true;
        }
        
        return false;
    }
}

// Hadouken: Down, Down-Forward, Forward + Punch
comboBuffer.recordInput('ArrowDown', time);
// ... (player inputs down-forward, forward)
comboBuffer.recordInput('x', time);

if (comboBuffer.checkSequence(['ArrowDown', 'ArrowRight', 'x'], time)) {
    player.hadouken();
}
```

---

## Key Takeaways

### Input State Pattern

```typescript
// ✓ Clean separation of concerns
class InputManager {
    update()        // Clear frame state
    isDown(key)     // Currently held
    isPressed(key)  // Just pressed this frame
    isReleased(key) // Just released this frame
}
```

### Feel Improvements

| Feature | Window | Benefit |
|---------|--------|---------|
| Input Buffer | 150ms | Accepts early inputs |
| Coyote Time | 100ms | Forgives late jumps |
| Variable Jump | 300ms | Player-controlled height |

### Common Formulas

```typescript
// Normalize diagonal movement
if (x !== 0 && y !== 0) {
    const len = Math.sqrt(x*x + y*y);
    x /= len; y /= len;
}

// Cut jump short on release
if (released && velocityY < 0) {
    velocityY *= 0.5;
}

// Check if input is recent
const isRecent = (currentTime - inputTime) < BUFFER_WINDOW;
```

---

**Next:** Quick reference in `d-notes.md`! 🎮