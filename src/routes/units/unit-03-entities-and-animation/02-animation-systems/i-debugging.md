# Animation Systems - Common Bugs

**Unit 03: Entities, Animations & Sprites | Topic 02 of 03**

> Fix these common animation issues!

---

## Bug 1: Animation Plays Too Fast/Slow 🐛

### Symptom
Animation feels like it's in fast-forward or slow-motion.

### Common Causes

**❌ Wrong Delta Time Units**
```typescript
// BAD: deltaTime is in ms, but using as seconds
this.frameTime += deltaTime; // Too fast!
```

**✅ Convert to Seconds**
```typescript
// GOOD: Convert ms to seconds
this.frameTime += deltaTime / 1000;
```

**❌ Wrong Frame Duration**
```typescript
// BAD: 0.001s = 1ms (way too fast!)
const anim = new Animation(frames, 0.001);
```

**✅ Use Realistic Durations**
```typescript
// GOOD: 0.1s = 100ms per frame
const anim = new Animation(frames, 0.1);
```

### Fix Steps
1. Print `deltaTime` - should be ~16ms at 60 FPS
2. Divide by 1000 to convert to seconds
3. Test frame durations: 0.05s (fast) to 0.2s (slow)

---

## Bug 2: Animation Doesn't Loop 🐛

### Symptom
Animation plays once then freezes on last frame.

### Common Causes

**❌ Forgot Modulo**
```typescript
// BAD: Goes past last frame
this.currentFrame++;
```

**✅ Use Modulo to Wrap**
```typescript
// GOOD: Wraps back to 0
this.currentFrame = (this.currentFrame + 1) % this.frames.length;
```

**❌ Play-Once Mode Active**
```typescript
// BAD: Animation set to play once
const anim = new Animation(frames, 0.1, 'once');
```

**✅ Use Loop Mode**
```typescript
// GOOD: Animation loops
const anim = new Animation(frames, 0.1, 'loop');
```

### Fix Steps
1. Check if using modulo for looping
2. Verify animation mode is `'loop'`
3. Print `currentFrame` each update

---

## Bug 3: Animation Continues When State Changes 🐛

### Symptom
Walk animation keeps playing when player stops moving.

### Common Causes

**❌ Not Resetting Animation**
```typescript
// BAD: Old animation continues
setState(newState: State): void {
    this.currentState = newState;
    // Animation not reset!
}
```

**✅ Reset on State Change**
```typescript
// GOOD: Animation starts from frame 0
setState(newState: State): void {
    if (newState !== this.currentState) {
        this.currentState = newState;
        this.animations.get(newState)?.reset(); // ← Reset!
    }
}
```

### Fix Steps
1. Add `reset()` method to Animation class
2. Call `reset()` in `setState()`
3. Only reset if state actually changed

---

## Bug 4: Flip Sprite in Wrong Position 🐛

### Symptom
Flipped sprite appears in wrong location or jumps around.

### Common Causes

**❌ Wrong Translation**
```typescript
// BAD: Translates to wrong position
ctx.translate(x, y);
ctx.scale(-1, 1);
sprite.draw(ctx, 0, 0, w, h); // Wrong!
```

**✅ Translate to Right Edge**
```typescript
// GOOD: Move to right edge before scaling
ctx.translate(x + w, y);
ctx.scale(-1, 1);
sprite.draw(ctx, 0, 0, w, h);
```

**❌ Forgot save/restore**
```typescript
// BAD: Affects all future draws!
ctx.scale(-1, 1);
sprite.draw(ctx, x, y, w, h);
// ctx.restore() missing!
```

**✅ Always Wrap Transforms**
```typescript
// GOOD: Isolated transform
ctx.save();
ctx.translate(x + w, y);
ctx.scale(-1, 1);
sprite.draw(ctx, 0, 0, w, h);
ctx.restore();
```

### Fix Steps
1. Always `save()` before transforms
2. Translate to `x + width` before `scale(-1, 1)`
3. Draw at `(0, 0)` after transform
4. Always `restore()` after

---

## Bug 5: Wrong Animation Plays 🐛

### Symptom
Idle animation plays when player is moving, or vice versa.

### Common Causes

**❌ Wrong State Logic Order**
```typescript
// BAD: Idle always wins
if (velocityX === 0) {
    setState('idle');
}
if (velocityX !== 0) {
    setState('walk'); // Never reached if idle set first!
}
```

**✅ Use if-else Chain**
```typescript
// GOOD: Only one state set
if (velocityX !== 0) {
    setState('walk');
} else {
    setState('idle');
}
```

**❌ Checking Wrong Variable**
```typescript
// BAD: Checking old velocity
if (this.oldVelocityX !== 0) {
    setState('walk');
}
```

**✅ Check Current State**
```typescript
// GOOD: Check current velocity
if (this.velocityX !== 0) {
    setState('walk');
}
```

### Fix Steps
1. Use if-else, not multiple ifs
2. Check states in priority order (jump > walk > idle)
3. Print current state to debug

---

## Bug 6: Frame Skipping 🐛

### Symptom
Animation jumps over frames, looks jittery.

### Common Causes

**❌ Using if Instead of while**
```typescript
// BAD: Skips frames if dt large
if (frameTime >= frameDuration) {
    frameTime -= frameDuration;
    currentFrame++;
}
```

**✅ Use while Loop**
```typescript
// GOOD: Advances multiple frames if needed
while (frameTime >= frameDuration) {
    frameTime -= frameDuration;
    currentFrame = (currentFrame + 1) % frames.length;
}
```

### Fix Steps
1. Change `if` to `while`
2. Test with large delta times (e.g., tab away from game)

---

## Bug 7: Animation Events Fire Multiple Times 🐛

### Symptom
Sound plays twice for one footstep.

### Common Causes

**❌ Not Tracking Triggered State**
```typescript
// BAD: Triggers every frame
if (currentFrame === eventFrame) {
    callback(); // Fires every frame!
}
```

**✅ Track Triggered Events**
```typescript
// GOOD: Only trigger once per frame
if (currentFrame === eventFrame && !event.triggered) {
    callback();
    event.triggered = true;
}
```

### Fix Steps
1. Add `triggered` flag to events
2. Reset flags when animation loops
3. Only trigger when frame changes

---

## Debugging Tools

### Animation State Logger
```typescript
function logAnimationState(anim: Animation) {
    console.log({
        frame: anim.getFrameIndex(),
        frameTime: anim.getFrameTime(),
        finished: anim.isFinished(),
    });
}
```

### Visual Frame Display
```typescript
function drawFrameDebug(ctx: CanvasRenderingContext2D, anim: Animation) {
    ctx.fillStyle = 'white';
    ctx.font = '16px monospace';
    ctx.fillText(`Frame: ${anim.getFrameIndex()}`, 10, 20);
    ctx.fillText(`Time: ${anim.getFrameTime().toFixed(3)}s`, 10, 40);
}
```

### State Machine Debug
```typescript
class AnimationStateMachine {
    setState(newState: State): void {
        console.log(`State change: ${this.currentState} -> ${newState}`);
        if (newState !== this.currentState) {
            this.currentState = newState;
            this.animations.get(newState)?.reset();
        }
    }
}
```

---

## Testing Checklist

- [ ] Animation loops smoothly at 60 FPS
- [ ] Delta time properly converted to seconds
- [ ] State changes reset animations
- [ ] Flipped sprites stay in position
- [ ] Correct animation plays for each state
- [ ] No frame skipping with variable dt
- [ ] Events fire once per frame
- [ ] Animation finished flag works

---

**Next:** FAQ in `j-faq.md`!
