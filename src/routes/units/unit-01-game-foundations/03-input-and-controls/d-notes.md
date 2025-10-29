# Input & Controls - Quick Reference

**Unit 01: Game Foundations | Topic 03**

> Copy-paste ready input patterns.

---

## Core Classes

### KeyboardManager (Complete)

```typescript
class KeyboardManager {
    private keys: Set<string> = new Set();
    private keysPressed: Set<string> = new Set();
    private keysReleased: Set<string> = new Set();
    
    constructor() {
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
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
        this.keysPressed.clear();
        this.keysReleased.clear();
    }
}
```

### MouseManager (Complete)

```typescript
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
        
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
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

// Constants
const MOUSE_LEFT = 0;
const MOUSE_MIDDLE = 1;
const MOUSE_RIGHT = 2;
```

### InputBuffer (Complete)

```typescript
class InputBuffer {
    private buffer: Map<string, number> = new Map();
    private readonly BUFFER_TIME = 0.15;
    
    recordInput(action: string, time: number) {
        this.buffer.set(action, time);
    }
    
    consumeInput(action: string, currentTime: number): boolean {
        const pressTime = this.buffer.get(action);
        if (pressTime !== undefined && currentTime - pressTime < this.BUFFER_TIME) {
            this.buffer.delete(action);
            return true;
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
}
```

---

## Common Patterns

### Movement Axis

```typescript
function getMovementAxis(input: KeyboardManager): {x: number, y: number} {
    let x = 0, y = 0;
    
    if (input.isDown('ArrowRight') || input.isDown('d')) x += 1;
    if (input.isDown('ArrowLeft') || input.isDown('a')) x -= 1;
    if (input.isDown('ArrowDown') || input.isDown('s')) y += 1;
    if (input.isDown('ArrowUp') || input.isDown('w')) y -= 1;
    
    // Normalize diagonal
    if (x !== 0 && y !== 0) {
        const len = Math.sqrt(x * x + y * y);
        x /= len;
        y /= len;
    }
    
    return {x, y};
}
```

### Variable Jump

```typescript
class Player {
    private jumpTime = 0;
    private isJumping = false;
    
    update(deltaTime: number, input: KeyboardManager) {
        // Start jump
        if (input.isPressed(' ') && this.isGrounded) {
            this.velocityY = -600;
            this.isJumping = true;
            this.jumpTime = 0;
        }
        
        // Hold for extra height
        if (this.isJumping) {
            this.jumpTime += deltaTime;
            if (input.isDown(' ') && this.jumpTime < 0.3 && this.velocityY < 0) {
                this.velocityY += -200 * deltaTime;
            } else {
                this.isJumping = false;
            }
        }
        
        // Release early = cut short
        if (input.isReleased(' ') && this.velocityY < 0) {
            this.velocityY *= 0.5;
            this.isJumping = false;
        }
    }
}
```

### Coyote Time

```typescript
class Player {
    private coyoteTime = 0;
    
    update(deltaTime: number, input: KeyboardManager) {
        if (this.isGrounded) {
            this.coyoteTime = 0;
        } else {
            this.coyoteTime += deltaTime;
        }
        
        const canJump = this.isGrounded || this.coyoteTime < 0.1;
        
        if (input.isPressed(' ') && canJump) {
            this.jump();
        }
    }
}
```

### Buffered Jump

```typescript
// In update()
if (input.isPressed('jump')) {
    buffer.recordInput('jump', currentTime);
}

if (this.isGrounded) {
    if (buffer.consumeInput('jump', currentTime)) {
        this.jump(); // Execute buffered input!
    }
}

buffer.cleanOld(currentTime);
```

---

## Key Codes Reference

### Common Keys

```typescript
// Letters
'a', 'b', 'c', ..., 'z'

// Arrows
'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'

// Special
' '        // Space
'Enter'    // Enter
'Escape'   // Escape
'Shift'    // Shift
'Control'  // Ctrl
'Alt'      // Alt
'Tab'      // Tab

// Numbers
'0', '1', '2', ..., '9'

// Function keys
'F1', 'F2', ..., 'F12'
```

### Keys to Prevent Default

```typescript
const GAME_KEYS = [
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    ' ',  // Space (prevent scroll)
    'Tab' // (prevent focus change)
];

document.addEventListener('keydown', (e) => {
    if (GAME_KEYS.includes(e.key)) {
        e.preventDefault();
    }
});
```

---

## Timing Values

### Input Windows

```typescript
// Input buffer: accept early inputs
const INPUT_BUFFER_TIME = 0.15; // 150ms

// Coyote time: grace period after leaving ground
const COYOTE_TIME = 0.1; // 100ms

// Variable jump: max hold duration
const MAX_JUMP_HOLD = 0.3; // 300ms

// Combo window: time between inputs in sequence
const COMBO_WINDOW = 0.5; // 500ms
```

### Feel Values

```typescript
// Mario-like controls
const WALK_SPEED = 200;      // px/s
const RUN_SPEED = 350;       // px/s
const JUMP_FORCE = -600;     // px/s
const JUMP_HOLD_FORCE = -200; // Additional force when holding
```

---

## Quick Snippets

### Basic Game Loop with Input

```typescript
const input = new KeyboardManager();
let player = {x: 400, y: 300};

function gameLoop(deltaTime: number) {
    // Read input
    if (input.isDown('ArrowRight')) player.x += 200 * deltaTime;
    if (input.isDown('ArrowLeft')) player.x -= 200 * deltaTime;
    if (input.isPressed(' ')) console.log('Jump!');
    
    // Render
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(player.x, player.y, 50, 50);
    
    // Update input state
    input.update();
    
    requestAnimationFrame(gameLoop);
}
```

### Touch Virtual Joystick

```typescript
class VirtualJoystick {
    private baseX: number;
    private baseY: number;
    private stickX: number;
    private stickY: number;
    private touchId: number | null = null;
    private readonly maxDistance = 40;
    
    constructor(x: number, y: number) {
        this.baseX = this.stickX = x;
        this.baseY = this.stickY = y;
    }
    
    onTouchStart(x: number, y: number, id: number) {
        const dx = x - this.baseX;
        const dy = y - this.baseY;
        if (Math.sqrt(dx*dx + dy*dy) < 50) {
            this.touchId = id;
        }
    }
    
    onTouchMove(x: number, y: number, id: number) {
        if (this.touchId !== id) return;
        
        let dx = x - this.baseX;
        let dy = y - this.baseY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > this.maxDistance) {
            dx = (dx / dist) * this.maxDistance;
            dy = (dy / dist) * this.maxDistance;
        }
        
        this.stickX = this.baseX + dx;
        this.stickY = this.baseY + dy;
    }
    
    onTouchEnd(id: number) {
        if (this.touchId === id) {
            this.touchId = null;
            this.stickX = this.baseX;
            this.stickY = this.baseY;
        }
    }
    
    getAxis(): {x: number, y: number} {
        return {
            x: (this.stickX - this.baseX) / this.maxDistance,
            y: (this.stickY - this.baseY) / this.maxDistance
        };
    }
}
```

### Remappable Controls

```typescript
interface KeyBindings {
    moveLeft: string[];
    moveRight: string[];
    jump: string[];
}

class ConfigurableInput {
    private bindings: KeyBindings = {
        moveLeft: ['ArrowLeft', 'a'],
        moveRight: ['ArrowRight', 'd'],
        jump: [' ', 'w']
    };
    
    isActionDown(action: keyof KeyBindings): boolean {
        return this.bindings[action].some(key => this.keyboard.isDown(key));
    }
    
    rebind(action: keyof KeyBindings, keys: string[]) {
        this.bindings[action] = keys;
        localStorage.setItem('keyBindings', JSON.stringify(this.bindings));
    }
    
    loadBindings() {
        const saved = localStorage.getItem('keyBindings');
        if (saved) this.bindings = JSON.parse(saved);
    }
}
```

---

## Debugging Helpers

### Visual Input Display

```typescript
function drawInputDebug(ctx: CanvasRenderingContext2D, input: KeyboardManager) {
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    
    // Show pressed keys
    const keys = Array.from(input['keys']); // Access private for debug
    ctx.fillText(`Keys: ${keys.join(', ')}`, 10, 20);
    
    // Show just pressed
    const pressed = Array.from(input['keysPressed']);
    if (pressed.length > 0) {
        ctx.fillStyle = 'yellow';
        ctx.fillText(`Pressed: ${pressed.join(', ')}`, 10, 40);
    }
}
```

### Input Lag Meter

```typescript
class InputLagMeter {
    private inputTime = 0;
    private responseTime = 0;
    
    recordInput() {
        this.inputTime = performance.now();
    }
    
    recordResponse() {
        this.responseTime = performance.now();
    }
    
    getLag(): number {
        return this.responseTime - this.inputTime;
    }
}

// Usage
if (input.isPressed(' ')) {
    lagMeter.recordInput();
    player.jump();
    lagMeter.recordResponse();
    console.log(`Input lag: ${lagMeter.getLag()}ms`);
}
```

---

## Complete Mini-Example

```typescript
// Full platformer input system
class Game {
    private keyboard = new KeyboardManager();
    private inputBuffer = new InputBuffer();
    private player = {
        x: 100,
        y: 400,
        velocityY: 0,
        isGrounded: false,
        coyoteTime: 0
    };
    private currentTime = 0;
    
    update(deltaTime: number) {
        this.currentTime += deltaTime;
        
        // Horizontal movement
        if (this.keyboard.isDown('ArrowRight')) {
            this.player.x += 200 * deltaTime;
        }
        if (this.keyboard.isDown('ArrowLeft')) {
            this.player.x -= 200 * deltaTime;
        }
        
        // Record jump input
        if (this.keyboard.isPressed(' ')) {
            this.inputBuffer.recordInput('jump', this.currentTime);
        }
        
        // Update coyote time
        if (this.player.isGrounded) {
            this.player.coyoteTime = 0;
        } else {
            this.player.coyoteTime += deltaTime;
        }
        
        // Jump (with buffer and coyote time)
        const canJump = this.player.isGrounded || this.player.coyoteTime < 0.1;
        if (canJump && this.inputBuffer.consumeInput('jump', this.currentTime)) {
            this.player.velocityY = -600;
        }
        
        // Physics
        this.player.velocityY += 980 * deltaTime;
        this.player.y += this.player.velocityY * deltaTime;
        
        // Ground collision
        if (this.player.y > 400) {
            this.player.y = 400;
            this.player.velocityY = 0;
            this.player.isGrounded = true;
        } else {
            this.player.isGrounded = false;
        }
        
        // Clean up
        this.inputBuffer.cleanOld(this.currentTime);
        this.keyboard.update();
    }
}
```

---

## Formulas

### Diagonal Normalization

```typescript
// Prevent faster diagonal movement
if (x !== 0 && y !== 0) {
    const len = Math.sqrt(x * x + y * y);
    x /= len; // x = x / len
    y /= len; // y = y / len
}
```

### Cut Jump on Release

```typescript
// Reduce upward velocity when jump released
if (jumpReleased && velocityY < 0) {
    velocityY *= 0.5; // Reduce by 50%
}
```

### Input Age Check

```typescript
// Check if input is recent enough
const age = currentTime - inputTime;
const isRecent = age < BUFFER_WINDOW;
```

---

## Best Practices

### ✅ Do

```typescript
// Use state-based input
if (input.isDown('ArrowRight')) move();

// Prevent default for game keys
e.preventDefault();

// Clear frame state each frame
input.update();

// Support multiple keys for same action
if (input.isDown(' ') || input.isDown('w')) jump();

// Buffer player inputs
inputBuffer.recordInput('jump', time);
```

### ❌ Don't

```typescript
// Don't use keydown events for movement
document.addEventListener('keydown', () => player.x += 5); // ❌

// Don't forget to prevent default
// (arrows will scroll page) ❌

// Don't use deprecated keyCode
if (e.keyCode === 32) // ❌

// Don't forget to clear frame state
// (isPressed will always be true) ❌
```

---

## Quick Checklist

✅ **Setup:**
- [ ] KeyboardManager tracks state
- [ ] MouseManager tracks position and buttons
- [ ] Prevent default for game keys
- [ ] Call `update()` each frame

✅ **Feel:**
- [ ] Input buffer (150ms)
- [ ] Coyote time (100ms)
- [ ] Variable jump (300ms hold)
- [ ] Cut jump on release

✅ **Robustness:**
- [ ] Handle tab switching
- [ ] Support multiple keys per action
- [ ] Remappable controls
- [ ] Touch/gamepad support

---

**Next:** Debug common issues in `i-debugging.md`! 🎮