# Topic 01: Collectibles and Power-ups - Exercises

Complete these exercises to master collectibles and power-up systems.

---

## Exercise 1: Basic Coin Collectible
Create a simple coin that the player can collect.

**Requirements:**
- Coin has position and hitbox
- Detect collision with player
- Remove coin when collected
- Add points to score

---

## Exercise 2: Animated Coin
Make the coin spin using sprite animation.

**Requirements:**
- 4-frame rotation animation
- 10 FPS animation speed
- Smooth looping

---

## Exercise 3: Coin Collection Feedback
Add visual and audio feedback.

**Requirements:**
- Play "ding" sound on collection
- Show "+10" score popup
- Fade out popup over 0.5 seconds
- Particle sparkles

---

## Exercise 4: Multiple Coin Types
Create gold, silver, and bronze coins.

**Requirements:**
- Gold: 100 points
- Silver: 50 points
- Bronze: 10 points
- Different sprites for each

---

## Exercise 5: Mushroom Power-up
Create a mushroom that makes player grow.

**Requirements:**
- Spawns from item block
- Moves horizontally
- Player grows when collected
- Can't collect if already powered up

---

## Exercise 6: Fire Flower
Add a fire flower power-up.

**Requirements:**
- Spawns from item block
- Player can shoot fireballs
- Replace mushroom if already big
- Different color/sprite

---

## Exercise 7: Item Block
Create question mark blocks that spawn items.

**Requirements:**
- Animate when hit from below
- Spawn power-up
- Become empty block after hit
- Play sound effect

---

## Exercise 8: Power-up State Machine
Implement player power states.

**Requirements:**
- Small → Big (mushroom)
- Big → Fire (fire flower)
- Damage reduces power level
- Visual changes for each state

---

## Exercise 9: Star Invincibility
Add a star that makes player invincible.

**Requirements:**
- 10 second duration
- Player flashes/rainbow colors
- Can defeat enemies by touching
- Speed boost

---

## Exercise 10: Combo System
Create a combo multiplier for coins.

**Requirements:**
- Collect coins quickly for combo
- Multiplier: x2, x3, x4, x5
- Reset after 3 seconds
- Display current combo

---

## Exercise 11: Hidden Blocks
Add invisible item blocks.

**Requirements:**
- Not visible initially
- Appear when hit
- Spawn items like normal blocks
- Optional: show outline on approach

---

## Exercise 12: Coin Trail
Make coins follow a path.

**Requirements:**
- Place coins in a line/arc
- Collect in sequence for bonus
- Visual guide showing path
- Extra points for perfect collection

---

## Exercise 13: Item Spawner
Create a system that spawns items periodically.

**Requirements:**
- Spawn at predefined positions
- Random item selection
- Limit max items on screen
- Respawn after collection

---

## Exercise 14: Power-up Persistence
Save power-up state between levels.

**Requirements:**
- Store player power state
- Restore on level load
- Handle death (reset to small)
- Visual indicator in UI

---

## Exercise 15: Complete Collection System
Combine all features into one system.

**Requirements:**
- Multiple collectible types
- All power-ups working
- Item blocks spawning items
- Combo system
- Score popups and particles
- Sound effects
- Power-up persistence

---

See `c-solutions.md` for complete implementations.
