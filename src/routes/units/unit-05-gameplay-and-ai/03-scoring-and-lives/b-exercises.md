# Scoring and Lives System - Exercises

**Unit 05: Gameplay, AI & Interactions | Topic 03 | Practice Challenges**

> Complete these exercises to master scoring, lives management, and combo systems.

---

## Exercise 1: Basic Score Manager

### Objective
Create a simple score manager that tracks and displays the current score.

### Requirements
- Store current score
- Method to add points
- Method to get current score
- Method to reset score

### Hints
- Use a private score variable
- Make sure score never goes negative
- Consider using getter methods

### Bonus
- Add a method to subtract points (for penalties)
- Track the highest score achieved in a session
- Add score change events/callbacks

---

## Exercise 2: Lives Manager

### Objective
Implement a lives system with add/remove life functionality.

### Requirements
- Start with 3 lives
- Method to add a life
- Method to lose a life
- Method to check if lives remain
- Maximum of 99 lives (Mario cap)

### Hints
- Use a private lives counter
- Check boundaries when adding/removing
- Return boolean from hasLivesRemaining()

### Bonus
- Trigger game over when lives reach 0
- Add visual feedback when life is lost
- Implement temporary invincibility after damage

---

## Exercise 3: Score Display UI

### Objective
Create a UI element that displays the score on screen.

### Requirements
- Display score in top-left corner
- Format score with leading zeros (000000)
- Update in real-time as score changes
- Use white text on dark background

### Hints
- Use ctx.fillText() for rendering
- String.padStart() for zero padding
- Update only when score changes

### Bonus
- Add high score display
- Animate score changes (counting up)
- Add background panel for readability

---

## Exercise 4: Score Popup Animation

### Objective
Create animated popups that appear when points are earned.

### Requirements
- Popup appears at point collection location
- Shows point value earned
- Floats upward
- Fades out over 1 second
- Automatically removes when done

### Hints
- Track lifetime and age
- Use velocityY for upward movement
- Use globalAlpha for fade effect
- Remove expired popups

### Bonus
- Add color coding by point value
- Scale popup for emphasis
- Add outline/shadow for visibility
- Show multiplier if active

---

## Exercise 5: Lives Display with Icons

### Objective
Display remaining lives using Mario head icons.

### Requirements
- Show "×" symbol
- Show number of lives
- Draw up to 3 Mario head icons
- Display in top-left below score

### Hints
- Use circles for Mario heads
- Red fill color (#ff0000)
- Use fillText() for number
- Only show icons for first 3 lives

### Bonus
- Add eyes to Mario heads
- Animate when life is lost
- Show different icon for 1 life (warning)
- Add mustache detail

---

## Exercise 6: Combo System

### Objective
Implement a combo system that tracks consecutive actions.

### Requirements
- Increment combo on action
- Reset combo after 2 seconds of inactivity
- Return multiplier based on combo count
  - 1-1: 1x
  - 2-4: 2x
  - 5-9: 3x
  - 10-19: 4x
  - 20+: 5x

### Hints
- Use a timer that counts down
- Reset timer on each action
- Use Math.floor() or if/else for multiplier

### Bonus
- Display combo counter on screen
- Visual feedback for multiplier increases
- Track max combo achieved
- Add combo break sound effect

---

## Exercise 7: Score with Combo Integration

### Objective
Integrate combo system with scoring to multiply earned points.

### Requirements
- Add score normally if no combo
- Multiply score by combo multiplier
- Increment combo on comboable actions
- Show multiplier in score popup

### Hints
- Check if action is comboable
- Get multiplier from combo manager
- Multiply points before adding to score
- Pass multiplier to popup

### Bonus
- Visual indicator when combo is active
- Different colors for different multipliers
- Combo lost warning at 0.5s remaining
- Combo milestone celebrations (10, 25, 50)

---

## Exercise 8: High Score Persistence

### Objective
Save and load high scores using localStorage.

### Requirements
- Save high score when game ends
- Load high score on game start
- Display high score on screen
- Handle localStorage errors gracefully

### Hints
- Use localStorage.setItem() to save
- Use localStorage.getItem() to load
- Use JSON.stringify/parse for objects
- Wrap in try-catch blocks

### Bonus
- Save top 10 scores with dates
- Display high score leaderboard
- Clear high scores button
- Cloud sync for scores

---

## Exercise 9: Score Events System

### Objective
Create an event-based scoring system with different point values.

### Requirements
- Define point values for:
  - Coin: 100
  - Enemy stomp: 200
  - Block break: 50
  - Power-up: 1000
- Trigger appropriate scoring on events

### Hints
- Use enum for ScoreEvent types
- Create addScoreEvent() method
- Use eventBus or callbacks
- Show popup at event location

### Bonus
- Add more event types
- Different coins worth different amounts
- Chain bonus for multiple stomps
- Perfect timing bonuses

---

## Exercise 10: 1-UP System

### Objective
Award extra lives when score milestones are reached.

### Requirements
- Award 1-UP at 100,000 points
- Award another every 100,000 after
- Play sound effect when awarded
- Show "1-UP!" text on screen

### Hints
- Track next milestone score
- Check after every score increase
- Increment milestone after award
- Use large, colorful text

### Bonus
- Animate 1-UP notification
- Different milestone intervals
- 1-UP from collecting 100 coins
- Visual celebration effect

---

## Exercise 11: Time Bonus System

### Objective
Award bonus points based on time remaining when level completes.

### Requirements
- Track level start time
- Set time limit (5 minutes)
- Calculate remaining time in seconds
- Award 50 points per second remaining

### Hints
- Use Date.now() or performance.now()
- Calculate elapsed time
- Subtract from time limit
- Multiply seconds by point value

### Bonus
- Animate bonus counting up
- Show time bonus separately
- Time attack mode (best time)
- Penalty for overtime

---

## Exercise 12: Damage Tracking System

### Objective
Track if player took damage and award no-damage bonus.

### Requirements
- Track damage state per level
- Reset on level start
- Record when damage is taken
- Award 10,000 points if no damage

### Hints
- Use boolean flag
- Set to true on any damage
- Check at level end
- Reset for new level

### Bonus
- Display no-damage indicator
- Different bonuses for difficulty
- Perfect run achievement
- No-damage streak counter

---

## Exercise 13: Coin Collection Bonus

### Objective
Award bonus for collecting all coins in a level.

### Requirements
- Count total coins in level
- Track collected coins
- Award 5000 point bonus if all collected
- Display collection progress

### Hints
- Count coins on level load
- Increment on coin collection
- Compare at level end
- Show "X/Y" format

### Bonus
- Partial bonus for high percentage
- Secret coin counter
- Coin collection map
- Sparkle effect on 100%

---

## Exercise 14: Score Popup Manager

### Objective
Manage multiple score popups efficiently using object pooling.

### Requirements
- Pool of reusable popup objects
- Create popups at collection points
- Update all active popups
- Return expired popups to pool

### Hints
- Array for active popups
- Array for pooled popups
- Reuse objects instead of creating new
- Remove expired from active list

### Bonus
- Maximum pool size limit
- Different popup types
- Popup stacking prevention
- Performance monitoring

---

## Exercise 15: Complete Game Score System

### Objective
Integrate all scoring components into a complete game system.

### Requirements
- Score manager with events
- Lives manager with damage handling
- Combo system with multipliers
- High score persistence
- Complete UI display
- Score popups
- Time and collection bonuses

### Hints
- Use composition over inheritance
- Event-driven architecture
- Separate concerns (managers)
- Update all systems in game loop

### Bonus
- Statistics tracking (total coins, enemies, etc.)
- Achievement system
- Score replay/breakdown
- Player progression system

---

## Challenge Projects

### Challenge A: Score Attack Mode (2-3 hours)

**Objective:** Create a time-limited mode focused on high scores.

**Requirements:**
- 3-minute timer
- No lives (single attempt)
- All coins respawn every 30 seconds
- Enemies respawn when off-screen
- Combo never resets
- Final score with breakdown

**Features:**
- Countdown timer display
- Escalating point values
- Risk/reward mechanics
- Final score celebration

---

### Challenge B: Leaderboard System (2-3 hours)

**Objective:** Create a full leaderboard with player names.

**Requirements:**
- Top 10 scores saved
- Player name entry
- Date and time stamp
- Level completed
- Time taken
- Display formatted leaderboard

**Features:**
- Name input screen
- Rank with medals (gold, silver, bronze)
- Clear scores option
- Export/import scores

---

### Challenge C: Achievement System (3-4 hours)

**Objective:** Add unlockable achievements that reward mastery.

**Requirements:**
- 15+ achievements defined
- Track achievement progress
- Persist unlocked achievements
- Display achievement notifications
- Achievement gallery screen

**Achievement Ideas:**
- "First Blood" - Defeat first enemy
- "Combo Master" - 50 combo chain
- "Perfectionist" - Complete level with no damage
- "Speed Demon" - Complete level in under 2 minutes
- "Coin Collector" - Collect 1000 coins total
- "Untouchable" - Complete 3 levels without taking damage
- "High Roller" - Reach 1,000,000 points

**Features:**
- Achievement popup notification
- Progress bars for incremental achievements
- Rarity tiers (common, rare, epic, legendary)
- Achievement rewards (cosmetics, cheats)

---

## Self-Assessment

After completing these exercises, you should be able to:

- [ ] Create and manage score systems
- [ ] Implement lives and damage handling
- [ ] Build combo systems with multipliers
- [ ] Display game UI elements
- [ ] Create animated score popups
- [ ] Persist data using localStorage
- [ ] Calculate time and collection bonuses
- [ ] Integrate all components into complete system
- [ ] Optimize performance with object pooling
- [ ] Design engaging scoring mechanics

---

## Tips for Success

1. **Start Simple:** Get basic scoring working before adding combos
2. **Test Thoroughly:** Make sure score never goes negative or NaN
3. **Visual Feedback:** Players should always know why they got points
4. **Balance Carefully:** Point values should reward skill appropriately
5. **Cache Strings:** Don't format score text every frame
6. **Use Events:** Decouple scoring from game logic
7. **Handle Errors:** localStorage can fail, always have fallbacks
8. **Pool Objects:** Reuse popups instead of creating new ones

---

**Next:** Check your solutions in `c-solutions.md` and review quick references in `d-notes.md`!
