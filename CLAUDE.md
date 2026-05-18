# BOT WARS — Codebase Guide

## What This Is

BOT WARS is a turn-based tactical combat simulation browser game. Players design bots, assemble 20-bot armies, program combat orders, configure targeting maps, then pit two armies against each other in battle. Created by Jay Palmer (JayPalmerBooks.com).

The project is currently a **UI prototype shell** — all screens and navigation are implemented, but the combat engine, data persistence, and authentication are not yet built.

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 8 |
| UI Components | Material-UI (MUI) 5 |
| Routing | React Router DOM 6 |
| State (stubbed) | Redux Toolkit (configured but unused) |
| Styling | MUI `sx` prop + custom dark theme |

## Dev Commands

```
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview built app
```

## Project Structure

```
src/
  main.tsx                        # React entry point
  App.tsx                         # Router with all 10 routes
  theme.ts                        # Global MUI dark theme
  store/store.ts                  # Redux store (empty, unused)
  screens/
    SplashScreen.tsx              # Login / main menu
    CreateProfileScreen.tsx       # Create user profile
    InstructionsScreen.tsx        # Scrollable rules (48 rules)
    NavigationScreen.tsx          # Hub with 6 nav buttons
    BotWorkshopScreen.tsx         # Design individual bots
    ArmyWorkshopScreen.tsx        # Assemble 20-bot armies
    OrdersListWorkshopScreen.tsx  # Program bot command sequences
    TargetingMapWorkshopScreen.tsx # Set targeting priorities (7x7 grid)
    CombatScreen.tsx              # Set combat limits, pick armies, launch battle
    ResultsScreen.tsx             # Battle log display (placeholder)
Graphics/                         # 116 PNG/PSD sprite assets
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

## Game Concepts

**Bots** are built from components that consume Slots, Weight, Gold, and Power:
- **Frame** — size (Micro to Titan, 10–90 slots)
- **Engine** — power output (Gnat to Nova, 1000–9000 PO)
- **Computer** — command capacity (5–45 CI = Command Instructions)
- **Armor** — defense rating (50–450 AD)
- **Targeting Sensor** — range 1–3, identifies up to 5 targets
- **Weapon Master** — primary weapon (10–90 WD)
- **Weapon Secondary / Bomb** — optional

**Orders Lists** are sequences of up to ~25 command types assigned to a bot:
- Movement: Forward 1–5, Backward 1–3, Turn Left/Right
- Combat: Fire Master/Secondary/All Weapons, Self-Destruct
- Conditionals: If Blocked, If Enemies in Range, If Armor Below X

**Targeting Maps** are 7×7 grids defining which cells to prioritize when firing. Range (1–3) determines which outer cells are active.

**Armies** are exactly 20 bots (any mix of designs).

**Combat** is turn-based, alternating armies. Victory = last army standing. Auto-loss if 50+ turns pass with no damage dealt.

## Key Implementation Patterns

**Screen components** are self-contained — each manages its own form state via `useState`. No screen reads from the Redux store yet.

**Validation** functions (`VERIFY_BOT_CHECK`, `VERIFY_ARMY_CHECK`, etc.) are stubs that always return success. Real validation is not implemented.

**Dropdown rendering** uses a shared `renderDropdown()` helper inside each screen with consistent MUI `Select` + `MenuItem` styling.

**Sensor stat parsing** uses regex to extract numeric values (slots, weight, gold cost, power cost) from the component description string displayed in the UI.

**Targeting map grid** uses a 7×7 button array. Center cell (3,3) is always "Bot". Clicking an empty cell stamps it with the next priority number. Already-numbered cells flash red. Range selector (1–3) disables outer rings.

## Graphics

Sprites live in `/Graphics/`. Naming convention:
- Bot sprites: `B_I_[BotType]_P[Player]_D[Direction].png` — 8 directions (N, NE, E, SE, S, SW, W, NW), 2 players
- Bullet sprites: `Bullet_All_D[Direction].png` — 8 directions

## Theme

Dark mode throughout: `#111` background, white Courier New text, dark blue (`#00008b`) buttons with 2px gray borders. Headers use Ebrima bold at 30pt. Defined in `src/theme.ts`.

## What Is Not Yet Built

- Combat simulation engine (no battle logic)
- Data persistence (no localStorage, IndexedDB, or backend)
- User authentication (login fields exist but do nothing)
- Data validation (all validators are stubs)
- Global state (Redux store is wired up but has no reducers or actions)
- Multiplayer / networking
- Results display (placeholder text only)

## Backup Files

`BotWorkshopScreen - Copy.tsx` and `BotWorkshopScreen - Copy (2).tsx` are old copies left in `src/screens/`. They are not imported anywhere and can be deleted.
