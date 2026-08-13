/**
 * Animation.js
 *
 * Handles visual animation tasks for BOT WARS.
 * These functions are placeholders for animation logic that can be triggered during combat.
 */

const CELL_SIZE = 40;
const CELL_GAP = 3;
const PADDING = 3;
const GRID_SIZE = 10;

// Vite replaces this with the configured base path (e.g. "/botwars/") at build/dev time.
// All public-folder asset paths must be prefixed with BASE, not hardcoded as "/Graphics/".
const BASE = import.meta.env.BASE_URL;

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.error(`[Animation] Failed to load image: ${src}`);
      resolve(null);
    };
    img.src = src;
  });
}

// ─── Audio (Web Audio API) ────────────────────────────────────────────────────
// Must be unlocked from a user gesture via SET_AUDIO_CONTEXT before any
// playSound call will produce output.

let _audioCtx = null;
const _bufferCache = {};

/**
 * SET_AUDIO_CONTEXT
 * Call this synchronously inside a click handler (before any await) to unlock
 * audio for the current page session.  Subsequent calls are no-ops.
 */
export function SET_AUDIO_CONTEXT(ctx) {
  if (_audioCtx) return;
  _audioCtx = ctx;
  for (const f of [
    '_GameStarts.wav', '_GameOver.wav', '_BotFires.wav',
    '_BotMoves.wav', '_BotVeers.wav', '_Explosion_x.wav', '_Scan4Enemies.wav',
  ]) _fetchSound(f);
}

async function _fetchSound(filename) {
  if (!_audioCtx || _bufferCache[filename]) return;
  try {
    const res = await fetch(`${BASE}Sounds/${filename}`);
    if (!res.ok) { console.warn(`[Audio] ${filename} → HTTP ${res.status}`); return; }
    const arr = await res.arrayBuffer();
    _bufferCache[filename] = await new Promise((resolve, reject) =>
      _audioCtx.decodeAudioData(arr, resolve, reject)
    );
    console.log(`[Audio] Loaded: ${filename}`);
  } catch (e) {
    console.warn(`[Audio] Could not load ${filename}:`, e);
  }
}

function playSound(filename) {
  const buf = _bufferCache[filename];
  if (!buf || !_audioCtx) return;
  try {
    const src = _audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(_audioCtx.destination);
    src.start(0);
  } catch {}
}

function cellXY(index) {
  const col = index % 10;
  const row = Math.floor(index / 10);
  return {
    x: PADDING + col * (CELL_SIZE + CELL_GAP),
    y: PADDING + row * (CELL_SIZE + CELL_GAP),
  };
}

function cellCenter(index) {
  const { x, y } = cellXY(index);
  return { x: x + CELL_SIZE / 2, y: y + CELL_SIZE / 2 };
}

// Returns the 8-direction compass string (N/NE/E/SE/S/SW/W/NW) for a bullet
// travelling from fromIndex to toIndex on the 10×10 grid.
function bulletDirection(fromIndex, toIndex) {
  const sx = Math.sign((toIndex % 10) - (fromIndex % 10));
  const sy = Math.sign(Math.floor(toIndex / 10) - Math.floor(fromIndex / 10));
  const TABLE = {
    '0,-1':'N', '1,-1':'NE', '1,0':'E',  '1,1':'SE',
    '0,1': 'S', '-1,1':'SW', '-1,0':'W', '-1,-1':'NW',
  };
  return TABLE[`${sx},${sy}`] || 'E';
}

// Slides a bullet sprite from the centre of fromIndex to the centre of toIndex
// over microDelayMs milliseconds using requestAnimationFrame.
// Restores the canvas to its pre-bullet state when done.
// No-ops when microDelayMs is 0.
async function animateBulletSlide(canvas, bulletSrc, fromIndex, toIndex) {
  if (microDelayMs === 0) return;

  const ctx = canvas.getContext('2d');
  const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const img = await loadImage(bulletSrc);
  if (!img) return;

  const fc  = cellCenter(fromIndex);
  const tc  = cellCenter(toIndex);
  const dur = microDelayMs;

  return new Promise(resolve => {
    const t0 = performance.now();

    function frame(now) {
      const t  = Math.min((now - t0) / dur, 1);
      const bx = fc.x + (tc.x - fc.x) * t;
      const by = fc.y + (tc.y - fc.y) * t;

      ctx.putImageData(snapshot, 0, 0);
      ctx.drawImage(img, bx - CELL_SIZE / 2, by - CELL_SIZE / 2, CELL_SIZE, CELL_SIZE);

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        ctx.putImageData(snapshot, 0, 0); // remove bullet; clean canvas
        resolve();
      }
    }

    requestAnimationFrame(frame);
  });
}

/**
 * DRAW_MAP_BACKGROUND
 * Fills all 100 game-map squares with the Empty_Green tile.
 */
export async function DRAW_MAP_BACKGROUND(canvas) {
  const ctx = canvas.getContext('2d');
  console.log('[Anim] DRAW_MAP_BACKGROUND — canvas:', canvas.width, 'x', canvas.height, 'ctx:', !!ctx);
  // Draw a solid dark rectangle first so we can tell if canvas drawing works at all
  if (ctx) { ctx.fillStyle = '#222'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  const img = await loadImage(`${BASE}Graphics/Empty_Green.png`);
  console.log('[Anim] Empty_Green.png loaded:', !!img);
  if (!img) return;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const x = PADDING + col * (CELL_SIZE + CELL_GAP);
      const y = PADDING + row * (CELL_SIZE + CELL_GAP);
      ctx.drawImage(img, x, y, CELL_SIZE, CELL_SIZE);
    }
  }
}

/**
 * DRAW_BOTS_ON_MAP
 * Draws each bot's sprite onto the canvas at its starting position.
 * Sprite filename: B_I_<botImage>_P<army>_D<facing>.png
 */
export async function DRAW_BOTS_ON_MAP(canvas, allBotsInCombatList, gameMapBots, gameMapFacing) {
  const ctx = canvas.getContext('2d');
  const occupied = gameMapBots.filter(b => b !== "0");
  console.log('[Anim] DRAW_BOTS_ON_MAP — occupied cells:', occupied.length,
              'bots in list:', allBotsInCombatList.length);
  const drawTasks = [];

  for (let i = 0; i < gameMapBots.length; i++) {
    const botId = gameMapBots[i];
    if (botId === "0") continue;

    const bot = allBotsInCombatList.find(b => String(b.combatBotNumber) === botId);
    if (!bot) {
      console.warn('[Anim] No bot found for cell', i, 'botId', botId,
                   'available:', allBotsInCombatList.map(b => b.combatBotNumber));
      continue;
    }

    const facing = gameMapFacing[i];
    const src = `${BASE}Graphics/B_I_${bot.botImage}_P${bot.army}_D${facing}.png`;
    console.log('[Anim] Loading sprite:', src);
    const { x, y } = cellXY(i);

    drawTasks.push(
      loadImage(src).then(img => {
        console.log('[Anim] Sprite', src, img ? 'OK' : 'FAILED');
        if (img) ctx.drawImage(img, x, y, CELL_SIZE, CELL_SIZE);
      })
    );
  }

  await Promise.all(drawTasks);
}

// ─── Timing ───────────────────────────────────────────────────────────────────

let microDelayMs = 200; // default 0.2 s
let macroDelayMs = 500; // default 0.5 s

/** SET_MICRO_DELAY — called by Combat Screen buttons to change the micro delay. */
export function SET_MICRO_DELAY(ms) { microDelayMs = ms; }

/** SET_MACRO_DELAY — called by Combat Screen buttons to change the macro delay. */
export function SET_MACRO_DELAY(ms) { macroDelayMs = ms; }

/** ANI_MICRO_DELAY — short pause between individual animation steps. */
export function ANI_MICRO_DELAY() {
  return new Promise(resolve => setTimeout(resolve, microDelayMs));
}

/** ANI_MACRO_DELAY — longer pause between major animation events. */
export function ANI_MACRO_DELAY() {
  return new Promise(resolve => setTimeout(resolve, macroDelayMs));
}

// ─── Flash overlays ───────────────────────────────────────────────────────────

/**
 * ANI_FLASH_OVERLAY
 * Snapshots a single grid cell, draws a semi-transparent flash image over that
 * cell only, waits ANI_MICRO_DELAY, then restores the original pixels.
 * cellIndex: 0-based grid index of the cell to flash.
 * filename:  one of DemiFlashWhite / DemiFlashDarkBlue / DemiFlashRed / DemiFlashYellow + ".png"
 */
export async function ANI_FLASH_OVERLAY(canvas, filename, cellIndex) {
  const ctx = canvas.getContext('2d');
  const { x, y } = cellXY(cellIndex);
  const snapshot = ctx.getImageData(x, y, CELL_SIZE, CELL_SIZE);

  const img = await loadImage(`${BASE}Graphics/${filename}`);
  if (img) {
    ctx.drawImage(img, x, y, CELL_SIZE, CELL_SIZE);
  }

  await ANI_MICRO_DELAY();
  ctx.putImageData(snapshot, x, y);
}

/**
 * ANI_FLASH_SEQUENCE
 * Runs several flash overlays in order over the same cell.
 * filenames: array of filenames, e.g. ["DemiFlashWhite.png", "DemiFlashRed.png"]
 */
export async function ANI_FLASH_SEQUENCE(canvas, filenames, cellIndex) {
  for (const filename of filenames) {
    await ANI_FLASH_OVERLAY(canvas, filename, cellIndex);
  }
}

// ─── Multi-cell helpers ───────────────────────────────────────────────────────

// Returns all valid grid indices within Chebyshev distance `range` of centerIndex,
// excluding the center cell itself.
function cellsInRange(centerIndex, range) {
  const cc = centerIndex % 10;
  const cr = Math.floor(centerIndex / 10);
  const cells = [];
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const dist = Math.max(Math.abs(col - cc), Math.abs(row - cr));
      if (dist > 0 && dist <= range) cells.push(row * 10 + col);
    }
  }
  return cells;
}

// Draws a flash image over multiple cells simultaneously, waits MICRO_DELAY, restores.
async function flashMultiCells(canvas, filename, cellIndices) {
  if (cellIndices.length === 0) return;
  const ctx = canvas.getContext('2d');
  const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const img = await loadImage(`${BASE}Graphics/${filename}`);
  if (img) {
    for (const idx of cellIndices) {
      const { x, y } = cellXY(idx);
      ctx.drawImage(img, x, y, CELL_SIZE, CELL_SIZE);
    }
  }
  await ANI_MICRO_DELAY();
  ctx.putImageData(snapshot, 0, 0);
}

// Draws small explosions on multiple cells simultaneously, waits MICRO_DELAY, restores.
async function smallExplosionMultiCells(canvas, cellIndices) {
  if (cellIndices.length === 0) return;
  const ctx = canvas.getContext('2d');
  const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (const idx of cellIndices) drawExplosionSmall(ctx, idx);
  await ANI_MICRO_DELAY();
  ctx.putImageData(snapshot, 0, 0);
}

// ─── Explosions ───────────────────────────────────────────────────────────────

function drawExplosionSmall(ctx, cellIndex) {
  const { x, y } = cellXY(cellIndex);
  const cx = x + CELL_SIZE / 2;
  const cy = y + CELL_SIZE / 2;
  const r = CELL_SIZE / 2;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0,    'rgba(255, 255, 180, 1)');
  g.addColorStop(0.35, 'rgba(255, 160, 0,   0.95)');
  g.addColorStop(0.7,  'rgba(200, 50,  0,   0.75)');
  g.addColorStop(1,    'rgba(80,  20,  0,   0)');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
}

function drawExplosionMedium(ctx, cellIndex) {
  const { x, y } = cellXY(cellIndex);
  const cx = x + CELL_SIZE / 2;
  const cy = y + CELL_SIZE / 2;
  const r = CELL_SIZE * 0.8;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0,    'rgba(255, 255, 255, 1)');
  g.addColorStop(0.15, 'rgba(255, 230, 80,  1)');
  g.addColorStop(0.4,  'rgba(255, 80,  0,   0.95)');
  g.addColorStop(0.75, 'rgba(160, 30,  0,   0.7)');
  g.addColorStop(1,    'rgba(40,  10,  0,   0)');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
}

function drawExplosionLarge(ctx, cellIndex) {
  const { x, y } = cellXY(cellIndex);
  const cx = x + CELL_SIZE / 2;
  const cy = y + CELL_SIZE / 2;

  // Outer halo — visually spills into neighbouring cells
  const outerR = CELL_SIZE * 1.3;
  const gOuter = ctx.createRadialGradient(cx, cy, CELL_SIZE * 0.4, cx, cy, outerR);
  gOuter.addColorStop(0,   'rgba(255, 120, 0, 0.7)');
  gOuter.addColorStop(0.6, 'rgba(180, 40,  0, 0.4)');
  gOuter.addColorStop(1,   'rgba(60,  10,  0, 0)');
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fillStyle = gOuter;
  ctx.fill();

  // Inner white-hot core
  const innerR = CELL_SIZE * 0.7;
  const gInner = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
  gInner.addColorStop(0,    'rgba(255, 255, 255, 1)');
  gInner.addColorStop(0.1,  'rgba(255, 240, 120, 1)');
  gInner.addColorStop(0.35, 'rgba(255, 100, 0,   0.97)');
  gInner.addColorStop(0.65, 'rgba(200, 40,  0,   0.85)');
  gInner.addColorStop(1,    'rgba(80,  15,  0,   0.4)');
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = gInner;
  ctx.fill();
}

/**
 * ANI_EXPLOSION_SMALL — weapon hit, target bot survives.
 * Snapshots the cell, draws an orange burst, waits MICRO_DELAY, restores original pixels.
 */
export async function ANI_EXPLOSION_SMALL(canvas, cellIndex) {
  const ctx = canvas.getContext('2d');
  const { x, y } = cellXY(cellIndex);
  const snapshot = ctx.getImageData(x, y, CELL_SIZE, CELL_SIZE);
  drawExplosionSmall(ctx, cellIndex);
  await ANI_MICRO_DELAY();
  ctx.putImageData(snapshot, x, y);
}

/**
 * ANI_EXPLOSION_MEDIUM — bot destroyed by weapon fire.
 * Snapshots full canvas, draws white-hot burst, waits MACRO_DELAY, restores.
 * Caller must draw Empty_Green at the cell afterwards to clear the destroyed bot.
 */
export async function ANI_EXPLOSION_MEDIUM(canvas, cellIndex) {
  const ctx = canvas.getContext('2d');
  const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  drawExplosionMedium(ctx, cellIndex);
  await ANI_MACRO_DELAY();
  ctx.putImageData(snapshot, 0, 0);
}

/**
 * ANI_EXPLOSION_LARGE — self-destruct.
 * Snapshots full canvas, draws multi-ring inferno (spills into neighbouring cells),
 * waits MACRO_DELAY, restores. Caller must draw Empty_Green at the cell afterwards.
 */
export async function ANI_EXPLOSION_LARGE(canvas, cellIndex) {
  const ctx = canvas.getContext('2d');
  const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  drawExplosionLarge(ctx, cellIndex);
  await ANI_MACRO_DELAY();
  ctx.putImageData(snapshot, 0, 0);
}

// ─── BEGIN_ANIMATION ──────────────────────────────────────────────────────────

/**
 * BEGIN_ANIMATION
 * Draws the map background, then overlays bot sprites if mapState is provided.
 * mapState: { allBotsInCombatList, gameMapBots, gameMapFacing }
 */
export async function BEGIN_ANIMATION(canvas, mapState = null) {
  await DRAW_MAP_BACKGROUND(canvas);
  if (mapState) {
    await DRAW_BOTS_ON_MAP(
      canvas,
      mapState.allBotsInCombatList,
      mapState.gameMapBots,
      mapState.gameMapFacing
    );
  }
}

// ─── Combat record replay ─────────────────────────────────────────────────────

// Matches: [INFO] Bot 3 (army 1, "MyBot") begins turn on space 14
// Group 1 = space number (1-based)
const BEGINS_TURN_RE = /^\[INFO\] Bot \d+ \(army \d+, ".+"\) begins turn on space (\d+)/;

// Matches: "Bot N on space N facing E: movement blocked (off map)."
// Group 1 = bot's space (1-based) — checked BEFORE MOVEMENT_BLOCKED_RE
const OFF_MAP_BLOCKED_RE = /^Bot \d+ on space (\d+).*movement blocked \(off map\)/;

// Matches the remaining movement-blocked variants — group 1 = bot's space (1-based):
//   Bot N on space N facing E: movement blocked (space N occupied).
//   Bot N on space N: backward movement blocked.
const MOVEMENT_BLOCKED_RE = /^Bot \d+ on space (\d+).*movement blocked/;

// Matches forward and backward movement:
//   "Move Bot 2 from space 9 to 8 facing W."
//   "Move Bot 2 backward from space 8 to 9 facing W."
const MOVE_BOT_RE = /^Move Bot (\d+)(?: backward)? from space (\d+) to (\d+) facing (\w+)\./;

// Matches all four rotation variants (Rotate/Veer × right/left):
//   Rotate Bot 1 right to face S on space 1.
//   Rotate Bot 1 left  to face N on space 1.
//   Veer Bot 3 right to face NE on space 7.
//   Veer Bot 3 left  to face NW on space 7.
const ROTATE_BOT_RE = /^(?:Rotate|Veer) Bot (\d+) (?:right|left) to face (\w+) on space (\d+)\./;

// Matches both targeting-map variants:
//   "Bot N on space N activates targeting map — no targets found in range N."
//   "Bot N on space N activates targeting map — N target(s) acquired in range N at space(s): N."
// Group 1 = bot's space (1-based)
const TARGETING_MAP_RE = /^Bot \d+ on space (\d+) activates targeting map/;

// Matches any weapon hit: "Fired Master from space 5 and hit space 9 for ..."
//   also: "Fired Self-Destruct blast (1 space) from space 5 and hit space 4 for ..."
// Group 1 = from space, Group 2 = target space (both 1-based)
const HIT_TARGET_RE = /^Fired .+? from space (\d+) and hit space (\d+) for/;

// Matches: "Bot 3 on space 9 is destroyed!"
// Group 1 = space (1-based)
const BOT_DESTROYED_RE = /^Bot \d+ on space (\d+) is destroyed!/;

// Matches: "Bot N activates self-destruct on space M!"
// Group 1 = bot's space (1-based)
const SELF_DESTRUCT_RE = /^Bot \d+ activates self-destruct on space (\d+)!/;

// Matches: "Bot N is destroyed by self-destruct!" — no space number, handled via SELF_DESTRUCT_RE
// (kept here only to document the format; not used for animation — SELF_DESTRUCT_RE clears the cell)
const SELF_DESTRUCT_DEATH_RE = /^Bot \d+ is destroyed by self-destruct!/;

// Draw any sprite image centred on a grid cell (0-based index).
async function drawSpriteAtCell(ctx, src, index) {
  const img = await loadImage(src);
  if (!img) return;
  const { x, y } = cellXY(index);
  ctx.drawImage(img, x, y, CELL_SIZE, CELL_SIZE);
}

/**
 * REPLAY_COMBAT_RECORD
 * Draws the initial map state, then walks the combat record line by line and
 * fires the appropriate canvas animation for each recognised event.
 *   "begins turn"      → yellow flash    — marks the active bot's turn
 *   "movement blocked (off map)"    → red flash       — bot tried to walk off the grid
 *   "movement blocked (occupied)"  → dark-blue flash — bot's path blocked by another bot
 *   "Move Bot …"       → white flash, bot sprite at new cell, Empty_Green at old cell (no delay)
 *   "Rotate/Veer Bot…" → white flash, updated bot sprite at same cell
 *   "activates targeting map" → white flash on scanner bot's cell (no delay)
 *   "hit space …"      → white flash (shooter), red flash (target), bullet slides across, small explosion
 *   "is destroyed!"    → medium explosion (white-hot), then Empty_Green clears cell
 *   "self-destruct…"   → white flash (scanner), red blast radius, white on nearby bots,
 *                        large explosion + Empty_Green, small explosions on nearby bots
 */
export async function REPLAY_COMBAT_RECORD(canvas, combatRecord, mapState, onEntry = null) {
  await BEGIN_ANIMATION(canvas, mapState);
  playSound('_GameStarts.wav');

  const ctx = canvas.getContext('2d');

  for (const entry of combatRecord) {
    if (onEntry) onEntry(entry);
    if (typeof entry !== 'string') continue;

    if (BEGINS_TURN_RE.test(entry)) {
      const m = entry.match(BEGINS_TURN_RE);
      const cellIdx = parseInt(m[1]) - 1;
      await ANI_FLASH_OVERLAY(canvas, 'DemiFlashYellow.png', cellIdx);

    } else if (OFF_MAP_BLOCKED_RE.test(entry)) {
      const m = entry.match(OFF_MAP_BLOCKED_RE);
      const cellIdx = parseInt(m[1]) - 1;
      await ANI_FLASH_OVERLAY(canvas, 'DemiFlashRed.png', cellIdx);

    } else if (MOVEMENT_BLOCKED_RE.test(entry)) {
      const m = entry.match(MOVEMENT_BLOCKED_RE);
      const cellIdx = parseInt(m[1]) - 1;
      await ANI_FLASH_OVERLAY(canvas, 'DemiFlashDarkBlue.png', cellIdx);

    } else if (MOVE_BOT_RE.test(entry)) {
      const m       = entry.match(MOVE_BOT_RE);
      const botId   = m[1];
      const fromIdx = parseInt(m[2]) - 1;   // 1-based → 0-based
      const toIdx   = parseInt(m[3]) - 1;
      const facing  = m[4];

      const bot = mapState.allBotsInCombatList.find(
        b => String(b.combatBotNumber) === botId
      );
      if (!bot) continue;

      playSound('_BotMoves.wav');
      // 1. White flash on the from-cell — announces movement
      await ANI_FLASH_OVERLAY(canvas, 'DemiFlashWhite.png', fromIdx);

      // 2. Draw bot sprite at new location
      await drawSpriteAtCell(
        ctx,
        `${BASE}Graphics/B_I_${bot.botImage}_P${bot.army}_D${facing}.png`,
        toIdx
      );

      // 3. Replace old location with empty tile — no delay
      await drawSpriteAtCell(ctx, `${BASE}Graphics/Empty_Green.png`, fromIdx);

    } else if (ROTATE_BOT_RE.test(entry)) {
      const m       = entry.match(ROTATE_BOT_RE);
      const botId   = m[1];
      const newDir  = m[2];
      const cellIdx = parseInt(m[3]) - 1;   // 1-based → 0-based

      const bot = mapState.allBotsInCombatList.find(
        b => String(b.combatBotNumber) === botId
      );
      if (!bot) continue;

      playSound('_BotVeers.wav');
      // 1. White flash on the bot's cell — announces rotation
      await ANI_FLASH_OVERLAY(canvas, 'DemiFlashWhite.png', cellIdx);

      // 2. Overwrite bot sprite at same cell with new facing direction — no delay
      await drawSpriteAtCell(
        ctx,
        `${BASE}Graphics/B_I_${bot.botImage}_P${bot.army}_D${newDir}.png`,
        cellIdx
      );

    } else if (TARGETING_MAP_RE.test(entry)) {
      const m = entry.match(TARGETING_MAP_RE);
      const cellIdx = parseInt(m[1]) - 1;
      playSound('_Scan4Enemies.wav');
      await ANI_FLASH_OVERLAY(canvas, 'DemiFlashWhite.png', cellIdx);

    } else if (HIT_TARGET_RE.test(entry)) {
      const m       = entry.match(HIT_TARGET_RE);
      const fromIdx = parseInt(m[1]) - 1;
      const toIdx   = parseInt(m[2]) - 1;
      const dir     = bulletDirection(fromIdx, toIdx);

      playSound('_BotFires.wav');
      // 1. White flash on shooter — weapon fired
      await ANI_FLASH_OVERLAY(canvas, 'DemiFlashWhite.png', fromIdx);
      // 2. Red flash on target — hit confirmed
      await ANI_FLASH_OVERLAY(canvas, 'DemiFlashRed.png', toIdx);
      // 3. Bullet slides from shooter to target
      await animateBulletSlide(canvas, `${BASE}Graphics/Bullet_All_D${dir}.png`, fromIdx, toIdx);
      // 4. Small explosion at target
      playSound('_Explosion_x.wav');
      await ANI_EXPLOSION_SMALL(canvas, toIdx);

    } else if (BOT_DESTROYED_RE.test(entry)) {
      const m = entry.match(BOT_DESTROYED_RE);
      const cellIdx = parseInt(m[1]) - 1;
      playSound('_Explosion_x.wav');
      await ANI_EXPLOSION_MEDIUM(canvas, cellIdx);
      await drawSpriteAtCell(ctx, `${BASE}Graphics/Empty_Green.png`, cellIdx);

    } else if (SELF_DESTRUCT_RE.test(entry)) {
      const m         = entry.match(SELF_DESTRUCT_RE);
      const cellIdx   = parseInt(m[1]) - 1;
      const rangeIdxs = cellsInRange(cellIdx, 2);

      // 1. White flash on self-destructing bot — announces activation
      await ANI_FLASH_OVERLAY(canvas, 'DemiFlashWhite.png', cellIdx);
      // 2. Red flash across entire blast radius (range 2)
      await flashMultiCells(canvas, 'DemiFlashRed.png', rangeIdxs);
      // 3. Large explosion + clear cell
      playSound('_Explosion_x.wav');
      await ANI_EXPLOSION_LARGE(canvas, cellIdx);
      await drawSpriteAtCell(ctx, `${BASE}Graphics/Empty_Green.png`, cellIdx);
      // Nearby bots destroyed by blast get their own "is destroyed!" log lines
      // handled by BOT_DESTROYED_RE as the replay continues.

    } else if (SELF_DESTRUCT_DEATH_RE.test(entry)) {
      // "Bot N is destroyed by self-destruct!" — no space number; cell already cleared above.

    }
  }

  playSound('_GameOver.wav');
}
	

/// JavaScript
//var MyImage = "/Graphics/Bullet_All_DE.png"; // changes often!
//const img = document.getElementById('MyImage');
//const xPosition = 150; // X coordinate in pixels
//const yPosition = 200; // Y coordinate in pixels
//img.style.left = xPosition + 'px';
//img.style.top = yPosition + 'px';
//img.style.display = 'block';

////// sprite graphics 
/*
*
*  FILES:
C:\JayPalmer\Games\bot-wars\Graphics
Bullet_All_DE.png
Bullet_All_DN.png
Bullet_All_DNE.png
Bullet_All_DNW.png
Bullet_All_DS.png
Bullet_All_DSE.png
Bullet_All_DSW.png
Bullet_All_DW.png
B_I_BigBot_P1_DE.png
B_I_BigBot_P1_DN.png
B_I_BigBot_P1_DNE.png
B_I_BigBot_P1_DNW.png
B_I_BigBot_P1_DS.png
B_I_BigBot_P1_DSE.png
B_I_BigBot_P1_DSW.png
B_I_BigBot_P1_DW.png
B_I_BigBot_P2_DE.png
B_I_BigBot_P2_DN.png
B_I_BigBot_P2_DNE.png
B_I_BigBot_P2_DNW.png
B_I_BigBot_P2_DS.png
B_I_BigBot_P2_DSE.png
B_I_BigBot_P2_DSW.png
B_I_BigBot_P2_DW.png
B_I_LargeBomb_P1_DE.png
B_I_LargeBomb_P1_DN.png
B_I_LargeBomb_P1_DNE.png
B_I_LargeBomb_P1_DNW.png
B_I_LargeBomb_P1_DS.png
B_I_LargeBomb_P1_DSE.png
B_I_LargeBomb_P1_DSW.png
B_I_LargeBomb_P1_DW.png
B_I_LargeBomb_P2_DE.png
B_I_LargeBomb_P2_DN.png
B_I_LargeBomb_P2_DNE.png
B_I_LargeBomb_P2_DNW.png
B_I_LargeBomb_P2_DS.png
B_I_LargeBomb_P2_DSE.png
B_I_LargeBomb_P2_DSW.png
B_I_LargeBomb_P2_DW.png
B_I_LargeShootingBomb_P1_DE.png
B_I_LargeShootingBomb_P1_DN.png
B_I_LargeShootingBomb_P1_DNE.png
B_I_LargeShootingBomb_P1_DNW.png
B_I_LargeShootingBomb_P1_DS.png
B_I_LargeShootingBomb_P1_DSE.png
B_I_LargeShootingBomb_P1_DSW.png
B_I_LargeShootingBomb_P1_DW.png
B_I_LargeShootingBomb_P2_DE.png
B_I_LargeShootingBomb_P2_DN.png
B_I_LargeShootingBomb_P2_DNE.png
B_I_LargeShootingBomb_P2_DNW.png
B_I_LargeShootingBomb_P2_DS.png
B_I_LargeShootingBomb_P2_DSE.png
B_I_LargeShootingBomb_P2_DSW.png
B_I_LargeShootingBomb_P2_DW.png
B_I_MedBigBot_P1_DE.png
B_I_MedBigBot_P1_DN.png
B_I_MedBigBot_P1_DNE.png
B_I_MedBigBot_P1_DNW.png
B_I_MedBigBot_P1_DS.png
B_I_MedBigBot_P1_DSE.png
B_I_MedBigBot_P1_DSW.png
B_I_MedBigBot_P1_DW.png
B_I_MedBigBot_P2_DE.png
B_I_MedBigBot_P2_DN.png
B_I_MedBigBot_P2_DNE.png
B_I_MedBigBot_P2_DNW.png
B_I_MedBigBot_P2_DS.png
B_I_MedBigBot_P2_DSE.png
B_I_MedBigBot_P2_DSW.png
B_I_MedBigBot_P2_DW.png
B_I_MedBot_P1_DE.png
B_I_MedBot_P1_DN.png
B_I_MedBot_P1_DNE.png
B_I_MedBot_P1_DNW.png
B_I_MedBot_P1_DS.png
B_I_MedBot_P1_DSE.png
B_I_MedBot_P1_DSW.png
B_I_MedBot_P1_DW.png
B_I_MedBot_P2_DE.png
B_I_MedBot_P2_DN.png
B_I_MedBot_P2_DNE.png
B_I_MedBot_P2_DNW.png
B_I_MedBot_P2_DS.png
B_I_MedBot_P2_DSE.png
B_I_MedBot_P2_DSW.png
B_I_MedBot_P2_DW.png
B_I_SmallBot_P1_DE.png
B_I_SmallBot_P1_DN.png
B_I_SmallBot_P1_DNE.png
B_I_SmallBot_P1_DNW.png
B_I_SmallBot_P1_DS.png
B_I_SmallBot_P1_DSE.png
B_I_SmallBot_P1_DSW.png
B_I_SmallBot_P1_DW.png
B_I_SmallBot_P2_DE.png
B_I_SmallBot_P2_DN.png
B_I_SmallBot_P2_DNE.png
B_I_SmallBot_P2_DNW.png
B_I_SmallBot_P2_DS.png
B_I_SmallBot_P2_DSE.png
B_I_SmallBot_P2_DSW.png
B_I_SmallBot_P2_DW.png
B_I_SmallMedBot_P1_DN.png
B_I_SmallShootingBomb_P1_DW.png
B_I_SmallShootingBomb_P2_DW.png
ComBatMapCover.png
ComBatMapCover1.png
ComBatMapCover2.png
ComBatMapCover3.png
Empty_Green.png

*
*    { GAME MAP }
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 40px)",
            gridTemplateRows: "repeat(10, 40px)",
            gap: "3px",
            border: "2px solid gray",
            padding: "3px",
            bgcolor: "#222",
          }}
*/


// On the COMBAT SCREEN, there is a GAME MAP of 100 squares, aranged in a 10 x 10 grid. Each is 40 px tall and 40 px wide, with a gap of 3 px between them. In the Graphics folder are many .png files including the file "Empty_Green.png". Using sprite graphics, from Animation.js, cover each of those 100 squares with the image "Empty_Green.png".

/**
 * ANI_PLACE_BOTS
 * Place bots on the battlefield before combat begins.
 */
export function ANI_PLACE_BOTS(botList) {
  console.log("ANI_PLACE_BOTS called", botList);
}

/**
 * ANI_START_BOT
 * Start the animation for a single bot entering combat.
 */
export function ANI_START_BOT(bot) {
  console.log("ANI_START_BOT called", bot);
}

/**
 * ANI_DETECT_ALLIED_BOTS
 * Animate allied bot detection or awareness.
 */
export function ANI_DETECT_ALLIED_BOTS(bot, allies) {
  console.log("ANI_DETECT_ALLIED_BOTS called", bot, allies);
}

/**
 * ANI_DETECT_ENEMY_BOTS
 * Animate enemy detection.
 */
export function ANI_DETECT_ENEMY_BOTS(bot, enemies) {
  console.log("ANI_DETECT_ENEMY_BOTS called", bot, enemies);
}

/**
 * ANI_MOVE_BOTS
 * Animate movement of multiple bots.
 */
export function ANI_MOVE_BOTS(botMoves) {
  console.log("ANI_MOVE_BOTS called", botMoves);
}

/**
 * ANI_ROTATE_BOTS
 * Animate bot rotation.
 */
export function ANI_ROTATE_BOTS(botRotations) {
  console.log("ANI_ROTATE_BOTS called", botRotations);
}

/**
 * ANI_IDENTIFY_IMAGE
 * Animate identification of a bot image.
 */
export function ANI_IDENTIFY_IMAGE(bot) {
  console.log("ANI_IDENTIFY_IMAGE called", bot);
}

/**
 * ANI_IDENTIFY_BULLET
 * Animate a bullet creation or identification effect.
 */
export function ANI_IDENTIFY_BULLET(bullet) {
  console.log("ANI_IDENTIFY_BULLET called", bullet);
}

/**
 * ANI_FIRE_WEAPONS
 * Animate weapon fire.
 */
export function ANI_FIRE_WEAPONS(attacker, target, weapon) {
  console.log("ANI_FIRE_WEAPONS called", attacker, target, weapon);
}

/**
 * ANI_REMOVE_DESTROYED
 * Animate bot removal after destruction.
 */
export function ANI_REMOVE_DESTROYED(bot) {
  console.log("ANI_REMOVE_DESTROYED called", bot);
}

/**
 * ANI_ACTIVATE_SELF_DESTRUCT
 * Animate self-destruct activation.
 */
export function ANI_ACTIVATE_SELF_DESTRUCT(bot) {
  console.log("ANI_ACTIVATE_SELF_DESTRUCT called", bot);
}

/**
 * ANI_ACTIVATE_SCANNER
 * Animate scanner activation.
 */
export function ANI_ACTIVATE_SCANNER(bot) {
  console.log("ANI_ACTIVATE_SCANNER called", bot);
}

/**
 * ANI_DETECT_BLOCKING
 * Animate detection of blockages or obstacles.
 */
export function ANI_DETECT_BLOCKING(bot, blockage) {
  console.log("ANI_DETECT_BLOCKING called", bot, blockage);
}

/**
 * ANI_BULLET_TRAVELLING
 * Animate a bullet moving through space.
 */
export function ANI_BULLET_TRAVELLING(bullet, path) {
  console.log("ANI_BULLET_TRAVELLING called", bullet, path);
}

/**
 * ANI_BULLET_STRIKING
 * Animate bullet impact on a target.
 */
export function ANI_BULLET_STRIKING(bullet, target) {
  console.log("ANI_BULLET_STRIKING called", bullet, target);
}

/**
 * ANI_RECORD_RESULTS
 * Animate the presentation of battle results.
 */
export function ANI_RECORD_RESULTS(results) {
  console.log("ANI_RECORD_RESULTS called", results);
}
