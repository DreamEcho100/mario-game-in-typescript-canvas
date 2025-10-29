# Input & Controls - FAQ

**Unit 01: Game Foundations | Topic 03**

> Your questions answered.

---

## Q1: Why use a Set for key tracking instead of an Object or Map?

**Short answer:** Sets are semantically correct and slightly more efficient for this use case.

**Detailed explanation:**

```typescript
// Option 1: Set (recommended)
private keys: Set<string> = new Set();
keys.add('ArrowRight');
if (keys.has('ArrowRight')) // Fast O(1) lookup

// Option 2: Object
private keys: {[key: string]: boolean} = {};
keys['ArrowRight'] = true;
if (keys['ArrowRight']) // Also fast

// Option 3: Map
private keys: Map<string, boolean> = new Map();
keys.set('ArrowRight', true);
if (keys.get('ArrowRight')) // Also fast
```

**Why Set is better:**

1. **Semantics:** We're storing a *set* of keys, not key-value pairs. Set conveys intent.
2. **Operations:** `add()`, `delete()`, `has()` are clearer than `obj[key] = true`
3. **No undefined:** `has()` returns boolean, `get()` can return undefined
4. **Iteration:** `for (const key of keys)` is cleaner

**When to use alternatives:**
- **Map:** If you need to store data per key (e.g., key press time)
- **Object:** If serializing to JSON (Sets don't serialize well)

---

## Q2: Should I listen on `document` or `canvas` for keyboard events?

**Short answer:** Always `document`.

**Detailed explanation:**

Keyboard events bubble up to `document` from whatever element has focus. Canvas doesn't gain focus automatically.

```typescript
// ❌ Bad: Won't work unless canvas is focused
canvas.addEventListener('keydown', ...);

// ✅ Good: Always works
document.addEventListener('keydown', ...);
```

**Why document:**
- Works immediately without focus management
- Captures keys even if other elements exist
- Standard practice for game input

**Exception:** If you have multiple games on same page, use `canvas.addEventListener` + focus management to isolate input.

---

## Q3: What's the difference between `e.key` and `e.code`?

**Short answer:** `key` is the *character*, `code` is the *physical key*.

**Detailed explanation:**

```typescript
document.addEventListener('keydown', (e) => {
    console.log('key:', e.key);   // 'a' or 'A' (depends on Shift)
    console.log('code:', e.code); // 'KeyA' (always)
});
```

**Examples:**

| Key Press | `e.key` | `e.code` |
|-----------|---------|----------|
| A (no Shift) | `'a'` | `'KeyA'` |
| A (with Shift) | `'A'` | `'KeyA'` |
| Arrow Right | `'ArrowRight'` | `'ArrowRight'` |
| Space | `' '` | `'Space'` |

**For games, use `e.key` because:**
- More intuitive ('a' vs 'KeyA')
- Consistent across keyboards
- What players expect

**Use `e.code` when:**
- Creating key binding UI (show physical key)
- Avoiding keyboard layout issues (QWERTY vs AZERTY)

---

## Q4: How do I detect key combos (Ctrl+S, Alt+J)?

**Short answer:** Check modifier properties in event.

**Detailed explanation:**

```typescript
document.addEventListener('keydown', (e) => {
    // Ctrl + S
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault(); // Prevent browser save dialog
        console.log('Quick save!');
    }
    
    // Shift + Space
    if (e.shiftKey && e.key === ' ') {
        player.specialAttack();
    }
    
    // Alt + J
    if (e.altKey && e.key === 'j') {
        openJournal();
    }
    
    // Ctrl + Shift + D (multiple modifiers)
    if (e.ctrlKey && e.shiftKey && e.key === 'd') {
        toggleDebug();
    }
});
```

**Available modifier properties:**
- `e.ctrlKey` - Ctrl/Cmd key
- `e.shiftKey` - Shift key
- `e.altKey` - Alt key
- `e.metaKey` - Windows key / Cmd key (Mac)

**Important:** Always `preventDefault()` for combos that have default browser behavior (Ctrl+S, Ctrl+W, etc.)

---

## Q5: Why do I need to call `update()` every frame?

**Short answer:** To clear frame-specific state (`isPressed`, `isReleased`).

**Detailed explanation:**

```typescript
// Without update():
Frame 1: Space pressed → keysPressed.add(' ')
Frame 2: isPressed(' ') returns TRUE (still in set!)
Frame 3: isPressed(' ') returns TRUE (still in set!)
... player jumps every frame!

// With update():
Frame 1: Space pressed → keysPressed.add(' ')
         isPressed(' ') returns TRUE
         update() → keysPressed.clear()
Frame 2: isPressed(' ') returns FALSE ✓
```

**What `update()` does:**
```typescript
update() {
    this.keysPressed.clear();   // Clear "just pressed"
    this.keysReleased.clear();  // Clear "just released"
    // Keep this.keys (held state)
}
```

**When to call:** At the **end** of each frame, after all input processing.

---

## Q6: How do I prevent arrow keys from scrolling the page?

**Short answer:** Call `e.preventDefault()` in `keydown` listener.

**Detailed explanation:**

```typescript
document.addEventListener('keydown', (e) => {
    // List of keys used in game
    const GAME_KEYS = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        ' ',  // Space (scrolls page)
        'Tab' // (changes focus)
    ];
    
    if (GAME_KEYS.includes(e.key)) {
        e.preventDefault(); // Prevent default browser behavior
    }
    
    // Your input handling
    keys.add(e.key);
});
```

**Why this is necessary:**
- Arrow keys scroll by default
- Space scrolls down a page
- Tab moves focus between elements
- Without prevention, game feels broken

**Alternative (prevent all keys):**
```typescript
document.addEventListener('keydown', (e) => {
    e.preventDefault(); // Prevents ALL keys (careful with Ctrl+R, F5, etc.)
    keys.add(e.key);
});
```

---

## Q7: How do I handle gamepad/controller input?

**Short answer:** Use the Gamepad API.

**Detailed explanation:**

```typescript
class GamepadManager {
    private gamepadIndex: number | null = null;
    
    constructor() {
        window.addEventListener('gamepadconnected', (e) => {
            console.log('Gamepad connected:', e.gamepad.id);
            this.gamepadIndex = e.gamepad.index;
        });
        
        window.addEventListener('gamepaddisconnected', () => {
            this.gamepadIndex = null;
        });
    }
    
    getState() {
        if (this.gamepadIndex === null) return null;
        
        const gamepads = navigator.getGamepads();
        const gp = gamepads[this.gamepadIndex];
        
        if (!gp) return null;
        
        return {
            // Left stick
            leftStickX: this.applyDeadzone(gp.axes[0]),
            leftStickY: this.applyDeadzone(gp.axes[1]),
            
            // Right stick
            rightStickX: this.applyDeadzone(gp.axes[2]),
            rightStickY: this.applyDeadzone(gp.axes[3]),
            
            // Buttons (standard mapping)
            a: gp.buttons[0].pressed,      // Cross / A
            b: gp.buttons[1].pressed,      // Circle / B
            x: gp.buttons[2].pressed,      // Square / X
            y: gp.buttons[3].pressed,      // Triangle / Y
            lb: gp.buttons[4].pressed,     // L1 / LB
            rb: gp.buttons[5].pressed,     // R1 / RB
            start: gp.buttons[9].pressed,
            
            // D-pad
            dpadUp: gp.buttons[12].pressed,
            dpadDown: gp.buttons[13].pressed,
            dpadLeft: gp.buttons[14].pressed,
            dpadRight: gp.buttons[15].pressed
        };
    }
    
    private applyDeadzone(value: number, deadzone = 0.15): number {
        if (Math.abs(value) < deadzone) return 0;
        return value;
    }
}

// Usage
const gamepad = new GamepadManager();

function gameLoop() {
    const gp = gamepad.getState();
    if (gp) {
        // Movement
        player.x += gp.leftStickX * 300 * deltaTime;
        player.y += gp.leftStickY * 300 * deltaTime;
        
        // Jump
        if (gp.a) {
            player.jump();
        }
    }
}
```

**Important notes:**
- Gamepad state must be polled (no events for button presses)
- Always apply deadzone to analog sticks (prevent drift)
- Standard button mapping varies slightly between controllers
- Test with multiple controller types

---

## Q8: What is input buffering and when should I use it?

**Short answer:** Input buffering remembers recent inputs so they can be used later. Use for any timed action.

**Detailed explanation:**

**Problem without buffering:**
```
Frame 100: Player in air, presses Jump
           → Check: isGrounded? NO → Ignore input ❌
Frame 101: Player lands
           → No input detected → No jump
```

**With buffering:**
```
Frame 100: Player in air, presses Jump
           → Record: jump pressed at time 5.000s
Frame 101: Player lands
           → Check buffer: jump pressed 0.016s ago < 0.15s ✓
           → Execute jump! ✅
```

**Implementation:**
```typescript
class InputBuffer {
    private buffer: Map<string, number> = new Map();
    private readonly BUFFER_TIME = 0.15; // 150ms
    
    recordInput(action: string, time: number) {
        this.buffer.set(action, time);
    }
    
    consumeInput(action: string, currentTime: number): boolean {
        const pressTime = this.buffer.get(action);
        if (pressTime && currentTime - pressTime < this.BUFFER_TIME) {
            this.buffer.delete(action);
            return true;
        }
        return false;
    }
}
```

**When to use:**
- **Platformers:** Buffer jump inputs
- **Fighting games:** Buffer special move inputs
- **Action games:** Buffer attack inputs
- **Any timed mechanic:** Dash, dodge, interact

**How long to buffer?**
- 100-150ms is standard
- Too short (50ms): Not helpful
- Too long (300ms): Feels sluggish

---

## Q9: What is coyote time and why does it make platformers feel better?

**Short answer:** Coyote time lets players jump for a short time after leaving a platform. Makes controls feel fair.

**Detailed explanation:**

Named after Wile E. Coyote running off cliffs in cartoons.

**Without coyote time:**
```
Player runs off platform edge:
Frame 1: On ground → Can jump ✓
Frame 2: In air (by 1 pixel) → Can't jump ❌
Player presses jump on Frame 2 → Ignored → Falls to death
```

**With coyote time (100ms grace):**
```
Frame 1: On ground
Frame 2: In air (1px), coyoteTime = 16ms → Can still jump ✓
Frame 3: In air (5px), coyoteTime = 32ms → Can still jump ✓
Frame 4: In air (11px), coyoteTime = 48ms → Can still jump ✓
...
Frame 7: In air (60px), coyoteTime = 112ms → Too late ❌
```

**Implementation:**
```typescript
class Player {
    private coyoteTime = 0;
    
    update(deltaTime: number) {
        if (this.isGrounded) {
            this.coyoteTime = 0;
        } else {
            this.coyoteTime += deltaTime;
        }
        
        const canJump = this.isGrounded || this.coyoteTime < 0.1;
        
        if (input.isPressed('jump') && canJump) {
            this.jump();
        }
    }
}
```

**Why it feels good:**
- Forgives imperfect timing
- Players don't notice it consciously
- Prevents frustrating "I pressed jump!" deaths
- Used in: Mario, Celeste, Hollow Knight, most platformers

**Typical value:** 100ms (6 frames at 60 FPS)

---

## Q10: How do I implement variable-height jumps?

**Short answer:** Apply initial force on press, additional force while held.

**Detailed explanation:**

**Goal:** Tap = short hop, hold = high jump

**Implementation:**
```typescript
class Player {
    private readonly JUMP_INITIAL = -600;  // Initial velocity
    private readonly JUMP_HOLD = -200;     // Force per second while held
    private readonly MAX_HOLD_TIME = 0.3;  // 300ms max
    
    private jumpTime = 0;
    private isJumping = false;
    
    update(deltaTime: number) {
        // Start jump
        if (input.isPressed('jump') && this.isGrounded) {
            this.velocityY = this.JUMP_INITIAL;
            this.isJumping = true;
            this.jumpTime = 0;
        }
        
        // Hold for extra height
        if (this.isJumping) {
            this.jumpTime += deltaTime;
            
            if (input.isDown('jump') && 
                this.jumpTime < this.MAX_HOLD_TIME && 
                this.velocityY < 0) {
                this.velocityY += this.JUMP_HOLD * deltaTime;
            } else {
                this.isJumping = false;
            }
        }
        
        // Release early = cut jump short
        if (input.isReleased('jump') && this.velocityY < 0) {
            this.velocityY *= 0.5; // Reduce by 50%
            this.isJumping = false;
        }
    }
}
```

**Three scenarios:**

| Input | Result |
|-------|--------|
| Tap (instant release) | velocityY = -600 → *0.5 = -300 → Short hop |
| Hold 150ms | velocityY = -600 + (-200 * 0.15) = -630 → Medium jump |
| Hold 300ms (max) | velocityY = -600 + (-200 * 0.3) = -660 → High jump |

**Why this feels good:**
- Player has precise control
- Natural: like real jumping
- Enables advanced techniques (short hop over enemy)

---

## Q11: How do I handle touch input for mobile?

**Short answer:** Use `TouchEvent` API and create virtual controls.

**Detailed explanation:**

**Basic touch tracking:**
```typescript
class TouchManager {
    private touches: Map<number, {x: number, y: number}> = new Map();
    
    constructor(canvas: HTMLCanvasElement) {
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            
            Array.from(e.changedTouches).forEach(touch => {
                this.touches.set(touch.identifier, {
                    x: touch.clientX - rect.left,
                    y: touch.clientY - rect.top
                });
            });
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            
            Array.from(e.changedTouches).forEach(touch => {
                this.touches.set(touch.identifier, {
                    x: touch.clientX - rect.left,
                    y: touch.clientY - rect.top
                });
            });
        });
        
        canvas.addEventListener('touchend', (e) => {
            Array.from(e.changedTouches).forEach(touch => {
                this.touches.delete(touch.identifier);
            });
        });
    }
}
```

**Virtual joystick (see `d-notes.md`):**
- Draw base circle
- Track touch inside base
- Move stick within max radius
- Convert to axis (-1 to 1)

**Virtual buttons:**
```typescript
class VirtualButton {
    constructor(
        private x: number,
        private y: number,
        private radius: number
    ) {}
    
    isPressed(touches: Map<number, {x: number, y: number}>): boolean {
        for (const touch of touches.values()) {
            const dx = touch.x - this.x;
            const dy = touch.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.radius) {
                return true;
            }
        }
        return false;
    }
}
```

---

## Q12: Should I support both keyboard and gamepad?

**Short answer:** Yes, if targeting desktop. Support as many input methods as reasonable.

**Detailed explanation:**

**Why support multiple inputs:**
- Accessibility (some players can't use keyboards)
- Preference (many prefer controllers for platformers)
- Steam Deck / console ports
- Larger potential audience

**Unified input approach:**
```typescript
class InputManager {
    keyboard = new KeyboardManager();
    gamepad = new GamepadManager();
    
    getMovementAxis(): {x: number, y: number} {
        // Try gamepad first
        const gp = this.gamepad.getState();
        if (gp && (gp.leftStickX !== 0 || gp.leftStickY !== 0)) {
            return {x: gp.leftStickX, y: gp.leftStickY};
        }
        
        // Fall back to keyboard
        return this.keyboard.getMovementAxis();
    }
    
    getJumpPressed(): boolean {
        return this.keyboard.isPressed(' ') || 
               this.gamepad.getState()?.a || 
               false;
    }
}
```

**Priority order:**
1. Desktop: Keyboard + Gamepad
2. Mobile: Touch
3. Web: Keyboard + Mouse

---

## Q13: How do I detect if a key is stuck?

**Short answer:** Track key duration and auto-release after threshold.

**Detailed explanation:**

**Problem:** Player tabs out while holding key → key never fires `keyup` → stuck!

**Solution:**
```typescript
class KeyboardManager {
    private keyTimes: Map<string, number> = new Map();
    private readonly MAX_KEY_DURATION = 5; // seconds
    
    update(deltaTime: number, currentTime: number) {
        // Update durations
        for (const [key, startTime] of this.keyTimes.entries()) {
            if (currentTime - startTime > this.MAX_KEY_DURATION) {
                console.warn(`Key '${key}' stuck, auto-releasing`);
                this.keys.delete(key);
                this.keyTimes.delete(key);
            }
        }
        
        this.keysPressed.clear();
        this.keysReleased.clear();
    }
    
    private onKeyDown(e: KeyboardEvent) {
        if (!this.keys.has(e.key)) {
            this.keyTimes.set(e.key, performance.now());
        }
        // ...
    }
    
    private onKeyUp(e: KeyboardEvent) {
        this.keyTimes.delete(e.key);
        // ...
    }
}
```

**Also handle visibility change:**
```typescript
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Clear all input when tab loses focus
        keyboard.clearAll();
    }
});
```

---

## Q14: How do I make controls remappable?

**Short answer:** Store action→keys mapping, provide rebind UI.

**Detailed explanation:**

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
    
    // Check if action is active
    isActionDown(action: keyof KeyBindings): boolean {
        return this.bindings[action].some(key => 
            this.keyboard.isDown(key)
        );
    }
    
    isActionPressed(action: keyof KeyBindings): boolean {
        return this.bindings[action].some(key => 
            this.keyboard.isPressed(key)
        );
    }
    
    // Rebind action
    rebind(action: keyof KeyBindings, keys: string[]) {
        this.bindings[action] = keys;
        this.save();
    }
    
    // Persistence
    save() {
        localStorage.setItem('keyBindings', JSON.stringify(this.bindings));
    }
    
    load() {
        const saved = localStorage.getItem('keyBindings');
        if (saved) {
            this.bindings = JSON.parse(saved);
        }
    }
    
    // Reset to defaults
    reset() {
        this.bindings = {
            moveLeft: ['ArrowLeft', 'a'],
            moveRight: ['ArrowRight', 'd'],
            jump: [' ', 'w', 'ArrowUp'],
            attack: ['x', 'j']
        };
        this.save();
    }
}

// Usage
const input = new ConfigurableInput();
input.load();

// In game
if (input.isActionDown('moveRight')) {
    player.x += speed;
}

// In settings menu
function rebindJump() {
    showMessage('Press key for Jump...');
    waitForKeyPress().then(key => {
        input.rebind('jump', [key]);
    });
}
```

---

## Q15: How do I prevent accidental inputs?

**Short answer:** Add confirmation for critical actions, use input buffering wisely.

**Detailed explanation:**

**Problem:** Player accidentally presses Escape → quits game without saving.

**Solutions:**

**1. Confirmation for destructive actions:**
```typescript
if (input.isPressed('Escape')) {
    if (!confirmDialog) {
        showConfirm('Quit without saving?');
    } else {
        quitGame();
    }
}
```

**2. Hold to confirm:**
```typescript
private escapeHoldTime = 0;

update(deltaTime: number) {
    if (input.isDown('Escape')) {
        this.escapeHoldTime += deltaTime;
        
        if (this.escapeHoldTime > 2.0) { // Hold 2 seconds
            quitGame();
        }
    } else {
        this.escapeHoldTime = 0;
    }
}
```

**3. Double-tap:**
```typescript
private lastEscapePress = 0;

update() {
    if (input.isPressed('Escape')) {
        const now = performance.now();
        
        if (now - this.lastEscapePress < 500) { // 500ms window
            quitGame();
        }
        
        this.lastEscapePress = now;
    }
}
```

---

## Q16: How do I handle input lag in online multiplayer?

**Short answer:** Predict locally, reconcile with server.

**Detailed explanation:**

**Problem:** Input → Server → Response = 50-200ms lag

**Solution: Client-side prediction**
```typescript
class NetworkedPlayer {
    // Local state (predicted)
    private predictedX = 0;
    private predictedY = 0;
    
    // Server state (authoritative)
    private serverX = 0;
    private serverY = 0;
    
    update(deltaTime: number, input: InputManager) {
        // 1. Apply input immediately (predict)
        if (input.isDown('ArrowRight')) {
            this.predictedX += 200 * deltaTime;
        }
        
        // 2. Send input to server
        this.sendInput({right: input.isDown('ArrowRight')});
        
        // 3. When server responds, reconcile
        // (See: client-side prediction, server reconciliation)
    }
    
    onServerUpdate(serverState: {x: number, y: number}) {
        this.serverX = serverState.x;
        this.serverY = serverState.y;
        
        // Smoothly interpolate to server position
        this.predictedX += (this.serverX - this.predictedX) * 0.1;
        this.predictedY += (this.serverY - this.predictedY) * 0.1;
    }
}
```

**Key techniques:**
- **Client-side prediction:** Apply inputs immediately
- **Server reconciliation:** Correct when server disagrees
- **Interpolation:** Smooth out corrections
- **Input buffering:** Send multiple frames of input

---

## Q17: What input latency is acceptable for games?

**Short answer:** < 100ms total input latency.

**Detailed explanation:**

**Total latency = Input lag + Processing + Render + Display**

```
Player presses button → Browser detects (1-16ms)
                      → Game processes (1-16ms)
                      → Render (1-16ms)
                      → Display shows (1-30ms)
                      ─────────────────────────
                        Total: 4-78ms
```

**Perceptible latency thresholds:**

| Latency | Feel |
|---------|------|
| < 50ms | Instant, imperceptible |
| 50-100ms | Slight delay, acceptable |
| 100-150ms | Noticeable, usable |
| 150-200ms | Sluggish, frustrating |
| > 200ms | Broken, unplayable |

**How to minimize:**

1. **60 FPS minimum:** 16ms frame time
2. **Process input first:** Before physics/rendering
3. **Avoid queuing:** Don't defer input to next frame
4. **Disable VSync:** Reduces display lag (but causes tearing)
5. **Use requestAnimationFrame:** Syncs with display

**Measure latency:**
```typescript
let inputTime = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        inputTime = performance.now();
    }
});

function gameLoop() {
    if (keyboard.isPressed(' ')) {
        const latency = performance.now() - inputTime;
        console.log('Input latency:', latency, 'ms');
    }
}
```

---

## Q18: Should I use `keydown`, `keypress`, or `keyup`?

**Short answer:** Use `keydown` and `keyup`. Avoid `keypress` (deprecated).

**Detailed explanation:**

| Event | Fires When | Use For |
|-------|-----------|---------|
| `keydown` | Key is pressed | Detecting press, tracking state |
| `keyup` | Key is released | Detecting release, clearing state |
| `keypress` | Character input (DEPRECATED) | ❌ Don't use |

**Why keypress is deprecated:**
- Doesn't fire for non-character keys (arrows, Shift)
- Behaves inconsistently across browsers
- Being removed from web standards

**Correct pattern:**
```typescript
document.addEventListener('keydown', (e) => {
    keys.add(e.key);
});

document.addEventListener('keyup', (e) => {
    keys.delete(e.key);
});
```

---

## Q19: How do I handle key repeat (holding a key)?

**Short answer:** Track state, not events. Use `isDown()` for continuous actions.

**Detailed explanation:**

**Problem:** Key repeat fires `keydown` multiple times while held.

```
Hold Space:
  keydown (user presses)
  keydown (OS repeat) ← 200ms later
  keydown (OS repeat) ← 33ms later
  keydown (OS repeat) ← 33ms later
  ...
```

**Solution: State-based input**
```typescript
// ❌ Bad: Tied to key repeat
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        player.x += 5; // Moves at OS repeat rate!
    }
});

// ✅ Good: Smooth movement
class KeyboardManager {
    private keys: Set<string> = new Set();
    
    constructor() {
        document.addEventListener('keydown', (e) => {
            this.keys.add(e.key); // Only records state
        });
    }
    
    isDown(key: string): boolean {
        return this.keys.has(key);
    }
}

function gameLoop(deltaTime: number) {
    if (keyboard.isDown('ArrowRight')) {
        player.x += 200 * deltaTime; // Frame-rate independent!
    }
}
```

**Key insight:** Check state in game loop, not in events.

---

## Q20: Where can I learn more about game input?

**Short answer:** Listed resources below.

**Articles:**
- [Gaffer on Games: Input Handling](https://gafferongames.com/post/input_handling/)
- [Celeste Input System](https://maddythorson.medium.com/celeste-and-towerfall-physics-d24bd2ae0fc5)
- [Input Buffering Explained](https://www.gamedeveloper.com/design/input-buffering-and-how-to-code-it)

**Videos:**
- "How Celeste's Controls Feel So Good" (Game Maker's Toolkit)
- "The Art of Screenshake" (Jan Willem Nijman)

**Books:**
- "Game Programming Patterns" by Robert Nystrom (Command pattern)
- "Game Feel" by Steve Swink

**Interactive:**
- [Juice it or lose it](https://www.youtube.com/watch?v=Fy0aCDmgnxg) (talk)
- Test games: Celeste, Super Meat Boy, Hollow Knight (tight controls)

**Try yourself:**
- Implement all features in this topic
- Feel the difference with/without buffering and coyote time
- Compare to commercial games

---

**Congratulations!** You've completed Input & Controls. Master these concepts and your games will feel responsive and professional. 🎮