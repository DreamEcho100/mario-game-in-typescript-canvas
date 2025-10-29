# 📐 Curriculum Structure & Organization

This document explains the complete organization of the Mario-like Platformer curriculum, including file purposes, content expectations, and navigation guidelines.

---

## 🗂️ Overall Directory Structure

```
mario-game-in-typescript-canvas/
│
├── README.md                          # Main entry point and overview
├── STRUCTURE.md                       # This file - explains organization
├── GETTING-STARTED.md                 # Quick setup guide
│
├── unit-01-game-foundations/          # Unit 01: Core Systems (5 topics)
│   ├── 01-canvas-rendering-basics/
│   ├── 02-game-loop-and-timing/
│   ├── 03-input-and-controls/
│   ├── 04-state-management/
│   ├── 05-world-coordinate-system/
│   ├── e-resources.md
│   ├── f-self-study.md
│   └── h-glossary.md
│
├── unit-02-physics-and-collisions/    # Unit 02: Physics (4 topics)
│   ├── 01-velocity-and-acceleration/
│   ├── 02-gravity-and-jumping/
│   ├── 03-collision-detection-aabb/
│   ├── 04-platformer-physics/
│   ├── e-resources.md
│   ├── f-self-study.md
│   └── h-glossary.md
│
├── unit-03-entities-and-animation/    # Unit 03: Sprites (3 topics)
│   ├── 01-sprite-rendering/
│   ├── 02-animation-systems/
│   ├── 03-entity-management/
│   ├── e-resources.md
│   ├── f-self-study.md
│   └── h-glossary.md
│
├── unit-04-level-design-and-world/    # Unit 04: Levels (4 topics)
│   ├── 01-tilemap-systems/
│   ├── 02-collision-maps/
│   ├── 03-camera-systems/
│   ├── 04-scrolling-and-parallax/
│   ├── e-resources.md
│   ├── f-self-study.md
│   └── h-glossary.md
│
├── unit-05-gameplay-and-ai/           # Unit 05: Gameplay (4 topics)
│   ├── 01-collectibles-and-powerups/
│   ├── 02-enemy-ai/
│   ├── 03-scoring-and-lives/
│   ├── 04-game-states/
│   ├── e-resources.md
│   ├── f-self-study.md
│   └── h-glossary.md
│
└── unit-06-optimization-and-engine/   # Unit 06: Advanced (3 topics)
    ├── 01-performance-profiling/
    ├── 02-architecture-patterns/
    ├── 03-building-reusable-engine/
    ├── e-resources.md
    ├── f-self-study.md
    ├── h-glossary.md
    └── k-advanced.md
```

---

## 📁 File Naming Convention

### Topic-Level Files (Inside Each Topic Folder)

Every topic folder contains these standardized files:

| Filename | Purpose | Typical Length |
|----------|---------|----------------|
| `a-lesson.md` | Main teaching content | 5,000-8,000 lines |
| `b-exercises.md` | Practice problems | 10-15 exercises |
| `c-solutions.md` | Complete solutions | Full implementations |
| `d-notes.md` | Quick reference | ~4,000 lines |
| `i-debugging.md` | Common bugs & fixes | 10 scenarios |
| `j-faq.md` | Frequently asked questions | 15-20 questions |

### Unit-Level Files (Inside Each Unit Folder)

Each unit folder also contains:

| Filename | Purpose | Typical Length |
|----------|---------|----------------|
| `e-resources.md` | External resources & references | ~2,500 lines |
| `f-self-study.md` | Study plan & schedule | ~4,700 lines |
| `h-glossary.md` | Terminology & definitions | ~4,000 lines |
| `k-advanced.md` | Deep dives (Unit 06 only) | ~5,000 lines |

---

## 📖 File Content Guidelines

### **a-lesson.md** — Core Teaching Content

**Purpose:** Primary learning material for each topic.

**Structure:**
1. **Introduction** — What you'll learn and why it matters
2. **Concepts** — Theory with visual explanations
3. **Implementation** — Step-by-step code examples
4. **Application** — Apply to the Mario game
5. **Best Practices** — Performance and architecture tips
6. **Summary** — Key takeaways
7. **Next Steps** — What's coming next

**Style:**
- Start simple, build complexity gradually
- Use ASCII art and diagrams liberally
- Include inline code examples with full context
- Explain the "why" behind every decision
- Link mathematics to visual results
- Provide performance benchmarks where relevant

**Example Sections:**
```markdown
# Canvas Rendering Basics

## Introduction
Canvas is your window into the game world...

## Core Concepts

### The Canvas Element
The HTML5 Canvas is a drawing surface...

### The 2D Rendering Context
ctx.fillRect() draws a filled rectangle...

## Implementation

### Step 1: Setting Up Canvas
```typescript
const canvas = document.createElement('canvas');
// ...
```

### Step 2: Your First Rectangle
// Full working code here

## Application to Mario
In a Mario game, we use rectangles for...

## Performance Considerations
Drawing many rectangles can slow down...

## Summary
You've learned: Canvas setup, basic drawing, ...

## Next Steps
In the next lesson, we'll create a game loop...
```

---

### **b-exercises.md** — Practice Challenges

**Purpose:** Hands-on practice to reinforce concepts from the lesson.

**Structure:**
- 10-15 exercises per topic
- Ordered from easiest to hardest
- Mix of:
  - **Warm-ups** (modify existing code)
  - **Implementations** (build from scratch)
  - **Challenges** (apply concepts creatively)
  - **Stretch Goals** (advanced extensions)

**Each Exercise Includes:**
1. **Objective** — What to build
2. **Requirements** — Specific criteria
3. **Hints** — Guidance without giving away the solution
4. **Bonus** — Optional advanced features

**Example:**
```markdown
## Exercise 5: Implement Smooth Acceleration

### Objective
Make the player accelerate smoothly when moving, instead of instant movement.

### Requirements
- Player should gradually reach max speed
- Deceleration when keys are released
- Smooth feeling, not jerky

### Hints
- Use a separate velocity variable
- Add to velocity each frame
- Clamp velocity to a maximum

### Bonus
- Add friction for ice-like surfaces
- Implement different acceleration for air vs ground
```

---

### **c-solutions.md** — Complete Implementations

**Purpose:** Provide working code with explanations.

**Structure:**
- Solutions for all exercises in order
- Not just code — detailed explanations
- Alternative approaches discussed
- Performance analysis included

**Each Solution Includes:**
1. **Complete Code** — Fully working TypeScript
2. **Explanation** — Why this approach works
3. **Step-by-Step** — How it was built
4. **Alternatives** — Other ways to solve it
5. **Performance** — Time/space complexity
6. **Pitfalls** — Common mistakes to avoid

**Example:**
```markdown
## Solution 5: Smooth Acceleration

### Complete Code

```typescript
class Player {
  x: number = 0;
  y: number = 0;
  velocityX: number = 0;
  accelerationRate: number = 0.5;
  maxSpeed: number = 5;
  friction: number = 0.8;
  
  update(input: Input) {
    // Apply acceleration based on input
    if (input.right) {
      this.velocityX += this.accelerationRate;
    } else if (input.left) {
      this.velocityX -= this.accelerationRate;
    } else {
      // Apply friction when no input
      this.velocityX *= this.friction;
    }
    
    // Clamp to max speed
    this.velocityX = Math.max(-this.maxSpeed, 
                               Math.min(this.maxSpeed, this.velocityX));
    
    // Apply velocity to position
    this.x += this.velocityX;
  }
}
```

### Explanation
This solution uses velocity and acceleration to create smooth movement...

### Why This Works
- Velocity accumulates over time (acceleration)
- Friction naturally slows the player down
- Clamping prevents unrealistic speeds

### Alternative Approaches
1. Easing functions (lerp)
2. Force-based physics
3. Exponential smoothing

### Performance Analysis
- O(1) time complexity
- No allocations
- ~0.01ms per frame

### Common Pitfalls to Avoid
- Forgetting to clamp velocity leads to infinite acceleration
- Too much friction makes movement feel sluggish
- Not applying friction in air creates "ice skating" feel
```

---

### **d-notes.md** — Quick Reference

**Purpose:** Condensed cheat sheet for quick lookup.

**Structure:**
- Key formulas
- Code snippets
- Diagrams
- Constants and values
- Quick troubleshooting

**Organized by:**
1. **Core Formulas**
2. **Code Patterns**
3. **Common Values**
4. **Visual Reference**
5. **Quick Fixes**

**Example:**
```markdown
# Quick Reference: Physics & Movement

## Core Formulas

### Velocity
```
velocity = velocity + acceleration * deltaTime
position = position + velocity * deltaTime
```

### Friction
```
velocity = velocity * frictionCoefficient
// 0.0 = instant stop, 1.0 = no friction
```

## Common Values

| Property | Typical Value | Notes |
|----------|---------------|-------|
| Gravity | 0.5 - 1.5 | Higher = faster fall |
| Jump Force | -10 to -15 | Negative = upward |
| Max Speed | 3 - 8 | Pixels per frame |
| Acceleration | 0.3 - 1.0 | Smoothness factor |

## Code Snippets

### Basic Movement
```typescript
if (input.right) this.velocityX += this.acceleration;
this.x += this.velocityX;
```

## Visual Reference

```
Acceleration Graph:
Speed
  ^
  |     ________  Max Speed
  |    /
  |   /  (Acceleration Phase)
  |  /
  | /
  +-----------------> Time
```

## Quick Fixes

**Problem:** Player moves too fast
**Fix:** Reduce maxSpeed or acceleration

**Problem:** Movement feels "slippery"
**Fix:** Increase friction coefficient
```

---

### **i-debugging.md** — Common Bugs & Solutions

**Purpose:** Real-world debugging scenarios to prepare learners.

**Structure:**
- 10 common bugs per topic
- Realistic symptoms
- Root cause analysis
- Step-by-step fixes

**Each Bug Includes:**
1. **Symptom** — What you see happening
2. **Root Cause** — Why it happens
3. **Solution** — How to fix it
4. **Prevention** — How to avoid it
5. **Code Example** — Before and after

**Example:**
```markdown
## Bug #3: Player Falls Through Floor

### Symptom
The player character sometimes falls through solid platforms, especially when moving fast or jumping.

### Root Cause
Collision detection happens AFTER movement is applied. When velocity is high, the player can move completely past a platform in a single frame without collision being detected (tunneling).

### Diagnosis Steps
1. Console.log player's Y position each frame
2. Check if velocity exceeds platform thickness
3. Visualize player hitbox and platform hitbox on screen

### Solution

#### Step 1: Separate Movement and Collision
```typescript
// WRONG: Move then check collision
player.y += player.velocityY;
if (checkCollision(player, platform)) {
  // Too late! Already inside platform
}

// RIGHT: Check collision before finalizing movement
const nextY = player.y + player.velocityY;
if (willCollide(player, platform, nextY)) {
  player.y = platform.y - player.height;  // Snap to surface
  player.velocityY = 0;
} else {
  player.y = nextY;
}
```

#### Step 2: Implement Swept AABB (Advanced)
For very high velocities, use swept collision detection...

### Prevention
- Always check collision before applying movement
- Limit maximum velocity to prevent tunneling
- Use fixed timestep physics (covered in Unit 02, Topic 04)
- Add safety checks: if player Y > worldHeight, reset position

### Related Issues
- See Bug #7: Jittery Collision Response
- See FAQ: "What is tunneling?"
```

---

### **j-faq.md** — Frequently Asked Questions

**Purpose:** Answer common questions and clarify confusing concepts.

**Structure:**
- 15-20 questions per topic
- Organized by category
- Beginner-friendly explanations

**Categories:**
1. **Conceptual** — Understanding the "why"
2. **Implementation** — How to code it
3. **Performance** — Optimization questions
4. **Debugging** — Troubleshooting help
5. **Advanced** — Deeper explorations

**Example:**
```markdown
## FAQ: Physics & Movement

### Conceptual Questions

#### Q1: What exactly is "delta time" and why do I need it?

**A:** Delta time is the time elapsed between frames. Without it, your game speed depends on frame rate.

Imagine two computers:
- Computer A: Runs at 60 FPS (16.67ms per frame)
- Computer B: Runs at 30 FPS (33.33ms per frame)

If you move the player 5 pixels per frame:
- Computer A: Player moves 300 pixels per second (5 × 60)
- Computer B: Player moves 150 pixels per second (5 × 30)

Same game, different speeds!

**Solution:** Multiply movement by delta time:
```typescript
// Wrong: Frame-dependent
player.x += 5;

// Right: Frame-independent
player.x += 5 * deltaTime;
```

Now both computers move the player at the same speed.

#### Q2: Should I use pixels or meters for physics?

**A:** For a Mario-like game, pixels work fine. Here's why:

**Use Pixels When:**
- Simple 2D platformer
- No need for realistic physics
- Easier to think about (sprite is 32px wide)

**Use Meters When:**
- Realistic physics simulation
- Integration with physics engines (Box2D, Matter.js)
- Large-scale worlds

For this curriculum, we use pixels with a virtual coordinate system (covered in Unit 01, Topic 05).

### Implementation Questions

#### Q3: How do I make the jump feel "good"?

**A:** Great jump feel comes from several techniques:

1. **Variable Jump Height**
   - Hold jump longer = jump higher
   - Release early = shorter jump

2. **Coyote Time**
   - Allow jumping for ~100ms after walking off ledge
   - Feels more forgiving

3. **Jump Buffering**
   - If player presses jump before landing, queue it
   - Executes jump on next valid frame

4. **Fast Fall**
   - Gravity stronger when falling than rising
   - Makes jump arc feel "snappier"

5. **Anticipation**
   - Small "squash" animation before jumping
   - Visual feedback enhances feel

Example implementation in Exercise 8 of Unit 02, Topic 02.

[... 12 more questions ...]
```

---

### **e-resources.md** — External Resources (Unit Level)

**Purpose:** Curated list of external learning materials.

**Categories:**
1. **Official Documentation**
2. **Books & Articles**
3. **Video Tutorials**
4. **Open Source Projects**
5. **Tools & Libraries**
6. **Community**

**Example:**
```markdown
# Resources: Unit 01 - Game Foundations

## Official Documentation

### Canvas API
- [MDN Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
  - Complete reference for Canvas 2D context
  - Interactive examples
  - Performance tips

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
  - Official TypeScript guide
  - Covers types, classes, modules

## Books

### Game Programming
1. **"Game Programming Patterns"** by Robert Nystrom
   - Free online: [gameprogrammingpatterns.com](http://gameprogrammingpatterns.com/)
   - Chapters 2 (Game Loop) and 4 (Update Method) especially relevant
   
2. **"The Nature of Code"** by Daniel Shiffman
   - Free online: [natureofcode.com](https://natureofcode.com/)
   - Chapter 1: Vectors (useful for Unit 02)

[... more resources ...]
```

---

### **f-self-study.md** — Study Plan (Unit Level)

**Purpose:** Structured learning schedule with milestones.

**Structure:**
- Week-by-week breakdown
- Daily learning goals
- Weekend projects
- Assessment checkpoints

**Example:**
```markdown
# Self-Study Plan: Unit 01 (3 Weeks)

## Overview
This unit covers the foundations of game development. Plan for 1-2 hours per weekday, 3-4 hours on weekends.

## Week 1: Rendering & Game Loop

### Monday: Canvas Basics
- [ ] Read: a-lesson.md (Canvas Rendering Basics)
- [ ] Complete: Exercises 1-5
- [ ] Build: Draw a colored rectangle that changes color on click
- **Time:** 1.5 hours

### Tuesday: Advanced Canvas
- [ ] Read: Rest of a-lesson.md (Canvas Rendering Basics)
- [ ] Complete: Exercises 6-10
- [ ] Build: Draw multiple shapes with gradients
- **Time:** 1.5 hours

[... daily breakdown continues ...]

### Weekend Project 1: Bouncing Ball
Build a ball that bounces around the screen.

**Requirements:**
- Ball rebounds off all four walls
- Gravity affects ball
- Click to reset position
- Display FPS counter

**Skills Practiced:**
- Canvas rendering
- Game loop
- Basic physics
- Input handling

**Expected Time:** 3-4 hours

## Assessment Checkpoint 1 (End of Week 1)

Answer these questions to test your understanding:

1. [ ] Can you explain what the game loop does?
2. [ ] What is delta time and why is it important?
3. [ ] How do you center an element on the canvas?
4. [ ] What's the difference between fillRect and strokeRect?
5. [ ] How would you debug a game running at low FPS?

If you answered yes to 4+, continue to Week 2.
If not, review lessons and try more exercises.

[... weeks 2-3 continue ...]
```

---

### **h-glossary.md** — Terminology (Unit Level)

**Purpose:** Define all game development terms used in the unit.

**Structure:**
- Alphabetical organization
- Simple definitions
- Examples and usage
- Related terms

**Example:**
```markdown
# Glossary: Unit 01 Terms

## A

### AABB (Axis-Aligned Bounding Box)
A rectangular collision box that is not rotated (sides parallel to axes). Used for efficient collision detection.

**Example:**
```typescript
interface AABB {
  x: number;      // Left edge
  y: number;      // Top edge
  width: number;
  height: number;
}
```

**Used In:** Collision detection (Unit 02, Topic 03)

**Related Terms:** Hitbox, Bounding Box, Collision Shape

---

### Accumulator
A variable that stores leftover time in a fixed timestep game loop.

**Example:**
```typescript
let accumulator = 0;
accumulator += deltaTime;
while (accumulator >= FIXED_TIMESTEP) {
  update(FIXED_TIMESTEP);
  accumulator -= FIXED_TIMESTEP;
}
```

**Used In:** Fixed timestep physics (Unit 02, Topic 04)

**Related Terms:** Delta Time, Fixed Timestep, Game Loop

[... continues alphabetically ...]

## D

### Delta Time
The elapsed time between the current frame and the previous frame, usually in seconds or milliseconds.

**Why It Matters:**
Without delta time, game speed depends on frame rate. With it, movement is frame-independent.

**Example:**
```typescript
// Frame-dependent (BAD)
player.x += 5;  // Moves faster at 60 FPS than 30 FPS

// Frame-independent (GOOD)
player.x += 5 * deltaTime;  // Same speed regardless of FPS
```

**Common Values:**
- 60 FPS: ~16.67ms delta time
- 30 FPS: ~33.33ms delta time
- Variable: Changes each frame

**Used In:** Every game loop implementation

**Related Terms:** Frame Rate, Game Loop, Frame Independence

[... continues ...]
```

---

### **k-advanced.md** — Deep Dives (Unit 06 Only)

**Purpose:** Advanced technical content for experienced developers.

**Topics:**
- Performance optimization deep dives
- Architecture patterns in detail
- Memory management
- Production considerations
- Engine design philosophy

**Example:**
```markdown
# Advanced Topics: Optimization & Engine Design

## Memory Management in JavaScript Games

### Understanding Garbage Collection

JavaScript's garbage collector can cause frame drops...

### Object Pooling

Instead of creating/destroying objects:

```typescript
class EntityPool {
  private pool: Entity[] = [];
  private active: Entity[] = [];
  
  get(): Entity {
    let entity = this.pool.pop();
    if (!entity) {
      entity = new Entity();
    }
    this.active.push(entity);
    return entity;
  }
  
  release(entity: Entity): void {
    const index = this.active.indexOf(entity);
    if (index > -1) {
      this.active.splice(index, 1);
      entity.reset();
      this.pool.push(entity);
    }
  }
}
```

**Performance Impact:**
- Before: 1000 entities/sec = ~2ms GC pauses
- After: No GC pauses, consistent frame time

[... deep technical content continues ...]
```

---

## 🎯 Learning Path Through the Structure

### Recommended Reading Order Per Topic:

1. **Start:** `a-lesson.md` — Learn the concepts
2. **Practice:** `b-exercises.md` — Do exercises 1-5
3. **Reference:** `d-notes.md` — Skim for key formulas
4. **Continue:** `b-exercises.md` — Complete remaining exercises
5. **Check:** `c-solutions.md` — Compare your solutions
6. **Debug:** `i-debugging.md` — Learn common issues
7. **Clarify:** `j-faq.md` — Read if anything is unclear

### Recommended Reading Order Per Unit:

1. Complete all topics in order (01 → 02 → 03, etc.)
2. After finishing all topics, read `h-glossary.md` for terminology review
3. Use `e-resources.md` to explore deeper
4. Follow `f-self-study.md` for structured pacing

---

## 📊 Content Metrics

### Total Curriculum Size

| Component | Count | Total Lines |
|-----------|-------|-------------|
| Units | 6 | - |
| Topics | 23 | - |
| Lesson Files | 23 | ~150,000 |
| Exercise Sets | 23 | ~5,000 |
| Solution Files | 23 | ~8,000 |
| Notes Files | 23 | ~92,000 |
| Debugging Guides | 23 | ~4,600 |
| FAQ Files | 23 | ~6,900 |
| Resource Guides | 6 | ~15,000 |
| Study Plans | 6 | ~28,200 |
| Glossaries | 6 | ~24,000 |
| Advanced Guide | 1 | ~5,000 |
| **Total** | **~190** | **~340,000 lines** |

This is a **comprehensive, production-ready curriculum** equivalent to a full university course.

---

## 🧭 Navigation Tips

### Finding Specific Content

**Want to learn about...?**

| Topic | Go To |
|-------|-------|
| Canvas basics | Unit 01 / Topic 01 / a-lesson.md |
| Game loop | Unit 01 / Topic 02 / a-lesson.md |
| Jump physics | Unit 02 / Topic 02 / a-lesson.md |
| Collision | Unit 02 / Topic 03 / a-lesson.md |
| Sprites | Unit 03 / Topic 01 / a-lesson.md |
| Animation | Unit 03 / Topic 02 / a-lesson.md |
| Tilemaps | Unit 04 / Topic 01 / a-lesson.md |
| Camera | Unit 04 / Topic 03 / a-lesson.md |
| Enemy AI | Unit 05 / Topic 02 / a-lesson.md |
| Optimization | Unit 06 / Topic 01 / a-lesson.md |

**Need quick reference?**
→ Check `d-notes.md` in the relevant topic

**Stuck on a bug?**
→ Check `i-debugging.md` in the relevant topic

**Have a question?**
→ Check `j-faq.md` in the relevant topic

**Want more resources?**
→ Check `e-resources.md` in the unit folder

---

## ✅ Quality Standards

Every file in this curriculum meets these standards:

### Lessons (a-lesson.md)
- ✅ 5,000-8,000 lines of content
- ✅ Clear learning objectives stated upfront
- ✅ Visual diagrams and ASCII art included
- ✅ Step-by-step code examples
- ✅ Performance considerations discussed
- ✅ Builds toward a working game feature

### Exercises (b-exercises.md)
- ✅ 10-15 progressive challenges
- ✅ Clear objectives and requirements
- ✅ Hints provided without spoiling solutions
- ✅ Stretch goals for advanced learners
- ✅ Mix of implementation and creative tasks

### Solutions (c-solutions.md)
- ✅ Complete, working TypeScript code
- ✅ Detailed explanations of approach
- ✅ Alternative solutions discussed
- ✅ Performance analysis included
- ✅ Common pitfalls highlighted

### Notes (d-notes.md)
- ✅ ~4,000 lines of reference material
- ✅ Quick-lookup formulas and snippets
- ✅ Visual diagrams included
- ✅ Common values and constants listed
- ✅ Organized for easy scanning

### Debugging (i-debugging.md)
- ✅ 10 realistic bug scenarios
- ✅ Clear symptom descriptions
- ✅ Root cause explanations
- ✅ Step-by-step solutions
- ✅ Prevention strategies

### FAQ (j-faq.md)
- ✅ 15-20 common questions answered
- ✅ Beginner-friendly explanations
- ✅ Code examples included
- ✅ Related topics cross-referenced
- ✅ Conceptual and practical questions mixed

---

## 🚀 Ready to Start?

Now that you understand the structure, dive into the content:

```bash
cd unit-01-game-foundations/01-canvas-rendering-basics
cat a-lesson.md  # Or open in your editor
```

**The journey of building a Mario-like platformer begins with a single pixel!** 🎮✨
