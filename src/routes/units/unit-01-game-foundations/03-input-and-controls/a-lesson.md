# Input & Controls - Complete Lesson

**Unit 01: Game Foundations | Topic 03**

> **Learning Objective:** Master keyboard, mouse, and touch input handling to create responsive, professional game controls.

---

## Table of Contents

1. [Introduction to Game Input](#introduction)
2. [Keyboard Input](#keyboard)
3. [Mouse Input](#mouse)
4. [Touch Input](#touch)
5. [Input State Management](#state-management)
6. [Key Mapping & Configuration](#key-mapping)
7. [Input Buffering](#buffering)
8. [Mario Implementation](#mario)
9. [Best Practices](#best-practices)

---

<a name="introduction"></a>
## 1. Introduction to Game Input

### Why Input Matters

Input handling is the **interface between player and game**. Bad input = bad game, no matter how good your graphics.

**What makes good input:**
- **Responsive:** Instant feedback (<100ms latency)
- **Predictable:** Same input = same result
- **Forgiving:** Buffer inputs, coyote time
- **Flexible:** Remappable keys, multiple devices

### Input Flow

```
Player Action → Browser Event → Input Manager → Game Logic → Response

Press Space → keydown event → Jump key detected → Player jumps → Visual feedback
```

---

<a name="keyboard"></a>
## 2. Keyboard Input

### Basic Event Handling

```typescript
// Simple approach (works, but has issues)
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        player.x += 5;
    }
});
```

**Problems:**
- Movement tied to key repeat rate (OS-dependent)
- Can't detect multiple keys simultaneously
- No way to check "is key currently held?"

### State-Based Input (Correct Way)

```typescript
class InputManager {
    private keys: Set<string> = new Set();
    
    constructor() {
        document.addEventListener('keydown', (e) => {
            this.keys.add(e.key);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
    }
    
    isKeyDown(key: string): boolean {
        return this.keys.has(key);
    }
}

// Usage in game loop
function update(deltaTime: number) {
    if (input.isKeyDown('ArrowRight')) {
        player.x += SPEED * deltaTime;
    }
    if (input.isKeyDown('ArrowLeft')) {
        player.x -= SPEED * deltaTime;
    }
}
```

### Key Codes vs Key Values

```typescript
// Use e.key (recommended)
if (e.key === ' ') // Space
if (e.key === 'w') // W key
if (e.key === 'ArrowUp') // Up arrow

// Avoid e.keyCode (deprecated)
if (e.keyCode === 32) // Space (don't use)
```

### Preventing Default Behavior

```typescript
document.addEventListener('keydown', (e) => {
    // Prevent arrow keys from scrolling page
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
    
    // Prevent space from scrolling
    if (e.key === ' ') {
        e.preventDefault();
    }
});
```

### Complete Keyboard Manager

```typescript
class KeyboardManager {
    private keys: Map<string, boolean> = new Map();
    private keysPressed: Set<string> = new Set(); // Just pressed this frame
    private keysReleased: Set<string> = new Set(); // Just released this frame
    
    constructor() {
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Prevent default for game keys
        document.addEventListener('keydown', (e) => {
            const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'];
            if (gameKeys.includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    private onKeyDown(e: KeyboardEvent) {
        if (!this.keys.get(e.key)) {
            // Key wasn't down before - this is a new press
            this.keysPressed.add(e.key);
        }
        this.keys.set(e.key, true);
    }
    
    private onKeyUp(e: KeyboardEvent) {
        this.keys.set(e.key, false);
        this.keysReleased.add(e.key);
    }
    
    // Call this at end of each frame
    update() {
        this.keysPressed.clear();
        this.keysReleased.clear();
    }
    
    // Is key currently held down?
    isDown(key: string): boolean {
        return this.keys.get(key) || false;
    }
    
    // Was key just pressed this frame?
    isPressed(key: string): boolean {
        return this.keysPressed.has(key);
    }
    
    // Was key just released this frame?
    isReleased(key: string): boolean {
        return this.keysReleased.has(key);
    }
}

// Usage
const keyboard = new KeyboardManager();

function gameLoop(deltaTime: number) {
    // Continuous movement (hold key)
    if (keyboard.isDown('ArrowRight')) {
        player.x += SPEED * deltaTime;
    }
    
    // Single action (press once)
    if (keyboard.isPressed(' ')) {
        player.jump();
    }
    
    // Detect release
    if (keyboard.isReleased('x')) {
        player.stopCharging();
    }
    
    keyboard.update(); // Clear frame-specific state
}
```

---

<a name="mouse"></a>
## 3. Mouse Input

### Mouse Position

```typescript
class MouseManager {
    x: number = 0;
    y: number = 0;
    private canvas: HTMLCanvasElement;
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.x = e.clientX - rect.left;
            this.y = e.clientY - rect.top;
        });
    }
    
    // Convert to game coordinates if canvas is scaled
    getGamePosition(scaleX: number = 1, scaleY: number = 1) {
        return {
            x: this.x / scaleX,
            y: this.y / scaleY
        };
    }
}
```

### Mouse Buttons

```typescript
class MouseManager {
    private buttons: Map<number, boolean> = new Map();
    private buttonsPressed: Set<number> = new Set();
    
    constructor(canvas: HTMLCanvasElement) {
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

// Mouse button constants
const MOUSE_LEFT = 0;
const MOUSE_MIDDLE = 1;
const MOUSE_RIGHT = 2;
```

### Mouse Wheel

```typescript
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    const delta = Math.sign(e.deltaY);
    if (delta > 0) {
        // Scroll down
        camera.zoomOut();
    } else {
        // Scroll up
        camera.zoomIn();
    }
});
```

---

<a name="touch"></a>
## 4. Touch Input

### Basic Touch Handling

```typescript
class TouchManager {
    private touches: Map<number, {x: number, y: number}> = new Map();
    
    constructor(canvas: HTMLCanvasElement) {
        canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
        canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
        canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
        canvas.addEventListener('touchcancel', this.onTouchEnd.bind(this));
        
        // Prevent default touch behaviors
        canvas.addEventListener('touchstart', (e) => e.preventDefault());
    }
    
    private onTouchStart(e: TouchEvent) {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        Array.from(e.changedTouches).forEach(touch => {
            this.touches.set(touch.identifier, {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            });
        });
    }
    
    private onTouchMove(e: TouchEvent) {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        Array.from(e.changedTouches).forEach(touch => {
            if (this.touches.has(touch.identifier)) {
                this.touches.set(touch.identifier, {
                    x: touch.clientX - rect.left,
                    y: touch.clientY - rect.top
                });
            }
        });
    }
    
    private onTouchEnd(e: TouchEvent) {
        Array.from(e.changedTouches).forEach(touch => {
            this.touches.delete(touch.identifier);
        });
    }
    
    getTouches(): Array<{x: number, y: number}> {
        return Array.from(this.touches.values());
    }
    
    getTouchCount(): number {
        return this.touches.size;
    }
}
```

### Virtual Joystick for Mobile

```typescript
class VirtualJoystick {
    private baseX = 0;
    private baseY = 0;
    private stickX = 0;
    private stickY = 0;
    private touchId: number | null = null;
    private readonly radius = 50;
    private readonly maxDistance = 40;
    
    constructor(x: number, y: number) {
        this.baseX = x;
        this.baseY = y;
        this.stickX = x;
        this.stickY = y;
    }
    
    onTouchStart(x: number, y: number, touchId: number) {
        const dx = x - this.baseX;
        const dy = y - this.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.radius) {
            this.touchId = touchId;
            this.updateStick(x, y);
        }
    }
    
    onTouchMove(x: number, y: number, touchId: number) {
        if (this.touchId === touchId) {
            this.updateStick(x, y);
        }
    }
    
    onTouchEnd(touchId: number) {
        if (this.touchId === touchId) {
            this.touchId = null;
            this.stickX = this.baseX;
            this.stickY = this.baseY;
        }
    }
    
    private updateStick(x: number, y: number) {
        let dx = x - this.baseX;
        let dy = y - this.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > this.maxDistance) {
            dx = (dx / dist) * this.maxDistance;
            dy = (dy / dist) * this.maxDistance;
        }
        
        this.stickX = this.baseX + dx;
        this.stickY = this.baseY + dy;
    }
    
    getAxis(): {x: number, y: number} {
        return {
            x: (this.stickX - this.baseX) / this.maxDistance,
            y: (this.stickY - this.baseY) / this.maxDistance
        };
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        // Base circle
        ctx.beginPath();
        ctx.arc(this.baseX, this.baseY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        
        // Stick
        ctx.beginPath();
        ctx.arc(this.stickX, this.stickY, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
    }
}
```

---

<a name="state-management"></a>
## 5. Input State Management

### Unified Input Manager

```typescript
class InputManager {
    keyboard = new KeyboardManager();
    mouse = new MouseManager(canvas);
    touch = new TouchManager(canvas);
    
    update() {
        this.keyboard.update();
        this.mouse.update();
    }
    
    // Unified movement query (works with keyboard or joystick)
    getMovementAxis(): {x: number, y: number} {
        let x = 0;
        let y = 0;
        
        // Keyboard
        if (this.keyboard.isDown('ArrowRight') || this.keyboard.isDown('d')) x += 1;
        if (this.keyboard.isDown('ArrowLeft') || this.keyboard.isDown('a')) x -= 1;
        if (this.keyboard.isDown('ArrowDown') || this.keyboard.isDown('s')) y += 1;
        if (this.keyboard.isDown('ArrowUp') || this.keyboard.isDown('w')) y -= 1;
        
        // Normalize diagonal movement
        if (x !== 0 && y !== 0) {
            const len = Math.sqrt(x * x + y * y);
            x /= len;
            y /= len;
        }
        
        return {x, y};
    }
    
    getJumpInput(): boolean {
        return this.keyboard.isPressed(' ') || 
               this.keyboard.isPressed('w') ||
               this.keyboard.isPressed('ArrowUp');
    }
}
```

---

<a name="key-mapping"></a>
## 6. Key Mapping & Configuration

### Remappable Controls

```typescript
interface KeyBindings {
    moveLeft: string[];
    moveRight: string[];
    jump: string[];
    attack: string[];
}

class ConfigurableInput {
    private bindings: KeyBindings = {
        moveLeft: ['ArrowLeft', 'a'],
        moveRight: ['ArrowRight', 'd'],
        jump: [' ', 'w', 'ArrowUp'],
        attack: ['x', 'j']
    };
    
    private keyboard = new KeyboardManager();
    
    isActionDown(action: keyof KeyBindings): boolean {
        return this.bindings[action].some(key => this.keyboard.isDown(key));
    }
    
    isActionPressed(action: keyof KeyBindings): boolean {
        return this.bindings[action].some(key => this.keyboard.isPressed(key));
    }
    
    rebind(action: keyof KeyBindings, keys: string[]) {
        this.bindings[action] = keys;
        this.saveBindings();
    }
    
    private saveBindings() {
        localStorage.setItem('keyBindings', JSON.stringify(this.bindings));
    }
    
    loadBindings() {
        const saved = localStorage.getItem('keyBindings');
        if (saved) {
            this.bindings = JSON.parse(saved);
        }
    }
}

// Usage
const input = new ConfigurableInput();
input.loadBindings();

function update(deltaTime: number) {
    if (input.isActionDown('moveRight')) {
        player.x += SPEED * deltaTime;
    }
    if (input.isActionPressed('jump')) {
        player.jump();
    }
}
```

---

<a name="buffering"></a>
## 7. Input Buffering

### Why Buffer Input?

Players often press jump **slightly before** landing. Without buffering, this input is lost.

### Implementation

```typescript
class InputBuffer {
    private buffer: Map<string, number> = new Map();
    private readonly BUFFER_TIME = 0.15; // 150ms buffer window
    
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

// Usage in Mario
class Player {
    private inputBuffer = new InputBuffer();
    
    update(deltaTime: number, currentTime: number) {
        // Record jump presses
        if (input.isPressed('jump')) {
            this.inputBuffer.recordInput('jump', currentTime);
        }
        
        // When landing, check if jump was buffered
        if (this.justLanded()) {
            if (this.inputBuffer.consumeInput('jump', currentTime)) {
                this.jump(); // Execute buffered jump!
            }
        }
        
        this.inputBuffer.cleanOld(currentTime);
    }
}
```

### Coyote Time

Allow jumping for a short time after leaving ground:

```typescript
class Player {
    private groundedTime = 0;
    private readonly COYOTE_TIME = 0.1; // 100ms grace period
    
    update(deltaTime: number) {
        if (this.isGrounded) {
            this.groundedTime = 0;
        } else {
            this.groundedTime += deltaTime;
        }
        
        // Can jump if recently grounded
        if (input.isPressed('jump') && this.groundedTime < this.COYOTE_TIME) {
            this.jump();
        }
    }
}
```

---

<a name="mario"></a>
## 8. Mario Implementation

### Complete Mario Controls

```typescript
class MarioPlayer {
    x = 100;
    y = 300;
    velocityX = 0;
    velocityY = 0;
    isGrounded = false;
    
    private readonly WALK_SPEED = 200;
    private readonly RUN_SPEED = 350;
    private readonly JUMP_FORCE = -600;
    private readonly JUMP_HOLD_FORCE = -200; // Additional force while holding
    private readonly MAX_JUMP_TIME = 0.3;
    
    private jumpTime = 0;
    private isJumping = false;
    private inputBuffer = new InputBuffer();
    private coyoteTime = 0;
    
    update(deltaTime: number, input: InputManager, currentTime: number) {
        // Horizontal movement
        const axis = input.getMovementAxis();
        const isRunning = input.keyboard.isDown('Shift') || input.keyboard.isDown('x');
        const maxSpeed = isRunning ? this.RUN_SPEED : this.WALK_SPEED;
        
        this.velocityX = axis.x * maxSpeed;
        
        // Coyote time
        if (this.isGrounded) {
            this.coyoteTime = 0;
        } else {
            this.coyoteTime += deltaTime;
        }
        
        // Buffer jump input
        if (input.getJumpInput()) {
            this.inputBuffer.recordInput('jump', currentTime);
        }
        
        // Jump start
        const canJump = this.isGrounded || this.coyoteTime < 0.1;
        if (this.inputBuffer.consumeInput('jump', currentTime) && canJump) {
            this.velocityY = this.JUMP_FORCE;
            this.isJumping = true;
            this.jumpTime = 0;
        }
        
        // Variable height jump (hold for higher)
        if (this.isJumping) {
            this.jumpTime += deltaTime;
            
            const jumpHeld = input.keyboard.isDown(' ') || 
                           input.keyboard.isDown('w') || 
                           input.keyboard.isDown('ArrowUp');
            
            if (jumpHeld && this.jumpTime < this.MAX_JUMP_TIME && this.velocityY < 0) {
                this.velocityY += this.JUMP_HOLD_FORCE * deltaTime;
            } else {
                this.isJumping = false;
            }
        }
        
        // Release jump early = shorter jump
        const jumpReleased = input.keyboard.isReleased(' ') ||
                           input.keyboard.isReleased('w') ||
                           input.keyboard.isReleased('ArrowUp');
        
        if (jumpReleased && this.velocityY < 0) {
            this.velocityY *= 0.5; // Cut jump short
            this.isJumping = false;
        }
        
        this.inputBuffer.cleanOld(currentTime);
    }
}
```

---

<a name="best-practices"></a>
## 9. Best Practices

### ✅ Do's

1. **Use state-based input**
   ```typescript
   if (input.isDown('ArrowRight')) // Good
   ```

2. **Prevent default for game keys**
   ```typescript
   e.preventDefault();
   ```

3. **Buffer player inputs**
   ```typescript
   inputBuffer.recordInput('jump', time);
   ```

4. **Support multiple input methods**
   ```typescript
   keyboard, gamepad, touch
   ```

5. **Make controls remappable**
   ```typescript
   bindings.rebind('jump', ['Space', 'w']);
   ```

### ❌ Don'ts

1. **Don't use keydown for movement**
   ```typescript
   // Bad: Tied to key repeat
   document.addEventListener('keydown', () => player.x += 5);
   ```

2. **Don't forget to clear frame state**
   ```typescript
   input.update(); // Clear isPressed, isReleased
   ```

3. **Don't mix coordinate systems**
   ```typescript
   // Bad: Using screen coords in game logic
   // Good: Convert to game coords first
   ```

---

## Summary

### Key Concepts

- **State-based input:** Track which keys are down
- **Frame-specific events:** isPressed, isReleased
- **Input buffering:** Remember inputs for short time
- **Coyote time:** Grace period for jumping
- **Remappable controls:** Let players customize

### Code Patterns

```typescript
// Basic pattern
class Input {
    update() { /* Clear frame state */ }
    isDown(key) { /* Is key held? */ }
    isPressed(key) { /* Just pressed? */ }
}

// Usage
function gameLoop() {
    if (input.isDown('Right')) move();
    if (input.isPressed('Space')) jump();
    input.update();
}
```

---

**Next:** Practice with exercises in `b-exercises.md`! 🎮