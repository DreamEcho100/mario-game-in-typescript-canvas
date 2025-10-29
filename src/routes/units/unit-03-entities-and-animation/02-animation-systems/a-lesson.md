# Animation Systems

**Unit 03: Entities, Animations & Sprites | Topic 02 of 03**

> **Learning Objective:** Build frame-based animation systems, state machines, and smooth animation transitions to bring your sprites to life.

---

## Building on Topic 01

In **Topic 01**, you learned to draw static sprites. Now we'll make them **move**!

### From Topic 01: Sprite Rendering
```typescript
// Topic 01: Drew single frame
const idleSprite = new Sprite(sheet, 0, 0, 32, 48);
idleSprite.draw(ctx, x, y, 32, 48);
```

### Topic 02 (NOW): Frame Animation
```typescript
// Topic 02: Cycle through frames
const walkAnim = new Animation([frame1, frame2, frame3], 0.1);
walkAnim.update(deltaTime);  // Advances frames
walkAnim.draw(ctx, x, y, 32, 48);  // Draws current frame
```

**The magic:** Time-based frame switching creates the illusion of movement!

---

## Table of Contents

1. [What is Animation?](#what-is-animation)
2. [Frame-Based Animation](#frame-based-animation)
3. [Animation Class](#animation-class)
4. [Animation State Machine](#animation-state-machine)
5. [Transition Blending](#transition-blending)
6. [Animation Events](#animation-events)
7. [Performance Tips](#performance-tips)
8. [Mario Implementation](#mario-implementation)

---

## What is Animation?

**Animation** = rapidly showing different images to create illusion of motion.

### Film/Video
- 24 frames per second (FPS)
- Each frame is different image

### Games
- 8-16 frames per animation
- Loop frames to create cycles (walk, run)
- Change speed by adjusting frame duration

### Walk Cycle Example

```
Frame 0     Frame 1     Frame 2     Frame 3
(0.1s)      (0.1s)      (0.1s)      (0.1s)
┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐
│ ●   │    │  ●  │    │   ● │    │  ●  │
│/|\  │    │ /|\ │    │ /|\ │    │ /|\ │
│/ \  │ -> │ /|  │ -> │  |\ │ -> │ /|  │
└─────┘    └─────┘    └─────┘    └─────┘
Then loop back to Frame 0
```

---

## Frame-Based Animation

### Simple Frame Cycling

```typescript
class SimpleAnimation {
    frames: Sprite[] = [];
    currentFrame = 0;
    frameTime = 0;
    frameDuration = 0.1; // 100ms per frame
    
    constructor(frames: Sprite[], frameDuration: number) {
        this.frames = frames;
        this.frameDuration = frameDuration;
    }
    
    update(deltaTime: number): void {
        this.frameTime += deltaTime / 1000;
        
        if (this.frameTime >= this.frameDuration) {
            this.frameTime = 0;
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

// Usage
const walkFrames = [sprite0, sprite1, sprite2, sprite3];
const walkAnim = new SimpleAnimation(walkFrames, 0.1);

function gameLoop(deltaTime: number) {
    walkAnim.update(deltaTime);
    walkAnim.draw(ctx, 100, 200, 32, 48);
}
```

### Animation Modes

**Loop Mode** - Repeats forever
```typescript
currentFrame = (currentFrame + 1) % frames.length;
```

**Once Mode** - Plays once and stops
```typescript
if (currentFrame < frames.length - 1) {
    currentFrame++;
}
```

**Ping-Pong Mode** - Forward then backward
```typescript
if (direction === 1 && currentFrame >= frames.length - 1) {
    direction = -1;
} else if (direction === -1 && currentFrame <= 0) {
    direction = 1;
}
currentFrame += direction;
```

---

## Animation Class

### Complete Animation System

```typescript
type AnimationMode = 'loop' | 'once' | 'pingpong';

class Animation {
    private frames: Sprite[];
    private frameDuration: number;
    private mode: AnimationMode;
    private currentFrame = 0;
    private frameTime = 0;
    private direction = 1; // For pingpong
    private finished = false;
    
    constructor(frames: Sprite[], frameDuration: number, mode: AnimationMode = 'loop') {
        this.frames = frames;
        this.frameDuration = frameDuration;
        this.mode = mode;
    }
    
    update(dt: number): void {
        if (this.finished) return;
        
        this.frameTime += dt / 1000;
        
        while (this.frameTime >= this.frameDuration) {
            this.frameTime -= this.frameDuration;
            this.advanceFrame();
        }
    }
    
    private advanceFrame(): void {
        switch (this.mode) {
            case 'loop':
                this.currentFrame = (this.currentFrame + 1) % this.frames.length;
                break;
                
            case 'once':
                if (this.currentFrame < this.frames.length - 1) {
                    this.currentFrame++;
                } else {
                    this.finished = true;
                }
                break;
                
            case 'pingpong':
                this.currentFrame += this.direction;
                if (this.currentFrame >= this.frames.length - 1) {
                    this.direction = -1;
                } else if (this.currentFrame <= 0) {
                    this.direction = 1;
                }
                break;
        }
    }
    
    reset(): void {
        this.currentFrame = 0;
        this.frameTime = 0;
        this.finished = false;
        this.direction = 1;
    }
    
    isFinished(): boolean {
        return this.finished;
    }
    
    getCurrentFrame(): Sprite {
        return this.frames[this.currentFrame];
    }
    
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, flipH = false): void {
        const frame = this.getCurrentFrame();
        
        if (flipH) {
            ctx.save();
            ctx.translate(x + w, y);
            ctx.scale(-1, 1);
            frame.draw(ctx, 0, 0, w, h);
            ctx.restore();
        } else {
            frame.draw(ctx, x, y, w, h);
        }
    }
}
```

---

## Animation State Machine

### State-Based Animations

```typescript
type PlayerState = 'idle' | 'walk' | 'run' | 'jump' | 'fall' | 'land';

class AnimationStateMachine {
    private animations: Map<PlayerState, Animation> = new Map();
    private currentState: PlayerState;
    
    constructor(animations: Map<PlayerState, Animation>, initialState: PlayerState) {
        this.animations = animations;
        this.currentState = initialState;
    }
    
    setState(newState: PlayerState): void {
        if (newState !== this.currentState) {
            this.currentState = newState;
            this.animations.get(newState)?.reset();
        }
    }
    
    getState(): PlayerState {
        return this.currentState;
    }
    
    update(dt: number): void {
        this.animations.get(this.currentState)?.update(dt);
    }
    
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, flipH = false): void {
        this.animations.get(this.currentState)?.draw(ctx, x, y, w, h, flipH);
    }
}

// Usage
const animations = new Map<PlayerState, Animation>([
    ['idle', new Animation(idleFrames, 0.2, 'loop')],
    ['walk', new Animation(walkFrames, 0.1, 'loop')],
    ['jump', new Animation(jumpFrames, 0.08, 'once')],
]);

const animState = new AnimationStateMachine(animations, 'idle');

// Change state based on player
if (player.velocityY < 0) {
    animState.setState('jump');
} else if (player.velocityX !== 0) {
    animState.setState('walk');
} else {
    animState.setState('idle');
}
```

---

## Transition Blending

### Smooth State Transitions

```typescript
class BlendedAnimation {
    private currentAnim: Animation;
    private previousAnim: Animation | null = null;
    private blendTime = 0;
    private blendDuration = 0.1; // 100ms blend
    
    setAnimation(newAnim: Animation): void {
        if (newAnim !== this.currentAnim) {
            this.previousAnim = this.currentAnim;
            this.currentAnim = newAnim;
            this.blendTime = 0;
            newAnim.reset();
        }
    }
    
    update(dt: number): void {
        this.currentAnim.update(dt);
        if (this.blendTime < this.blendDuration) {
            this.blendTime += dt / 1000;
        }
    }
    
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
        if (this.previousAnim && this.blendTime < this.blendDuration) {
            // Blend between previous and current
            const alpha = this.blendTime / this.blendDuration;
            
            ctx.save();
            ctx.globalAlpha = 1 - alpha;
            this.previousAnim.draw(ctx, x, y, w, h);
            
            ctx.globalAlpha = alpha;
            this.currentAnim.draw(ctx, x, y, w, h);
            ctx.restore();
        } else {
            this.currentAnim.draw(ctx, x, y, w, h);
        }
    }
}
```

---

## Animation Events

### Triggering Actions on Frames

```typescript
interface AnimationEvent {
    frame: number;
    callback: () => void;
}

class EventAnimation extends Animation {
    private events: AnimationEvent[] = [];
    private lastFrame = -1;
    
    addEvent(frame: number, callback: () => void): void {
        this.events.push({ frame, callback });
    }
    
    update(dt: number): void {
        const prevFrame = this.currentFrame;
        super.update(dt);
        
        // Trigger events for frames we passed
        if (this.currentFrame !== prevFrame) {
            this.events.forEach(event => {
                if (event.frame === this.currentFrame) {
                    event.callback();
                }
            });
        }
    }
}

// Usage: Play sound when foot hits ground
const walkAnim = new EventAnimation(walkFrames, 0.1, 'loop');
walkAnim.addEvent(0, () => playSound('step'));
walkAnim.addEvent(2, () => playSound('step'));
```

---

## Performance Tips

### 1. Reuse Animation Objects

```typescript
// ❌ BAD: Creates new Animation every frame
function render() {
    const anim = new Animation(frames, 0.1);
    anim.draw(ctx, x, y, 32, 48);
}

// ✅ GOOD: Create once, reuse
const anim = new Animation(frames, 0.1);
function render() {
    anim.update(dt);
    anim.draw(ctx, x, y, 32, 48);
}
```

### 2. Share Frames Between Animations

```typescript
const walkFrames = [frame1, frame2, frame3];

const walkAnim = new Animation(walkFrames, 0.1);
const walkFastAnim = new Animation(walkFrames, 0.05); // Same frames, faster
```

### 3. Lazy Load Animations

```typescript
class LazyAnimationLoader {
    private loaded: Map<string, Animation> = new Map();
    
    get(name: string): Animation {
        if (!this.loaded.has(name)) {
            this.loaded.set(name, this.createAnimation(name));
        }
        return this.loaded.get(name)!;
    }
}
```

---

## Mario Implementation

### Complete Mario Animation System

```typescript
class Mario {
    x = 100;
    y = 400;
    velocityX = 0;
    velocityY = 0;
    facingRight = true;
    onGround = false;
    
    private animState: AnimationStateMachine;
    
    constructor(sprites: MarioSprites) {
        // Create all animations
        const animations = new Map<PlayerState, Animation>([
            ['idle', new Animation(sprites.getFrames('idle'), 0.5, 'loop')],
            ['walk', new Animation(sprites.getFrames('walk'), 0.1, 'loop')],
            ['run', new Animation(sprites.getFrames('run'), 0.08, 'loop')],
            ['jump', new Animation(sprites.getFrames('jump'), 0.08, 'once')],
            ['fall', new Animation(sprites.getFrames('fall'), 0.1, 'loop')],
        ]);
        
        this.animState = new AnimationStateMachine(animations, 'idle');
    }
    
    update(dt: number): void {
        // Update state based on physics
        if (!this.onGround) {
            if (this.velocityY < 0) {
                this.animState.setState('jump');
            } else {
                this.animState.setState('fall');
            }
        } else if (Math.abs(this.velocityX) > 200) {
            this.animState.setState('run');
        } else if (Math.abs(this.velocityX) > 0) {
            this.animState.setState('walk');
        } else {
            this.animState.setState('idle');
        }
        
        // Update animation
        this.animState.update(dt);
        
        // Update facing direction
        if (this.velocityX > 0) this.facingRight = true;
        if (this.velocityX < 0) this.facingRight = false;
    }
    
    draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        this.animState.draw(ctx, screenX, screenY, 32, 48, !this.facingRight);
    }
}
```

---

## Summary

### What You've Learned

✅ **Frame Animation** - Cycling through sprites over time
✅ **Animation Modes** - Loop, once, pingpong
✅ **State Machines** - Switching animations based on state
✅ **Smooth Transitions** - Blending between animations
✅ **Animation Events** - Triggering actions on specific frames
✅ **Performance** - Reusing animations, sharing frames

### Key Takeaways

1. **Delta time** controls animation speed
2. **State machines** manage complex animation logic
3. **Reset animations** when switching states
4. **Share frame arrays** between similar animations
5. **Events** sync sound/effects to animation

---

## Looking Ahead to Topic 03

You can now animate sprites! **Next: Managing many entities:**

```typescript
// Topic 02 (NOW): Single animated entity
mario.update(dt);
mario.draw(ctx, camera);

// Topic 03 (NEXT): Many entities!
entities.forEach(entity => {
    entity.update(dt);
    entity.draw(ctx, camera);
});
```

**Preview:** Entity pools, factories, component systems

**Next:** Complete exercises in `b-exercises.md`!
