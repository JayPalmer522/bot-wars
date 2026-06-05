# BOT WARS

A turn-based tactical combat simulation browser game. Players design bots, assemble 20-bot armies, program combat orders, and configure targeting maps — then pit two armies against each other in battle.

Created by Jay Palmer ([JayPalmerBooks.com](https://jaypalmerbooks.com)).

---

## Current Status

**Fully playable end-to-end, minus animation.**

Working today:

- All 10 screens and navigation
- **Persistence** — bots, armies, orders lists, targeting maps, and component catalogs stored in IndexedDB via Dexie; workshops read/write real data; default content seeded on first run from `main.tsx`
- **User authentication** — `SplashScreen` and `CreateProfileScreen` wired to `Profiles.js` (SHA-256 password hashing)
- **Combat engine** — fully operational: map placement, movement/turning in all 8 directions, weapon firing, damage, destruction, acquired-target fire, win/loss/draw detection
- **Results display** — reads the full `COMBAT_RECORD` transcript from Redux and renders it

Not yet finished:

- **Animation** — `Animation.js` is placeholder stubs; the combat engine produces a complete `COMBAT_RECORD` designed to drive animation, but the rendering loop doesn't exist yet
- **Targeting map grid in combat** — bots scan for enemies by Chebyshev distance; the 7×7 priority grid saved by the Targeting Map Workshop is not yet used to order targets
- **Bomb weapons** — catalog and stat extraction are implemented; `FIRE_BOMB_WEAPON` is not yet called from `EXECUTE_ORDERS_LIST`
- **Profile stats** — `GET_USER_STATS` / `UPDATE_USER_STATS` in `Profiles.js` exist but are not called after combat
- **Data validation** — no slot/weight/power/army-size constraint checking in the workshops
- **Multiplayer / networking**, sound, persistence of battle outcomes

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 8 |
| UI Components | Material-UI (MUI) 5 |
| Routing | React Router DOM 6 |
| Persistence | Dexie 4 (IndexedDB wrapper) — **active** |
| State | Redux Toolkit + react-redux — `battleLogSlice` holds log + full `combatRecord` |
| Styling | MUI `sx` prop + custom dark theme |

The combat/game-logic modules in `src/utils/` are plain JavaScript, not TypeScript.

---

## Getting Started

```bash
npm install
npm run dev       # start dev server (http://localhost:5173)
npm run build     # production build
npm run preview   # preview production build locally
```

No test runner or linter is configured.

---

## Project Structure

```
src/
  main.tsx                          # React entry — Redux Provider + ThemeProvider; calls seedDefaults()
  App.tsx                           # Router — all 10 routes
  theme.ts                          # Global MUI dark theme
  store/
    store.ts                        # Redux store — registers battleLog reducer
    battleLogSlice.ts               # addLogEntry / clearLog / setCombatRecord actions
  db/
    db.ts                           # Dexie schema — 13 tables + TS interfaces
    seed.ts                         # seedDefaults() — component catalogs + default bots/lists/maps
  utils/                            # Game logic (plain JS)
    Combat.js                       # Battle simulation — fully wired into CombatScreen
    Profiles.js                     # Auth / profile CRUD (SHA-256; wired into Splash + CreateProfile screens)
    Animation.js                    # Animation hooks (placeholder stubs — not yet wired)
  screens/
    SplashScreen.tsx                # Login — calls ATTEMPT_LOGIN; navigates to /navigation on success
    CreateProfileScreen.tsx         # Create user profile — calls CREATE_PROFILE
    InstructionsScreen.tsx          # Scrollable rules (48 rules)
    NavigationScreen.tsx            # Hub with 6 nav buttons
    BotWorkshopScreen.tsx           # Design individual bots (reads/writes db)
    ArmyWorkshopScreen.tsx          # Assemble 20-bot armies (reads/writes db; enforces 20-bot limit)
    OrdersListWorkshopScreen.tsx    # Program bot command sequences (reads/writes db)
    TargetingMapWorkshopScreen.tsx  # Set targeting priorities (7×7 grid; writes db)
    CombatScreen.tsx                # Pick armies, set limits, call BEGIN_COMBAT, dispatch setCombatRecord
    ResultsScreen.tsx               # Battle log display — reads combatRecord from Redux
Graphics/                           # 116 PNG/PSD sprite assets
```

---

## Routing

| Path | Screen | Purpose |
|---|---|---|
| `/` | SplashScreen | Login |
| `/create-profile` | CreateProfileScreen | New user |
| `/instructions` | InstructionsScreen | Game rules |
| `/navigation` | NavigationScreen | Hub menu |
| `/bot` | BotWorkshopScreen | Bot builder |
| `/army` | ArmyWorkshopScreen | Army builder |
| `/orders` | OrdersListWorkshopScreen | Orders programming |
| `/targeting` | TargetingMapWorkshopScreen | Targeting map editor |
| `/combat` | CombatScreen | Start battle |
| `/results` | ResultsScreen | Battle results |

---

## Game Concepts

### Bots

Bots are assembled from components. Each component consumes some combination of **Slots**, **Weight**, **Gold**, and **Power**:

| Component | Description |
|---|---|
| **Frame** | Size class: Micro → Titan (10–90 slots); provides baseline ND (Natural Defense) |
| **Engine** | Power output: Gnat → Nova (1,000–9,000 PO); determines movement speed |
| **Computer** | Command capacity: 5–45 CI (Command Instructions) |
| **Armor** | Defense rating: 50–450 AD |
| **Targeting Sensor** | Range 1–3; identifies up to 5 targets |
| **Weapon Master** | Primary weapon (WD + WR) |
| **Weapon Secondary / Bomb** | Optional additional weapons |

### Orders Lists

Each bot runs a sequence of command strings from its assigned Orders List. The combat engine matches on exact text:

- **Movement** — Move Forward 1–5, Move Backward 1–3, Turn Left/Right, Veer Left/Right, Angle Right, Move toward located Enemy
- **Combat** — Fire Master Weapon, Fire Secondary Weapon, Fire All, Activate Self-Destruct
- **Conditionals** — If Movement Blocked by Enemy/Ally, If Any Enemies in Range, If Your Armor is Below X, If Facing Off-Map
- **Setup** — Activate Targeting Map

### Targeting Maps

A 7×7 grid defining which cells to prioritize when firing. The center cell is always "Bot". Clicking an empty cell stamps the next priority number. Range (1–3) disables outer rings beyond sensor reach.

### Armies

Exactly 20 bots (any mix of designs) constitute an army.

### Combat Rules

- Turn-based; bot turn order is randomized at the start of each battle
- The army that acts first starts on the left side of the map, facing East; the second army starts on the right, facing West
- Victory = last army standing (checked after every individual bot's turn)
- If 50 consecutive full rounds pass with no damage dealt, combat ends:
  - Army with more surviving bots wins outright
  - Tie on bots → compare total remaining HP; higher HP = Marginal Winner
  - Tie on bots and HP → Draw
  - Both armies at 0 bots → Both Armies Lose

---

## Data Layer

`src/db/db.ts` defines `BotWarsDB` (Dexie, schema v4) with 13 tables: player content (`bots`, `armies`, `orderLists`, `targetMaps`, `profiles`) and seeded component catalogs (`botFrames`, `botEngines`, `botComputers`, `botArmors`, `botSensors`, `botMasters`, `botSecondaries`, `botBombs`). TypeScript interfaces live alongside the schema.

`src/db/seed.ts` exposes `seedDefaults()` — idempotent (no-ops once `bots` is populated). It seeds all 8 component catalogs (9 entries each) plus three default bots (Small/Medium/Large), orders lists, and targeting maps. Called once from `main.tsx` at startup.

A `Bot` row stores each component as its **full description string** (e.g. `"Micro-bot = BF 10 slots, 10 ND, 130 weight, 100 cost."`), not a foreign key. Both the UI and the combat engine parse stats from these strings using regex helpers (`extractND`, `extractAD`, `extractSlots`, `extractPO`, etc.) defined in `Combat.js`.

---

## Combat Engine (`src/utils/Combat.js`)

```
CombatScreen → BEGIN_COMBAT(army1Id, army2Id, settings)
                 → CREATE_ALL_BOTS_IN_COMBAT_LIST   # randomize order; assign combatBotNumber
                 → MAIN_COMBAT_LOOP
                     → buildBotStatsMap()            # sync — extracts stats from description strings
                     → STARTING_MAP_SQUARES()        # places bots on map; first-turn army = left/East
                     → loadAllOrdersLists()           # load unique orders lists from DB
                     → round loop (max 200 rounds):
                         → EXECUTE_ORDERS_LIST() per living bot
                             → movement: CURRENT_MOVE_BOT1 / CURRENT_MOVE_BACKWARD / CURRENT_TURN_* / CURRENT_VEER_*
                             → fire: fireMasterWeapon / fireSecondaryWeapon (acquired target or forward scan)
                             → conditionals: scanForEnemies, armor check, facing check, block check
                         → checkWinCondition() after each bot's turn   # ends combat immediately on army wipeout
                         → after full round: noRecentDamageRounds counter → resolveDraw() at 50
```

**Map model:** 10×10 grid (100 cells) as five parallel flat arrays — `BASIC_MAP_NUMBERS`, `GAME_MAP_BOTS` (bot id or `"0"`), `GAME_MAP_FACING` (compass dir or `"0"`), `GAME_MAP_BULLETS`, `GAME_MAP_DAMAGE` (current HP as string). Index `i` is the same cell in every array. Movement swaps entries; destruction sets all three bot arrays to `"0"`.

**Direction system:** 8-direction (N, NE, E, SE, S, SW, W, NW). `TURN_RIGHT_MAP`, `TURN_LEFT_MAP`, `VEER_RIGHT_MAP`, `VEER_LEFT_MAP` are lookup tables. `DIR_OFFSET` maps direction → flat-array index delta. `isValidMove(from, to)` guards column-wrap at grid edges.

**Acquired targets:** `Activate Targeting Map` calls `scanForEnemies` (Chebyshev distance) and stores enemy cell indices in `acquiredTargetsMap[botId]`. Fire commands use those indices as guided targets, falling back to a forward scan on miss or no target. Acquired targets are cleared at the end of each bot's turn.

**Destroyed bots:** `applyWeaponHit` zeros all three map arrays for the cell when HP reaches 0 and pushes the bot ID to `newDeadBots`. The caller immediately adds those IDs to `deadBotIds` (a Set) so subsequent commands in the same turn cannot re-target them, and the main round loop skips dead bots on future turns.

**`COMBAT_RECORD`** accumulates log strings plus one settings-header object. Dispatched to Redux via `setCombatRecord` after battle; read by `ResultsScreen` via `useSelector`.

**`CHECK_BOT_TOTALS(frame, engine, ...)`** is exported for `BotWorkshopScreen` to compute `slotsDisplay`, `slotsColor`, `totalWeight`, `totalGold`, `totalPower`, and `move` from component description strings.

---

## Redux State

```typescript
interface BattleLogState {
  log: string[];          // addLogEntry / clearLog
  combatRecord: object[]; // setCombatRecord — full battle transcript (log strings + settings header)
}
```

`CombatScreen` dispatches `clearLog` + `addLogEntry` + `setCombatRecord` after `BEGIN_COMBAT`. `ResultsScreen` reads both via `useSelector`.

---

## Authentication

`ATTEMPT_LOGIN(username, password)` and `CREATE_PROFILE(name, email, password)` use SHA-256 via Web Crypto API and persist to the `profiles` Dexie table. `SplashScreen` calls `ATTEMPT_LOGIN`; `CreateProfileScreen` calls `CREATE_PROFILE`.

---

## Theme

Dark mode throughout: `#111` background, white Courier New text, dark blue (`#00008b`) buttons with 2px gray borders. Headers use Ebrima bold at 30pt. Defined in `src/theme.ts`.

---

## Graphics

Sprites live in `/Graphics/`. Naming conventions:

- **Bot sprites** — `B_I_[BotType]_P[Player]_D[Direction].png` — 8 directions (N, NE, E, SE, S, SW, W, NW), 2 players
- **Bullet sprites** — `Bullet_All_D[Direction].png` — 8 directions
