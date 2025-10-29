# Unit 03: Entities, Animations & Sprites - Self-Study Plan

> A structured 2-week study plan to master sprites, animations, and entity management.

---

## 📅 Week 1: Sprites & Animations

### Day 1-2: Sprite Rendering
**Goal:** Master drawing sprites from sprite sheets

**Study:**
- Read `01-sprite-rendering/a-lesson.md`
- Review `01-sprite-rendering/d-notes.md`

**Practice:**
- Exercise 1-3: Load and draw sprites
- Exercise 4: Implement horizontal flipping
- Exercise 5: Build sprite atlas loader

**Project:**
```typescript
// Create a sprite viewer
- Load a sprite sheet
- Display all sprites in a grid
- Click sprite to view full size
- Show sprite dimensions
```

**Check Understanding:**
- [ ] Can load images with Promises
- [ ] Understand 9-parameter `drawImage()`
- [ ] Can extract sprites from sheet
- [ ] Can flip sprites horizontally
- [ ] Built reusable Sprite class

---

### Day 3-4: Basic Animation
**Goal:** Create frame-based animations

**Study:**
- Read `02-animation-systems/a-lesson.md` (sections 1-3)
- Review animation modes

**Practice:**
- Exercise 1-2: Simple frame animation
- Exercise 3: Play-once mode
- Exercise 6: Horizontal flipping

**Project:**
```typescript
// Animated character viewer
- Create walk cycle animation
- Toggle between idle/walk/run
- Pause/play controls
- Speed slider
- Frame counter display
```

**Check Understanding:**
- [ ] Animation loops smoothly
- [ ] Delta time controls speed
- [ ] Play-once mode works
- [ ] Can flip animated sprite
- [ ] Built Animation class

---

### Day 5-6: State Machines
**Goal:** Manage multiple animations with states

**Study:**
- Read `02-animation-systems/a-lesson.md` (sections 4-6)
- Study Mario implementation

**Practice:**
- Exercise 4: Build state machine
- Exercise 5: Connect to player physics
- Exercise 9: Add animation events

**Project:**
```typescript
// Playable animated character
- Idle animation when stationary
- Walk when moving slowly
- Run when moving fast
- Jump animation (play once)
- Footstep sounds on specific frames
```

**Check Understanding:**
- [ ] State machine switches correctly
- [ ] Animations reset on state change
- [ ] Physics drives animation state
- [ ] Events trigger at correct frames
- [ ] Character feels responsive

---

### Day 7: Week 1 Checkpoint

**Mini Project: Animated Sprite Demo**
```typescript
// Build complete sprite/animation system
Requirements:
- Load sprite sheet from URL
- Display all available animations
- Switch animations with keyboard
- Show current state/frame
- FPS counter
- Debug visualization
```

**Self-Assessment:**
- [ ] All exercises completed
- [ ] Mini project works
- [ ] Can debug animation issues
- [ ] Understand sprite rendering pipeline
- [ ] Ready for entity management

---

## 📅 Week 2: Entity Management

### Day 8-9: Entity Architecture
**Goal:** Build scalable entity system

**Study:**
- Read `03-entity-management/a-lesson.md` (sections 1-3)
- Review entity lifecycle

**Practice:**
- Exercise 1-2: Base Entity + Coin
- Exercise 3-4: EntityManager with deferred add/remove
- Exercise 10: Entity lifecycle states

**Project:**
```typescript
// Entity playground
- Spawn different entity types
- Click to add entities
- Right-click to delete
- Display entity count
- Auto-remove dead entities
```

**Check Understanding:**
- [ ] Base Entity class works
- [ ] Multiple entity types
- [ ] EntityManager handles add/remove
- [ ] No crashes from concurrent modification
- [ ] Lifecycle states work

---

### Day 10-11: Performance Optimization
**Goal:** Handle hundreds of entities efficiently

**Study:**
- Read `03-entity-management/a-lesson.md` (sections 4-6)
- Study object pooling and spatial grid

**Practice:**
- Exercise 5: Object pool
- Exercise 7: Offscreen culling
- Exercise 8: Spatial grid

**Project:**
```typescript
// Performance stress test
- Spawn 500+ entities
- Implement object pooling
- Add spatial grid for collisions
- Display performance metrics
- Compare with/without optimizations
```

**Check Understanding:**
- [ ] Object pool reuses objects
- [ ] Culling improves FPS
- [ ] Spatial grid speeds collisions
- [ ] Can handle 500+ entities
- [ ] Understand O(n²) vs O(n)

---

### Day 12-13: Advanced Patterns
**Goal:** Factory and component patterns

**Study:**
- Read `03-entity-management/a-lesson.md` (sections 5, 7)
- Review component system

**Practice:**
- Exercise 6: Entity factory
- Exercise 9: Component system

**Project:**
```typescript
// Level loader
- Define level in JSON
- Use factory to create entities
- Build entities with components
- Save/load level data
```

**Example JSON:**
```json
[
  { "type": "player", "x": 50, "y": 400 },
  { "type": "enemy", "x": 200, "y": 400, "properties": { "health": 10 } },
  { "type": "coin", "x": 300, "y": 300 }
]
```

**Check Understanding:**
- [ ] Factory creates from data
- [ ] Components are flexible
- [ ] Can compose complex entities
- [ ] JSON loads correctly
- [ ] Easy to add new entity types

---

### Day 14: Final Project

**Capstone: Mini Mario Level**
```typescript
// Build a playable Mario-style level
Requirements:
✅ Animated Mario (idle, walk, run, jump)
✅ Multiple enemies with AI
✅ Collectible coins
✅ Entity manager with pooling
✅ Spatial grid collision
✅ Load level from JSON
✅ Score system
✅ Death/respawn

Bonus:
- Power-ups
- Moving platforms
- Particle effects
- Sound effects
```

**Code Structure:**
```
src/
  entities/
    Entity.ts           # Base class
    Player.ts          # Mario
    Enemy.ts           # Goomba
    Coin.ts            # Collectible
  systems/
    EntityManager.ts   # Manager
    ObjectPool.ts      # Pooling
    SpatialGrid.ts     # Collision optimization
  animation/
    Animation.ts       # Animation class
    AnimationStateMachine.ts
  assets/
    mario-sheet.png
    enemies-sheet.png
  levels/
    level-1.json
  main.ts              # Entry point
```

---

## 🎯 Learning Objectives Check

By the end of 2 weeks, you should be able to:

### Sprite Rendering
- [ ] Load and draw sprites from sheets
- [ ] Extract specific regions with 9-param drawImage
- [ ] Build reusable Sprite class
- [ ] Create sprite atlases with JSON metadata
- [ ] Flip and transform sprites
- [ ] Optimize sprite rendering

### Animation Systems
- [ ] Create frame-based animations
- [ ] Implement loop/once/pingpong modes
- [ ] Build animation state machines
- [ ] Connect animations to game state
- [ ] Add animation events
- [ ] Smooth animation transitions

### Entity Management
- [ ] Design entity architecture
- [ ] Implement EntityManager
- [ ] Use object pooling for performance
- [ ] Create entity factories
- [ ] Cull offscreen entities
- [ ] Spatial grid for collision
- [ ] Component-based entities

---

## 📝 Assessment Quizzes

### Quiz 1: Sprites (After Day 2)
1. What are the 9 parameters of `drawImage()`?
2. Why use sprite sheets instead of individual files?
3. How do you flip a sprite horizontally?
4. What's the difference between a sprite sheet and atlas?
5. How do you prevent blurry sprites?

### Quiz 2: Animations (After Day 6)
1. Why use delta time for animations?
2. What's the difference between loop and once mode?
3. When should you reset an animation?
4. How do state machines help manage animations?
5. How do you trigger sounds on specific frames?

### Quiz 3: Entities (After Day 13)
1. Why defer add/remove operations?
2. When should you use object pooling?
3. How does a spatial grid improve performance?
4. What's the difference between inheritance and composition?
5. How do you handle entity lifecycle?

**Answers in FAQ files!**

---

## 🔄 Practice Routine

### Daily (30 min)
- Review one topic's notes
- Complete 2-3 exercises
- Read debugging FAQ for that topic

### Every Other Day (60 min)
- Work on current project
- Implement one optimization
- Test with browser DevTools

### Weekly (2-3 hours)
- Complete checkpoint project
- Review all exercises
- Build something fun!

---

## 🎓 After Unit 03

### Next Steps
1. **Unit 04:** Advanced game systems
2. **Unit 05:** Physics and collision
3. **Unit 06:** Level design and tilemaps
4. **Unit 07:** Polish and juice

### Independent Projects
- **Flappy Bird clone** - Simple, good for practice
- **Space Invaders** - Entities and shooting
- **Platformer demo** - Physics and animation
- **Top-down shooter** - Many entities, spatial grid

### Join Community
- Share your projects on Twitter/Reddit
- Join game dev Discord servers
- Participate in game jams
- Get feedback on your code

---

## 💡 Study Tips

### When Stuck
1. Re-read the lesson section
2. Check debugging guide
3. Read FAQ
4. Review solution (but try first!)
5. Ask in community

### Best Practices
- **Code every day** - Even 30 minutes helps
- **Type code yourself** - Don't copy/paste
- **Break problems down** - Solve piece by piece
- **Test frequently** - Don't write too much at once
- **Use debugger** - Console.log is your friend

### Project Ideas
- **Animation editor** - Create/preview animations
- **Sprite packer** - Combine sprites into sheets
- **Entity visualizer** - See spatial grid in action
- **Performance tester** - Compare techniques

---

**Good luck!** You're on your way to building amazing 2D games! 🎮

**Remember:** Everyone starts somewhere. Don't compare your beginning to someone else's middle. Keep coding! 🚀
