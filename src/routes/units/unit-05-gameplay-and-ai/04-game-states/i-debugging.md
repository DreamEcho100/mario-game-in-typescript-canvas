# Game States and State Management - Debugging Guide

**Unit 05: Gameplay, AI & Interactions | Topic 04 | Common Issues & Solutions**

---

## Bug #1: State Doesn't Switch

### Symptom
Calling setState() doesn't change the state.

### Root Cause
State not registered or wrong name used.

### Solution
```typescript
// ❌ Wrong: Typo in name
stateMachine.setState('manu'); // Should be 'menu'

// ✅ Fixed: Use enum
enum States { MENU = 'menu' }
stateMachine.setState(States.MENU);
```

---

## Bug #2: Multiple States Active

### Symptom
Two states rendering at once.

### Root Cause
Not calling exit() or managing state properly.

### Solution
```typescript
// ✅ Always exit before entering new state
setState(name: string): void {
  if (this.currentState) {
    this.currentState.exit();
  }
  this.currentState = this.states.get(name)!;
  this.currentState.enter();
}
```

---

## Bug #3: Input Still Works When Paused

### Symptom
Player can move while game is paused.

### Root Cause
Game update still runs in pause state.

### Solution
```typescript
// ✅ Don't update game in pause
class PausedState {
  update(deltaTime: number): void {
    // Don't call game.update()!
  }
}
```

---

## Bug #4: Save Data Lost

### Symptom
Save data doesn't persist after reload.

### Root Cause
localStorage error or wrong key.

### Solution
```typescript
// ✅ Always use try-catch
save(): void {
  try {
    localStorage.setItem('save', JSON.stringify(data));
  } catch (e) {
    console.error('Save failed:', e);
  }
}
```

---

## Bug #5: Menu Selection Wraps Incorrectly

### Symptom
Can't select last menu item.

### Root Cause
Off-by-one error in bounds checking.

### Solution
```typescript
// ✅ Correct bounds
selectNext(): void {
  this.index = (this.index + 1) % this.options.length;
}
```

---

## Bug #6: State Transition Crashes

### Symptom
Error when changing states.

### Root Cause
State is null or not found.

### Solution
```typescript
// ✅ Check before transitioning
setState(name: string): void {
  if (!this.states.has(name)) {
    console.error(`State not found: ${name}`);
    return;
  }
  // ... proceed
}
```

---

## Bug #7: Fade Stuck at Black Screen

### Symptom
Fade transition never completes.

### Root Cause
State change happens at wrong time.

### Solution
```typescript
// ✅ Change state mid-fade
if (progress >= 0.5 && !stateChanged) {
  stateMachine.setState(nextState);
  stateChanged = true;
}
```

---

## Bug #8: Audio Plays After State Change

### Symptom
Previous state's audio continues.

### Root Cause
Not stopping audio in exit().

### Solution
```typescript
// ✅ Clean up in exit
exit(): void {
  audioManager.stopAll();
}
```

---

## Bug #9: Load Corrupts Game

### Symptom
Loading save crashes or breaks game.

### Root Cause
Invalid JSON or version mismatch.

### Solution
```typescript
// ✅ Validate loaded data
load(): SaveData | null {
  const data = JSON.parse(saved);
  if (this.isValidSave(data)) {
    return data;
  }
  return null;
}
```

---

## Bug #10: Pause Menu Unresponsive

### Symptom
Can't navigate pause menu.

### Root Cause
Input not routed to pause state.

### Solution
```typescript
// ✅ Route input in state machine
handleInput(input: InputState): void {
  this.currentState?.handleInput?.(input);
}
```

---

**For more debugging tips, review the lesson and test thoroughly!**
