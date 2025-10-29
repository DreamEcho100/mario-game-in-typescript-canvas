# Topic 02: Enemy AI - Exercises

Complete these exercises to master enemy AI systems.

---

## Exercise 1: Basic Patrol Enemy
Create an enemy that walks back and forth.

**Requirements:**
- Walks at constant speed
- Turns around at edges
- Turns around at walls
- Affected by gravity

---

## Exercise 2: Edge Detection
Improve the patrol enemy to not fall off platforms.

**Requirements:**
- Check for ground ahead
- Turn around if no ground
- Continue patrol

---

## Exercise 3: Chase Player
Enemy chases player when in range.

**Requirements:**
- Detect player within 200px
- Move toward player
- Return to patrol when far away

---

## Exercise 4: Line of Sight
Enemy only chases if they can see player.

**Requirements:**
- Check angle to player (vision cone)
- Raycast for walls blocking view
- Chase only if clear line of sight

---

## Exercise 5: Jumping Enemy
Enemy can jump over obstacles.

**Requirements:**
- Detect obstacles ahead
- Jump to clear them
- Land safely

---

## Exercise 6: Ranged Attacker
Enemy shoots projectiles at player.

**Requirements:**
- Shoot every 2 seconds
- Aim at player's position
- Projectiles move and collide

---

## Exercise 7: State Machine
Implement enemy with multiple states.

**Requirements:**
- States: Idle, Patrol, Alert, Chase, Attack
- Smooth transitions between states
- Visual indicator of current state

---

## Exercise 8: Flying Enemy
Enemy that flies and hovers.

**Requirements:**
- No gravity
- Hover up/down smoothly
- Follow player horizontally
- Maintain altitude

---

## Exercise 9: Pathfinding Enemy
Enemy navigates around obstacles.

**Requirements:**
- Find path to player
- Follow waypoints
- Update path when needed

---

## Exercise 10: Coward Enemy
Enemy flees from player.

**Requirements:**
- Run away when player is close
- Keep minimum distance
- Return to patrol when safe

---

## Exercise 11: Boss Enemy
Multi-phase boss with different attacks.

**Requirements:**
- 3 health phases
- Different attacks per phase
- Pattern-based attacks
- Defeat animation

---

## Exercise 12: Stomping Mechanic
Player can defeat enemies by jumping on them.

**Requirements:**
- Detect player landing on enemy
- Defeat enemy
- Bounce player upward
- Award points

---

## Exercise 13: Shell Enemy
Enemy enters shell when stomped, can be kicked.

**Requirements:**
- First stomp: enter shell
- Second stomp: kick shell
- Shell moves fast and defeats other enemies
- Time limit before re-emerging

---

## Exercise 14: Enemy Variants
Create 3 enemy types with different AI.

**Requirements:**
- Slow but tough enemy
- Fast but weak enemy
- Ranged attacker
- Different sprites and behaviors

---

## Exercise 15: Enemy Manager
System to spawn and manage many enemies.

**Requirements:**
- Spawn enemies at predefined positions
- Update only nearby enemies
- Handle defeat/removal
- Object pooling for performance

---

See `c-solutions.md` for complete implementations.
