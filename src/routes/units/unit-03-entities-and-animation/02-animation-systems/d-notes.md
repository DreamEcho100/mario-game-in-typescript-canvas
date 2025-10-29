# Animation Systems - Quick Notes

**Unit 03: Entities, Animations & Sprites | Topic 02 of 03**

> Quick reference for frame-based animation

---

## Basic Animation Loop

```typescript
let currentFrame = 0;
let frameTime = 0;
const frameDuration = 0.1; // 100ms

function update(dt: number) {
    frameTime += dt / 1000;
    
    if (frameTime >= frameDuration) {
        frameTime = 0;
        currentFrame = (currentFrame + 1) % frames.length;
    }
}
```

---

## Animation Class Template

```typescript
class Animation {
    private frames: Sprite[];
    private frameDuration: number;
    private currentFrame = 0;
    private frameTime = 0;
    
    constructor(frames: Sprite[], frameDuration: number) {
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
    
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
        this.getCurrentFrame().draw(ctx, x, y, w, h);
    }
}
```

---

## Animation Modes

### Loop Forever
```typescript
currentFrame = (currentFrame + 1) % frames.length;
```

### Play Once
```typescript
if (currentFrame < frames.length - 1) {
    currentFrame++;
} else {
    finished = true;
}
```

### Ping-Pong
```typescript
currentFrame += direction;
if (currentFrame >= frames.length - 1) direction = -1;
if (currentFrame <= 0) direction = 1;
```

---

## State Machine Pattern

```typescript
type State = 'idle' | 'walk' | 'run';

class AnimationStateMachine {
    private animations = new Map<State, Animation>();
    private currentState: State;
    
    setState(newState: State): void {
        if (newState !== this.currentState) {
            this.currentState = newState;
            this.animations.get(newState)?.reset();
        }
    }
    
    update(dt: number): void {
        this.animations.get(this.currentState)?.update(dt);
    }
}
```

---

## Common Frame Durations

- **Idle:** 0.2 - 0.5s (slow, relaxed)
- **Walk:** 0.1 - 0.15s (moderate)
- **Run:** 0.05 - 0.08s (fast)
- **Attack:** 0.05 - 0.08s (snappy)
- **Death:** 0.15 - 0.2s (dramatic)

---

## Horizontal Flip

```typescript
function drawFlipped(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.save();
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    sprite.draw(ctx, 0, 0, w, h);
    ctx.restore();
}
```

---

## Animation Events

```typescript
interface AnimationEvent {
    frame: number;
    callback: () => void;
}

class EventAnimation extends Animation {
    private events: AnimationEvent[] = [];
    
    addEvent(frame: number, callback: () => void): void {
        this.events.push({ frame, callback });
    }
    
    update(dt: number): void {
        const prevFrame = this.currentFrame;
        super.update(dt);
        
        if (this.currentFrame !== prevFrame) {
            this.events.forEach(e => {
                if (e.frame === this.currentFrame) {
                    e.callback();
                }
            });
        }
    }
}
```

---

## Player Animation Logic

```typescript
function updatePlayerAnimation() {
    if (!player.onGround) {
        animState.setState(player.velocityY < 0 ? 'jump' : 'fall');
    } else if (Math.abs(player.velocityX) >= 200) {
        animState.setState('run');
    } else if (Math.abs(player.velocityX) > 0) {
        animState.setState('walk');
    } else {
        animState.setState('idle');
    }
}
```

---

## Smooth Transitions

```typescript
class BlendedAnimation {
    private blendTime = 0;
    private blendDuration = 0.1;
    
    draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        const alpha = this.blendTime / this.blendDuration;
        
        ctx.globalAlpha = 1 - alpha;
        previousAnim.draw(ctx, x, y, w, h);
        
        ctx.globalAlpha = alpha;
        currentAnim.draw(ctx, x, y, w, h);
        
        ctx.globalAlpha = 1.0;
    }
}
```

---

## Performance Tips

```typescript
// ❌ BAD: Creates every frame
function render() {
    const anim = new Animation(frames, 0.1);
    anim.draw(ctx, x, y);
}

// ✅ GOOD: Create once
const anim = new Animation(frames, 0.1);
function render() {
    anim.update(dt);
    anim.draw(ctx, x, y);
}
```

---

## Typical Animation Counts

**Small character:** 30-50 frames total
- Idle: 4-8 frames
- Walk: 6-8 frames
- Run: 6-8 frames
- Jump: 3-4 frames
- Fall: 2-3 frames
- Attack: 4-6 frames

**Boss enemy:** 100+ frames
- Multiple attack animations
- Damage reactions
- Phase transitions

---

## Debug Visualization

```typescript
function drawAnimDebug(ctx: CanvasRenderingContext2D, anim: Animation) {
    ctx.fillStyle = 'white';
    ctx.fillText(`Frame: ${anim.getFrameIndex()}/${anim.getFrameCount()}`, 10, 20);
    ctx.fillText(`Time: ${anim.getFrameTime().toFixed(2)}s`, 10, 40);
    ctx.fillText(`State: ${animState.getState()}`, 10, 60);
}
```

---

## Quick Checklist

- [ ] Use `deltaTime` for smooth animation
- [ ] Convert `deltaTime` to seconds (`/ 1000`)
- [ ] Reset animation when switching states
- [ ] Use modulo for looping: `% frames.length`
- [ ] Check `isFinished()` for one-shot animations
- [ ] Flip sprite based on facing direction
- [ ] Share frame arrays between animations
- [ ] Add events for sound/particle effects

---

**Next:** Debugging in `i-debugging.md`!
