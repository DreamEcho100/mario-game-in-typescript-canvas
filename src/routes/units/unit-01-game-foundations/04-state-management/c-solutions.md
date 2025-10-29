# State Management - Solutions

**Unit 01: Game Foundations | Topic 04**

> Complete implementations with explanations.

---

## Exercise 1: Basic Game States ⭐

### Solution

```typescript
enum GameState {
    MainMenu,
    Playing,
    GameOver
}

class Game {
    private state: GameState = GameState.MainMenu;
    private score = 0;
    private player: Player;
    
    constructor() {
        this.player = new Player();
    }
    
    update(deltaTime: number, input: InputManager) {
        switch (this.state) {
            case GameState.MainMenu:
                if (input.isPressed('Enter')) {
                    this.setState(GameState.Playing);
                }
                break;
                
            case GameState.Playing:
                this.updatePlaying(deltaTime, input);
                
                if (input.isPressed('Escape')) {
                    this.setState(GameState.MainMenu);
                } else if (this.player.isDead) {
                    this.setState(GameState.GameOver);
                }
                break;
                
            case GameState.GameOver:
                if (input.isPressed('r')) {
                    this.setState(GameState.MainMenu);
                }
                break;
        }
    }
    
    private updatePlaying(deltaTime: number, input: InputManager) {
        this.player.update(deltaTime, input);
        this.score += Math.floor(deltaTime * 10);
    }
    
    render(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        switch (this.state) {
            case GameState.MainMenu:
                this.renderMainMenu(ctx);
                break;
            case GameState.Playing:
                this.renderPlaying(ctx);
                break;
            case GameState.GameOver:
                this.renderGameOver(ctx);
                break;
        }
    }
    
    private renderMainMenu(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MARIO GAME', 400, 200);
        
        ctx.font = '24px Arial';
        ctx.fillText('Press ENTER to Start', 400, 300);
        ctx.fillText('Arrow Keys to Move', 400, 340);
        ctx.fillText('Space to Jump', 400, 380);
    }
    
    private renderPlaying(ctx: CanvasRenderingContext2D) {
        this.player.draw(ctx);
        
        // Score
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.score}`, 10, 30);
        
        // Instructions
        ctx.font = '14px Arial';
        ctx.fillText('ESC: Menu', 10, 60);
    }
    
    private renderGameOver(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'red';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', 400, 200);
        
        ctx.fillStyle = 'white';
        ctx.font = '32px Arial';
        ctx.fillText(`Final Score: ${this.score}`, 400, 260);
        
        ctx.font = '24px Arial';
        ctx.fillText('Press R to Restart', 400, 320);
    }
    
    private setState(newState: GameState) {
        console.log(`State: ${GameState[this.state]} → ${GameState[newState]}`);
        this.state = newState;
        
        // State-specific initialization
        if (newState === GameState.Playing) {
            this.score = 0;
            this.player = new Player();
        }
    }
}
```

### Explanation

**Key pattern:** Switch on state for both update and render. Each state has isolated logic.

**State transitions:**
- MainMenu → Playing (Enter)
- Playing → MainMenu (Escape)
- Playing → GameOver (player dies)
- GameOver → MainMenu (R)

---

## Exercise 2: Player State Machine ⭐⭐

### Solution

```typescript
enum PlayerState {
    Idle,
    Walking,
    Jumping,
    Falling
}

class Player {
    state: PlayerState = PlayerState.Idle;
    x = 400;
    y = 400;
    velocityX = 0;
    velocityY = 0;
    isGrounded = false;
    
    private readonly WALK_SPEED = 200;
    private readonly JUMP_FORCE = -600;
    
    update(deltaTime: number, input: InputManager) {
        // Transitions
        this.updateTransitions(input);
        
        // Behavior
        this.updateBehavior(deltaTime, input);
        
        // Physics
        this.velocityY += 980 * deltaTime;
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
        
        // Ground collision
        if (this.y > 400) {
            this.y = 400;
            this.velocityY = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
    }
    
    private updateTransitions(input: InputManager) {
        const left = input.isDown('ArrowLeft');
        const right = input.isDown('ArrowRight');
        const jump = input.isPressed(' ');
        
        switch (this.state) {
            case PlayerState.Idle:
                if (!this.isGrounded) {
                    this.state = PlayerState.Falling;
                } else if (jump) {
                    this.state = PlayerState.Jumping;
                    this.velocityY = this.JUMP_FORCE;
                } else if (left || right) {
                    this.state = PlayerState.Walking;
                }
                break;
                
            case PlayerState.Walking:
                if (!this.isGrounded) {
                    this.state = PlayerState.Falling;
                } else if (jump) {
                    this.state = PlayerState.Jumping;
                    this.velocityY = this.JUMP_FORCE;
                } else if (!left && !right) {
                    this.state = PlayerState.Idle;
                }
                break;
                
            case PlayerState.Jumping:
                if (this.velocityY > 0) {
                    this.state = PlayerState.Falling;
                }
                break;
                
            case PlayerState.Falling:
                if (this.isGrounded) {
                    this.state = PlayerState.Idle;
                }
                break;
        }
    }
    
    private updateBehavior(deltaTime: number, input: InputManager) {
        switch (this.state) {
            case PlayerState.Idle:
                this.velocityX = 0;
                break;
                
            case PlayerState.Walking:
                if (input.isDown('ArrowRight')) {
                    this.velocityX = this.WALK_SPEED;
                } else if (input.isDown('ArrowLeft')) {
                    this.velocityX = -this.WALK_SPEED;
                } else {
                    this.velocityX = 0;
                }
                break;
                
            case PlayerState.Jumping:
            case PlayerState.Falling:
                // Air control (reduced)
                if (input.isDown('ArrowRight')) {
                    this.velocityX = this.WALK_SPEED * 0.7;
                } else if (input.isDown('ArrowLeft')) {
                    this.velocityX = -this.WALK_SPEED * 0.7;
                } else {
                    this.velocityX *= 0.95; // Air friction
                }
                break;
        }
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        // Color by state
        switch (this.state) {
            case PlayerState.Idle:
                ctx.fillStyle = 'white';
                break;
            case PlayerState.Walking:
                ctx.fillStyle = 'green';
                break;
            case PlayerState.Jumping:
                ctx.fillStyle = 'blue';
                break;
            case PlayerState.Falling:
                ctx.fillStyle = 'orange';
                break;
        }
        
        ctx.fillRect(this.x - 20, this.y - 40, 40, 40);
        
        // State name
        ctx.fillStyle = 'white';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(PlayerState[this.state], this.x, this.y - 50);
    }
}
```

### Explanation

**Separation of concerns:**
- `updateTransitions()` - Changes state based on conditions
- `updateBehavior()` - Executes current state's logic
- Physics applied after behavior

**Why this works:**
- Can't jump unless grounded (checked in transition)
- Movement only in Walking state
- Air control different from ground control

---

## Exercise 3: Enter/Exit Callbacks ⭐⭐

### Solution

```typescript
class Player {
    state: PlayerState = PlayerState.Idle;
    private previousState: PlayerState = PlayerState.Idle;
    
    update(deltaTime: number, input: InputManager) {
        this.updateTransitions(input);
        
        // Detect state change
        if (this.state !== this.previousState) {
            this.exitState(this.previousState);
            this.enterState(this.state);
            this.previousState = this.state;
        }
        
        this.updateBehavior(deltaTime, input);
        // ... physics
    }
    
    private enterState(state: PlayerState) {
        console.log(`Enter: ${PlayerState[state]}`);
        
        switch (state) {
            case PlayerState.Idle:
                this.velocityX = 0;
                break;
                
            case PlayerState.Jumping:
                this.velocityY = -600;
                console.log('Jump!');
                break;
                
            case PlayerState.Walking:
                // Play footstep sound
                break;
        }
    }
    
    private exitState(state: PlayerState) {
        console.log(`Exit: ${PlayerState[state]}`);
        
        switch (state) {
            case PlayerState.Walking:
                // Stop footstep sound
                break;
        }
    }
}
```

### Key Points

**State change detection:**
```typescript
if (this.state !== this.previousState) {
    exitState(previousState);
    enterState(state);
    previousState = state;
}
```

**Why this matters:**
- Jump velocity applied exactly once (not every frame)
- Sounds play on state change (not looping)
- Clean initialization/cleanup

---

## Exercise 5: Transition Guards ⭐⭐⭐

### Solution

```typescript
class Player {
    state: PlayerState = PlayerState.Idle;
    stamina = 100;
    private isAttacking = false;
    
    private readonly MAX_STAMINA = 100;
    private readonly JUMP_COST = 10;
    private readonly STAMINA_REGEN = 5; // per second
    
    update(deltaTime: number, input: InputManager) {
        this.updateStamina(deltaTime);
        this.updateTransitions(input);
        this.updateBehavior(deltaTime, input);
        // ... physics
    }
    
    private updateStamina(deltaTime: number) {
        // Regenerate stamina
        this.stamina = Math.min(
            this.MAX_STAMINA,
            this.stamina + this.STAMINA_REGEN * deltaTime
        );
    }
    
    private updateTransitions(input: InputManager) {
        switch (this.state) {
            case PlayerState.Idle:
            case PlayerState.Walking:
                // Jump with guard
                if (input.isPressed(' ') && this.canJump()) {
                    this.state = PlayerState.Jumping;
                    this.stamina -= this.JUMP_COST;
                    this.velocityY = -600;
                }
                
                // Attack with guard
                if (input.isPressed('x') && this.canAttack()) {
                    this.state = PlayerState.Attacking;
                    this.isAttacking = true;
                    setTimeout(() => {
                        this.isAttacking = false;
                        this.state = PlayerState.Idle;
                    }, 500);
                }
                break;
        }
    }
    
    // Guards
    private canJump(): boolean {
        return this.isGrounded && this.stamina >= this.JUMP_COST;
    }
    
    private canAttack(): boolean {
        return !this.isAttacking;
    }
    
    private canRun(): boolean {
        return this.state !== PlayerState.Ducking;
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        // ... draw player
        
        // Stamina bar
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.x - 30, this.y - 60, 60, 8);
        
        ctx.fillStyle = this.stamina < this.JUMP_COST ? 'red' : 'yellow';
        const width = (this.stamina / this.MAX_STAMINA) * 60;
        ctx.fillRect(this.x - 30, this.y - 60, width, 8);
        
        // Stamina text
        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(this.stamina)}`, this.x, this.y - 65);
    }
}
```

### Explanation

**Guard pattern:**
```typescript
if (input.isPressed('jump') && this.canJump()) {
    // Only executes if guard passes
}
```

**Benefits:**
- Centralized validation logic
- Easy to modify conditions
- Prevents invalid transitions
- Can be tested independently

---

## Exercise 7: Skidding State ⭐⭐⭐

### Solution

```typescript
enum PlayerState {
    Idle,
    Walking,
    Running,
    Jumping,
    Falling,
    Skidding
}

class Player {
    state: PlayerState = PlayerState.Idle;
    velocityX = 0;
    facing: 'left' | 'right' = 'right';
    
    private readonly WALK_SPEED = 150;
    private readonly RUN_SPEED = 250;
    private readonly SKID_THRESHOLD = 150;
    private readonly SKID_DECEL = 800;
    
    private updateTransitions(input: InputManager) {
        const left = input.isDown('ArrowLeft');
        const right = input.isDown('ArrowRight');
        const run = input.isDown('Shift');
        
        switch (this.state) {
            case PlayerState.Walking:
            case PlayerState.Running:
                // Check for direction change while moving fast
                if (this.isSkidding(left, right)) {
                    this.state = PlayerState.Skidding;
                }
                break;
                
            case PlayerState.Skidding:
                // Exit when stopped
                if (Math.abs(this.velocityX) < 10) {
                    this.state = PlayerState.Idle;
                    this.velocityX = 0;
                }
                break;
        }
    }
    
    private isSkidding(left: boolean, right: boolean): boolean {
        // Moving right fast, but pressing left
        if (this.velocityX > this.SKID_THRESHOLD && left) {
            return true;
        }
        // Moving left fast, but pressing right
        if (this.velocityX < -this.SKID_THRESHOLD && right) {
            return true;
        }
        return false;
    }
    
    private updateBehavior(deltaTime: number, input: InputManager) {
        switch (this.state) {
            case PlayerState.Skidding:
                // Decelerate toward zero
                const decel = this.SKID_DECEL * deltaTime;
                
                if (this.velocityX > 0) {
                    this.velocityX = Math.max(0, this.velocityX - decel);
                } else if (this.velocityX < 0) {
                    this.velocityX = Math.min(0, this.velocityX + decel);
                }
                break;
                
            // ... other states
        }
    }
    
    private enterState(state: PlayerState) {
        switch (state) {
            case PlayerState.Skidding:
                // Reverse facing
                this.facing = this.facing === 'left' ? 'right' : 'left';
                console.log('Skid!');
                // Play skid sound
                break;
        }
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        
        // Flip based on facing
        if (this.facing === 'left') {
            ctx.scale(-1, 1);
            ctx.translate(-this.x * 2, 0);
        }
        
        // Different visual for skidding
        if (this.state === PlayerState.Skidding) {
            ctx.fillStyle = 'yellow';
            // Leaning back
            ctx.fillRect(this.x - 25, this.y - 35, 40, 35);
            
            // Skid particles
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(
                    this.x + (i * 10),
                    this.y,
                    5,
                    5
                );
            }
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x - 20, this.y - 40, 40, 40);
        }
        
        ctx.restore();
    }
}
```

### Explanation

**Skid detection:**
```
velocityX = 200 (moving right fast)
Player presses Left
→ Math.abs(200) > 150 && pressing opposite direction
→ Enter Skidding state
```

**Deceleration:**
```
Each frame: velocityX -= SKID_DECEL * deltaTime
200 → 120 → 40 → 0 (over ~0.25 seconds)
```

**Visual feedback:**
- Color changes
- Facing direction reverses
- Particle effect

---

## Exercise 9: State Stack (Pause Menu) ⭐⭐⭐

### Solution

```typescript
interface GameState {
    name: string;
    onEnter?: () => void;
    onExit?: () => void;
    onPause?: () => void;
    onResume?: () => void;
    update: (deltaTime: number) => void;
    render: (ctx: CanvasRenderingContext2D) => void;
}

class StateStack {
    private stack: GameState[] = [];
    
    push(state: GameState) {
        // Pause current top state
        if (this.stack.length > 0) {
            const current = this.stack[this.stack.length - 1];
            if (current.onPause) {
                current.onPause();
            }
        }
        
        // Add new state
        this.stack.push(state);
        if (state.onEnter) {
            state.onEnter();
        }
        
        console.log(`Pushed: ${state.name} (stack depth: ${this.stack.length})`);
    }
    
    pop() {
        if (this.stack.length === 0) {
            console.warn('Cannot pop empty stack');
            return;
        }
        
        // Exit top state
        const top = this.stack.pop()!;
        if (top.onExit) {
            top.onExit();
        }
        
        // Resume previous state
        if (this.stack.length > 0) {
            const current = this.stack[this.stack.length - 1];
            if (current.onResume) {
                current.onResume();
            }
        }
        
        console.log(`Popped: ${top.name} (stack depth: ${this.stack.length})`);
    }
    
    update(deltaTime: number) {
        // Only update top state
        if (this.stack.length > 0) {
            const top = this.stack[this.stack.length - 1];
            top.update(deltaTime);
        }
    }
    
    render(ctx: CanvasRenderingContext2D) {
        // Render all states (bottom to top)
        // This allows pause menu to overlay game
        this.stack.forEach(state => {
            state.render(ctx);
        });
    }
}

// Usage: Create states
const playingState: GameState = {
    name: 'Playing',
    update: (deltaTime) => {
        player.update(deltaTime, input);
        
        if (input.isPressed('p')) {
            stateStack.push(pauseState);
        }
    },
    render: (ctx) => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 800, 600);
        player.draw(ctx);
    },
    onPause: () => {
        console.log('Game paused');
    },
    onResume: () => {
        console.log('Game resumed');
    }
};

const pauseState: GameState = {
    name: 'Pause',
    update: (deltaTime) => {
        if (input.isPressed('p') || input.isPressed('Escape')) {
            stateStack.pop();
        }
    },
    render: (ctx) => {
        // Draw semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, 800, 600);
        
        // Pause text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', 400, 250);
        
        ctx.font = '24px Arial';
        ctx.fillText('Press P to Resume', 400, 300);
        ctx.fillText('Press ESC for Menu', 400, 340);
    }
};

// Game loop
const stateStack = new StateStack();
stateStack.push(playingState);

function gameLoop(deltaTime: number) {
    stateStack.update(deltaTime);
    stateStack.render(ctx);
    input.update();
}
```

### Explanation

**Stack behavior:**
```
Start:    [Playing]
Press P:  [Playing, Pause]  ← Only Pause updates
Press P:  [Playing]         ← Resume Playing
```

**Key feature:** Game state preserved while paused. When unpausing, game continues from exact state.

**Rendering all states:** Allows pause menu to appear *over* game (game still visible but frozen).

---

## Exercise 10: Enemy State Machine ⭐⭐⭐

### Solution

```typescript
enum EnemyState {
    Patrolling,
    Chasing,
    Attacking
}

class Enemy {
    state: EnemyState = EnemyState.Patrolling;
    x = 200;
    y = 400;
    velocityX = 0;
    
    private readonly PATROL_SPEED = 100;
    private readonly CHASE_SPEED = 200;
    private readonly PATROL_LEFT = 100;
    private readonly PATROL_RIGHT = 300;
    
    private readonly CHASE_RANGE = 200;
    private readonly ATTACK_RANGE = 50;
    private readonly ESCAPE_RANGE = 250;
    
    private patrolDirection = 1;
    
    update(deltaTime: number, player: Player) {
        const distToPlayer = Math.sqrt(
            (this.x - player.x) ** 2 + 
            (this.y - player.y) ** 2
        );
        
        // Transitions
        this.updateTransitions(distToPlayer);
        
        // Behavior
        this.updateBehavior(deltaTime, player);
        
        // Physics
        this.x += this.velocityX * deltaTime;
    }
    
    private updateTransitions(distToPlayer: number) {
        switch (this.state) {
            case EnemyState.Patrolling:
                if (distToPlayer < this.CHASE_RANGE) {
                    this.state = EnemyState.Chasing;
                }
                break;
                
            case EnemyState.Chasing:
                if (distToPlayer < this.ATTACK_RANGE) {
                    this.state = EnemyState.Attacking;
                } else if (distToPlayer > this.ESCAPE_RANGE) {
                    this.state = EnemyState.Patrolling;
                }
                break;
                
            case EnemyState.Attacking:
                if (distToPlayer > this.ATTACK_RANGE) {
                    this.state = EnemyState.Chasing;
                }
                break;
        }
    }
    
    private updateBehavior(deltaTime: number, player: Player) {
        switch (this.state) {
            case EnemyState.Patrolling:
                this.velocityX = this.PATROL_SPEED * this.patrolDirection;
                
                // Turn around at patrol boundaries
                if (this.x >= this.PATROL_RIGHT) {
                    this.patrolDirection = -1;
                } else if (this.x <= this.PATROL_LEFT) {
                    this.patrolDirection = 1;
                }
                break;
                
            case EnemyState.Chasing:
                // Move toward player
                if (player.x > this.x) {
                    this.velocityX = this.CHASE_SPEED;
                } else {
                    this.velocityX = -this.CHASE_SPEED;
                }
                break;
                
            case EnemyState.Attacking:
                this.velocityX = 0;
                // Play attack animation
                break;
        }
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        // Color by state
        switch (this.state) {
            case EnemyState.Patrolling:
                ctx.fillStyle = 'green';
                break;
            case EnemyState.Chasing:
                ctx.fillStyle = 'yellow';
                break;
            case EnemyState.Attacking:
                ctx.fillStyle = 'red';
                break;
        }
        
        ctx.fillRect(this.x - 20, this.y - 20, 40, 20);
        
        // State name
        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(EnemyState[this.state], this.x, this.y - 25);
        
        // Detection radius (debug)
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.CHASE_RANGE, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.ATTACK_RANGE, 0, Math.PI * 2);
        ctx.stroke();
    }
}
```

### Explanation

**Distance-based transitions:**
```
Player far (>250px):  Patrolling
Player near (200px):  Chasing → moves toward player
Player very near (<50px): Attacking → stops and attacks
Player escapes (>250px): Return to Patrolling
```

**AI behavior:**
- Patrolling: Predictable back-and-forth
- Chasing: Reactive to player position
- Attacking: Stationary threat

---

## Key Takeaways

### State Machine Pattern

```typescript
class Entity {
    state: State;
    
    update(deltaTime: number) {
        // 1. Determine next state
        this.updateTransitions();
        
        // 2. Handle state change
        if (stateChanged) {
            this.exitState(oldState);
            this.enterState(newState);
        }
        
        // 3. Execute current state
        this.updateBehavior(deltaTime);
    }
}
```

### Common Patterns

**Guard conditions:**
```typescript
if (input && this.canDoAction()) {
    this.state = NewState;
}
```

**Timers:**
```typescript
this.stateTime += deltaTime;
if (this.stateTime > DURATION) {
    this.state = NextState;
}
```

**Distance checks:**
```typescript
const dist = distance(this, target);
if (dist < RANGE) {
    this.state = NewState;
}
```

---

**Next:** Quick reference in `d-notes.md`! 🎮