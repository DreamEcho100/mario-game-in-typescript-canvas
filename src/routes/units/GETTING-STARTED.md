# 🚀 Getting Started with Mario Platformer Development

**Quick setup guide to start building your 2D platformer in TypeScript & Canvas**

---

## ⚡ 5-Minute Quick Start

### Prerequisites Check

Before you begin, ensure you have:

- ✅ **Node.js** (v14 or higher) — [Download here](https://nodejs.org/)
- ✅ **Code Editor** — VS Code recommended — [Download here](https://code.visualstudio.com/)
- ✅ **Modern Browser** — Chrome, Firefox, or Edge
- ✅ **Basic JavaScript knowledge** — Variables, functions, loops
- ✅ **Terminal/Command Line** — Basic familiarity

### Setup Steps

```bash
# 1. Navigate to this directory
cd mario-game-in-typescript-canvas

# 2. Initialize npm project
npm init -y

# 3. Install TypeScript
npm install --save-dev typescript @types/node

# 4. Create TypeScript configuration
npx tsc --init

# 5. Create your first game file
mkdir src
touch src/game.ts
touch index.html
```

### Create Your First Files

**index.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mario Platformer</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #222;
        }
        canvas {
            border: 2px solid #fff;
            background: #87CEEB;
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <script src="dist/game.js"></script>
</body>
</html>
```

**src/game.ts:**
```typescript
// Your first game code!
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

canvas.width = 800;
canvas.height = 600;

let x = 100;
let y = 100;

function gameLoop() {
    // Clear screen
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, 32, 32);
    
    // Move right
    x += 2;
    if (x > canvas.width) x = 0;
    
    requestAnimationFrame(gameLoop);
}

gameLoop();
```

**Update tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Compile and Run

```bash
# Compile TypeScript
npx tsc

# Open index.html in your browser
# Or use a simple HTTP server:
npx http-server . -p 8080
# Then visit: http://localhost:8080
```

**You should see a red square moving across a blue background!** 🎉

---

## 📚 Learning Path Options

### Option A: Structured Learning (Recommended)

Follow the curriculum in order:

1. **Week 1-2:** Unit 01 — Game Foundations
2. **Week 3-4:** Unit 02 — Physics & Collisions
3. **Week 5-6:** Unit 03 — Entities & Animation
4. **Week 7-8:** Unit 04 — Level Design & World
5. **Week 9-10:** Unit 05 — Gameplay & AI
6. **Week 11-14:** Unit 06 — Optimization & Engine

### Option B: Project-Based Learning

Jump to specific features you want to build:

- **Want jumping?** → Unit 02, Topic 02
- **Want sprites?** → Unit 03, Topic 01
- **Want levels?** → Unit 04, Topic 01
- **Want enemies?** → Unit 05, Topic 02

### Option C: Weekend Sprints

Build something playable each weekend:

- **Weekend 1:** Moving rectangle with keyboard control
- **Weekend 2:** Character that can jump and land on platforms
- **Weekend 3:** Animated sprite character
- **Weekend 4:** Scrolling level with tiles
- **Weekend 5:** Collectible coins and scoring
- **Weekend 6:** Enemy that patrols and damages player

---

## 🛠️ Development Environment Setup

### VS Code Extensions (Recommended)

```bash
# Install these VS Code extensions:
- ESLint
- Prettier
- TypeScript + JavaScript
- Live Server
- GitLens (optional)
```

### Alternative: Use a Bundler

For a more professional setup:

```bash
# Using Parcel (simplest)
npm install --save-dev parcel
# Add to package.json scripts:
# "dev": "parcel index.html"
# "build": "parcel build index.html"

# Or Webpack (more control)
npm install --save-dev webpack webpack-cli webpack-dev-server
npm install --save-dev ts-loader html-webpack-plugin
```

### Project Structure

```
mario-game-in-typescript-canvas/
├── src/
│   ├── game.ts           # Main game entry
│   ├── entities/         # Player, enemies, etc.
│   ├── systems/          # Physics, collision, etc.
│   ├── utils/            # Helpers and utilities
│   └── types/            # TypeScript types
├── assets/
│   ├── images/           # Sprites and tiles
│   ├── sounds/           # Audio files
│   └── levels/           # Level data (JSON)
├── dist/                 # Compiled output
├── unit-01-game-foundations/  # Learning materials
├── unit-02-physics-and-collisions/
├── ... (other units)
├── index.html
├── tsconfig.json
└── package.json
```

---

## 🎮 Your First Real Game

Let's build something better than a moving square. Follow this 1-hour tutorial:

### Step 1: Create a Player Class

**src/player.ts:**
```typescript
export class Player {
    x: number;
    y: number;
    width: number = 32;
    height: number = 32;
    velocityX: number = 0;
    velocityY: number = 0;
    speed: number = 5;
    jumpPower: number = -12;
    gravity: number = 0.5;
    isOnGround: boolean = false;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    update(input: { left: boolean; right: boolean; jump: boolean }, groundY: number) {
        // Horizontal movement
        if (input.left) this.velocityX = -this.speed;
        else if (input.right) this.velocityX = this.speed;
        else this.velocityX = 0;

        // Jumping
        if (input.jump && this.isOnGround) {
            this.velocityY = this.jumpPower;
            this.isOnGround = false;
        }

        // Apply gravity
        this.velocityY += this.gravity;

        // Apply velocity
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Ground collision
        if (this.y + this.height >= groundY) {
            this.y = groundY - this.height;
            this.velocityY = 0;
            this.isOnGround = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
```

### Step 2: Create Input Handler

**src/input.ts:**
```typescript
export class InputHandler {
    keys: { [key: string]: boolean } = {};

    constructor() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    get left(): boolean {
        return this.keys['ArrowLeft'] || this.keys['a'];
    }

    get right(): boolean {
        return this.keys['ArrowRight'] || this.keys['d'];
    }

    get jump(): boolean {
        return this.keys['ArrowUp'] || this.keys['w'] || this.keys[' '];
    }
}
```

### Step 3: Update Main Game

**src/game.ts:**
```typescript
import { Player } from './player.js';
import { InputHandler } from './input.js';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

canvas.width = 800;
canvas.height = 600;

const GROUND_Y = 550;

const player = new Player(100, 100);
const input = new InputHandler();

function gameLoop() {
    // Clear screen
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

    // Update and draw player
    player.update(
        {
            left: input.left,
            right: input.right,
            jump: input.jump
        },
        GROUND_Y
    );
    player.draw(ctx);

    requestAnimationFrame(gameLoop);
}

gameLoop();
```

### Step 4: Compile and Play

```bash
npx tsc
# Open index.html in browser
```

**Controls:**
- Arrow keys or WASD to move
- Space or W or Up Arrow to jump

**🎉 Congratulations! You've built your first platformer character!**

---

## 📖 What to Learn Next

### After Your First Game Works:

1. **Improve It:**
   - Add platforms at different heights
   - Make the player change color when jumping
   - Add a coin to collect
   - Display score on screen

2. **Learn the Theory:**
   - Go to Unit 01 → 01-canvas-rendering-basics
   - Read `a-lesson.md` to understand what you just built
   - Do the exercises to reinforce concepts

3. **Build It Better:**
   - Learn about delta time (Unit 01, Topic 02)
   - Add smooth acceleration (Unit 02, Topic 01)
   - Make collision more robust (Unit 02, Topic 03)

---

## 🐛 Common Setup Issues

### Issue: "Cannot find module './player.js'"

**Fix:** Make sure your TypeScript is compiled:
```bash
npx tsc
```

Check that `dist/` folder contains `.js` files.

### Issue: "ctx is null"

**Fix:** Make sure your canvas element ID matches:
```html
<canvas id="gameCanvas"></canvas>
```

```typescript
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
```

### Issue: "Nothing appears on screen"

**Fix:** Check console for errors (F12 in browser). Make sure:
- Script is loaded: `<script src="dist/game.js"></script>`
- Canvas is created before script runs
- No TypeScript compilation errors

### Issue: "Game runs at different speeds on different computers"

**Fix:** You need delta time! Learn about it in Unit 01, Topic 02.

---

## 🎯 Learning Tips

### 1. Type Every Example Yourself
Don't copy-paste. Typing builds muscle memory and understanding.

### 2. Break Things Intentionally
Change values, remove code, see what breaks. This teaches you how everything works.

### 3. Keep Your Browser Console Open
Press F12. Watch for errors and log messages.

### 4. Draw Hitboxes
When debugging, draw rectangles around your collision boxes:
```typescript
ctx.strokeStyle = 'lime';
ctx.strokeRect(player.x, player.y, player.width, player.height);
```

### 5. Use Git
Commit after each working feature:
```bash
git init
git add .
git commit -m "Added jumping player"
```

### 6. Take Breaks
Game development is complex. Step away when frustrated. Solutions often come during breaks.

---

## 🎮 Mini-Project Ideas

Before diving into the full curriculum, warm up with these:

### Project 1: Color Changer (30 mins)
Click the canvas to change the player's color.

### Project 2: Multiple Platforms (1 hour)
Add 3-4 platforms at different heights. Player should collide with all of them.

### Project 3: Coin Collector (1 hour)
Add 5 coins. Collect them by touching them. Display score.

### Project 4: Moving Enemy (1.5 hours)
Add a red enemy that patrols back and forth. Player loses when touching it.

### Project 5: Simple Level (2 hours)
Create a level with platforms, coins, and a goal flag. Reach the flag to win.

---

## 📞 Getting Help

### When You're Stuck:

1. **Check the FAQ** in `j-faq.md` of the relevant topic
2. **Review Debugging Guide** in `i-debugging.md`
3. **Look at Solutions** in `c-solutions.md`
4. **Read the Glossary** in `h-glossary.md` for term definitions
5. **Check Resources** in `e-resources.md` for external help

### Understanding Errors:

**"Uncaught TypeError: Cannot read property 'x' of undefined"**
→ An object is undefined. Check if it's created before use.

**"Uncaught ReferenceError: requestAnimationFrame is not defined"**
→ You're running in Node.js. Run in a browser.

**"Property 'fillRect' does not exist on type 'never'"**
→ TypeScript thinks ctx is never. Use: `const ctx = canvas.getContext('2d')!;`

---

## 🚀 You're Ready!

You now have:
- ✅ A working development environment
- ✅ Your first playable game
- ✅ Understanding of the curriculum structure
- ✅ Resources for when you get stuck

**Next Step:** Choose your learning path and start building!

### Recommended First Topic:
```bash
cd unit-01-game-foundations/01-canvas-rendering-basics
# Open a-lesson.md in your editor
```

**Your journey to becoming a 2D game developer starts now!** 🎮✨

Remember: Every expert was once a beginner. Take it one topic at a time, and you'll be amazed at what you create!

---

## 📊 Progress Tracking

Keep track of your journey:

```markdown
## My Progress

- [ ] Setup complete
- [ ] First game running
- [ ] Unit 01 complete
- [ ] Unit 02 complete
- [ ] Unit 03 complete
- [ ] Unit 04 complete
- [ ] Unit 05 complete
- [ ] Unit 06 complete
- [ ] Published my first game!

**Start Date:** ___________
**Target Completion:** ___________
```

**Now go build something amazing!** 🚀
