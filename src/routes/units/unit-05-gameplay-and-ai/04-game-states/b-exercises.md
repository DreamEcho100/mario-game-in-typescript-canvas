# Game States and State Management - Exercises

**Unit 05: Gameplay, AI & Interactions | Topic 04 | Practice Challenges**

> Complete these exercises to master game state management and flow control.

---

## Exercise 1: Basic State Machine

### Objective
Create a simple state machine that manages transitions between states.

### Requirements
- Store multiple states in a Map
- Track current state
- Implement setState() method
- Call enter() and exit() on transitions
- Route update() and render() to current state

### Hints
- Use a Map<string, GameState>
- Store current state reference
- Always call exit() before enter()
- Handle null/undefined states

### Bonus
- Add state history tracking
- Implement previousState() method
- Add transition validation
- Log all state changes

---

## Exercise 2: Game State Interface

### Objective
Define a GameState interface and implement two simple states.

### Requirements
- Interface with enter(), exit(), update(), render()
- Implement MenuState
- Implement PlayingState
- Both states should render differently

### Hints
- Use TypeScript interface
- Implement all required methods
- Clear screen in render()
- Use different colors for each state

### Bonus
- Add handleInput() method
- Create transition between states
- Add state-specific data
- Implement state name property

---

## Exercise 3: Main Menu State

### Objective
Create a functional main menu with navigation.

### Requirements
- Display game title
- Show 3-4 menu options
- Highlight selected option
- Navigate with arrow keys
- Select with Enter key

### Hints
- Track selectedIndex
- Use array of option strings
- Modulo for wrapping
- Different color for selection

### Bonus
- Add arrow indicator (▶)
- Play sound effects on navigate/select
- Add background image
- Animate selection

---

## Exercise 4: Pause State

### Objective
Implement a pause state that freezes gameplay.

### Requirements
- Pause when Escape pressed
- Show "PAUSED" text
- Dim game background
- Resume when Escape pressed again

### Hints
- Capture screen before pausing
- Use semi-transparent overlay
- Don't update game in pause
- Remember previous state

### Bonus
- Add pause menu options
- Show paused time
- Blur game background
- Add unpause animation

---

## Exercise 5: Loading State

### Objective
Create a loading screen with progress bar.

### Requirements
- Show "LOADING..." text
- Display progress bar
- Show percentage
- Transition to menu when complete

### Hints
- Track progress (0-1)
- Use fillRect() for bar
- Calculate percentage display
- Use setTimeout() to simulate loading

### Bonus
- Load actual images
- Show which asset loading
- Animated loading text
- Smooth progress animation

---

## Exercise 6: Level Complete State

### Objective
Show celebration screen when level ends.

### Requirements
- Display "LEVEL COMPLETE!" message
- Show final score
- Calculate and display bonuses
- Auto-advance after delay

### Hints
- Use setTimeout() or timer
- Format score nicely
- Bright, celebratory colors
- Play victory music

### Bonus
- Animate score counting up
- Award bonuses sequentially
- Show stars/rank
- Fireworks particle effect

---

## Exercise 7: Game Over State

### Objective
Create game over screen with options.

### Requirements
- Display "GAME OVER" message
- Show final score
- Check if high score
- Options: Continue or Quit

### Hints
- Red/dark color scheme
- Compare with high score
- Different message for high score
- Timeout to return to menu

### Bonus
- Dramatic music
- Fade in effect
- Show statistics
- Continue countdown timer

---

## Exercise 8: State Transitions with Fade

### Objective
Add smooth fade transitions between states.

### Requirements
- Fade out current state
- Change state mid-fade
- Fade in new state
- Works for any state transition

### Hints
- Use globalAlpha
- Track transition progress
- Callback when complete
- Tween from 1 to 0 to 1

### Bonus
- Different transition types (slide, zoom)
- Configurable duration
- Skip with key press
- Pause during transition

---

## Exercise 9: Settings Menu State

### Objective
Create a settings menu with adjustable options.

### Requirements
- Music volume slider
- Sound effects volume slider
- Fullscreen toggle
- Save settings to localStorage

### Hints
- Use range for volume (0-100)
- Boolean for toggles
- JSON.stringify for saving
- Apply changes immediately

### Bonus
- Controls remapping
- Difficulty selection
- Language selection
- Reset to defaults button

---

## Exercise 10: High Scores State

### Objective
Display high scores table.

### Requirements
- Show top 10 scores
- Display rank, score, date
- Highlight new high score
- Option to clear scores

### Hints
- Load from localStorage
- Format date nicely
- Use monospace font for alignment
- Different colors for ranks

### Bonus
- Add player names
- Sort by different criteria
- Export/import scores
- Medals for top 3

---

## Exercise 11: Save and Load System

### Objective
Implement game save and load functionality.

### Requirements
- Save player state (lives, score, position)
- Save level progress
- Load saved game
- Handle missing save data

### Hints
- Create SaveData interface
- Use JSON.stringify/parse
- Try-catch for errors
- Default values if no save

### Bonus
- Multiple save slots
- Auto-save feature
- Save timestamp
- Compress save data

---

## Exercise 12: Pause Menu with Options

### Objective
Expand pause state with full menu.

### Requirements
- Resume option
- Restart level option
- Settings option
- Quit to menu option

### Hints
- Use Menu class from lesson
- Navigate with arrows
- Execute actions on select
- Confirm destructive actions

### Bonus
- Keyboard shortcuts
- Show controls help
- Preview settings changes
- Confirm quit dialog

---

## Exercise 13: State History System

### Objective
Track state history for back navigation.

### Requirements
- Store last 5 states
- Implement goBack() method
- Don't duplicate consecutive states
- Clear on game restart

### Hints
- Use array as stack
- Push on state change
- Pop on goBack()
- Check if same as current

### Bonus
- Configurable history size
- Clear history on certain states
- Debug view of history
- Forward navigation

---

## Exercise 14: Credits Screen

### Objective
Create animated credits screen.

### Requirements
- Scrolling text
- Game title
- Creator names
- Technology used

### Hints
- Scroll Y position upward
- Render text at y + scrollY
- Reset when reaches top
- Skip with key press

### Bonus
- Music credits
- Special thanks
- Game statistics
- Easter egg

---

## Exercise 15: Complete State System

### Objective
Integrate all states into complete game flow.

### Requirements
- All major states implemented
- Proper transitions between all states
- Input handling per state
- Save/load working
- Pause from any gameplay state

### Hints
- Use StateMachine class
- Register all states
- Test all transition paths
- Handle edge cases

### Bonus
- State transition animations
- Sound effects for each state
- Debug state visualizer
- State unit tests

---

## Challenge Projects

### Challenge A: Advanced Menu System (3-4 hours)

**Objective:** Create a professional multi-level menu system.

**Requirements:**
- Main menu with submenus
- Breadcrumb navigation
- Back button functionality
- Consistent styling
- Smooth animations

**Features:**
- Level Select submenu (grid of levels)
- Options submenu (multiple pages)
- Profile submenu (stats, achievements)
- Help submenu (controls, tips)

---

### Challenge B: Checkpoint System (2-3 hours)

**Objective:** Implement mid-level checkpoints with save.

**Requirements:**
- Checkpoint flags in levels
- Activate on player touch
- Save checkpoint position
- Respawn at last checkpoint
- Visual activation feedback

**Features:**
- Checkpoint counter
- Permanent activation
- Save to localStorage
- Reset on level complete

---

### Challenge C: Achievement System (3-4 hours)

**Objective:** Create an achievement tracking and display system.

**Requirements:**
- Define 15+ achievements
- Track progress (0-100%)
- Unlock notifications
- Achievement gallery screen
- Save unlocked achievements

**Achievement Ideas:**
- "First Steps" - Complete first level
- "Speed Demon" - Complete level in under 2 min
- "Perfectionist" - 100% coins, no damage
- "Combo Master" - 50 combo streak
- "Veteran" - Complete all levels

**Features:**
- Popup notification on unlock
- Rarity tiers
- Achievement rewards
- Share achievements

---

## Self-Assessment

After completing these exercises, you should be able to:

- [ ] Implement state machine pattern
- [ ] Create multiple game states
- [ ] Handle state transitions
- [ ] Build menu systems
- [ ] Implement pause/resume
- [ ] Create save/load systems
- [ ] Add state-specific input handling
- [ ] Design smooth transitions
- [ ] Manage state lifecycle
- [ ] Integrate complete game flow

---

## Tips for Success

1. **Start Simple:** Get basic state switching working first
2. **Test Transitions:** Try every possible state transition
3. **Handle Edge Cases:** What if player pauses during fade?
4. **Use Enums:** Define state names as constants
5. **Separate Concerns:** Each state should be independent
6. **Lifecycle Important:** Always call enter/exit properly
7. **Save Often:** Test save/load frequently
8. **Input Management:** Clear input between states

---

**Next:** Check your solutions in `c-solutions.md` and review quick references in `d-notes.md`!
