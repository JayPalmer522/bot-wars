# BOT WARS - JavaScript Architecture Plan

## Overview
The game logic will be organized into three main JavaScript modules to handle core functionality:
- **Profiles.js** - User authentication and profile management
- **Combat.js** - Battle simulation and combat mechanics
- **Animation.js** - Visual effects and UI animations

---

## 1. Profiles.js
**Purpose:** Handle user login, profile creation, profile management, and user data persistence

### Functions:
- `ATTEMPT_LOGIN(username, password)` - Validate user credentials and load profile
- `CREATE_PROFILE(username, email, password)` - Create new user account
- `LOAD_PROFILE(userId)` - Load existing user profile from database
- `SAVE_PROFILE(userId, profileData)` - Save/update user profile
- `DELETE_PROFILE(userId)` - Remove user profile
- `VALIDATE_USERNAME(username)` - Check if username is available
- `VALIDATE_PASSWORD(password)` - Verify password strength
- `HASH_PASSWORD(password)` - Encrypt password before storage
- `GET_USER_ARMIES(userId)` - Fetch all armies owned by user
- `GET_USER_BOTS(userId)` - Fetch all bots owned by user
- `GET_USER_STATS(userId)` - Retrieve user win/loss statistics
- `UPDATE_USER_STATS(userId, wins, losses)` - Update user combat statistics

### Data Interactions:
- Interact with Profiles table (if needed in database)
- Read/write from Bots, Armies, OrderLists, TargetMaps tables
- Store session tokens and user context

---

## 2. Combat.js
**Purpose:** Handle all combat simulation logic, turn-based mechanics, and battle calculations

### Functions:
- `INITIALIZE_COMBAT(army1Id, army2Id, settings)` - Set up new combat session
- `START_COMBAT()` - Begin battle sequence
- `PROCESS_TURN(currentArmy, targetArmy)` - Execute one army's turn
- `EXECUTE_BOT_ACTION(bot, action, targetBot)` - Execute single bot action (move, fire, etc.)
- `CALCULATE_DAMAGE(attacker, weapon, defender)` - Compute damage from attack
- `APPLY_DAMAGE(bot, damageAmount)` - Apply damage and update bot health
- `CHECK_BOT_STATUS(bot)` - Determine if bot is still alive
- `CHECK_WIN_CONDITION()` - Determine if battle is over (winner/loser)
- `GENERATE_LOG_ENTRY(action, details)` - Create battle log entry
- `END_COMBAT(winner, loser)` - Finalize combat, calculate rewards
- `RETRIEVE_BOT_ORDERS(botId)` - Get bot's command sequence
- `EVALUATE_CONDITIONAL(condition, botState)` - Check if/then conditions
- `CALCULATE_MOVE_RANGE(bot)` - Determine how far bot can move
- `CHECK_LINE_OF_SIGHT(attacker, target)` - Verify targeting is valid
- `APPLY_ARMOR_REDUCTION(damage, armorRating)` - Reduce damage based on armor

### Data Interactions:
- Read from Bots, Armies, OrderLists, TargetMaps tables
- Write battle logs to Redux store
- Update Army combat statistics
- Store turn-by-turn combat state

---

## 3. Animation.js
**Purpose:** Handle all visual effects, UI transitions, and rendering animations

### Functions:
- `ANIMATE_BOT_MOVE(botId, startPos, endPos, duration)` - Animate bot movement on grid
- `ANIMATE_WEAPON_FIRE(attackerPos, targetPos, weaponType)` - Show weapon effect
- `ANIMATE_EXPLOSION(position, size, intensity)` - Display explosion effect
- `ANIMATE_DAMAGE_NUMBER(position, damageAmount)` - Show floating damage text
- `ANIMATE_ARMOR_HIT(botId)` - Visual armor impact effect
- `FLASH_SCREEN(color, duration)` - Flash screen for significant events
- `SHAKE_CAMERA(intensity, duration)` - Camera shake effect
- `FADE_IN_ELEMENT(element, duration)` - Fade in UI element
- `FADE_OUT_ELEMENT(element, duration)` - Fade out UI element
- `SLIDE_TRANSITION(fromScreen, toScreen, direction)` - Screen slide transition
- `HIGHLIGHT_BOT(botId, color, duration)` - Highlight selected bot
- `SHOW_TOOLTIP(text, position)` - Display contextual tooltip
- `ANIMATE_HEALTH_BAR(botId, oldHealth, newHealth)` - Animate health bar change
- `PLAY_SOUND_EFFECT(soundName)` - Play audio effect
- `ANIMATE_BOT_DEATH(botId)` - Death animation sequence
- `PAUSE_ANIMATION()` - Pause all animations
- `RESUME_ANIMATION()` - Resume all animations

### Data Interactions:
- Interact with UI component states
- Read bot/combat state for position and status data
- Trigger based on Combat.js events
- Update Redux store for animation state

---

## Integration Flow

### User Login Flow:
1. SplashScreen button click → `ATTEMPT_LOGIN(username, password)`
2. Profiles.js validates and loads profile
3. Navigation to NavigationScreen
4. Redux store updated with current user context

### Bot Design Flow:
1. BotWorkshopScreen dropdown changes → Calculate totals
2. "Save Bot Design" button → Profiles.js (implicit via bot save)
3. Bot stored in database
4. Bots table updated

### Combat Flow:
1. CombatScreen "Begin Combat" → `INITIALIZE_COMBAT(army1, army2, settings)`
2. `START_COMBAT()` begins simulation
3. Each turn: `PROCESS_TURN()` with `EXECUTE_BOT_ACTION()`
4. Damage calculated: `CALCULATE_DAMAGE()` → `APPLY_DAMAGE()`
5. Battle log entries: `GENERATE_LOG_ENTRY()`
6. Visual feedback: Animation.js functions called
7. Victory check: `CHECK_WIN_CONDITION()`
8. Combat ends: `END_COMBAT()` → Results stored in Redux
9. ResultsScreen displays battle log and outcomes

---

## File Structure
```
src/
  utils/
    Profiles.js      (user auth and profile management)
    Combat.js        (battle simulation)
    Animation.js     (visual effects and transitions)
```

## Implementation Notes
- Each module exports functions as named exports for tree-shaking
- Modules should be stateless where possible (rely on Redux for state)
- Combat.js should emit events/callbacks for Animation.js to respond to
- Error handling with try-catch blocks throughout
- Console logging for debugging during development
