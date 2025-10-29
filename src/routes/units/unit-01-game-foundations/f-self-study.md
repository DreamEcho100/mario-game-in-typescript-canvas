# Unit 01: Self-Study Guide

**Game Foundations**

> A structured 3-4 week learning plan to master game foundations.

---

## Overview

This self-study guide helps you work through Unit 01 at your own pace. Whether you have 5 hours or 20 hours per week, you'll build a strong foundation in:

- Canvas rendering and graphics
- Game loop timing and frame rates
- Input handling (keyboard, mouse, touch)
- State management for game logic
- World coordinate systems and cameras

**Estimated Time:** 30-40 hours total (3-4 weeks at 10 hours/week)

---

## Prerequisites

Before starting, you should be comfortable with:

- ✅ Basic JavaScript (variables, functions, loops, objects)
- ✅ HTML and CSS fundamentals
- ✅ Using a code editor (VS Code recommended)
- ✅ Running a local web server (Live Server extension)

**New to TypeScript?** Don't worry! Start with JavaScript and gradually add types. TypeScript is a superset of JavaScript, so your JS code will work.

---

## Learning Approach

### The Build-Measure-Learn Cycle

1. **Read** the lesson material (1-2 hours per topic)
2. **Build** exercises and practice projects (2-3 hours per topic)
3. **Review** solutions and compare your approach (30 min per topic)
4. **Debug** common issues (learn from mistakes!)
5. **Experiment** with variations and extensions

### Study Tips

- **Code along:** Type out examples yourself, don't copy-paste
- **Break it down:** Don't rush; master each concept before moving on
- **Take notes:** Write your own quick reference in `d-notes.md` style
- **Build projects:** Apply concepts in your own small games
- **Ask questions:** Use forums, Discord, or Stack Overflow when stuck
- **Teach others:** Explaining concepts helps you learn deeper

---

## Week 1: Canvas & Timing (Topics 01-02)

**Goal:** Render graphics and understand the game loop.

### Day 1-2: Canvas Rendering Basics (Topic 01)

**Time:** 5-6 hours

**Tasks:**
1. Read `a-lesson.md` thoroughly (90 min)
   - Canvas setup and context
   - Drawing shapes, paths, images
   - Colors, gradients, transformations
   - Text rendering and fonts

2. Complete exercises 1-8 from `b-exercises.md` (2 hours)
   - Start with ⭐ exercises (basic)
   - Move to ⭐⭐ exercises (intermediate)

3. Check solutions in `c-solutions.md` (30 min)
   - Compare your code with provided solutions
   - Note alternative approaches
   - Understand performance tips

4. Build mini-project: **Draw a Simple Scene** (1 hour)
   - Combine shapes to create a landscape
   - Add a character (rectangle/circle combo)
   - Use colors and gradients creatively
   - Challenge: Make character face direction (transform)

5. Quick reference (30 min)
   - Review `d-notes.md` for copy-paste patterns
   - Bookmark MDN Canvas API for reference

**Learning Check:**
- [ ] Can I create a canvas and get the 2D context?
- [ ] Can I draw shapes, paths, and images?
- [ ] Do I understand coordinate system (0,0 at top-left)?
- [ ] Can I use transformations (translate, rotate, scale)?

### Day 3-4: Game Loop & Timing (Topic 02)

**Time:** 5-6 hours

**Tasks:**
1. Read `a-lesson.md` (90 min)
   - requestAnimationFrame vs setInterval
   - Delta time and frame-rate independence
   - FPS calculation and display
   - Performance monitoring

2. Complete exercises 1-6 (2 hours)
   - Basic game loop structure
   - Moving objects with delta time
   - Frame rate display
   - Pause/resume functionality

3. Check solutions (30 min)
   - Study frame-rate independent movement
   - Understand RAF timing

4. Build mini-project: **Bouncing Ball** (1.5 hours)
   - Ball moves across screen
   - Bounces off edges
   - Shows FPS counter
   - Pause with spacebar
   - Challenge: Add gravity and drag

5. Debug common issues (30 min)
   - Work through 2-3 bugs from `i-debugging.md`
   - Practice using console.log for debugging

**Learning Check:**
- [ ] Do I understand why RAF is better than setInterval?
- [ ] Can I calculate and use delta time correctly?
- [ ] Can my objects move consistently at different frame rates?
- [ ] Can I display FPS and pause the game?

### Weekend Review & Project

**Time:** 2-3 hours

**Mini-Game: Catch the Falling Objects**

Combine Topics 01 and 02:
- Canvas with background
- Objects fall from top (use delta time)
- Player-controlled basket at bottom (keyboard input from next week's preview)
- Score counter
- FPS display
- Pause/resume

**Focus:** Clean code structure, smooth animation, consistent timing.

---

## Week 2: Input & State (Topics 03-04)

**Goal:** Handle user input and manage game states.

### Day 5-6: Input & Controls (Topic 03)

**Time:** 5-6 hours

**Tasks:**
1. Read `a-lesson.md` (90 min)
   - Keyboard input (keydown, keyup, state)
   - Mouse input (click, move, drag)
   - Touch input (touchstart, touchmove, touchend)
   - Input buffering and coyote time

2. Complete exercises 1-8 (2.5 hours)
   - Keyboard movement (WASD/arrows)
   - Mouse following
   - Touch controls
   - Input buffering

3. Check solutions (30 min)
   - Study input manager pattern
   - Understand event listeners vs state

4. Build mini-project: **Player Controller** (1.5 hours)
   - Player moves with keyboard
   - Player follows mouse when clicked
   - Mobile-friendly touch controls
   - Smooth acceleration/deceleration
   - Challenge: Add jump with coyote time

**Learning Check:**
- [ ] Can I detect multiple keys pressed simultaneously?
- [ ] Do I understand the difference between events and state?
- [ ] Can I implement mouse drag and click?
- [ ] Can I add touch support for mobile?

### Day 7-8: State Management (Topic 04)

**Time:** 5-6 hours

**Tasks:**
1. Read `a-lesson.md` (90 min)
   - Finite State Machines (FSM)
   - State Pattern
   - Game states (menu, playing, paused, game over)
   - Entity states (idle, walking, jumping, falling)

2. Complete exercises 1-6 (2.5 hours)
   - Simple state machine
   - Player state with animation
   - Game state manager
   - State transitions with guards

3. Check solutions (30 min)
   - Compare FSM approaches
   - Study state transition patterns

4. Build mini-project: **State-Based Character** (1.5 hours)
   - Character with 4+ states
   - Visual indication of state
   - Smooth state transitions
   - Input-based state changes
   - Challenge: Add hierarchical states

**Learning Check:**
- [ ] Can I implement a basic state machine?
- [ ] Do I understand when to use State Pattern vs simple enum?
- [ ] Can I handle game states (menu, playing, etc.)?
- [ ] Can I debug state transitions effectively?

### Weekend Project

**Time:** 3-4 hours

**Mini-Game: Simple Platformer Controller**

Combine Topics 01-04:
- Player with walk, jump, fall states
- Keyboard/touch controls
- State-based animation (different colors per state)
- Simple platform collision (basic, not full physics yet)
- Menu state → Playing state → Game Over state
- FPS and state display for debugging

**Focus:** Clean state management, responsive controls, polished feel.

---

## Week 3: World Coordinates (Topic 05)

**Goal:** Implement scrolling camera and large worlds.

### Day 9-10: Coordinate Systems & Basic Camera (Part 1)

**Time:** 5-6 hours

**Tasks:**
1. Read `a-lesson.md` sections 1-6 (90 min)
   - World space vs screen space
   - Camera properties
   - Coordinate conversion
   - Camera follow and bounds
   - Viewport culling

2. Complete exercises 1-6 (2.5 hours)
   - World to screen conversion
   - Basic camera follow
   - Smooth camera follow
   - Camera deadzone
   - Camera bounds
   - Viewport culling

3. Check solutions (30 min)
   - Study coordinate conversion formulas
   - Understand culling optimization

4. Build mini-project: **Scrolling World** (1.5 hours)
   - Large world (3000px wide)
   - Player moves through world
   - Camera follows player smoothly
   - Show world position vs screen position
   - Challenge: Add camera deadzone

**Learning Check:**
- [ ] Do I understand world vs screen coordinates?
- [ ] Can I convert between coordinate systems?
- [ ] Can my camera follow the player smoothly?
- [ ] Can I cull off-screen entities for performance?

### Day 11-12: Advanced Camera & Parallax (Part 2)

**Time:** 5-6 hours

**Tasks:**
1. Read `a-lesson.md` sections 7-12 (90 min)
   - Canvas translation technique
   - Parallax scrolling
   - Camera shake
   - Camera zones
   - Minimap

2. Complete exercises 7-12 (2.5 hours)
   - Canvas translation
   - Parallax layers
   - Camera shake effect
   - Camera zones
   - Minimap implementation

3. Check solutions (30 min)
   - Study parallax implementation
   - Learn about layer rendering

4. Build mini-project: **Parallax Scene** (1.5 hours)
   - Multiple parallax layers (3-4 layers)
   - Sky, clouds, mountains, ground
   - Camera follows player
   - Camera shake on impact
   - Challenge: Add minimap

**Learning Check:**
- [ ] Can I use ctx.translate() for camera?
- [ ] Can I implement parallax scrolling?
- [ ] Can I add camera shake effects?
- [ ] Can I render a minimap of the world?

### Weekend Review & Debug

**Time:** 2-3 hours

**Tasks:**
1. Debug practice (1.5 hours)
   - Work through `i-debugging.md` for Topics 03-05
   - Fix 2-3 bugs per topic
   - Understand common pitfalls

2. FAQ review (1 hour)
   - Read through `j-faq.md` for all topics
   - Note anything you don't understand
   - Research deeper if needed

---

## Week 4: Integration & Final Project

**Goal:** Build a complete game using all concepts.

### Day 13-14: Final Project Planning & Setup

**Time:** 4-5 hours

**Choose one project:**

#### Option A: Side-Scrolling Platformer
- Player runs and jumps through levels
- Camera follows with deadzone
- Parallax background
- Collectibles scattered around
- Basic platforms (rectangles)
- Game states: Menu → Playing → Game Over

#### Option B: Top-Down Adventure
- Player moves in 4 directions
- Camera follows smoothly
- Large explorable world
- Items to collect
- NPCs to interact with
- Minimap showing explored areas

#### Option C: Endless Runner
- Player auto-runs forward
- Jump over obstacles
- Camera moves at constant speed
- Parallax backgrounds
- Score based on distance
- Increasing difficulty

**Day 13 Tasks:**
1. Plan your game (1 hour)
   - Write down core mechanics
   - Sketch game screen layout
   - List entities and their states
   - Define game states

2. Set up project structure (1 hour)
   ```
   /src
     /entities
       Player.ts
       Enemy.ts
       Collectible.ts
     /systems
       InputManager.ts
       Camera.ts
       StateManager.ts
     /utils
       Vector2D.ts
       Rectangle.ts
     main.ts
   ```

3. Implement core systems (2-3 hours)
   - Game loop with RAF
   - Input manager
   - Camera system
   - Basic rendering

**Day 14 Tasks:**
1. Create player entity (2 hours)
   - Player class with states
   - Rendering and animation
   - Input handling
   - Movement with delta time

2. Add game world (2 hours)
   - World bounds
   - Background rendering
   - Platforms or obstacles
   - Collectibles

3. Integrate camera (1 hour)
   - Camera follows player
   - World to screen conversion
   - Viewport culling

### Day 15-16: Polish & Features

**Time:** 6-8 hours

**Day 15 Tasks:**
1. Game states (2 hours)
   - Menu screen
   - Playing state
   - Pause menu
   - Game over screen

2. UI layer (2 hours)
   - Score display
   - Lives/health bar
   - Instructions
   - Pause indicator

3. Parallax backgrounds (1-2 hours)
   - Multiple layers
   - Smooth scrolling
   - Seamless tiling

**Day 16 Tasks:**
1. Enemies/obstacles (2-3 hours)
   - Basic AI (patrol, chase)
   - Collision detection
   - State-based behavior
   - Respawn logic

2. Polish (2-3 hours)
   - Camera shake on events
   - Smooth transitions
   - Visual feedback
   - Sound effects (optional)

3. Testing & debugging (1-2 hours)
   - Test all features
   - Fix bugs
   - Performance optimization
   - Mobile compatibility

### Weekend: Finalize & Deploy

**Time:** 4-6 hours

**Tasks:**
1. Final polish (2 hours)
   - Balance difficulty
   - Tune camera settings
   - Adjust timing and feel
   - Add juice (particle effects, screen shake)

2. Documentation (1 hour)
   - Add README.md
   - Controls instructions
   - Credits and assets used
   - Future improvements

3. Deploy (1 hour)
   - GitHub Pages or itch.io
   - Test deployed version
   - Share with friends

4. Retrospective (1 hour)
   - What went well?
   - What was challenging?
   - What did you learn?
   - What would you do differently?

---

## Progress Tracking

Use this checklist to track your progress:

### Topic 01: Canvas Rendering ☐
- [ ] Read lesson
- [ ] Complete 8+ exercises
- [ ] Review solutions
- [ ] Build mini-project
- [ ] Understand transformations

### Topic 02: Game Loop & Timing ☐
- [ ] Read lesson
- [ ] Complete 6+ exercises
- [ ] Implement delta time correctly
- [ ] Display FPS
- [ ] Build bouncing ball demo

### Topic 03: Input & Controls ☐
- [ ] Read lesson
- [ ] Complete 8+ exercises
- [ ] Handle keyboard input
- [ ] Handle mouse input
- [ ] Add touch support

### Topic 04: State Management ☐
- [ ] Read lesson
- [ ] Complete 6+ exercises
- [ ] Implement FSM
- [ ] Manage game states
- [ ] Create state-based character

### Topic 05: World Coordinate System ☐
- [ ] Read lesson
- [ ] Complete 12+ exercises
- [ ] Implement camera follow
- [ ] Add parallax scrolling
- [ ] Create large world

### Final Project ☐
- [ ] Plan and design
- [ ] Implement core mechanics
- [ ] Add polish and juice
- [ ] Test thoroughly
- [ ] Deploy and share

---

## Study Schedule Templates

### 10 Hours/Week (4 Weeks)

| Week | Focus | Hours |
|------|-------|-------|
| 1 | Topics 01-02 | 10h |
| 2 | Topics 03-04 | 10h |
| 3 | Topic 05 | 10h |
| 4 | Final Project | 10h |

**Daily:** 1.5 hours on weekdays, 3-4 hours on weekends

### 15 Hours/Week (3 Weeks)

| Week | Focus | Hours |
|------|-------|-------|
| 1 | Topics 01-03 | 15h |
| 2 | Topics 04-05 | 15h |
| 3 | Final Project | 15h |

**Daily:** 2 hours on weekdays, 5 hours on weekends

### 20 Hours/Week (2 Weeks)

| Week | Focus | Hours |
|------|-------|-------|
| 1 | Topics 01-04 | 20h |
| 2 | Topic 05 + Project | 20h |

**Daily:** 2-3 hours daily, 6-8 hours on weekends

---

## Tips for Success

### Stay Motivated
- **Set small goals:** Complete one exercise at a time
- **Celebrate wins:** Finished a topic? Take a break, play a game!
- **Share progress:** Post screenshots on Reddit or Discord
- **Join game jams:** Apply what you learn in a weekend jam

### Overcome Challenges
- **Stuck on a bug?** Use `i-debugging.md` guides and console.log
- **Concept unclear?** Read `j-faq.md` or ask in forums
- **Code not working?** Compare with solutions, check for typos
- **Feeling overwhelmed?** Take a break, come back fresh

### Go Deeper
- **Read the books:** Game Programming Patterns (free online)
- **Watch tutorials:** Coding Train, Chris Courses on YouTube
- **Study games:** Play indie games and analyze their mechanics
- **Contribute:** Help others in forums, share your learnings

---

## After Unit 01

Once you complete this unit, you'll be ready for:

- **Unit 02:** Physics & Collisions
  - Velocity and acceleration
  - Gravity and jumping
  - Collision detection and response
  - Realistic movement

- **Unit 03:** Entities & Animation
  - Sprite rendering
  - Frame-based animation
  - Sprite sheets
  - Entity Component System

- **Unit 04:** Level Design
  - Tile maps
  - Level parsing (JSON)
  - Camera zones
  - Advanced parallax

- **Unit 05:** Gameplay & AI
  - Enemy behaviors
  - Power-ups
  - Scoring system
  - Sound effects

- **Unit 06:** Optimization
  - Spatial partitioning
  - Object pooling
  - Performance profiling
  - Production builds

---

## Accountability & Support

### Find a Study Buddy
- Pair up with someone learning game dev
- Share progress weekly
- Code review each other's projects
- Motivate each other

### Join Communities
- **Discord:** Game Dev League, Unofficial MDN
- **Reddit:** r/gamedev, r/webdev
- **Twitter:** #gamedev, #madewithpixels
- **Forums:** HTML5GameDevs.com

### Track Your Journey
- **Dev log:** Write weekly updates on your blog
- **GitHub:** Commit regularly, show your progress
- **YouTube:** Record yourself coding (great for reviewing)
- **Twitter/Mastodon:** Share screenshots and GIFs

---

## Resources Quick Links

- **MDN Canvas Tutorial:** https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial
- **Game Programming Patterns:** https://gameprogrammingpatterns.com/
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/handbook/
- **Free Assets:** https://kenney.nl/assets
- **Code Examples:** Search GitHub for "typescript canvas game"

---

## Final Thoughts

Learning game development is a marathon, not a sprint. Be patient with yourself. Every bug you fix, every feature you implement, every "aha!" moment—these all add up to mastery.

**Most importantly:** Have fun! Game development should be enjoyable. If you're not having fun, try a different project or take a break.

You've got this! 🎮

---

**Next:** Look up terms in `h-glossary.md` as you learn!