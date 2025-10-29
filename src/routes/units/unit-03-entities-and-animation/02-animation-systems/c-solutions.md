# Animation Systems - Solutions

**Unit 03: Entities, Animations & Sprites | Topic 02 of 03**

> Complete, working solutions for key animation exercises.

---

## Solution 1: Simple Frame Animation

```typescript
const frames: Sprite[] = [
    new Sprite(sheet, 0, 0, 32, 32),
    new Sprite(sheet, 32, 0, 32, 32),
    new Sprite(sheet, 64, 0, 32, 32),
    new Sprite(sheet, 96, 0, 32, 32),
];

const frameDuration = 0.1; // 100ms per frame
let currentFrame = 0;
let frameTime = 0;

function update(deltaTime: number): void {
    // Add time since last frame
    frameTime += deltaTime / 1000;
    
    // Advance frames when time threshold reached
    while (frameTime >= frameDuration) {
        frameTime -= frameDuration;
        currentFrame = (currentFrame + 1) % frames.length;
    }
}

function draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    frames[currentFrame].draw(ctx, x, y, 32, 32);
}

// Game loop
let lastTime = 0;
function gameLoop(timestamp: number): void {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    update(deltaTime);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw(ctx, 100, 100);
    
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
```

**Key Points:**
- Convert `deltaTime` to seconds (`/ 1000`)
- Use `while` loop in case multiple frames should advance
- Modulo wraps back to frame 0

---

## Solution 2: Animation Class

```typescript
class Animation {
    private frames: Sprite[];
    private frameDuration: number;
    private currentFrame = 0;
    private frameTime = 0;
    
    constructor(frames: Sprite[], frameDuration: number) {
        if (frames.length === 0) {
            throw new Error('Animation must have at least one frame');
        }
        this.frames = frames;
        this.frameDuration = frameDuration;
    }
    
    update(dt: number): void {
        this.frameTime += dt / 1000;
        
        while (this.frameTime >= this.frameDuration) {
            this.frameTime -= this.frameDuration;
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }
    }
    
    getCurrentFrame(): Sprite {
        return this.frames[this.currentFrame];
    }
    
    getFrameIndex(): number {
        return this.currentFrame;
    }
    
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
        this.getCurrentFrame().draw(ctx, x, y, w, h);
    }
}

// Usage
const walkFrames = [
    new Sprite(sheet, 0, 0, 32, 48),
    new Sprite(sheet, 32, 0, 32, 48),
    new Sprite(sheet, 64, 0, 32, 48),
    new Sprite(sheet, 96, 0, 32, 48),
];

const walkAnim = new Animation(walkFrames, 0.1);

function gameLoop(dt: number): void {
    walkAnim.update(dt);
    walkAnim.draw(ctx, 100, 200, 32, 48);
}
```

---

## Solution 3: Play Once Mode

```typescript
type AnimationMode = 'loop' | 'once';

class Animation {
    private frames: Sprite[];
    private frameDuration: number;
    private mode: AnimationMode;
    private currentFrame = 0;
    private frameTime = 0;
    private finished = false;
    
    constructor(frames: Sprite[], frameDuration: number, mode: AnimationMode = 'loop') {
        this.frames = frames;
        this.frameDuration = frameDuration;
        this.mode = mode;
    }
    
    update(dt: number): void {
        if (this.finished) return; // Don't update if finished
        
        this.frameTime += dt / 1000;
        
        while (this.frameTime >= this.frameDuration) {
            this.frameTime -= this.frameDuration;
            this.advanceFrame();
        }
    }
    
    private advanceFrame(): void {
        if (this.mode === 'loop') {
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        } else {
            // Once mode
            if (this.currentFrame < this.frames.length - 1) {
                this.currentFrame++;
            } else {
                this.finished = true;
            }
        }
    }
    
    reset(): void {
        this.currentFrame = 0;
        this.frameTime = 0;
        this.finished = false;
    }
    
    isFinished(): boolean {
        return this.finished;
    }
    
    getCurrentFrame(): Sprite {
        return this.frames[this.currentFrame];
    }
    
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
        this.getCurrentFrame().draw(ctx, x, y, w, h);
    }
}

// Usage
const jumpAnim = new Animation(jumpFrames, 0.08, 'once');

function onJump(): void {
    jumpAnim.reset(); // Start animation
}

function gameLoop(dt: number): void {
    jumpAnim.update(dt);
    jumpAnim.draw(ctx, player.x, player.y, 32, 48);
    
    if (jumpAnim.isFinished()) {
        console.log('Jump animation complete, switch to fall!');
    }
}
```

---

## Solution 4: Animation State Machine

```typescript
type PlayerState = 'idle' | 'walk' | 'run' | 'jump' | 'fall';

class AnimationStateMachine {
    private animations: Map<PlayerState, Animation>;
    private currentState: PlayerState;
    
    constructor(animations: Map<PlayerState, Animation>, initialState: PlayerState) {
        this.animations = animations;
        this.currentState = initialState;
    }
    
    setState(newState: PlayerState): void {
        if (newState !== this.currentState) {
            this.currentState = newState;
            
            // Reset the new animation
            const anim = this.animations.get(newState);
            if (anim) {
                anim.reset();
            }
        }
    }
    
    getState(): PlayerState {
        return this.currentState;
    }
    
    update(dt: number): void {
        const anim = this.animations.get(this.currentState);
        if (anim) {
            anim.update(dt);
        }
    }
    
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, flipH = false): void {
        const anim = this.animations.get(this.currentState);
        if (anim) {
            if (flipH) {
                ctx.save();
                ctx.translate(x + w, y);
                ctx.scale(-1, 1);
                anim.draw(ctx, 0, 0, w, h);
                ctx.restore();
            } else {
                anim.draw(ctx, x, y, w, h);
            }
        }
    }
}

// Setup
const animations = new Map<PlayerState, Animation>([
    ['idle', new Animation(idleFrames, 0.2, 'loop')],
    ['walk', new Animation(walkFrames, 0.1, 'loop')],
    ['run', new Animation(runFrames, 0.08, 'loop')],
    ['jump', new Animation(jumpFrames, 0.08, 'once')],
    ['fall', new Animation(fallFrames, 0.1, 'loop')],
]);

const animState = new AnimationStateMachine(animations, 'idle');

// Usage
function gameLoop(dt: number): void {
    animState.update(dt);
    animState.draw(ctx, player.x, player.y, 32, 48, !player.facingRight);
}
```

---

## Solution 5: Player Animation Logic

```typescript
class Player {
    x = 100;
    y = 400;
    velocityX = 0;
    velocityY = 0;
    facingRight = true;
    onGround = false;
    
    private animState: AnimationStateMachine;
    
    constructor(animations: Map<PlayerState, Animation>) {
        this.animState = new AnimationStateMachine(animations, 'idle');
    }
    
    update(dt: number): void {
        // Update physics first...
        this.updatePhysics(dt);
        
        // Then update animation based on state
        this.updateAnimation();
        
        this.animState.update(dt);
    }
    
    private updateAnimation(): void {
        // Priority order matters!
        if (!this.onGround) {
            // In air
            if (this.velocityY < 0) {
                this.animState.setState('jump');
            } else {
                this.animState.setState('fall');
            }
        } else {
            // On ground
            const absVelX = Math.abs(this.velocityX);
            
            if (absVelX >= 200) {
                this.animState.setState('run');
            } else if (absVelX > 0) {
                this.animState.setState('walk');
            } else {
                this.animState.setState('idle');
            }
        }
        
        // Update facing direction
        if (this.velocityX > 0) {
            this.facingRight = true;
        } else if (this.velocityX < 0) {
            this.facingRight = false;
        }
    }
    
    draw(ctx: CanvasRenderingContext2D): void {
        this.animState.draw(ctx, this.x, this.y, 32, 48, !this.facingRight);
    }
    
    private updatePhysics(dt: number): void {
        // Gravity, collision, etc.
        this.velocityY += 800 * (dt / 1000);
        this.x += this.velocityX * (dt / 1000);
        this.y += this.velocityY * (dt / 1000);
        
        // Simplified ground check
        if (this.y >= 400) {
            this.y = 400;
            this.velocityY = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }
    }
}
```

**Key Logic:**
1. Check air state first (highest priority)
2. Then check ground speed
3. Update facing direction based on velocity
4. Always update animation AFTER physics

---

## Solution 6: Horizontal Flipping

```typescript
class Animation {
    // ... (previous code)
    
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, flipH = false): void {
        if (flipH) {
            ctx.save();
            ctx.translate(x + w, y);  // Move to right edge
            ctx.scale(-1, 1);          // Flip horizontally
            this.getCurrentFrame().draw(ctx, 0, 0, w, h);
            ctx.restore();
        } else {
            this.getCurrentFrame().draw(ctx, x, y, w, h);
        }
    }
}

// Usage
class Player {
    facingRight = true;
    
    updateFacing(): void {
        if (this.velocityX > 0) {
            this.facingRight = true;
        } else if (this.velocityX < 0) {
            this.facingRight = false;
        }
    }
    
    draw(ctx: CanvasRenderingContext2D): void {
        // Flip if facing left
        const flipH = !this.facingRight;
        this.animation.draw(ctx, this.x, this.y, 32, 48, flipH);
    }
}
```

---

## Solution 9: Animation Events

```typescript
interface AnimationEvent {
    frame: number;
    callback: () => void;
    triggered?: boolean; // Track if triggered this cycle
}

class EventAnimation extends Animation {
    private events: AnimationEvent[] = [];
    private lastFrame = -1;
    
    addEvent(frame: number, callback: () => void): void {
        this.events.push({ frame, callback, triggered: false });
    }
    
    update(dt: number): void {
        const prevFrame = this.getFrameIndex();
        super.update(dt);
        const currentFrame = this.getFrameIndex();
        
        // Detect frame changes
        if (currentFrame !== prevFrame) {
            // Check if we wrapped around (loop)
            if (currentFrame < prevFrame) {
                // Reset all triggered flags
                this.events.forEach(e => e.triggered = false);
            }
            
            // Trigger events for current frame
            this.events.forEach(event => {
                if (event.frame === currentFrame && !event.triggered) {
                    event.callback();
                    event.triggered = true;
                }
            });
        }
    }
    
    reset(): void {
        super.reset();
        this.events.forEach(e => e.triggered = false);
    }
}

// Usage
const walkAnim = new EventAnimation(walkFrames, 0.1, 'loop');

walkAnim.addEvent(0, () => {
    console.log('Left foot down');
    playSound('step.wav');
});

walkAnim.addEvent(2, () => {
    console.log('Right foot down');
    playSound('step.wav');
});

// In game loop
function gameLoop(dt: number): void {
    walkAnim.update(dt);
    walkAnim.draw(ctx, player.x, player.y, 32, 48);
}
```

---

## Testing Your Solutions

```typescript
// Test animation cycles
const testAnim = new Animation(frames, 0.1);
for (let i = 0; i < 100; i++) {
    testAnim.update(16); // Simulate 60 FPS
    console.log(`Frame: ${testAnim.getFrameIndex()}`);
}

// Test play-once mode
const jumpAnim = new Animation(jumpFrames, 0.08, 'once');
while (!jumpAnim.isFinished()) {
    jumpAnim.update(16);
    console.log('Still playing...');
}
console.log('Animation finished!');

// Test state machine
const machine = new AnimationStateMachine(animations, 'idle');
console.log(machine.getState()); // 'idle'
machine.setState('walk');
console.log(machine.getState()); // 'walk'
```

---

## Common Mistakes

### ❌ Forgetting to Reset Animation
```typescript
// BAD: Animation continues from where it was
setState('jump');
```

### ✅ Always Reset When Switching
```typescript
// GOOD: Animation starts from frame 0
setState(newState: PlayerState): void {
    if (newState !== this.currentState) {
        this.currentState = newState;
        this.animations.get(newState)?.reset(); // ← Reset!
    }
}
```

### ❌ Not Converting Delta Time
```typescript
// BAD: deltaTime is in milliseconds
this.frameTime += deltaTime; // Wrong scale!
```

### ✅ Convert to Seconds
```typescript
// GOOD: Convert ms to seconds
this.frameTime += deltaTime / 1000;
```

---

## Performance Notes

1. **Reuse Animation objects** - Don't create new ones every frame
2. **Share frame arrays** - Multiple animations can reference same frames
3. **Lazy updates** - Only update animations for on-screen entities
4. **Batch draws** - Draw all similar animations together

---

**Next:** Quick reference in `d-notes.md`!
