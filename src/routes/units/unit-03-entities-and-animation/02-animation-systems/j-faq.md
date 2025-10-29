# Animation Systems - FAQ

**Unit 03: Entities, Animations & Sprites | Topic 02 of 03**

> Answers to common animation questions

---

## Q1: How many frames do I need for each animation?

**Short answer:** 4-8 frames for most animations.

**Detail:**
- **Idle:** 4-6 frames (subtle breathing/bobbing)
- **Walk:** 6-8 frames (full walk cycle)
- **Run:** 6-8 frames (similar to walk, but faster playback)
- **Jump:** 2-4 frames (windup, peak, fall)
- **Attack:** 4-8 frames (windup, hit, recovery)

**Smooth vs. Snappy:**
- More frames = smoother, but more work
- Fewer frames = snappier, retro feel

**Tip:** Start with 4 frames, add more if needed.

---

## Q2: How fast should animations play?

**Frame duration guide:**

| Animation | Duration | Reason |
|-----------|----------|--------|
| Idle | 0.2 - 0.5s | Slow, calm |
| Walk | 0.1 - 0.15s | Moderate pace |
| Run | 0.05 - 0.08s | Fast, urgent |
| Attack | 0.05 - 0.08s | Snappy response |
| Death | 0.15 - 0.2s | Dramatic pause |

**Formula:** `fps = 1 / frameDuration`
- 0.1s = 10 FPS per frame
- 0.05s = 20 FPS per frame

**Test different speeds!** Feel is more important than numbers.

---

## Q3: Should I use frame index or time-based animation?

**Time-based is better for games!**

**❌ Frame Index (Bad)**
```typescript
// Advances every game frame
currentFrame++;
// Animation speed depends on framerate!
```

**✅ Time-Based (Good)**
```typescript
// Advances based on elapsed time
frameTime += deltaTime / 1000;
if (frameTime >= frameDuration) {
    currentFrame++;
}
// Animation speed consistent regardless of framerate
```

**Why?** Game framerate varies (lag, different devices). Time-based keeps animation speed constant.

---

## Q4: When should I reset an animation?

**Reset when:**
1. **Switching states**
   ```typescript
   setState('jump'); // Reset jump to frame 0
   ```

2. **Restarting a one-shot animation**
   ```typescript
   if (attackButton.pressed) {
       attackAnim.reset();
   }
   ```

3. **Looping back** (automatic in loop mode)

**Don't reset when:**
- Animation is already playing and should continue
- Switching to same state (check `if (newState !== current)`)

---

## Q5: How do I sync animations with movement speed?

**Scale frame duration by velocity:**

```typescript
class Player {
    updateAnimation(): void {
        const speed = Math.abs(this.velocityX);
        
        if (speed > 200) {
            animState.setState('run');
            runAnim.setSpeed(speed / 200); // Faster = faster animation
        } else if (speed > 0) {
            animState.setState('walk');
            walkAnim.setSpeed(speed / 100);
        }
    }
}
```

**Or:** Match frame duration to stride length
```typescript
// If character moves 100px per walk cycle
const strideLength = 100;
const frameDuration = (strideLength / velocityX) / frameCount;
```

---

## Q6: How do I blend between animations smoothly?

**Use alpha blending during transition:**

```typescript
class BlendedAnimation {
    private blendTime = 0;
    private blendDuration = 0.1; // 100ms
    
    draw(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        if (this.blendTime < this.blendDuration) {
            const alpha = this.blendTime / this.blendDuration;
            
            // Draw previous animation (fading out)
            ctx.globalAlpha = 1 - alpha;
            previousAnim.draw(ctx, x, y, w, h);
            
            // Draw current animation (fading in)
            ctx.globalAlpha = alpha;
            currentAnim.draw(ctx, x, y, w, h);
            
            ctx.globalAlpha = 1.0;
        } else {
            currentAnim.draw(ctx, x, y, w, h);
        }
    }
}
```

**When to use:** Transitions between similar poses (idle ↔ walk).

**When NOT to use:** Fast actions (jump, attack) - instant switch feels better.

---

## Q7: What's the difference between loop, once, and pingpong modes?

**Loop Mode:** Repeats forever
```
Frame: 0 → 1 → 2 → 3 → 0 → 1 → 2 → 3 → ...
Use for: Idle, walk, run
```

**Once Mode:** Plays once and stops
```
Frame: 0 → 1 → 2 → 3 → (stop at 3)
Use for: Jump, attack, death
```

**Ping-Pong Mode:** Bounces back and forth
```
Frame: 0 → 1 → 2 → 3 → 2 → 1 → 0 → 1 → ...
Use for: Idle breathing, floating platforms
```

---

## Q8: How do I trigger sounds/effects on specific frames?

**Use animation events:**

```typescript
walkAnim.addEvent(0, () => playSound('step.wav'));
walkAnim.addEvent(3, () => playSound('step.wav'));

attackAnim.addEvent(2, () => {
    playSound('sword_swing.wav');
    spawnSlashEffect();
});
```

**Important:** Track if event already fired this frame to avoid duplicates!

---

## Q9: Should I create one Animation per entity or share them?

**Share animations between entities of same type!**

**✅ Good: Shared Animations**
```typescript
class Enemy {
    static walkAnim = new Animation(walkFrames, 0.1);
    
    draw(ctx: CanvasRenderingContext2D) {
        Enemy.walkAnim.draw(ctx, this.x, this.y, 32, 32);
    }
}
```

**❌ Bad: Per-Entity Animations**
```typescript
class Enemy {
    walkAnim = new Animation(walkFrames, 0.1); // Wasteful!
}
```

**Exception:** If entities need different animation speeds or offsets.

**Optimization:** Use a shared `AnimationManager`:
```typescript
class AnimationManager {
    private animations = new Map<string, Animation>();
    
    get(name: string): Animation {
        if (!this.animations.has(name)) {
            this.animations.set(name, this.createAnimation(name));
        }
        return this.animations.get(name)!;
    }
}
```

---

## Q10: How do I debug animation timing issues?

**Add visual frame counter:**

```typescript
function drawAnimDebug(ctx: CanvasRenderingContext2D, anim: Animation) {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.font = 'bold 16px monospace';
    
    const text = `Frame: ${anim.getFrameIndex()} / ${anim.getFrameCount()}`;
    ctx.strokeText(text, 10, 20);
    ctx.fillText(text, 10, 20);
    
    const time = `Time: ${anim.getFrameTime().toFixed(3)}s / ${anim.getFrameDuration()}s`;
    ctx.strokeText(time, 10, 40);
    ctx.fillText(time, 10, 40);
}
```

**Log state changes:**
```typescript
setState(newState: State): void {
    if (newState !== this.currentState) {
        console.log(`[Anim] ${this.currentState} → ${newState}`);
        this.currentState = newState;
    }
}
```

**Slow motion testing:**
```typescript
// Multiply deltaTime by 0.1 for 10x slowdown
anim.update(deltaTime * 0.1);
```

---

## Q11: Can I have multiple animation layers?

**Yes! Use separate animations for body parts:**

```typescript
class Player {
    bodyAnim: Animation;
    legsAnim: Animation;
    
    draw(ctx: CanvasRenderingContext2D) {
        // Draw legs (lower layer)
        this.legsAnim.draw(ctx, this.x, this.y + 24, 32, 24);
        
        // Draw body (upper layer)
        this.bodyAnim.draw(ctx, this.x, this.y, 32, 32);
    }
}
```

**Use cases:**
- Player body + legs (body can aim while legs walk)
- Character + weapon (weapon has attack animation)
- Facial expressions separate from body

---

## Q12: How do I make an animation wait before looping?

**Add pause frames:**

```typescript
class PausedAnimation extends Animation {
    private pauseDuration = 0.5; // 500ms pause
    private pauseTime = 0;
    
    advanceFrame(): void {
        if (this.currentFrame === this.frames.length - 1) {
            // On last frame, pause
            this.pauseTime += this.frameTime;
            if (this.pauseTime >= this.pauseDuration) {
                this.pauseTime = 0;
                this.currentFrame = 0;
            }
        } else {
            this.currentFrame++;
        }
    }
}
```

**Or:** Just duplicate last frame in sprite sheet!

---

## Quick Reference

| Task | Method |
|------|--------|
| Loop animation | `new Animation(frames, 0.1, 'loop')` |
| Play once | `new Animation(frames, 0.1, 'once')` |
| Check finished | `anim.isFinished()` |
| Restart | `anim.reset()` |
| Flip horizontal | Pass `flipH: true` to draw() |
| Trigger event | `anim.addEvent(2, callback)` |
| Change speed | `anim.setSpeed(2.0)` |

---

**Congratulations!** You've mastered animation systems!

**Next Topic:** Entity Management (`unit-03/03-entity-management/`)
