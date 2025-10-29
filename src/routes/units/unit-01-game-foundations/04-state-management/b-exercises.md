# State Management - Exercises

**Unit 01: Game Foundations | Topic 04**

> Build state machines that scale!

---

## Exercise 1: Basic Game States ⭐

**Objective:** Implement main menu, playing, and game over states.

**Requirements:**
- Create `GameState` enum with MainMenu, Playing, GameOver
- Switch between states based on input:
  - MainMenu: Press Enter → Playing
  - Playing: Press Escape → MainMenu, Player dies → GameOver
  - GameOver: Press R → MainMenu
- Render different screens for each state

**Starter Code:**
```typescript
enum GameState {
    MainMenu,
    Playing,
    GameOver
}

class Game {
    private state: GameState = GameState.MainMenu;
    
    update(deltaTime: number, input: InputManager) {
        // TODO: Handle state transitions
    }
    
    render(ctx: CanvasRenderingContext2D) {
        // TODO: Render based on state
    }
}
```

---

## Exercise 2: Player State Machine ⭐⭐

**Objective:** Create Idle, Walking, Jumping, Falling states for player.

**Requirements:**
- `PlayerState` enum
- Transitions:
  - Idle → Walking (press arrow)
  - Walking → Idle (release arrows)
  - Idle/Walking → Jumping (press Space, only if grounded)
  - Jumping → Falling (velocityY > 0)
  - Falling → Idle (land on ground)
- Different velocities per state

**Test:**
- Movement only works in Walking state
- Can't jump while already jumping
- Smooth transitions

---

## Exercise 3: Enter/Exit Callbacks ⭐⭐

**Objective:** Add state enter/exit logic.

**Requirements:**
- `enterState(state)` method
- `exitState(state)` method
- When entering Jumping: set velocityY = -600
- When entering Idle: set velocityX = 0
- When exiting Playing state: save score
- When entering Paused: store game time

**Test:**
- Jump velocity applied exactly once
- States clean up properly

---

## Exercise 4: State-Based Animation ⭐⭐

**Objective:** Different animations for each player state.

**Requirements:**
- Idle: Breathing animation (bob up/down)
- Walking: Walk cycle (4 frames)
- Jumping: Arms up, static
- Falling: Arms down, static
- Update animation frame based on state

**Hint:**
```typescript
private animationFrame = 0;
private animationTime = 0;

updateAnimation(deltaTime: number) {
    this.animationTime += deltaTime;
    if (this.animationTime > 0.1) { // 10 FPS
        this.animationFrame++;
        this.animationTime = 0;
    }
}
```

---

## Exercise 5: Transition Guards ⭐⭐⭐

**Objective:** Prevent invalid state transitions.

**Requirements:**
- `canJump()` - only if grounded AND stamina > 0
- `canAttack()` - only if not already attacking
- `canRun()` - only if not crouching
- Stamina system: Jump costs 10, regenerates 5/sec
- Transitions respect guards

**Test:**
- Can't jump with 0 stamina
- Can't attack while attacking
- Stamina regenerates properly

---

## Exercise 6: Running State ⭐⭐⭐

**Objective:** Add Running state separate from Walking.

**Requirements:**
- Walking: 150 px/s
- Running: 300 px/s (hold Shift)
- Transitions:
  - Walking + Shift → Running
  - Running - Shift → Walking
- Different animation speeds (run faster)

**Test:**
- Speed doubles when running
- Animation plays faster
- Smooth transition

---

## Exercise 7: Skidding State ⭐⭐⭐

**Objective:** Implement Mario-style skidding when changing direction.

**Requirements:**
- Detect direction change while moving fast (>150 px/s)
- Enter Skidding state
- Decelerate velocity to 0
- Transition to Walking in opposite direction
- Play skid animation (leaning back)

**Logic:**
```typescript
if (velocityX > 150 && input.isDown('left')) {
    state = Skidding;
}
```

---

## Exercise 8: Hierarchical States ⭐⭐⭐

**Objective:** Implement nested Grounded/Airborne states.

**Requirements:**
- Top level: Grounded, Airborne
- Grounded substates: Idle, Walking, Running
- Airborne substates: Jumping, Falling
- Only allow ground actions when grounded
- Physics behaves differently per top-level state

**Structure:**
```typescript
mainState: 'grounded' | 'airborne';
subState: 'idle' | 'walking' | 'running' | 'jumping' | 'falling';
```

---

## Exercise 9: State Stack (Pause Menu) ⭐⭐⭐

**Objective:** Implement pause menu using state stack.

**Requirements:**
- Create `StateStack` class
- `push(state)` - add state on top
- `pop()` - remove top state
- Press P → push PauseState
- Press P again → pop (resume game)
- Game continues running under pause (optional: freeze)

**Test:**
- Game state preserved when paused
- Can pause/unpause multiple times
- Stack handles empty case

---

## Exercise 10: Enemy State Machine ⭐⭐⭐

**Objective:** Create AI enemy with Patrol, Chase, Attack states.

**Requirements:**
- **Patrol:** Move left-right between points
- **Chase:** Move toward player if within 200px
- **Attack:** Stop and attack if within 50px
- Transitions based on distance to player
- Return to Patrol if player escapes (>250px)

**Hint:**
```typescript
const distToPlayer = Math.sqrt(
    (this.x - player.x) ** 2 + 
    (this.y - player.y) ** 2
);
```

---

## Exercise 11: State Timers ⭐⭐⭐

**Objective:** Time-limited states.

**Requirements:**
- **Attacking state:** 0.5 seconds, then return to Idle
- **Hurt state:** 1 second of invincibility
- **PowerUp state:** 10 seconds of super speed
- Track `stateTime` - time spent in current state
- Auto-transition when time expires

**Implementation:**
```typescript
private stateTime = 0;

enterState(state: State) {
    this.stateTime = 0;
}

update(deltaTime: number) {
    this.stateTime += deltaTime;
    
    if (this.state === State.Attacking && this.stateTime > 0.5) {
        this.state = State.Idle;
    }
}
```

---

## Exercise 12: State History ⭐⭐⭐

**Objective:** Track previous states for combo detection.

**Requirements:**
- Store last 3 states in array
- Detect combo: Jumping → Attacking → Landing = "Jump Attack"
- Detect combo: Running → Ducking = "Slide"
- Show combo name when executed

**Structure:**
```typescript
private stateHistory: PlayerState[] = [];

setState(newState: PlayerState) {
    this.stateHistory.push(this.state);
    if (this.stateHistory.length > 3) {
        this.stateHistory.shift();
    }
    this.state = newState;
}

checkCombo() {
    if (this.stateHistory === [Jumping, Attacking, Landing]) {
        return 'Jump Attack';
    }
}
```

---

## Exercise 13: Context-Sensitive Actions ⭐⭐⭐⭐

**Objective:** Same button does different things per state.

**Requirements:**
- Press X:
  - In Idle: Attack
  - In Jumping: Dive attack
  - In Running: Slide
  - In Ducking: Roll
- Different behavior, same input
- Visual feedback per action

---

## Exercise 14: Animation State Machine ⭐⭐⭐⭐

**Objective:** Separate state machine just for animations.

**Requirements:**
- `AnimationState`: Intro, Loop, Outro
- Each player state has its own animation FSM
- Example: Walk animation
  - Intro: Foot lifts (2 frames)
  - Loop: Walking cycle (4 frames, repeat)
  - Outro: Foot lands (2 frames) → Idle
- Smooth transitions between animations

---

## Exercise 15: Debug State Visualizer ⭐⭐

**Objective:** Visual tool to see state changes.

**Requirements:**
- Show current state name on screen
- Show state duration
- Show available transitions
- Show state history (last 5 states)
- Color-code by state type

**Display:**
```
Current: Jumping (0.3s)
History: Idle → Walking → Jumping
Next: Falling (when velocityY > 0)
```

---

## 🎯 Challenge Projects

### Challenge 1: Fighting Game States

Implement a fighting game character with:
- Ground states: Idle, Walk, Crouch, Block
- Attack states: LightPunch, HeavyPunch, Kick, Special
- Air states: Jump, AirAttack, AirBlock
- Hit states: HitStun, Knockdown, GetUp
- Combos: Detect move sequences (→ ↓ ↘ + Punch = Hadouken)
- Cancel system: Can cancel certain moves into others

### Challenge 2: Platformer Power-Ups

Create power-up system that modifies states:
- Fire flower: Adds Shooting state
- Cape: Adds Gliding state (in air)
- Star: Adds Invincible state (temporary)
- Mushroom: Adds Big state (modifies hitbox)
- Power-ups stack and interact

### Challenge 3: Stealth Game AI

Enemy with sophisticated state machine:
- **Idle:** Stand guard
- **Suspicious:** Heard noise, investigating
- **Searching:** Looking for player
- **Chasing:** Saw player, pursuing
- **Attacking:** In range, attacking
- **Retreating:** Health low, backing off
- **Calling Backup:** Alert other enemies
- Vision cones, sound detection, memory system

---

## Testing Checklist

✅ **Basic States:**
- [ ] States switch correctly
- [ ] One state active at a time
- [ ] Invalid transitions blocked
- [ ] Enter/exit callbacks fire

✅ **Transitions:**
- [ ] All transitions work
- [ ] Guards prevent invalid transitions
- [ ] Transition conditions clear
- [ ] No stuck states

✅ **Behavior:**
- [ ] Each state has distinct behavior
- [ ] State behavior doesn't leak to other states
- [ ] Animations match states
- [ ] Physics respects states

✅ **Edge Cases:**
- [ ] Rapid state changes handled
- [ ] State during death/reset
- [ ] Stack push/pop edge cases
- [ ] Timer edge cases (exactly 0, negative)

---

## Common Mistakes

### 1. Using Booleans Instead of States
```typescript
// ❌ Combinatorial explosion
if (isJumping && isAttacking && !isHurt) {
    // Which takes priority?
}

// ✅ Clear priority
if (state === State.Attacking) {
    // Always takes priority
}
```

### 2. Not Clearing State on Transition
```typescript
// ❌ Velocity persists
setState(State.Idle) {
    this.state = State.Idle;
    // Forgot to set velocityX = 0!
}

// ✅ Clean state
enterState(State.Idle) {
    this.velocityX = 0;
    this.velocityY = 0;
}
```

### 3. Mixing Update and Transition Logic
```typescript
// ❌ Confusing
update() {
    if (state === Walking) {
        move();
        if (jump) state = Jumping; // Transition mixed in!
    }
}

// ✅ Separated
update() {
    updateTransitions(); // Check transitions
    executeState();       // Execute behavior
}
```

### 4. Forgetting to Handle All States
```typescript
// ❌ Incomplete
switch (state) {
    case Idle: ...; break;
    case Walking: ...; break;
    // Forgot Jumping, Falling, etc!
}

// ✅ Complete (TypeScript helps!)
switch (state) {
    case State.Idle: ...; break;
    case State.Walking: ...; break;
    case State.Jumping: ...; break;
    case State.Falling: ...; break;
    default:
        const _exhaustive: never = state; // Compile error if missing
}
```

---

**Next:** Solutions in `c-solutions.md`! 🎮