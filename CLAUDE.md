# BOT WARS — Codebase Guide

## What This Is

BOT WARS is a turn-based tactical combat simulation browser game. Players design bots, assemble 20-bot armies, program combat orders, configure targeting maps, then pit two armies against each other in battle. Created by Jay Palmer (JayPalmerBooks.com).

**Current state:** all 10 screens, navigation, Dexie/IndexedDB persistence, Redux state management, user authentication, and the core combat simulation engine are fully implemented and wired together. The combat engine runs end-to-end: map placement, movement, turning, weapon fire, damage, destruction, targeting, win/loss/draw detection, and results display. Animation of the battle is the main remaining feature.

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 8 |
| UI Components | Material-UI (MUI) 5 |
| Routing | React Router DOM 6 |
| Persistence | Dexie 4 (IndexedDB wrapper) — **active** |
| State | Redux Toolkit + react-redux — `battleLogSlice` is **active** (combat log + record) |
| Styling | MUI `sx` prop + custom dark theme |

Note: the game logic modules in `src/utils/` (`Combat.js`, `Profiles.js`, `Animation.js`) are plain JavaScript, not TypeScript.

## Dev Commands

```
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview built app
```

There is no test runner or linter configured.

## Project Structure

```
src/
  main.tsx                        # React entry — wraps App in Redux Provider + ThemeProvider; calls seedDefaults()
  App.tsx                         # Router with all 10 routes
  theme.ts                        # Global MUI dark theme
  store/
    store.ts                      # Redux store — registers battleLog reducer
    battleLogSlice.ts             # addLogEntry / clearLog / setCombatRecord actions
  db/
    db.ts                         # Dexie schema — 13 tables, TypeScript interfaces
    seed.ts                       # seedDefaults() — component catalogs + 3 default bots + default lists/maps
  utils/                          # Combat engine + game logic (plain JS)
    Combat.js                     # Battle simulation — fully wired into CombatScreen
    Profiles.js                   # Auth / profile CRUD (SHA-256 hashing, wired into SplashScreen + CreateProfileScreen)
    Animation.js                  # Animation hooks (placeholder stubs — not yet wired in)
  screens/
    SplashScreen.tsx              # Login — calls ATTEMPT_LOGIN from Profiles.js; navigates to /navigation on success
    CreateProfileScreen.tsx       # Create user profile — calls CREATE_PROFILE from Profiles.js
    InstructionsScreen.tsx        # Scrollable rules (48 rules)
    NavigationScreen.tsx          # Hub with 6 nav buttons
    BotWorkshopScreen.tsx         # Design individual bots — reads/writes db
    ArmyWorkshopScreen.tsx        # Assemble 20-bot armies — reads/writes db; enforces 20-bot limit
    OrdersListWorkshopScreen.tsx  # Program bot command sequences — reads/writes db
    TargetingMapWorkshopScreen.tsx # Set targeting priorities (7x7 grid) — writes db
    CombatScreen.tsx              # Pick armies, set limits, calls BEGIN_COMBAT, dispatches setCombatRecord
    ResultsScreen.tsx             # Battle log display — reads combatRecord from Redux store
public/
  Graphics/                       # 116 PNG/PSD sprite assets — served at /Graphics/*
```

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

## Data Layer (`src/db/`)

`db.ts` declares `BotWarsDB extends Dexie` (database name `BotWarsDB`, schema **version 4**) with 13 tables:

- **Player content:** `bots`, `armies`, `orderLists`, `targetMaps`, `profiles`
- **Component catalogs** (seeded reference data): `botFrames`, `botEngines`, `botComputers`, `botArmors`, `botSensors`, `botMasters`, `botSecondaries`, `botBombs`

Most tables key off an auto-increment `id` with a unique `&name` index. TypeScript interfaces for every table live alongside the schema in `db.ts`.

`seed.ts` exposes `seedDefaults()`, which is **idempotent** (bails out if `bots` already has rows). It seeds all 8 component catalogs (9 entries each) plus three default bots (Small/Medium/Large), three default orders lists (5/15/25 commands), and three default targeting maps (ranges 1–3). It is called once from `main.tsx` at app startup.

**Important:** a `Bot` row stores each component as the **full description string** (e.g. `"Micro-bot = BF 10 slots, 10 ND, 130 weight, 100 cost."`), not a foreign key. Stat extraction uses regex helpers (`extractND`, `extractAD`, `extractSlots`, `extractPO`, etc.) defined at the top of `Combat.js`.

## Game Concepts

**Bots** are built from components that consume Slots, Weight, Gold, and Power:
- **Frame** — size (Micro to Titan, 10–90 slots); provides baseline ND (Natural Defense)
- **Engine** — power output (Gnat to Nova, 1000–9000 PO); determines movement speed (`Math.ceil(PO/3000)`)
- **Computer** — command capacity (5–45 CI = Command Instructions)
- **Armor** — defense rating (50–450 AD)
- **Targeting Sensor** — range 1–3, identifies up to 5 targets
- **Weapon Master** — primary weapon (WD + WR)
- **Weapon Secondary / Bomb** — optional

**Orders Lists** are sequences of command strings assigned to a bot. The engine matches on exact command text:
- Movement: Move Forward 1–5, Move Backward 1–3, Turn Left/Right, Veer Left/Right, Angle Right, Move toward located Enemy
- Combat: Fire Master Weapon, Fire Secondary Weapon, Fire All, Activate Self-Destruct
- Conditionals: If Any Enemies in Range, If Movement Blocked by Enemy/Ally, If Your Armor is Below X, If Facing Off-Map
- Setup: Activate Targeting Map

**Targeting Maps** are 7×7 grids defining which cells to prioritize when firing. Range (1–3) determines which outer cells are active.

**Armies** store an ordered `botIds` array (exactly 20 bots).

**Combat** is turn-based. Bot turn order is randomized at battle start. The army that acts first is placed on the left side of the map facing East; the second army is placed on the right facing West.

**Victory conditions:**
- Last army standing — detected after each individual bot's turn
- If 50 consecutive full rounds pass with no damage: the army with more surviving bots wins; on a bot-count tie the army with higher total remaining HP is the Marginal Winner; equal bots and HP is a Draw; 0 bots on both sides is Both Armies Lose

## Combat Engine (`src/utils/Combat.js`)

Call flow from the UI:

```
CombatScreen.simulateCombat()
  → BEGIN_COMBAT(army1Id, army2Id, settings)
      → CREATE_ALL_BOTS_IN_COMBAT_LIST(bots1, bots2)  # randomize order; assign combatBotNumber
      → MAIN_COMBAT_LOOP(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD)
          → buildBotStatsMap()                          # sync — regex stat extractors, no DB calls
          → STARTING_MAP_SQUARES()                      # places bots; first-turn army = left/East
          → loadAllOrdersLists()                        # load unique ordersListIds from DB
          → round loop (max 200):
              → EXECUTE_ORDERS_LIST() per living bot
                  → movement: CURRENT_MOVE_BOT1 / CURRENT_MOVE_BACKWARD / CURRENT_TURN_* / CURRENT_VEER_*
                  → fire: fireMasterWeapon / fireSecondaryWeapon (acquired target or forward scan)
                  → conditionals: scanForEnemies, armor check, facing check, block check
                  → kills immediately added to deadBotIds Set
              → checkWinCondition() after each bot's turn  # breaks inner loop on army wipeout
              → after full round: noRecentDamageRounds++; resolveDraw() at 50
```

**Map model:** the battlefield is a 10×10 grid (100 cells) represented as five flat, 0-based index-aligned arrays:
`BASIC_MAP_NUMBERS`, `GAME_MAP_BOTS` (bot id or `"0"`), `GAME_MAP_FACING` (compass direction or `"0"`), `GAME_MAP_BULLETS`, `GAME_MAP_DAMAGE` (current HP as string). Index `i` refers to the same cell in every array. Movement swaps entries between cells. Destruction zeroes all three bot arrays for the cell.

**Direction system:** 8-direction (N, NE, E, SE, S, SW, W, NW). Lookup tables `TURN_RIGHT_MAP`, `TURN_LEFT_MAP`, `VEER_RIGHT_MAP`, `VEER_LEFT_MAP` define rotation. `DIR_OFFSET` maps direction → index delta on the 100-cell flat array. `isValidMove(fromIndex, toIndex)` guards column-wrap at grid edges.

**Acquired targets:** `Activate Targeting Map` calls `scanForEnemies` (Chebyshev distance within sensor range) and stores result indices in `acquiredTargetsMap[botId]`. Fire commands use those as guided targets, with fallback to forward scan if the target is gone or out of range. Unguided forward fire hits the first bot regardless of army (friendly fire). Acquired targets are cleared at the end of each bot's turn.

**Destroyed bots:** `applyWeaponHit` zeros all three bot map arrays when HP ≤ 0 and returns the dead bot's ID in `newDeadBots`. The caller immediately adds it to `deadBotIds` (a `Set`), so subsequent targeting scans (which read `GAME_MAP_BOTS`) won't find the cleared cell, and future turns skip the bot entirely.

**`COMBAT_RECORD`** is an array of log strings + one settings-header object. Dispatched to Redux via `setCombatRecord` after battle, then read by `ResultsScreen` via `useSelector`.

**`CHECK_BOT_TOTALS(frame, engine, ...)`** is exported for `BotWorkshopScreen.calcBotTotals`. It uses the regex stat extractors to compute `slotsDisplay`, `slotsColor`, `totalWeight`, `totalGold`, `totalPower`, and `move` from component description strings.

## Redux State (`src/store/battleLogSlice.ts`)

```typescript
interface BattleLogState {
  log: string[];          // addLogEntry / clearLog
  combatRecord: object[]; // setCombatRecord — full battle transcript (log strings + settings header)
}
```

`CombatScreen` dispatches `clearLog` + `addLogEntry` + `setCombatRecord` after `BEGIN_COMBAT`.
`ResultsScreen` reads both via `useSelector`.

## Authentication (`src/utils/Profiles.js`)

`ATTEMPT_LOGIN(username, password)` and `CREATE_PROFILE(name, email, password)` are implemented with SHA-256 via Web Crypto API and persisted to the `profiles` Dexie table. `SplashScreen` calls `ATTEMPT_LOGIN`; `CreateProfileScreen` calls `CREATE_PROFILE`.

## Key Implementation Patterns

**Screen components** manage their own form state via `useState`, then persist through Dexie. The Bot/Army/Orders/Targeting workshops load existing rows on mount and upsert on save (`.where("name").equals(name).first()` then `.update()` or `.add()`).

**Dropdown rendering** uses a shared `renderDropdown()` helper defined inside each screen with consistent MUI `Select` + `MenuItem` styling.

**Stat extraction** — component description strings are parsed with regex helpers (`extractND`, `extractAD`, `extractSlots`, `extractPO`, `extractWeight`, `extractCost`, `extractPC`, `extractWD`, `extractWR`, `extractSensorRange`, `extractSensorTargets`), all defined at the top of `Combat.js`. The UI (`BotWorkshopScreen` via `CHECK_BOT_TOTALS`) and the combat engine both use these — no DB catalog lookups during combat.

**Targeting map grid** uses a 7×7 button array. Center cell (3,3) is always "Bot". Clicking an empty cell stamps it with the next priority number. Range selector (1–3) disables outer rings.

## Graphics

Sprites live in `/Graphics/`. Naming convention:
- Bot sprites: `B_I_[BotType]_P[Player]_D[Direction].png` — 8 directions (N, NE, E, SE, S, SW, W, NW), 2 players
- Bullet sprites: `Bullet_All_D[Direction].png` — 8 directions

## Theme

Dark mode throughout: `#111` background, white Courier New text, dark blue (`#00008b`) buttons with 2px gray borders. Headers use Ebrima bold at 30pt. Defined in `src/theme.ts`.

## What Is Not Yet Built / Finished

- **Animation phase** — `Animation.js` is placeholder stubs only. The combat engine produces a full `COMBAT_RECORD` transcript designed to drive animation, but the rendering loop does not exist yet.
- **Targeting map grid in combat** — bots scan for enemies by Chebyshev distance; the 7×7 priority grid saved by the Targeting Map Workshop is not yet used to order targets.
- **Bomb weapons** — `botBombs` catalog and stat extraction (`extractBombWD1`/`extractBombWD2`) are implemented but `FIRE_BOMB_WEAPON` is not yet called from `EXECUTE_ORDERS_LIST`.
- **Profile stats** — `GET_USER_STATS` / `UPDATE_USER_STATS` in `Profiles.js` are implemented but not called after combat.
- **Data validation** — no slot/weight/power/army-size constraint checking in the UI workshops.
- **Multiplayer / networking**, sound, and persistence of battle outcomes.
