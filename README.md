# BOT WARS

A turn-based tactical combat simulation browser game. Players design bots, assemble 20-bot armies, program combat orders, and configure targeting maps — then pit two armies against each other in battle.

Created by Jay Palmer ([JayPalmerBooks.com](https://jaypalmerbooks.com)).

---

## Current Status

**UI prototype shell.** All 10 screens and navigation are implemented. The following are not yet built:

- Combat simulation engine (no battle logic)
- Data persistence (Dexie is installed but not wired up)
- User authentication (login fields exist but do nothing)
- Data validation (all validators are stubs returning success)
- Global state (Redux store scaffolding exists but has no reducers)
- Multiplayer / networking
- Results display (placeholder text only)

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 8 |
| UI Components | Material-UI (MUI) 5 |
| Routing | React Router DOM 6 |
| DB (stubbed) | Dexie (IndexedDB wrapper, installed but unused) |
| Styling | MUI `sx` prop + custom dark theme |

---

## Getting Started

```bash
npm install
npm run dev       # start dev server (http://localhost:5173)
npm run build     # production build
npm run preview   # preview production build locally
```

---

## Project Structure

```
src/
  main.tsx                          # React entry point
  App.tsx                           # Router — all 10 routes
  theme.ts                          # Global MUI dark theme
  store/store.ts                    # Redux store scaffold (unused)
  screens/
    SplashScreen.tsx                # Login / main menu
    CreateProfileScreen.tsx         # Create user profile
    InstructionsScreen.tsx          # Scrollable rules (48 rules)
    NavigationScreen.tsx            # Hub with 6 nav buttons
    BotWorkshopScreen.tsx           # Design individual bots
    ArmyWorkshopScreen.tsx          # Assemble 20-bot armies
    OrdersListWorkshopScreen.tsx    # Program bot command sequences
    TargetingMapWorkshopScreen.tsx  # Set targeting priorities (7×7 grid)
    CombatScreen.tsx                # Set combat limits, pick armies, launch
    ResultsScreen.tsx               # Battle log display (placeholder)
Graphics/                           # 116 PNG/PSD sprite assets
```

> `BotWorkshopScreen - Copy.tsx` and `BotWorkshopScreen - Copy (2).tsx` are stale backup files not imported anywhere and can be deleted.

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
| **Frame** | Size class: Micro → Titan (10–90 slots) |
| **Engine** | Power output: Gnat → Nova (1,000–9,000 PO) |
| **Computer** | Command capacity: 5–45 CI (Command Instructions) |
| **Armor** | Defense rating: 50–450 AD |
| **Targeting Sensor** | Range 1–3; identifies up to 5 targets |
| **Weapon Master** | Primary weapon (10–90 WD) |
| **Weapon Secondary / Bomb** | Optional additional weapons |

### Orders Lists

Each bot runs a sequence of up to ~25 commands from its assigned Orders List:

- **Movement** — Forward 1–5, Backward 1–3, Turn Left/Right
- **Combat** — Fire Master/Secondary/All Weapons, Self-Destruct
- **Conditionals** — If Blocked, If Enemies in Range, If Armor Below X

### Targeting Maps

A 7×7 grid defining which cells to prioritize when firing. The center cell is always "Bot". Clicking an empty cell stamps the next priority number. Range (1–3) disables outer rings beyond sensor reach.

### Armies

Exactly 20 bots (any mix of designs) constitute an army.

### Combat Rules

- Turn-based, alternating armies
- Victory = last army standing
- Auto-loss if 50+ turns pass with no damage dealt

---

## Implementation Patterns

**Screen components** are self-contained — each manages its own form state via `useState`. No screen reads from the Redux store yet.

**Validation stubs** (`VERIFY_BOT_CHECK`, `VERIFY_ARMY_CHECK`, etc.) always return success. Real constraint checking is not implemented.

**Dropdowns** use a shared `renderDropdown()` helper inside each screen with consistent MUI `Select` + `MenuItem` styling.

**Sensor stat parsing** uses regex to extract numeric values (slots, weight, gold, power) from component description strings displayed in the UI.

---

## Theme

Dark mode throughout: `#111` background, white Courier New text, dark blue (`#00008b`) buttons with 2px gray borders. Headers use Ebrima bold at 30pt. Defined in `src/theme.ts`.

---

## Graphics

Sprites live in `/Graphics/`. Naming conventions:

- **Bot sprites** — `B_I_[BotType]_P[Player]_D[Direction].png` — 8 directions (N, NE, E, SE, S, SW, W, NW), 2 players
- **Bullet sprites** — `Bullet_All_D[Direction].png` — 8 directions
