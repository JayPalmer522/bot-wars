/**
 * Combat.js — Battle simulation engine for BOT WARS
 */
import { db } from "../db/db";

export let SHOW_COMBAT_RECORD = "TRUE";

// ─── Logging helpers ──────────────────────────────────────────────────────────

function logInfo(COMBAT_RECORD, msg) {
  const line = `[INFO] ${msg}`;
  console.log(line);
  if (COMBAT_RECORD) COMBAT_RECORD.push(line);
}

function logError(COMBAT_RECORD, msg, error) {
  const detail = error?.message ?? String(error ?? "");
  const line = `[ERROR] ${msg}${detail ? ": " + detail : ""}`;
  console.error(line, error ?? "");
  if (COMBAT_RECORD) COMBAT_RECORD.push(line);
}

// ─── Stat extractors ──────────────────────────────────────────────────────────

function extractComponentName(desc) {
  return desc?.split(" = ")[0]?.trim() || "";
}

function extractND(desc) {
  const m = desc?.match(/(\d+)\s+ND/);
  return m ? parseInt(m[1]) : 0;
}

function extractAD(desc) {
  const m = desc?.match(/(\d+)\s+AD/);
  return m ? parseInt(m[1]) : 0;
}

function extractSlots(desc) {
  const after = desc?.split(" = ")[1] || "";
  const m = after.match(/(\d+)\s+slots?/i);
  return m ? parseInt(m[1]) : 0;
}

function extractPO(desc) {
  const m = desc?.match(/(\d+)\s+PO/);
  return m ? parseInt(m[1]) : 0;
}

function extractWeight(desc) {
  const m = desc?.match(/(\d+)\s+weight/);
  return m ? parseInt(m[1]) : 0;
}

function extractCost(desc) {
  const m = desc?.match(/(\d+)\s+cost/);
  return m ? parseInt(m[1]) : 0;
}

function extractPC(desc) {
  const m = desc?.match(/(\d+)\s+PC/);
  return m ? parseInt(m[1]) : 0;
}

function extractWD(desc) {
  const m = desc?.match(/(\d+)\s+WD/);
  return m ? parseInt(m[1]) : 0;
}

function extractWR(desc) {
  const m = desc?.match(/(\d+)\s+WR/);
  return m ? parseInt(m[1]) : 0;
}

function extractBombWD1(desc) {
  const m = desc?.match(/(\d+),\d+\s+WD/);
  return m ? parseInt(m[1]) : 0;
}

function extractBombWD2(desc) {
  const m = desc?.match(/\d+,(\d+)\s+WD/);
  return m ? parseInt(m[1]) : 0;
}

function extractSensorRange(desc) {
  const m = desc?.match(/in\s+(\d+)\s+range/i);
  return m ? parseInt(m[1]) : 1;
}

function extractSensorTargets(desc) {
  const m = desc?.match(/(?:Max\s+(\d+)|(\d+)\s+Max)\s+targets?/i);
  return m ? parseInt(m[1] || m[2]) : 1;
}

// ─── Grid helpers ─────────────────────────────────────────────────────────────

// Direction offsets on 0-based 100-cell (10×10) index array
const DIR_OFFSET = {
  N: -10, NE: -9, E: 1,  SE: 11,
  S:  10, SW:  9, W: -1, NW: -11,
};

// 90° clockwise rotation
const TURN_RIGHT_MAP = {
  N: "E",  NE: "SE", E: "S",  SE: "SW",
  S: "W",  SW: "NW", W: "N",  NW: "NE",
};

// 90° counter-clockwise (cardinals 90° CCW; diagonals flip 180° — original game design)
const TURN_LEFT_MAP = {
  N: "W",  NE: "SW", E: "N",  SE: "NW",
  S: "E",  SW: "NE", W: "S",  NW: "SE",
};

// 45° clockwise
const VEER_RIGHT_MAP = {
  N: "NE", NE: "E",  E: "SE", SE: "S",
  S: "SW", SW: "W",  W: "NW", NW: "N",
};

// 45° counter-clockwise
const VEER_LEFT_MAP = {
  N: "NW", NW: "W",  W: "SW", SW: "S",
  S: "SE", SE: "E",  E: "NE", NE: "N",
};

// Returns true if moving from fromIndex to toIndex is within grid bounds (no column wrap)
function isValidMove(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= 100) return false;
  return Math.abs((fromIndex % 10) - (toIndex % 10)) <= 1;
}

// Find the 0-based index of a bot by its combatBotNumber string
function findBotIndex(GAME_MAP_BOTS, botId) {
  return GAME_MAP_BOTS.findIndex(cell => cell === String(botId));
}

// ─── CHECK_BOT_TOTALS (used by BotWorkshopScreen) ────────────────────────────

export function CHECK_BOT_TOTALS(frame, engine, computer, armor, sensor, weaponMaster, weaponSecondary, weaponBomb) {
  const frameCapacity = extractSlots(frame);

  const slotsUsed =
    extractSlots(engine) + extractSlots(computer) + extractSlots(armor) +
    extractSlots(sensor) + extractSlots(weaponMaster) +
    extractSlots(weaponSecondary) + extractSlots(weaponBomb);

  const totalWeight =
    extractWeight(frame) + extractWeight(engine) + extractWeight(computer) +
    extractWeight(armor) + extractWeight(sensor) + extractWeight(weaponMaster) +
    extractWeight(weaponSecondary) + extractWeight(weaponBomb);

  const totalGold =
    extractCost(frame) + extractCost(engine) + extractCost(computer) +
    extractCost(armor) + extractCost(sensor) + extractCost(weaponMaster) +
    extractCost(weaponSecondary) + extractCost(weaponBomb);

  const totalPower =
    extractPC(sensor) + extractPC(weaponMaster) + extractPC(weaponSecondary);

  const enginePO = extractPO(engine);
  // Engine tiers 1-3 → move 1, 4-6 → move 2, 7-9 → move 3
  const move = Math.ceil(enginePO / 3000);

  const slotsDisplay = `${slotsUsed}/${frameCapacity}`;
  const slotsColor = slotsUsed > frameCapacity ? "red" : "black";

  return {
    slotsDisplay,
    slotsColor,
    totalWeight: totalWeight.toString(),
    totalGold: totalGold.toString(),
    totalPower: totalPower.toString(),
    move: move.toString(),
  };
}

// ─── Combat stats lookup ──────────────────────────────────────────────────────

function buildBotStatsMap(ALL_BOTS_IN_COMBAT_LIST) {
  const map = {};
  for (const bot of ALL_BOTS_IN_COMBAT_LIST) {
    map[bot.combatBotNumber] = {
      armor:         extractND(bot.frame) + extractAD(bot.armor),
      masterWD:      extractWD(bot.weaponMaster),
      masterWR:      extractWR(bot.weaponMaster),
      secondaryWD:   extractWD(bot.weaponSecondary),
      secondaryWR:   extractWR(bot.weaponSecondary),
      bombWD1:       extractBombWD1(bot.weaponBomb),
      bombWD2:       extractBombWD2(bot.weaponBomb),
      movement:      parseInt(bot.move) || 1,
      sensorRange:   extractSensorRange(bot.sensor),
      sensorTargets: extractSensorTargets(bot.sensor),
      army:          bot.army,
    };
  }
  return map;
}

// ─── Orders lists loader ──────────────────────────────────────────────────────

async function loadAllOrdersLists(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD) {
  const map = {};
  const seen = new Set();
  for (const bot of ALL_BOTS_IN_COMBAT_LIST) {
    const id = bot.ordersListId;
    if (id == null || seen.has(id)) continue;
    seen.add(id);
    try {
      const list = await db.orderLists.get(id);
      if (list) {
        map[id] = list;
        logInfo(COMBAT_RECORD, `Loaded orders list id=${id} "${list.name}" (${list.commands.length} commands)`);
      } else {
        logError(COMBAT_RECORD, `Orders list id=${id} not found in DB`);
      }
    } catch (error) {
      logError(COMBAT_RECORD, `Failed to load orders list id=${id}`, error);
    }
  }
  return map;
}

// ─── Win / draw resolution ────────────────────────────────────────────────────

function checkWinCondition(ALL_BOTS_IN_COMBAT_LIST, deadBotIds) {
  const army1Alive = ALL_BOTS_IN_COMBAT_LIST.filter(b => b.army === 1 && !deadBotIds.has(String(b.combatBotNumber)));
  const army2Alive = ALL_BOTS_IN_COMBAT_LIST.filter(b => b.army === 2 && !deadBotIds.has(String(b.combatBotNumber)));

  if (army1Alive.length === 0 && army2Alive.length === 0) {
    return { gameOver: true, message: "Both armies destroyed simultaneously — Both Armies Lose!" };
  }
  if (army1Alive.length === 0) {
    return { gameOver: true, message: `Victory to Army 2! Army 1 destroyed. Army 2 survivors: ${army2Alive.length} bot(s).` };
  }
  if (army2Alive.length === 0) {
    return { gameOver: true, message: `Victory to Army 1! Army 2 destroyed. Army 1 survivors: ${army1Alive.length} bot(s).` };
  }
  return { gameOver: false };
}

function resolveDraw(ALL_BOTS_IN_COMBAT_LIST, deadBotIds, GAME_MAP_BOTS, GAME_MAP_DAMAGE) {
  const army1Alive = ALL_BOTS_IN_COMBAT_LIST.filter(b => b.army === 1 && !deadBotIds.has(String(b.combatBotNumber)));
  const army2Alive = ALL_BOTS_IN_COMBAT_LIST.filter(b => b.army === 2 && !deadBotIds.has(String(b.combatBotNumber)));
  const c1 = army1Alive.length, c2 = army2Alive.length;

  if (c1 === 0 && c2 === 0) {
    return "50 consecutive turns with no damage — Both Armies Lose! All bots destroyed.";
  }

  if (c1 !== c2) {
    const winner = c1 > c2 ? 1 : 2;
    const wc = winner === 1 ? c1 : c2;
    const lc = winner === 1 ? c2 : c1;
    return `50 consecutive turns with no damage — Army ${winner} wins! Army ${winner}: ${wc} bot(s), Army ${winner === 1 ? 2 : 1}: ${lc} bot(s).`;
  }

  // Equal bot counts — compare total remaining HP
  const sumHp = (aliveList) =>
    aliveList.reduce((sum, b) => {
      const idx = GAME_MAP_BOTS.findIndex(cell => cell === String(b.combatBotNumber));
      return sum + (idx !== -1 ? (parseInt(GAME_MAP_DAMAGE[idx]) || 0) : 0);
    }, 0);

  const hp1 = sumHp(army1Alive), hp2 = sumHp(army2Alive);

  if (hp1 === hp2) {
    return `50 consecutive turns with no damage — Tie! Both armies have ${c1} bot(s) and equal remaining HP (${hp1}).`;
  }

  const winner = hp1 > hp2 ? 1 : 2;
  const winHp  = winner === 1 ? hp1 : hp2;
  const loseHp = winner === 1 ? hp2 : hp1;
  return `50 consecutive turns with no damage — Army ${winner} is the Marginal Winner! Both armies: ${c1} bot(s), HP: Army ${winner} ${winHp} vs Army ${winner === 1 ? 2 : 1} ${loseHp}.`;
}

// ─── BEGIN_COMBAT ─────────────────────────────────────────────────────────────

export async function BEGIN_COMBAT(army1Id, army2Id, settings = {}) {
  SHOW_COMBAT_RECORD = "TRUE";
  const COMBAT_RECORD = [];

  try {
    logInfo(COMBAT_RECORD, `BEGIN_COMBAT — Army1 id=${army1Id}, Army2 id=${army2Id}`);

    const army1 = await db.armies.get(army1Id);
    const army2 = await db.armies.get(army2Id);

    if (!army1 || !army2) {
      logError(COMBAT_RECORD, `Army not found — army1=${!!army1}, army2=${!!army2}`);
      return { success: false, message: "One or both armies not found.", combatRecord: COMBAT_RECORD };
    }

    logInfo(COMBAT_RECORD, `Armies loaded — "${army1.name}" vs "${army2.name}"`);

    const bots1 = (await Promise.all(army1.botIds.map(id => db.bots.get(id)))).filter(Boolean);
    const bots2 = (await Promise.all(army2.botIds.map(id => db.bots.get(id)))).filter(Boolean);

    logInfo(COMBAT_RECORD, `Bots loaded — Army1: ${bots1.length} bots, Army2: ${bots2.length} bots`);

    COMBAT_RECORD.push({
      date:               new Date().toLocaleDateString(),
      maxGoldSelection:   settings.maxGoldSelection   || "No limits",
      maxWeightSelection: settings.maxWeightSelection || "No limits",
      maxPowerSelection:  settings.maxPowerSelection  || "No limits",
      playerName:         settings.playerName         || "Unknown Player",
      army1Name:          army1.name,
      army2Name:          army2.name,
    });

    const ALL_BOTS_IN_COMBAT_LIST = CREATE_ALL_BOTS_IN_COMBAT_LIST(bots1, bots2);
    logInfo(COMBAT_RECORD, `Combat order set — ${ALL_BOTS_IN_COMBAT_LIST.length} bots total, first turn: Army ${ALL_BOTS_IN_COMBAT_LIST[0]?.army}`);

    // Snapshot initial placement before the combat loop mutates the map arrays
    const initialBotStatsMap = buildBotStatsMap(ALL_BOTS_IN_COMBAT_LIST);
    const [, initialGameMapBots, , initialGameMapFacing] =
      STARTING_MAP_SQUARES(ALL_BOTS_IN_COMBAT_LIST, initialBotStatsMap);

    const battleId = `battle_${Date.now()}`;
    await MAIN_COMBAT_LOOP(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);

    logInfo(COMBAT_RECORD, `BEGIN_COMBAT complete — battleId: ${battleId}`);
	logInfo(COMBAT_RECORD, `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`);
	logInfo(COMBAT_RECORD, `THANK YOU FOR PLAYING BOT-WARS!`);
	logInfo(COMBAT_RECORD, `Hope you enjoyed it!`);
	logInfo(COMBAT_RECORD, `Be sure to check out JAYPALMERBOOKS.COM!`);
	logInfo(COMBAT_RECORD, `May every victory be yours! -- Jay Palmer`);
	logInfo(COMBAT_RECORD, `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`);
	logInfo(COMBAT_RECORD, `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`);
	logInfo(COMBAT_RECORD, `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`);
	
    return {
      success: true,
      battleId,
      combatRecord: COMBAT_RECORD,
      initialMapState: {
        allBotsInCombatList: ALL_BOTS_IN_COMBAT_LIST,
        gameMapBots: initialGameMapBots,
        gameMapFacing: initialGameMapFacing,
      },
    };
  } catch (error) {
    logError(COMBAT_RECORD, "BEGIN_COMBAT fatal error", error);
    return { success: false, message: "Failed to initialize combat.", combatRecord: COMBAT_RECORD };
  }
}

// ─── CREATE_ALL_BOTS_IN_COMBAT_LIST ──────────────────────────────────────────

export function CREATE_ALL_BOTS_IN_COMBAT_LIST(army1Bots = [], army2Bots = []) {
  const firstArmy = Math.floor(Math.random() * 2) + 1;

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const s1 = shuffle(army1Bots);
  const s2 = shuffle(army2Bots);
  const allBots = [];
  const maxLen = Math.max(s1.length, s2.length);

  for (let i = 0; i < maxLen; i++) {
    if (firstArmy === 1) {
      if (i < s1.length) allBots.push({ ...s1[i], army: 1 });
      if (i < s2.length) allBots.push({ ...s2[i], army: 2 });
    } else {
      if (i < s2.length) allBots.push({ ...s2[i], army: 2 });
      if (i < s1.length) allBots.push({ ...s1[i], army: 1 });
    }
  }

  return allBots.map((bot, index) => ({ ...bot, combatBotNumber: index + 1 }));
}

// ─── STARTING_MAP_SQUARES ─────────────────────────────────────────────────────

export function STARTING_MAP_SQUARES(ALL_BOTS_IN_COMBAT_LIST, botStatsMap) {
  logInfo(null, "STARTING_MAP_SQUARES start");

  // Whichever army goes first in turn order starts on the LEFT facing East.
  // The other army starts on the RIGHT facing West.
  const leftArmyNum = ALL_BOTS_IN_COMBAT_LIST[0]?.army ?? 1;

  const LEFT_SPACES  = [1,2,11,12,21,22,31,32,41,42,51,52,61,62,71,72,81,82,91,92];
  const RIGHT_SPACES = [9,10,19,20,29,30,39,40,49,50,59,60,69,70,79,80,89,90,99,100];

  const BASIC_MAP_NUMBERS = Array.from({ length: 100 }, (_, i) => i + 1);
  const GAME_MAP_BOTS     = Array(100).fill("0");
  const GAME_MAP_BULLETS  = Array(100).fill(0);
  const GAME_MAP_FACING   = Array(100).fill("0");
  const GAME_MAP_DAMAGE   = Array(100).fill("0");

  let leftCount = 0, rightCount = 0;

  ALL_BOTS_IN_COMBAT_LIST.forEach((bot) => {
    const isLeft   = bot.army === leftArmyNum;
    const spaces   = isLeft ? LEFT_SPACES : RIGHT_SPACES;
    const idx      = isLeft ? leftCount++ : rightCount++;
    if (idx >= spaces.length) return;
    const arrayIdx = spaces[idx] - 1;
    GAME_MAP_BOTS[arrayIdx]   = String(bot.combatBotNumber);
    GAME_MAP_FACING[arrayIdx] = isLeft ? "E" : "W";
    const stats = botStatsMap[bot.combatBotNumber];
    GAME_MAP_DAMAGE[arrayIdx] = String(stats?.armor ?? 0);
  });

  const placed = ALL_BOTS_IN_COMBAT_LIST.length;
  logInfo(null, `STARTING_MAP_SQUARES end — ${placed} bots placed`);
  return [BASIC_MAP_NUMBERS, GAME_MAP_BOTS, GAME_MAP_BULLETS, GAME_MAP_FACING, GAME_MAP_DAMAGE];
}

// ─── MAIN_COMBAT_LOOP ─────────────────────────────────────────────────────────

export async function MAIN_COMBAT_LOOP(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD) {
  logInfo(COMBAT_RECORD, "MAIN_COMBAT_LOOP start");

  try {
    const botStatsMap = buildBotStatsMap(ALL_BOTS_IN_COMBAT_LIST);
    logInfo(COMBAT_RECORD, `Bot stats built for ${Object.keys(botStatsMap).length} bots`);

    const [, GAME_MAP_BOTS, GAME_MAP_BULLETS, GAME_MAP_FACING, GAME_MAP_DAMAGE] =
      STARTING_MAP_SQUARES(ALL_BOTS_IN_COMBAT_LIST, botStatsMap);
    logInfo(COMBAT_RECORD, "Starting map squares placed");

    const ordersListsMap = await loadAllOrdersLists(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
    logInfo(COMBAT_RECORD, `Orders lists loaded: ${Object.keys(ordersListsMap).length} unique lists`);

    const deadBotIds = new Set();
    const acquiredTargetsMap = {};
    let noRecentDamageRounds = 0;
    let roundNumber = 0;
    let gameOver = false;

    while (roundNumber < 200 && !gameOver) {
      roundNumber++;
      COMBAT_RECORD.push(`Round ${roundNumber} begins.`);
      let damageThisRound = false;

      for (const CURRENT_BOT of ALL_BOTS_IN_COMBAT_LIST) {
        if (deadBotIds.has(String(CURRENT_BOT.combatBotNumber))) continue;

        try {
          const result = await EXECUTE_ORDERS_LIST(
            ALL_BOTS_IN_COMBAT_LIST, GAME_MAP_BOTS, GAME_MAP_BULLETS, COMBAT_RECORD,
            noRecentDamageRounds, deadBotIds, GAME_MAP_FACING, CURRENT_BOT, GAME_MAP_DAMAGE,
            ordersListsMap, botStatsMap, acquiredTargetsMap
          );

          if (result.damageDealt) damageThisRound = true;

          for (const deadId of result.newDeadBots) {
            deadBotIds.add(deadId);
          }

          const winCheck = checkWinCondition(ALL_BOTS_IN_COMBAT_LIST, deadBotIds);
          if (winCheck.gameOver) {
            logInfo(COMBAT_RECORD, winCheck.message);
            gameOver = true;
            break;
          }
        } catch (error) {
          logError(COMBAT_RECORD, `Bot ${CURRENT_BOT.combatBotNumber} turn failed`, error);
        }
      }

      if (!gameOver) {
        noRecentDamageRounds = damageThisRound ? 0 : noRecentDamageRounds + 1;
        if (noRecentDamageRounds >= 50) {
          logInfo(COMBAT_RECORD, resolveDraw(ALL_BOTS_IN_COMBAT_LIST, deadBotIds, GAME_MAP_BOTS, GAME_MAP_DAMAGE));
          gameOver = true;
        }
      }
    }

    logInfo(COMBAT_RECORD, `MAIN_COMBAT_LOOP end — ${roundNumber} round(s) played`);
    return { success: true };
  } catch (error) {
    logError(COMBAT_RECORD, "MAIN_COMBAT_LOOP fatal error", error);
    return { success: false };
  }
}

// ─── EXECUTE_ORDERS_LIST ──────────────────────────────────────────────────────

export async function EXECUTE_ORDERS_LIST(
  ALL_BOTS_IN_COMBAT_LIST, GAME_MAP_BOTS, GAME_MAP_BULLETS, COMBAT_RECORD,
  noRecentDamageTurns, deadBotIds, GAME_MAP_FACING, CURRENT_BOT, GAME_MAP_DAMAGE,
  ordersListsMap, botStatsMap, acquiredTargetsMap = {}
) {
  const botId = String(CURRENT_BOT.combatBotNumber);
  const ordersList = ordersListsMap[CURRENT_BOT.ordersListId];

  if (!ordersList) {
    logError(COMBAT_RECORD, `Bot ${botId} has no orders list (ordersListId=${CURRENT_BOT.ordersListId})`);
    return { damageDealt: false, newDeadBots: [] };
  }

  const botSpace = findBotIndex(GAME_MAP_BOTS, botId) + 1;
  logInfo(COMBAT_RECORD, `Bot ${botId} (army ${CURRENT_BOT.army}, "${CURRENT_BOT.name}") begins turn on space ${botSpace}`);

  const commands = ordersList.commands;
  let damageDealt = false;
  const newDeadBots = [];

  for (let i = 0; i < commands.length; i++) {
    if (deadBotIds.has(botId)) break;

    const cmd = commands[i];

    if (cmd === "Move Forward 1") {
      [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE] =
        await CURRENT_MOVE_BOT1(COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE);

    } else if (cmd === "Move Forward 2") {
      [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE] =
        await CURRENT_MOVE_BOT1(COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE);
      [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE] =
        await CURRENT_MOVE_BOT1(COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE);

    } else if (cmd === "Move Forward 3") {
      for (let s = 0; s < 3; s++)
        [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE] =
          await CURRENT_MOVE_BOT1(COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE);

    } else if (cmd === "Move Forward 4") {
      for (let s = 0; s < 4; s++)
        [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE] =
          await CURRENT_MOVE_BOT1(COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE);

    } else if (cmd === "Move Forward 5") {
      for (let s = 0; s < 5; s++)
        [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE] =
          await CURRENT_MOVE_BOT1(COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE);

    } else if (cmd === "Move Backward 1") {
      [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE] =
        await CURRENT_MOVE_BACKWARD(COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, 1);

    } else if (cmd === "Move Backward 2") {
      [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE] =
        await CURRENT_MOVE_BACKWARD(COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, 2);

    } else if (cmd === "Move Backward 3") {
      [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE] =
        await CURRENT_MOVE_BACKWARD(COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, 3);

    } else if (cmd === "Turn Right") {
      [GAME_MAP_FACING, COMBAT_RECORD] =
        await CURRENT_TURN_RIGHT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS);

    } else if (cmd === "Turn Left") {
      [GAME_MAP_FACING, COMBAT_RECORD] =
        await CURRENT_TURN_LEFT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS);

    } else if (cmd === "Veer Right") {
      [GAME_MAP_FACING, COMBAT_RECORD] =
        await CURRENT_VEER_RIGHT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS);

    } else if (cmd === "Veer Left") {
      [GAME_MAP_FACING, COMBAT_RECORD] =
        await CURRENT_VEER_LEFT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS);

    } else if (cmd === "Fire Master Weapon") {
      const acquired = acquiredTargetsMap[botId] ?? [];
      const r = fireMasterWeapon(
        CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE,
        COMBAT_RECORD, botStatsMap, ALL_BOTS_IN_COMBAT_LIST, acquired[0] ?? null
      );
      if (r.damageDealt) damageDealt = true;
      for (const d of r.newDeadBots) { newDeadBots.push(d); deadBotIds.add(d); }

    } else if (cmd === "Fire Seconday Weapon" || cmd === "Fire Secondary Weapon") {
      const acquired = acquiredTargetsMap[botId] ?? [];
      const r = fireSecondaryWeapon(
        CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE,
        COMBAT_RECORD, botStatsMap, ALL_BOTS_IN_COMBAT_LIST, acquired[0] ?? null
      );
      if (r.damageDealt) damageDealt = true;
      for (const d of r.newDeadBots) { newDeadBots.push(d); deadBotIds.add(d); }

    } else if (cmd === "Fire All") {
      const acquired = acquiredTargetsMap[botId] ?? [];
      // If 2 targets acquired, Master gets target[0] and Secondary gets target[1]
      const r1 = fireMasterWeapon(
        CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE,
        COMBAT_RECORD, botStatsMap, ALL_BOTS_IN_COMBAT_LIST, acquired[0] ?? null
      );
      for (const d of r1.newDeadBots) { newDeadBots.push(d); deadBotIds.add(d); }
      const r2 = fireSecondaryWeapon(
        CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE,
        COMBAT_RECORD, botStatsMap, ALL_BOTS_IN_COMBAT_LIST, acquired[1] ?? null
      );
      if (r1.damageDealt || r2.damageDealt) damageDealt = true;
      for (const d of r2.newDeadBots) { newDeadBots.push(d); deadBotIds.add(d); }

    } else if (cmd === "Activate Targeting Map") {
      const tmIdx   = findBotIndex(GAME_MAP_BOTS, botId);
      const tmStats = botStatsMap[CURRENT_BOT.combatBotNumber];
      const tmRange = tmStats?.sensorRange ?? 1;
      const maxTargets = tmStats?.sensorTargets ?? 1;
      const targets = scanForEnemies(tmIdx, CURRENT_BOT.army, GAME_MAP_BOTS, ALL_BOTS_IN_COMBAT_LIST, tmRange);
      const acquired = targets.slice(0, maxTargets);
      acquiredTargetsMap[botId] = acquired;
      if (acquired.length > 0) {
        const spaces = acquired.map(i => i + 1).join(", ");
        COMBAT_RECORD.push(`Bot ${botId} on space ${tmIdx + 1} activates targeting map — ${acquired.length} target(s) acquired in range ${tmRange} at space(s): ${spaces}.`);
      } else {
        COMBAT_RECORD.push(`Bot ${botId} on space ${tmIdx + 1} activates targeting map — no targets found in range ${tmRange}.`);
      }

    } else if (cmd === "If Any Enemies in Range ...") {
      // Conditional: scan for enemies; if none, skip the next command
      const idx = findBotIndex(GAME_MAP_BOTS, botId);
      const stats = botStatsMap[CURRENT_BOT.combatBotNumber];
      const range = stats?.sensorRange ?? 1;
      const hasEnemy = scanForEnemies(idx, CURRENT_BOT.army, GAME_MAP_BOTS, ALL_BOTS_IN_COMBAT_LIST, range).length > 0;
      COMBAT_RECORD.push(`Bot ${botId} scans: enemies in range = ${hasEnemy}.`);
      if (!hasEnemy) i++; // skip next command

    } else if (cmd === "Move toward located Enemy") {
      [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE] =
        await CURRENT_MOVE_TOWARD_ENEMY(
          CURRENT_BOT, ALL_BOTS_IN_COMBAT_LIST, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE,
          COMBAT_RECORD, botStatsMap
        );

    } else if (cmd === "If Movement Blocked by Enemy ...") {
      const idx = findBotIndex(GAME_MAP_BOTS, botId);
      const facing = GAME_MAP_FACING[idx];
      const offset = DIR_OFFSET[facing] ?? 0;
      const nextIdx = idx + offset;
      const blocked = nextIdx >= 0 && nextIdx < 100 &&
        isValidMove(idx, nextIdx) && GAME_MAP_BOTS[nextIdx] !== "0";
      COMBAT_RECORD.push(`Bot ${botId} checks: blocked by enemy = ${blocked}.`);
      if (!blocked) i++;

    } else if (cmd === "If Movement Blocked by Ally ...") {
      const idx = findBotIndex(GAME_MAP_BOTS, botId);
      const facing = GAME_MAP_FACING[idx];
      const offset = DIR_OFFSET[facing] ?? 0;
      const nextIdx = idx + offset;
      const blockedByAlly = nextIdx >= 0 && nextIdx < 100 &&
        isValidMove(idx, nextIdx) && (() => {
          const cell = GAME_MAP_BOTS[nextIdx];
          if (cell === "0") return false;
          const blocker = ALL_BOTS_IN_COMBAT_LIST.find(b => String(b.combatBotNumber) === cell);
          return blocker?.army === CURRENT_BOT.army;
        })();
      COMBAT_RECORD.push(`Bot ${botId} checks: blocked by ally = ${blockedByAlly}.`);
      if (!blockedByAlly) i++;

    } else if (cmd.startsWith("If Your Armor is Below ")) {
      const threshold = parseInt(cmd.replace("If Your Armor is Below ", "")) || 0;
      const idx = findBotIndex(GAME_MAP_BOTS, botId);
      const currentHp = parseInt(GAME_MAP_DAMAGE[idx]) || 0;
      const armorLow = currentHp < threshold;
      COMBAT_RECORD.push(`Bot ${botId} checks armor (${currentHp}) below ${threshold}: ${armorLow}.`);
      if (!armorLow) i++;

    } else if (cmd === "If Facing Off-Map ...") {
      const idx = findBotIndex(GAME_MAP_BOTS, botId);
      const facing = GAME_MAP_FACING[idx];
      const offset = DIR_OFFSET[facing] ?? 0;
      const nextIdx = idx + offset;
      const offMap = !isValidMove(idx, nextIdx);
      COMBAT_RECORD.push(`Bot ${botId} checks: facing off-map = ${offMap}.`);
      if (!offMap) i++;

    } else if (cmd === "Angle Right") {
      // Angle Right = Veer Right
      [GAME_MAP_FACING, COMBAT_RECORD] =
        await CURRENT_VEER_RIGHT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS);

    } else if (cmd === "Activate Self-Destruct") {
      const idx = findBotIndex(GAME_MAP_BOTS, botId);
      // Scan for all bots within Chebyshev distance 2 BEFORE clearing self from map
      const nearbyBotSpaces = [];
      if (idx !== -1) {
        const selfCol = idx % 10, selfRow = Math.floor(idx / 10);
        for (let ni = 0; ni < GAME_MAP_BOTS.length; ni++) {
          if (ni === idx || GAME_MAP_BOTS[ni] === "0") continue;
          const col = ni % 10, row = Math.floor(ni / 10);
          if (Math.max(Math.abs(col - selfCol), Math.abs(row - selfRow)) <= 2) {
            nearbyBotSpaces.push(ni + 1);
          }
        }
      }
      const nearbyStr = nearbyBotSpaces.length > 0
        ? `Nearby bots at space(s): ${nearbyBotSpaces.join(", ")}.`
        : `No nearby bots.`;
      COMBAT_RECORD.push(`Bot ${botId} activates self-destruct on space ${idx + 1}! ${nearbyStr}`);
      if (idx !== -1) {
        GAME_MAP_BOTS[idx]   = "0";
        GAME_MAP_FACING[idx] = "0";
        GAME_MAP_DAMAGE[idx] = "0";
      }
      newDeadBots.push(botId);
      deadBotIds.add(botId);
      break;

    } else {
      logError(COMBAT_RECORD, `Bot ${botId}: unknown command "${cmd}" — skipped`);
    }
  }

  // Clear acquired targets at end of this bot's turn
  delete acquiredTargetsMap[botId];

  return { damageDealt, newDeadBots };
}

// ─── MOVEMENT FUNCTIONS ───────────────────────────────────────────────────────

export async function CURRENT_MOVE_BOT1(COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE) {
  const botId = String(CURRENT_BOT.combatBotNumber);
  const idx = findBotIndex(GAME_MAP_BOTS, botId);
  if (idx === -1) return [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE];

  const facing = GAME_MAP_FACING[idx];
  const offset = DIR_OFFSET[facing];
  if (offset === undefined) return [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE];

  const nextIdx = idx + offset;

  if (!isValidMove(idx, nextIdx)) {
    COMBAT_RECORD.push(`Bot ${botId} on space ${idx + 1} facing ${facing}: movement blocked (off map).`);
    return [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE];
  }

  if (GAME_MAP_BOTS[nextIdx] !== "0") {
    COMBAT_RECORD.push(`Bot ${botId} on space ${idx + 1} facing ${facing}: movement blocked (space ${nextIdx + 1} occupied).`);
    return [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE];
  }

  // Swap all map data between current and next cell
  [GAME_MAP_BOTS[idx],    GAME_MAP_BOTS[nextIdx]]   = [GAME_MAP_BOTS[nextIdx],   GAME_MAP_BOTS[idx]];
  [GAME_MAP_FACING[idx],  GAME_MAP_FACING[nextIdx]]  = [GAME_MAP_FACING[nextIdx], GAME_MAP_FACING[idx]];
  [GAME_MAP_DAMAGE[idx],  GAME_MAP_DAMAGE[nextIdx]]  = [GAME_MAP_DAMAGE[nextIdx], GAME_MAP_DAMAGE[idx]];

  COMBAT_RECORD.push(`Move Bot ${botId} from space ${idx + 1} to ${nextIdx + 1} facing ${facing}.`);
  return [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE];
}

export async function CURRENT_MOVE_BACKWARD(COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, steps = 1) {
  const botId = String(CURRENT_BOT.combatBotNumber);

  for (let s = 0; s < steps; s++) {
    const idx = findBotIndex(GAME_MAP_BOTS, botId);
    if (idx === -1) break;

    const facing = GAME_MAP_FACING[idx];
    const offset = DIR_OFFSET[facing];
    if (offset === undefined) break;

    const backIdx = idx - offset; // reverse direction

    if (!isValidMove(idx, backIdx) || GAME_MAP_BOTS[backIdx] !== "0") {
      COMBAT_RECORD.push(`Bot ${botId} on space ${idx + 1}: backward movement blocked.`);
      break;
    }

    [GAME_MAP_BOTS[idx],    GAME_MAP_BOTS[backIdx]]   = [GAME_MAP_BOTS[backIdx],   GAME_MAP_BOTS[idx]];
    [GAME_MAP_FACING[idx],  GAME_MAP_FACING[backIdx]]  = [GAME_MAP_FACING[backIdx], GAME_MAP_FACING[idx]];
    [GAME_MAP_DAMAGE[idx],  GAME_MAP_DAMAGE[backIdx]]  = [GAME_MAP_DAMAGE[backIdx], GAME_MAP_DAMAGE[idx]];

    COMBAT_RECORD.push(`Move Bot ${botId} backward from space ${idx + 1} to ${backIdx + 1} facing ${facing}.`);
  }

  return [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE];
}

export async function CURRENT_TURN_RIGHT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS) {
  const botId = String(CURRENT_BOT.combatBotNumber);
  const idx = findBotIndex(GAME_MAP_BOTS, botId);
  if (idx === -1) return [GAME_MAP_FACING, COMBAT_RECORD];

  const newDir = TURN_RIGHT_MAP[GAME_MAP_FACING[idx]] ?? GAME_MAP_FACING[idx];
  GAME_MAP_FACING[idx] = newDir;
  COMBAT_RECORD.push(`Rotate Bot ${botId} right to face ${newDir} on space ${idx + 1}.`);
  return [GAME_MAP_FACING, COMBAT_RECORD];
}

export async function CURRENT_TURN_LEFT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS) {
  const botId = String(CURRENT_BOT.combatBotNumber);
  const idx = findBotIndex(GAME_MAP_BOTS, botId);
  if (idx === -1) return [GAME_MAP_FACING, COMBAT_RECORD];

  const newDir = TURN_LEFT_MAP[GAME_MAP_FACING[idx]] ?? GAME_MAP_FACING[idx];
  GAME_MAP_FACING[idx] = newDir;
  COMBAT_RECORD.push(`Rotate Bot ${botId} left to face ${newDir} on space ${idx + 1}.`);
  return [GAME_MAP_FACING, COMBAT_RECORD];
}

export async function CURRENT_VEER_RIGHT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS) {
  const botId = String(CURRENT_BOT.combatBotNumber);
  const idx = findBotIndex(GAME_MAP_BOTS, botId);
  if (idx === -1) return [GAME_MAP_FACING, COMBAT_RECORD];

  const newDir = VEER_RIGHT_MAP[GAME_MAP_FACING[idx]] ?? GAME_MAP_FACING[idx];
  GAME_MAP_FACING[idx] = newDir;
  COMBAT_RECORD.push(`Veer Bot ${botId} right to face ${newDir} on space ${idx + 1}.`);
  return [GAME_MAP_FACING, COMBAT_RECORD];
}

export async function CURRENT_VEER_LEFT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS) {
  const botId = String(CURRENT_BOT.combatBotNumber);
  const idx = findBotIndex(GAME_MAP_BOTS, botId);
  if (idx === -1) return [GAME_MAP_FACING, COMBAT_RECORD];

  const newDir = VEER_LEFT_MAP[GAME_MAP_FACING[idx]] ?? GAME_MAP_FACING[idx];
  GAME_MAP_FACING[idx] = newDir;
  COMBAT_RECORD.push(`Veer Bot ${botId} left to face ${newDir} on space ${idx + 1}.`);
  return [GAME_MAP_FACING, COMBAT_RECORD];
}

export async function CURRENT_MOVE_TOWARD_ENEMY(
  CURRENT_BOT, ALL_BOTS_IN_COMBAT_LIST, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE,
  COMBAT_RECORD, botStatsMap
) {
  const botId = String(CURRENT_BOT.combatBotNumber);
  const idx = findBotIndex(GAME_MAP_BOTS, botId);
  if (idx === -1) return [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE];

  const stats = botStatsMap[CURRENT_BOT.combatBotNumber];
  const range = stats?.sensorRange ?? 3;
  const enemies = scanForEnemies(idx, CURRENT_BOT.army, GAME_MAP_BOTS, ALL_BOTS_IN_COMBAT_LIST, range);

  if (enemies.length === 0) {
    COMBAT_RECORD.push(`Bot ${botId}: no enemies found to move toward.`);
    return [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE];
  }

  // Face toward nearest enemy then move
  const targetIdx = enemies[0];
  const fromRow = Math.floor(idx / 10), fromCol = idx % 10;
  const toRow   = Math.floor(targetIdx / 10), toCol = targetIdx % 10;
  const dr = Math.sign(toRow - fromRow), dc = Math.sign(toCol - fromCol);

  const dirEntry = Object.entries(DIR_OFFSET).find(([, off]) => {
    const r = Math.floor(off / 10) || (off < 0 ? -1 : off > 0 ? 1 : 0);
    const c = off % 10;
    return r === dr && c === dc;
  });

  if (dirEntry) {
    GAME_MAP_FACING[idx] = dirEntry[0];
  }

  return CURRENT_MOVE_BOT1(COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE);
}

// ─── SCANNER ─────────────────────────────────────────────────────────────────

function scanForEnemies(botIndex, botArmy, GAME_MAP_BOTS, ALL_BOTS_IN_COMBAT_LIST, range) {
  const results = [];
  const botRow = Math.floor(botIndex / 10);
  const botCol = botIndex % 10;

  for (let i = 0; i < GAME_MAP_BOTS.length; i++) {
    const cell = GAME_MAP_BOTS[i];
    if (cell === "0") continue;
    const targetBot = ALL_BOTS_IN_COMBAT_LIST.find(b => String(b.combatBotNumber) === cell);
    if (!targetBot || targetBot.army === botArmy) continue;
    const r = Math.floor(i / 10), c = i % 10;
    const dist = Math.max(Math.abs(r - botRow), Math.abs(c - botCol)); // Chebyshev distance
    if (dist <= range) results.push(i);
  }

  return results;
}

// ─── WEAPON FUNCTIONS ─────────────────────────────────────────────────────────

function applyWeaponHit(fromSpace, targetIdx, damage, weaponLabel, targetBotId,
  GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, COMBAT_RECORD) {
  const targetSpace = targetIdx + 1;
  const hp    = parseInt(GAME_MAP_DAMAGE[targetIdx]) || 0;
  const newHp = Math.max(0, hp - damage);
  GAME_MAP_DAMAGE[targetIdx] = String(newHp);
  COMBAT_RECORD.push(`Fired ${weaponLabel} from space ${fromSpace} and hit space ${targetSpace} for ${damage} damage. HP: ${hp} → ${newHp}.`);
  const newDeadBots = [];
  if (newHp <= 0) {
    GAME_MAP_BOTS[targetIdx]   = "0";
    GAME_MAP_FACING[targetIdx] = "0";
    GAME_MAP_DAMAGE[targetIdx] = "0";
    newDeadBots.push(targetBotId);
    COMBAT_RECORD.push(`Bot ${targetBotId} on space ${targetSpace} is destroyed!`);
  }
  return { damageDealt: true, newDeadBots };
}

function fireWeapon(CURRENT_BOT, damage, range, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE,
  COMBAT_RECORD, ALL_BOTS_IN_COMBAT_LIST, weaponLabel, acquiredTargetIdx = null) {
  const botId  = String(CURRENT_BOT.combatBotNumber);
  const botIdx = findBotIndex(GAME_MAP_BOTS, botId);
  if (botIdx === -1) {
    logError(COMBAT_RECORD, `Bot ${botId} not found on map when firing ${weaponLabel}`);
    return { damageDealt: false, newDeadBots: [] };
  }
  if (damage === 0 || range === 0) {
    logError(COMBAT_RECORD, `Bot ${botId} ${weaponLabel} has no damage or range (WD=${damage}, WR=${range})`);
    return { damageDealt: false, newDeadBots: [] };
  }
  const botSpace = botIdx + 1;

  // ── Acquired target: check it is still present and in range ───────────────
  if (acquiredTargetIdx !== null) {
    const botRow = Math.floor(botIdx / 10), botCol = botIdx % 10;
    const tRow   = Math.floor(acquiredTargetIdx / 10), tCol = acquiredTargetIdx % 10;
    const dist   = Math.max(Math.abs(botRow - tRow), Math.abs(botCol - tCol));
    const cell   = GAME_MAP_BOTS[acquiredTargetIdx];
    const targetBot = cell !== "0"
      ? ALL_BOTS_IN_COMBAT_LIST.find(b => String(b.combatBotNumber) === cell)
      : null;

    if (dist <= range && targetBot && targetBot.army !== CURRENT_BOT.army) {
      return applyWeaponHit(botSpace, acquiredTargetIdx, damage, weaponLabel, cell,
        GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, COMBAT_RECORD);
    }
    COMBAT_RECORD.push(`Bot ${botId} ${weaponLabel}: acquired target out of range or gone — scanning forward.`);
  }

  // ── No target (or out of range): scan forward along facing direction ───────
  const facing = GAME_MAP_FACING[botIdx];
  const offset = DIR_OFFSET[facing];
  if (offset === undefined) return { damageDealt: false, newDeadBots: [] };

  let scanIdx = botIdx;
  for (let r = 1; r <= range; r++) {
    const nextIdx = scanIdx + offset;
    if (!isValidMove(scanIdx, nextIdx)) break;
    scanIdx = nextIdx;
    const cell = GAME_MAP_BOTS[scanIdx];
    if (cell !== "0") {
      // Hits the first bot in the line regardless of army — friendly fire is possible
      return applyWeaponHit(botSpace, scanIdx, damage, weaponLabel, cell,
        GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, COMBAT_RECORD);
    }
  }

  COMBAT_RECORD.push(`Fired ${weaponLabel} from space ${botSpace} — no targets hit.`);
  return { damageDealt: false, newDeadBots: [] };
}

function fireMasterWeapon(CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE,
  COMBAT_RECORD, botStatsMap, ALL_BOTS_IN_COMBAT_LIST, acquiredTargetIdx = null) {
  const stats = botStatsMap[CURRENT_BOT.combatBotNumber];
  return fireWeapon(CURRENT_BOT, stats?.masterWD ?? 0, stats?.masterWR ?? 0,
    GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, COMBAT_RECORD, ALL_BOTS_IN_COMBAT_LIST,
    "Master", acquiredTargetIdx);
}

function fireSecondaryWeapon(CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE,
  COMBAT_RECORD, botStatsMap, ALL_BOTS_IN_COMBAT_LIST, acquiredTargetIdx = null) {
  const stats = botStatsMap[CURRENT_BOT.combatBotNumber];
  if (!stats?.secondaryWD) return { damageDealt: false, newDeadBots: [] };
  return fireWeapon(CURRENT_BOT, stats.secondaryWD, stats.secondaryWR,
    GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, COMBAT_RECORD, ALL_BOTS_IN_COMBAT_LIST,
    "Secondary", acquiredTargetIdx);
}

export async function FIRE_MASTER_WEAPON(CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, COMBAT_RECORD, botStatsMap, ALL_BOTS_IN_COMBAT_LIST) {
  return fireMasterWeapon(CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, COMBAT_RECORD, botStatsMap, ALL_BOTS_IN_COMBAT_LIST);
}

export async function FIRE_SECONDARY_WEAPON(CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, COMBAT_RECORD, botStatsMap, ALL_BOTS_IN_COMBAT_LIST) {
  return fireSecondaryWeapon(CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, COMBAT_RECORD, botStatsMap, ALL_BOTS_IN_COMBAT_LIST);
}

export async function FIRE_ALL_WEAPONS(CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, COMBAT_RECORD, botStatsMap, ALL_BOTS_IN_COMBAT_LIST) {
  const r1 = fireMasterWeapon(CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, COMBAT_RECORD, botStatsMap, ALL_BOTS_IN_COMBAT_LIST);
  const r2 = fireSecondaryWeapon(CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE, COMBAT_RECORD, botStatsMap, ALL_BOTS_IN_COMBAT_LIST);
  return { damageDealt: r1.damageDealt || r2.damageDealt, newDeadBots: [...r1.newDeadBots, ...r2.newDeadBots] };
}

// ─── SCANNER / TARGETING (kept for future animation use) ─────────────────────

export async function CURRENT_ACTIVATE_SCANNER_FULL(combatState) {
  try {
    let CURRENT_BULLET_TARGET1 = "";
    let CURRENT_BULLET_TARGET2 = "";

    const SCANNER_RANGE      = combatState.RECORD_BOT_SENSOR_RANGE || 1;
    const CURRENT_TARGETING_MAP = combatState.RECORD_TARGETING_MAP || [];
    const ROTATED_MAP        = await ROTATE_TARGETING_MAP(CURRENT_TARGETING_MAP, combatState.CURRENT_BOT_FACING);
    let GAME_MAP_TARGETING   = [...combatState.GAME_MAP_BOTS];

    for (let i = 0; i < GAME_MAP_TARGETING.length; i++) {
      const SPACE_CURRENT = GAME_MAP_TARGETING[i];
      if (SPACE_CURRENT !== 0 && SPACE_CURRENT !== "0,") {
        const isInRange = calculateDistance(i, combatState.CURRENT_BOT_LOCATION, SCANNER_RANGE);
        GAME_MAP_TARGETING[i] = isInRange ? (ROTATED_MAP[i] || "0,") : "0,";
      }
    }

    const ALL_BOTS_IN_COMBAT_LIST_TEMP = combatState.allBotsInCombatList || [];

    for (const CURRENT_BOT_TEMP of ALL_BOTS_IN_COMBAT_LIST_TEMP) {
      if (CURRENT_BULLET_TARGET2 !== "") break;
      const BOT_LOCATION_TEMP          = CURRENT_BOT_TEMP.location || "0,0";
      const CURRENT_TARGETING_BOT_ARMY = CURRENT_BOT_TEMP.army || 1;

      for (let mapIndex = 0; mapIndex < GAME_MAP_TARGETING.length; mapIndex++) {
        const SPACE_TEMP = GAME_MAP_TARGETING[mapIndex];
        if (SPACE_TEMP !== "0," && SPACE_TEMP !== 0) {
          GAME_MAP_TARGETING[mapIndex] = CURRENT_BOT_TEMP.botNumber || "0,";
          if (CURRENT_TARGETING_BOT_ARMY !== combatState.RECORD_BOT_ARMY) {
            if      (CURRENT_BULLET_TARGET1 === "") CURRENT_BULLET_TARGET1 = BOT_LOCATION_TEMP;
            else if (CURRENT_BULLET_TARGET2 === "") CURRENT_BULLET_TARGET2 = BOT_LOCATION_TEMP;
          }
        }
      }
    }

    return { ...combatState, CURRENT_BULLET_TARGET1, CURRENT_BULLET_TARGET2, GAME_MAP_TARGETING };
  } catch (error) {
    console.error("CURRENT_ACTIVATE_SCANNER_FULL error:", error);
    return combatState;
  }
}

function calculateDistance(space1, location2, maxRange) {
  const [x2, y2] = location2.split(",").map(Number);
  const x1 = space1 % 10;
  const y1 = Math.floor(space1 / 10);
  return Math.abs(x1 - x2) + Math.abs(y1 - y2) <= maxRange;
}

export async function ROTATE_TARGETING_MAP(targetingMap, facing) {
  try {
    const rotationMap = { N: 0, NE: 1, E: 2, SE: 3, S: 4, SW: 5, W: 6, NW: 7 };
    const rotations = rotationMap[facing] || 0;
    let rotatedMap = [...targetingMap];
    for (let r = 0; r < rotations; r++) {
      rotatedMap = rotateGridClockwise(rotatedMap);
    }
    return rotatedMap;
  } catch (error) {
    console.error("ROTATE_TARGETING_MAP error:", error);
    return targetingMap;
  }
}

function rotateGridClockwise(grid) {
  const size = 7;
  const rotated = Array(grid.length).fill(0);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      rotated[j * size + (size - 1 - i)] = grid[i * size + j];
    }
  }
  return rotated;
}

// ─── PROFILE / STATS INTEGRATION ─────────────────────────────────────────────

export async function GET_VALUES_FROM_RECORDS(currentBot, armyNumber, currentBotNumber) {
  try {
    const frameComponent  = await db.botFrames.where("name").equals(extractComponentName(currentBot.frame)).first();
    const armorComponent  = await db.botArmors.where("name").equals(extractComponentName(currentBot.armor)).first();
    const masterWeapon    = await db.botMasters.where("name").equals(extractComponentName(currentBot.weaponMaster)).first();
    const secondaryWeapon = await db.botSecondaries.where("name").equals(extractComponentName(currentBot.weaponSecondary)).first();
    const bombWeapon      = await db.botBombs.where("name").equals(extractComponentName(currentBot.weaponBomb)).first();
    const sensorComponent = await db.botSensors.where("name").equals(extractComponentName(currentBot.sensor)).first();

    return {
      CURRENT_BOT_NAME:     currentBot.name,
      CURRENT_BOT_NUMBER:   currentBotNumber,
      RECORD_BOT_ARMY:      armyNumber,
      CURRENT_BOT_ARMOR:    (frameComponent?.nd || 0) + (armorComponent?.ad || 0),
      RECORD_MASTER_WEAPON_DAMAGE:    masterWeapon?.wd    || 0,
      RECORD_MASTER_WEAPON_RANGE:     masterWeapon?.wr    || 0,
      RECORD_SECONDARY_WEAPON_DAMAGE: secondaryWeapon?.wd || 0,
      RECORD_SECONDARY_WEAPON_RANGE:  secondaryWeapon?.wr || 0,
      RECORD_BOMB1_DAMAGE:  bombWeapon?.wd                || 0,
      RECORD_BOMB2_DAMAGE:  Math.floor((bombWeapon?.wd    || 0) / 2),
      RECORD_BOT_SENSOR_RANGE:   sensorComponent?.range   || 0,
      RECORD_BOT_SENSOR_COUNT:   sensorComponent?.targets || 0,
      CURRENT_BOT_MOVEMENT: parseInt(currentBot.move) || 0,
      ANI_IMAGE_NAME_FULL:  `${currentBot.botImage}_P${armyNumber}_D${"E"}`,
    };
  } catch (error) {
    console.error("GET_VALUES_FROM_RECORDS error:", error);
    return null;
  }
}

export async function PROCESS_TURN(currentArmy, targetArmy) {
  return { success: true };
}

export async function START_COMBAT() {
  return { success: true };
}

export async function CHECK_WIN_CONDITION() {
  return { gameOver: false };
}

export async function END_COMBAT(winnerId, loserId) {
  return { success: true };
}

  