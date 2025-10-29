# Velocity and Acceleration - Exercise Solutions

## Solution 1: Basic Velocity Movement ⭐

```typescript
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

class Ball {
  x: number = 100;
  y: number = 300;
  velocityX: number = 100; // pixels per second
  velocityY: number = 0;
  radius: number = 20;
  
  update(deltaTime: number): void {
    // Convert milliseconds to seconds
    const dt = deltaTime / 1000;
    
    // Apply velocity to position
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    
    // Wrap around when reaching right edge
    if (this.x - this.radius > canvas.width) {
      this.x = -this.radius;
    }
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

const ball = new Ball();
let lastTime = 0;

function gameLoop(currentTime: number): void {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  // Update
  ball.update(deltaTime);
  
  // Draw
  ctx.fillStyle = 'lightblue';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ball.draw(ctx);
  
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

**Key Concepts**:
- `deltaTime / 1000` converts milliseconds to seconds
- Velocity is in pixels per second
- Wrapping: check if ball completely left the screen

---

## Solution 2: Bouncing Ball ⭐

```typescript
class Ball {
  x: number = 400;
  y: number = 300;
  velocityX: number = 150;
  velocityY: number = 100;
  radius: number = 20;
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply velocity
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    
    // Bounce off left/right walls
    if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.velocityX *= -1;
    }
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.velocityX *= -1;
    }
    
    // Bounce off top/bottom walls
    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.velocityY *= -1;
    }
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.velocityY *= -1;
    }
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

**Key Concepts**:
- Check boundaries for each axis separately
- Reverse velocity component when hitting wall
- Adjust position to prevent getting stuck in wall

**Common Mistake**: Forgetting to adjust position after collision leads to multiple bounces

---

## Solution 3: Acceleration from Input ⭐⭐

```typescript
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

class Player {
  x: number = 400;
  y: number = 300;
  velocityX: number = 0;
  velocityY: number = 0;
  accelerationX: number = 0;
  accelerationY: number = 0;
  
  maxSpeed: number = 300;
  accelerationRate: number = 800;
  size: number = 32;
  
  handleInput(keys: Set<string>): void {
    // Reset acceleration
    this.accelerationX = 0;
    this.accelerationY = 0;
    
    // Apply acceleration based on input
    if (keys.has('ArrowLeft')) {
      this.accelerationX = -this.accelerationRate;
    }
    if (keys.has('ArrowRight')) {
      this.accelerationX = this.accelerationRate;
    }
    if (keys.has('ArrowUp')) {
      this.accelerationY = -this.accelerationRate;
    }
    if (keys.has('ArrowDown')) {
      this.accelerationY = this.accelerationRate;
    }
  }
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply acceleration to velocity
    this.velocityX += this.accelerationX * dt;
    this.velocityY += this.accelerationY * dt;
    
    // Limit velocity to max speed
    const speed = Math.sqrt(
      this.velocityX * this.velocityX +
      this.velocityY * this.velocityY
    );
    
    if (speed > this.maxSpeed) {
      const ratio = this.maxSpeed / speed;
      this.velocityX *= ratio;
      this.velocityY *= ratio;
    }
    
    // Apply velocity to position
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    
    // Keep in bounds
    this.x = Math.max(16, Math.min(canvas.width - 16, this.x));
    this.y = Math.max(16, Math.min(canvas.height - 16, this.y));
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'green';
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
    
    // Draw velocity indicator
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x + this.velocityX * 0.1,
      this.y + this.velocityY * 0.1
    );
    ctx.stroke();
  }
}

const keys = new Set<string>();
const player = new Player();

window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

let lastTime = 0;
function gameLoop(currentTime: number): void {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  player.handleInput(keys);
  player.update(deltaTime);
  
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw(ctx);
  
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

**Key Concepts**:
- Acceleration changes velocity, velocity changes position
- Calculate total speed using Pythagorean theorem
- Limit speed by normalizing and scaling velocity vector

**Common Mistake**: Setting velocity directly instead of using acceleration

---

## Solution 4: Friction and Deceleration ⭐⭐

```typescript
class Player {
  x: number = 400;
  y: number = 300;
  velocityX: number = 0;
  velocityY: number = 0;
  accelerationX: number = 0;
  accelerationY: number = 0;
  
  maxSpeed: number = 300;
  accelerationRate: number = 800;
  friction: number = 0.85;
  size: number = 32;
  
  handleInput(keys: Set<string>): void {
    this.accelerationX = 0;
    this.accelerationY = 0;
    
    if (keys.has('ArrowLeft')) this.accelerationX = -this.accelerationRate;
    if (keys.has('ArrowRight')) this.accelerationX = this.accelerationRate;
    if (keys.has('ArrowUp')) this.accelerationY = -this.accelerationRate;
    if (keys.has('ArrowDown')) this.accelerationY = this.accelerationRate;
  }
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply acceleration to velocity
    this.velocityX += this.accelerationX * dt;
    this.velocityY += this.accelerationY * dt;
    
    // Apply frame-rate independent friction
    const frictionFactor = Math.pow(this.friction, dt * 60);
    this.velocityX *= frictionFactor;
    this.velocityY *= frictionFactor;
    
    // Stop if very slow (prevent floating-point drift)
    if (Math.abs(this.velocityX) < 0.1) this.velocityX = 0;
    if (Math.abs(this.velocityY) < 0.1) this.velocityY = 0;
    
    // Limit to max speed
    const speed = Math.sqrt(
      this.velocityX * this.velocityX +
      this.velocityY * this.velocityY
    );
    if (speed > this.maxSpeed) {
      const ratio = this.maxSpeed / speed;
      this.velocityX *= ratio;
      this.velocityY *= ratio;
    }
    
    // Apply velocity to position
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    
    // Keep in bounds
    this.x = Math.max(16, Math.min(canvas.width - 16, this.x));
    this.y = Math.max(16, Math.min(canvas.height - 16, this.y));
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // Draw player
    ctx.fillStyle = 'purple';
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
    
    // Draw velocity vector
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x + this.velocityX * 0.15,
      this.y + this.velocityY * 0.15
    );
    ctx.stroke();
    
    // Draw speed text
    const speed = Math.sqrt(
      this.velocityX * this.velocityX +
      this.velocityY * this.velocityY
    );
    ctx.fillStyle = 'black';
    ctx.font = '16px monospace';
    ctx.fillText(`Speed: ${speed.toFixed(0)} px/s`, 10, 30);
  }
}
```

**Key Concepts**:
- Friction formula: `velocity *= Math.pow(friction, dt * 60)`
- This makes friction frame-rate independent
- Stop completely when velocity is very small

**Common Mistake**: Using `velocity *= friction` directly (frame-rate dependent)

---

## Solution 5: Normalized Diagonal Movement ⭐⭐

```typescript
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

class Player {
  x: number = 400;
  y: number = 300;
  velocityX: number = 0;
  velocityY: number = 0;
  speed: number = 200;
  size: number = 32;
  
  handleInput(keys: Set<string>): void {
    // Get input direction
    let inputX = 0;
    let inputY = 0;
    
    if (keys.has('a')) inputX -= 1;
    if (keys.has('d')) inputX += 1;
    if (keys.has('w')) inputY -= 1;
    if (keys.has('s')) inputY += 1;
    
    // Normalize input vector
    const magnitude = Math.sqrt(inputX * inputX + inputY * inputY);
    
    if (magnitude > 0) {
      inputX /= magnitude;
      inputY /= magnitude;
    }
    
    // Apply speed
    this.velocityX = inputX * this.speed;
    this.velocityY = inputY * this.speed;
  }
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply velocity to position
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    
    // Keep in bounds
    this.x = Math.max(16, Math.min(canvas.width - 16, this.x));
    this.y = Math.max(16, Math.min(canvas.height - 16, this.y));
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'orange';
    ctx.fillRect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
    
    // Draw current speed
    const currentSpeed = Math.sqrt(
      this.velocityX * this.velocityX +
      this.velocityY * this.velocityY
    );
    
    ctx.fillStyle = 'black';
    ctx.font = '16px monospace';
    ctx.fillText(`Speed: ${currentSpeed.toFixed(0)} px/s`, 10, 30);
    ctx.fillText(`Max Speed: ${this.speed} px/s`, 10, 50);
    
    // Should always show max speed when moving
    if (currentSpeed > 0) {
      const isCorrect = Math.abs(currentSpeed - this.speed) < 0.1;
      ctx.fillText(
        isCorrect ? '✓ Normalized!' : '✗ Not normalized',
        10,
        70
      );
    }
  }
}

const keys = new Set<string>();
const player = new Player();

window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

let lastTime = 0;
function gameLoop(currentTime: number): void {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  player.handleInput(keys);
  player.update(deltaTime);
  
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid for visual feedback
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  for (let x = 0; x < canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  player.draw(ctx);
  
  ctx.fillStyle = 'black';
  ctx.font = '14px monospace';
  ctx.fillText('Use WASD to move', 10, canvas.height - 10);
  
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

**Key Concepts**:
- Normalization: divide each component by magnitude
- Magnitude = √(x² + y²)
- After normalization, vector has length 1
- Then multiply by desired speed

**Common Mistake**: Not checking if magnitude is 0 before dividing

---

## Solution 6: Smooth Acceleration with Lerp ⭐⭐

```typescript
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

class Follower {
  x: number = 400;
  y: number = 300;
  targetX: number = 400;
  targetY: number = 300;
  lerpFactor: number = 0.1;
  radius: number = 20;
  
  setTarget(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Linear interpolation (frame-rate independent)
    // Move 10% toward target each frame at 60 FPS
    const smoothing = this.lerpFactor * (dt * 60);
    
    this.x = this.x + (this.targetX - this.x) * smoothing;
    this.y = this.y + (this.targetY - this.y) * smoothing;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // Draw target
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.targetX, this.targetY, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw follower
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw line to target
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.targetX, this.targetY);
    ctx.stroke();
    
    // Draw distance
    const distance = Math.sqrt(
      (this.targetX - this.x) ** 2 +
      (this.targetY - this.y) ** 2
    );
    
    ctx.fillStyle = 'black';
    ctx.font = '14px monospace';
    ctx.fillText(`Distance: ${distance.toFixed(0)}px`, 10, 30);
  }
}

const follower = new Follower();

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  follower.setTarget(
    e.clientX - rect.left,
    e.clientY - rect.top
  );
});

let lastTime = 0;
function gameLoop(currentTime: number): void {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  follower.update(deltaTime);
  
  ctx.fillStyle = '#E8F4F8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  follower.draw(ctx);
  
  ctx.fillStyle = 'black';
  ctx.font = '14px monospace';
  ctx.fillText('Move mouse to set target', 10, canvas.height - 10);
  
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

**Key Concepts**:
- Lerp: `current += (target - current) * factor`
- Factor 0.1 = move 10% closer each frame
- Multiply by `dt * 60` for frame-rate independence
- Creates smooth, camera-like following

**Common Mistake**: Not making lerp frame-rate independent

---

## Solution 7: Terminal Velocity Test ⭐⭐

```typescript
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = 800;
canvas.height = 600;

class Ball {
  x: number = 400;
  y: number = 100;
  velocityY: number = 0;
  acceleration: number = 500; // pixels per second squared
  maxSpeed: number = 300;
  useTerminalVelocity: boolean = true;
  radius: number = 20;
  
  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    // Apply gravity acceleration
    this.velocityY += this.acceleration * dt;
    
    // Apply terminal velocity if enabled
    if (this.useTerminalVelocity && this.velocityY > this.maxSpeed) {
      this.velocityY = this.maxSpeed;
    }
    
    // Apply velocity
    this.y += this.velocityY * dt;
    
    // Bounce off bottom
    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.velocityY = 0;
    }
  }
  
  reset(): void {
    this.y = 100;
    this.velocityY = 0;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // Draw ball
    ctx.fillStyle = this.useTerminalVelocity ? 'green' : 'red';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw speed text
    ctx.fillStyle = 'black';
    ctx.font = '18px monospace';
    ctx.fillText(`Speed: ${this.velocityY.toFixed(0)} px/s`, 10, 30);
    ctx.fillText(
      `Terminal Velocity: ${this.useTerminalVelocity ? 'ON' : 'OFF'}`,
      10,
      55
    );
    ctx.fillText(`Max Speed: ${this.maxSpeed} px/s`, 10, 80);
    
    // Draw warning if too fast
    if (!this.useTerminalVelocity && this.velocityY > this.maxSpeed) {
      ctx.fillStyle = 'red';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('⚠ EXCEEDING SAFE SPEED!', 10, 110);
    }
    
    // Draw instructions
    ctx.fillStyle = 'black';
    ctx.font = '14px monospace';
    ctx.fillText('Press T to toggle terminal velocity', 10, canvas.height - 30);
    ctx.fillText('Press R to reset', 10, canvas.height - 10);
  }
}

const ball = new Ball();

window.addEventListener('keydown', (e) => {
  if (e.key === 't' || e.key === 'T') {
    ball.useTerminalVelocity = !ball.useTerminalVelocity;
  }
  if (e.key === 'r' || e.key === 'R') {
    ball.reset();
  }
});

let lastTime = 0;
function gameLoop(currentTime: number): void {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  ball.update(deltaTime);
  
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ball.draw(ctx);
  
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

**Key Concepts**:
- Without terminal velocity, speed increases indefinitely
- Terminal velocity caps maximum speed
- Important for game balance and collision detection
- Real physics: terminal velocity comes from air resistance

---

## Key Takeaways from All Solutions

### 1. Always Use Delta Time
```typescript
// ❌ BAD
x += velocity;

// ✅ GOOD
x += velocity * (deltaTime / 1000);
```

### 2. Frame-Rate Independent Friction
```typescript
// ❌ BAD
velocity *= 0.9;

// ✅ GOOD
velocity *= Math.pow(0.9, deltaTime / 1000 * 60);
```

### 3. Normalize Input Vectors
```typescript
const magnitude = Math.sqrt(inputX * inputX + inputY * inputY);
if (magnitude > 0) {
  inputX /= magnitude;
  inputY /= magnitude;
}
```

### 4. Apply Terminal Velocity
```typescript
const speed = Math.sqrt(vx * vx + vy * vy);
if (speed > maxSpeed) {
  vx = (vx / speed) * maxSpeed;
  vy = (vy / speed) * maxSpeed;
}
```

### 5. Update Order
```typescript
// Correct order:
1. Handle input → set acceleration
2. Apply acceleration → change velocity
3. Apply friction → reduce velocity
4. Apply terminal velocity → limit velocity
5. Apply velocity → change position
6. Handle collisions → adjust position/velocity
```

---

## Next Steps

Continue to the remaining exercises (8-15) or move on to:
- d-notes.md (quick reference)
- i-debugging.md (common bugs)
- j-faq.md (frequently asked questions)
- Next topic: Gravity and Jumping!
