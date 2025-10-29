# Animation Systems - Exercises

**Unit 03: Entities, Animations & Sprites | Topic 02 of 03**

> Practice building frame-based animations and state machines!

---

## Exercise 1: Simple Frame Animation ⭐

Create an animation that cycles through 4 frames.

### Requirements
- Load 4 sprite frames
- Cycle every 100ms
- Loop forever

### Starter Code
```typescript
const frames: Sprite[] = []; // Load your 4 frames
const frameDuration = 0.1; // 100ms

let currentFrame = 0;
let frameTime = 0;

function update(deltaTime: number) {
    // TODO: Advance frames
}

function draw(ctx: CanvasRenderingContext2D) {
    // TODO: Draw current frame
}
```

### Hints
- Add `deltaTime` to `frameTime`
- When `frameTime >= frameDuration`, advance frame
- Use modulo to loop: `(frame + 1) % frames.length`

---

## Exercise 2: Animation Class ⭐⭐

Build a reusable `Animation` class.

### Requirements
- Constructor takes frames and duration
- `update(dt)` advances frames
- `getCurrentFrame()` returns current sprite
- `draw()` renders current frame

### Template
```typescript
class Animation {
    private frames: Sprite[];
    private frameDuration: number;
    private currentFrame = 0;
    private frameTime = 0;
    
    constructor(frames: Sprite[], frameDuration: number) {
        // TODO
    }
    
    update(dt: number): void {
        // TODO
    }
    
    getCurrentFrame(): Sprite {
        // TODO
    }
    
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
        // TODO
    }
}
```

---

## Exercise 3: Play Once Mode ⭐⭐

Add "play once" mode that stops at the last frame.

### Requirements
- Constructor accepts `loop: boolean`
- If `loop = false`, stop at last frame
- Add `isFinished()` method
- Add `reset()` to restart

### Example Usage
```typescript
const jumpAnim = new Animation(jumpFrames, 0.1, false);

function update(dt: number) {
    jumpAnim.update(dt);
    
    if (jumpAnim.isFinished()) {
        console.log('Jump animation complete!');
    }
}
```

---

## Exercise 4: Animation State Machine ⭐⭐⭐

Create a state machine that switches between idle, walk, and run.

### Requirements
- Store multiple animations in a Map
- `setState(name)` switches animation
- Reset animation when switching states
- Update and draw current animation

### Template
```typescript
type State = 'idle' | 'walk' | 'run';

class AnimationStateMachine {
    private animations: Map<State, Animation>;
    private currentState: State;
    
    constructor(animations: Map<State, Animation>, initialState: State) {
        // TODO
    }
    
    setState(newState: State): void {
        // TODO: Switch state and reset animation
    }
    
    update(dt: number): void {
        // TODO: Update current animation
    }
    
    draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        // TODO: Draw current animation
    }
}
```

---

## Exercise 5: Player Animation Logic ⭐⭐⭐

Connect animation states to player physics.

### Requirements
- If `velocityX == 0`, use idle
- If `velocityX != 0 && abs(velocityX) < 200`, use walk
- If `abs(velocityX) >= 200`, use run
- If `velocityY < 0`, use jump
- If `velocityY > 0 && !onGround`, use fall

### Example Logic
```typescript
function updateAnimationState() {
    if (!player.onGround) {
        // TODO: jump or fall?
    } else if (/* moving fast */) {
        // TODO: run
    } else if (/* moving */) {
        // TODO: walk
    } else {
        // TODO: idle
    }
}
```

---

## Exercise 6: Horizontal Flipping ⭐⭐

Flip animations based on facing direction.

### Requirements
- Track `facingRight: boolean`
- Update when `velocityX != 0`
- Flip sprite when drawing if facing left

### Hint
```typescript
if (!facingRight) {
    ctx.save();
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
    animation.draw(ctx, 0, 0, width, height);
    ctx.restore();
}
```

---

## Exercise 7: Ping-Pong Animation ⭐⭐⭐

Create an animation that plays forward, then backward.

### Requirements
- Track `direction: 1 | -1`
- When reaching last frame, set direction = -1
- When reaching first frame, set direction = 1
- Advance frame: `currentFrame += direction`

### Example Use
Idle breathing animation that moves up/down smoothly.

---

## Exercise 8: Animation Speed Control ⭐⭐

Add playback speed multiplier.

### Requirements
- Add `speed: number` property (default 1.0)
- Multiply `dt` by speed in update
- `speed = 2.0` = 2x faster
- `speed = 0.5` = half speed

### Example
```typescript
class Animation {
    speed = 1.0;
    
    update(dt: number): void {
        this.frameTime += (dt / 1000) * this.speed;
        // ...
    }
    
    setSpeed(newSpeed: number): void {
        this.speed = newSpeed;
    }
}
```

---

## Exercise 9: Animation Events ⭐⭐⭐

Trigger callbacks when specific frames are reached.

### Requirements
- Store array of `{ frame: number, callback: () => void }`
- Check when frame changes in `update()`
- Call callbacks for reached frames

### Use Case
```typescript
walkAnim.addEvent(0, () => playSound('step1.wav'));
walkAnim.addEvent(2, () => playSound('step2.wav'));
```

---

## Exercise 10: Blended Transitions ⭐⭐⭐⭐

Fade between animations smoothly.

### Requirements
- Track `previousAnimation` and `currentAnimation`
- Blend duration: 100-200ms
- Use `ctx.globalAlpha` to fade
- `alpha = blendTime / blendDuration`

### Visual Effect
```
Previous animation alpha: 1.0 -> 0.0
Current animation alpha:  0.0 -> 1.0
Over 100ms duration
```

---

## Challenge Exercise 11: Frame-Perfect Input ⭐⭐⭐⭐

Some frames are "active" for attacks.

### Requirements
- Mark frames as `active: boolean`
- Only deal damage when current frame is active
- Reset hit detection each animation loop

### Example
```typescript
const attackFrames = [
    { sprite: frame1, active: false },  // Wind up
    { sprite: frame2, active: true },   // Hit!
    { sprite: frame3, active: true },   // Hit!
    { sprite: frame4, active: false },  // Recovery
];
```

---

## Challenge Exercise 12: Animation Chaining ⭐⭐⭐⭐

Play one animation after another finishes.

### Requirements
- Queue multiple animations
- When current finishes, start next
- Support looping last animation

### Example
```typescript
animChain.queue('crouch', 'once');
animChain.queue('jump', 'once');
animChain.queue('fall', 'loop'); // Loop when done
```

---

## Solutions

Complete solutions available in **`c-solutions.md`**!

Practice each exercise before checking solutions. Animation systems are core to game feel!

---

## Testing Checklist

- [ ] Frame animation loops smoothly
- [ ] Animation class is reusable
- [ ] Play-once mode stops correctly
- [ ] State machine switches properly
- [ ] Player animations match movement
- [ ] Horizontal flipping works
- [ ] Ping-pong mode goes back and forth
- [ ] Speed control affects playback
- [ ] Events trigger at correct frames
- [ ] Transitions blend smoothly

**Next:** Check your work in `c-solutions.md`!
