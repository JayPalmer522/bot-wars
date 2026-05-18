/**
 * Combat.js
 * 
 * Handles all combat simulation logic, turn-based mechanics, and battle calculations.
 * This module contains the core gameplay engine that processes actions and determines outcomes.
 */

import { db } from "../db/db";

let SHOW_COMBAT_RECORD = "TRUE";

function SHOW_COMBAT_RECORD_POPUP(functionName) {
  if (SHOW_COMBAT_RECORD === "TRUE") {
    const allBots = typeof ALL_BOTS_IN_COMBAT_LIST !== "undefined" ? ALL_BOTS_IN_COMBAT_LIST : undefined;
    const mapSquares = typeof GAME_MAP_SQUARES !== "undefined" ? GAME_MAP_SQUARES : undefined;
    const command = typeof CURRENT_COMMAND !== "undefined" ? CURRENT_COMMAND : undefined;
    const bot = typeof CURRENT_BOT !== "undefined" ? CURRENT_BOT : undefined;
    const botNumber = typeof CURRENT_BOT_NUMBER !== "undefined" ? CURRENT_BOT_NUMBER : undefined;

    const message = [
      `End of Function: ${functionName}. `,
      `ALL_BOTS_IN_COMBAT_LIST: ${JSON.stringify(allBots)}`,
      `GAME_MAP_SQUARES: ${JSON.stringify(mapSquares)}`,
      `CURRENT_COMMAND: ${JSON.stringify(command)}`,
      `CURRENT_BOT: ${JSON.stringify(bot)}`,
      `CURRENT_BOT_NUMBER: ${JSON.stringify(botNumber)}`,
    ].join("\n");

    window.alert(message);
  }
}

/**
 * BEGIN_COMBAT
 * 
 * Sets up a new combat session with two armies and specified settings.
 * 
 * @param {number} army1Id - ID of first army
 * @param {number} army2Id - ID of second army
 * @param {object} settings - Combat settings (maxGold, maxWeight, maxPower, etc.)
 * @returns {Promise<{success: boolean, battleId?: string, message?: string}>}
 */
export async function BEGIN_COMBAT(army1Id, army2Id, settings = {}) {
  SHOW_COMBAT_RECORD = "TRUE";
  console.log(`INITIALIZE_COMBAT: Army1=${army1Id}, Army2=${army2Id}, SHOW_COMBAT_RECORD=${SHOW_COMBAT_RECORD}`);
  
  try {
    // Validate armies exist
    const army1 = await db.armies.get(army1Id);
    const army2 = await db.armies.get(army2Id);

    if (!army1 || !army2) {
      return { success: false, message: "One or both armies not found." };
    }

    // Load bot data for armies
    const bots1 = await Promise.all(army1.botIds.map(id => db.bots.get(id)));
    const bots2 = await Promise.all(army2.botIds.map(id => db.bots.get(id)));

    const COMBAT_RECORD = [];
    COMBAT_RECORD.push({
      date: new Date().toLocaleDateString(),
      maxGoldSelection: settings.maxGoldSelection || "No limits",
      maxWeightSelection: settings.maxWeightSelection || "No limits",
      maxPowerSelection: settings.maxPowerSelection || "No limits",
      playerName: settings.playerName || "Unknown Player",
      army1Name: army1.name,
      army2Name: army2.name,
    });

    const ALL_BOTS_IN_COMBAT_LIST = CREATE_ALL_BOTS_IN_COMBAT_LIST(bots1, bots2);

    const battleState = {
      battleId: `battle_${Date.now()}`,
      SHOW_COMBAT_RECORD,
      COMBAT_RECORD,
      army1: { ...army1, bots: bots1, aliveCount: bots1.length },
      army2: { ...army2, bots: bots2, aliveCount: bots2.length },
      ALL_BOTS_IN_COMBAT_LIST,
      currentTurn: 0,
      currentArmy: 1,
      battleLog: [],
      settings: settings,
      isActive: true,
    };

    console.log(`Combat initialized with battle ID: ${battleState.battleId}`);
    SHOW_COMBAT_RECORD_POPUP("BEGIN_COMBAT");
    return { success: true, battleId: battleState.battleId };
  } catch (error) {
    console.error("INITIALIZE_COMBAT error:", error);
    SHOW_COMBAT_RECORD_POPUP("BEGIN_COMBAT");
    return { success: false, message: "Failed to initialize combat." };
  }
}

/**
 * START_COMBAT
 * 
 * Begins the battle simulation loop.
 * 
 * @returns {Promise<{success: boolean, battleLog?: array}>}
 */
export async function START_COMBAT() {
  console.log("START_COMBAT called");
  // Placeholder - will process turns in sequence
  SHOW_COMBAT_RECORD_POPUP("START_COMBAT");
  return { success: true };
}

/**
 * PROCESS_TURN
 * 
 * Executes one army's turn during combat.
 * 
 * @param {object} currentArmy - Current attacking army
 * @param {object} targetArmy - Target defending army
 * @returns {Promise<{success: boolean, logEntry?: string}>}
 */
export async function PROCESS_TURN(currentArmy, targetArmy) {
  console.log(`PROCESS_TURN: ${currentArmy.name} attacking ${targetArmy.name}`);
  // Placeholder
  SHOW_COMBAT_RECORD_POPUP("PROCESS_TURN");
  return { success: true };
}

/**
 * EXECUTE_BOT_ACTION
 * 
 * Executes a single bot's action in combat.
 * 
 * @param {object} bot - Bot executing the action
 * @param {string} action - Action type (move, fire, etc.)
 * @param {object} targetBot - Target bot (if applicable)
 * @returns {Promise<{success: boolean, result?: object}>}
 */
export async function EXECUTE_BOT_ACTION(bot, action, targetBot = null) {
  console.log(`EXECUTE_BOT_ACTION: Bot ${bot.name} executing ${action}`);
  // Placeholder
  SHOW_COMBAT_RECORD_POPUP("EXECUTE_BOT_ACTION");
  return { success: true };
}

/**
 * CALCULATE_DAMAGE
 * 
 * Computes damage from an attack.
 * 
 * @param {object} attacker - Attacking bot
 * @param {string} weapon - Weapon name
 * @param {object} defender - Defending bot
 * @returns {number} - Damage amount
 */
export function CALCULATE_DAMAGE(attacker, weapon, defender) {
  console.log(`CALCULATE_DAMAGE: ${attacker.name} with ${weapon} vs ${defender.name}`);
  // Placeholder
  SHOW_COMBAT_RECORD_POPUP("CALCULATE_DAMAGE");
  return 0;
}

/**
 * CHECK_WIN_CONDITION
 * 
 * Determines if the battle has ended and identifies the winner.
 * 
 * @returns {Promise<{gameOver: boolean, winner?: number, loser?: number}>}
 */
export async function CHECK_WIN_CONDITION() {
  console.log("CHECK_WIN_CONDITION called");
  // Placeholder
  SHOW_COMBAT_RECORD_POPUP("CHECK_WIN_CONDITION");
  return { gameOver: false };
}

/**
 * END_COMBAT
 * 
 * Finalizes combat and calculates rewards.
 * 
 * @param {number} winnerId - ID of winning army
 * @param {number} loserId - ID of losing army
 * @returns {Promise<{success: boolean, results?: object}>}
 */
export async function END_COMBAT(winnerId, loserId) {
  console.log(`END_COMBAT: Winner=${winnerId}, Loser=${loserId}`);
  // Placeholder
  SHOW_COMBAT_RECORD_POPUP("END_COMBAT");
  return { success: true };
}

/**
 * CHECK_BOT_TOTALS
 * 
 * Calculates total bot statistics from selected components.
 * 
 * @param {string} frame - Selected frame string
 * @param {string} engine - Selected engine string
 * @param {string} computer - Selected computer string
 * @param {string} armor - Selected armor string
 * @param {string} sensor - Selected sensor string
 * @param {string} weaponMaster - Selected master weapon string
 * @param {string} weaponSecondary - Selected secondary weapon string
 * @param {string} weaponBomb - Selected bomb weapon string
 * @returns {object} - Calculated totals and display values
 */
export function CHECK_BOT_TOTALS(frame, engine, computer, armor, sensor, weaponMaster, weaponSecondary, weaponBomb) {
  console.log("CHECK_BOT_TOTALS called");

  // SLOT_COUNT
  let SLOT_COUNT = 0;

  // Engine: = BE (\d+) slot
  const engineMatch = engine.match(/= BE (\d+) slot/);
  if (engineMatch) SLOT_COUNT += parseInt(engineMatch[1]);

  // Computer: = BC (\d+) slot
  const compMatch = computer.match(/= BC (\d+) slot/);
  if (compMatch) SLOT_COUNT += parseInt(compMatch[1]);

  // Armor: = FA (\d+) slot
  const armorMatch = armor.match(/= FA (\d+) slot/);
  if (armorMatch) SLOT_COUNT += parseInt(armorMatch[1]);

  // Sensor: PC, (\d+) slot
  const sensorMatch = sensor.match(/PC, (\d+) slot/);
  if (sensorMatch) SLOT_COUNT += parseInt(sensorMatch[1]);

  // Weapon Master: WR, (\d+) slot
  const wmMatch = weaponMaster.match(/WR, (\d+) slot/);
  if (wmMatch) SLOT_COUNT += parseInt(wmMatch[1]);

  // Weapon Secondary: WR, (\d+) slot
  const wsMatch = weaponSecondary.match(/WR, (\d+) slot/);
  if (wsMatch) SLOT_COUNT += parseInt(wsMatch[1]);

  // Weapon Bomb: WD, (\d+) slot
  const wbMatch = weaponBomb.match(/WD, (\d+) slot/);
  if (wbMatch) SLOT_COUNT += parseInt(wbMatch[1]);

  // Frame slots: = BF (\d+) slot
  const frameMatch = frame.match(/= BF (\d+) slot/);
  const frameSlots = frameMatch ? parseInt(frameMatch[1]) : 0;

  const slotsDisplay = `${frameSlots}/${SLOT_COUNT}`;
  const slotsColor = SLOT_COUNT > frameSlots ? 'red' : 'black';

  // WEIGHT_TOTAL
  let WEIGHT_TOTAL = 0;

  // Frame: ND, (\d+) weight
  const frameWeightMatch = frame.match(/ND, (\d+) weight/);
  if (frameWeightMatch) WEIGHT_TOTAL += parseInt(frameWeightMatch[1]);

  // Engine: PO, (\d+) weight
  const engineWeightMatch = engine.match(/PO, (\d+) weight/);
  if (engineWeightMatch) WEIGHT_TOTAL += parseInt(engineWeightMatch[1]);

  // Armor: AD, (\d+) weight
  const armorWeightMatch = armor.match(/AD, (\d+) weight/);
  if (armorWeightMatch) WEIGHT_TOTAL += parseInt(armorWeightMatch[1]);

  // Sensor: slots, (\d+) weight
  const sensorWeightMatch = sensor.match(/slots, (\d+) weight/);
  if (sensorWeightMatch) WEIGHT_TOTAL += parseInt(sensorWeightMatch[1]);

  // Weapon Master: PC, (\d+) weight
  const wmWeightMatch = weaponMaster.match(/PC, (\d+) weight/);
  if (wmWeightMatch) WEIGHT_TOTAL += parseInt(wmWeightMatch[1]);

  // Weapon Secondary: PC, (\d+) weight
  const wsWeightMatch = weaponSecondary.match(/PC, (\d+) weight/);
  if (wsWeightMatch) WEIGHT_TOTAL += parseInt(wsWeightMatch[1]);

  // Weapon Bomb: PC, (\d+) weight
  const wbWeightMatch = weaponBomb.match(/PC, (\d+) weight/);
  if (wbWeightMatch) WEIGHT_TOTAL += parseInt(wbWeightMatch[1]);

  // GOLD_COUNT
  let GOLD_COUNT = 0;

  // Frame: weight, (\d+) cost
  const frameGoldMatch = frame.match(/weight, (\d+) cost/);
  if (frameGoldMatch) GOLD_COUNT += parseInt(frameGoldMatch[1]);

  // Engine: weight, (\d+) cost
  const engineGoldMatch = engine.match(/weight, (\d+) cost/);
  if (engineGoldMatch) GOLD_COUNT += parseInt(engineGoldMatch[1]);

  // Armor: weight, (\d+) cost
  const armorGoldMatch = armor.match(/weight, (\d+) cost/);
  if (armorGoldMatch) GOLD_COUNT += parseInt(armorGoldMatch[1]);

  // Sensor: weight, (\d+) cost
  const sensorGoldMatch = sensor.match(/weight, (\d+) cost/);
  if (sensorGoldMatch) GOLD_COUNT += parseInt(sensorGoldMatch[1]);

  // Weapon Master: weight, (\d+) cost
  const wmGoldMatch = weaponMaster.match(/weight, (\d+) cost/);
  if (wmGoldMatch) GOLD_COUNT += parseInt(wmGoldMatch[1]);

  // Weapon Secondary: weight, (\d+) cost
  const wsGoldMatch = weaponSecondary.match(/weight, (\d+) cost/);
  if (wsGoldMatch) GOLD_COUNT += parseInt(wsGoldMatch[1]);

  // Weapon Bomb: weight, (\d+) cost
  const wbGoldMatch = weaponBomb.match(/weight, (\d+) cost/);
  if (wbGoldMatch) GOLD_COUNT += parseInt(wbGoldMatch[1]);

  // POWER_TOTAL
  let POWER_TOTAL = 0;

  // Weapon Master: = WM (\d+) WD,
  const wmPowerMatch = weaponMaster.match(/= WM (\d+) WD,/);
  if (wmPowerMatch) POWER_TOTAL += parseInt(wmPowerMatch[1]);

  // Weapon Secondary: = WS (\d+) WD,
  const wsPowerMatch = weaponSecondary.match(/= WS (\d+) WD,/);
  if (wsPowerMatch) POWER_TOTAL += parseInt(wsPowerMatch[1]);

  // Weapon Bomb: = WB (\d+),(\d+) WD,
  const wbPowerMatch = weaponBomb.match(/= WB (\d+),(\d+) WD,/);
  if (wbPowerMatch) {
    POWER_TOTAL += parseInt(wbPowerMatch[1]) + parseInt(wbPowerMatch[2]);
  }

  // POWER_OUTPUT
  let POWER_OUTPUT = 0;

  // Engine: slots, (\d+) PO,
  const poMatch = engine.match(/slots, (\d+) PO,/);
  if (poMatch) POWER_OUTPUT += parseInt(poMatch[1]);

  // MAX_MOVEMENT
  const MAX_MOVEMENT = Math.floor((POWER_OUTPUT - POWER_TOTAL - WEIGHT_TOTAL - 1000) / 2000);

  SHOW_COMBAT_RECORD_POPUP("CHECK_BOT_TOTALS");
  return {
    slotsDisplay,
    slotsColor,
    totalWeight: WEIGHT_TOTAL.toString(),
    totalGold: GOLD_COUNT.toString(),
    totalPower: POWER_TOTAL.toString(),
    move: MAX_MOVEMENT.toString(),
  };
}

/**
 * GET_VALUES_FROM_RECORDS
 * 
 * Extracts and initializes all combat variables from the current bot record.
 * Called during main combat loop to populate combat tracking variables.
 * 
 * @param {object} currentBot - Current bot record from ALL_BOTS_IN_COMBAT_LIST
 * @param {number} armyNumber - Army number (1 or 2)
 * @param {number} currentBotNumber - Bot number in the army
 * @returns {Promise<object>} - Object containing all initialized combat variables
 */
export async function GET_VALUES_FROM_RECORDS(currentBot, armyNumber, currentBotNumber) {
  console.log(`GET_VALUES_FROM_RECORDS called for bot: ${currentBot.name}, army: ${armyNumber}`);

  try {
    // Extract basic bot information
    const CURRENT_BOT_NAME = currentBot.name;
    const CURRENT_BOT_NUMBER = currentBotNumber;
    const CURRENT_BOT_LOCATION = currentBot.location || "0,0";
    const RECORD_BOT_ARMY = armyNumber;
    const CURRENT_BOT_FACING = currentBot.facing || "N";

    // Animation variables
    const ANI_BOT_NUMBER = CURRENT_BOT_NUMBER;
    const ANI_BOT_FACING = CURRENT_BOT_FACING;
    const ANI_IMAGE_NAME_PART = currentBot.botImage || "Default Bot Image";
    const ANI_IMAGE_NAME_FULL = `${ANI_IMAGE_NAME_PART}_P${RECORD_BOT_ARMY}_D${ANI_BOT_FACING}`;

    // Bullet variables
    const CURRENT_BULLET_LOCATION = CURRENT_BOT_LOCATION;
    const CURRENT_BULLET_FACING = ANI_BOT_FACING;

    // Movement
    const moveValue = parseInt(currentBot.move || "0");
    const CURRENT_BOT_MOVEMENT = moveValue > 0 ? moveValue : 0;

    // Query Components DB for armor stats
    const frameComponent = await db.botFrames.where("name").equals(currentBot.frame).first();
    const armorComponent = await db.botArmors.where("name").equals(currentBot.armor).first();
    const CURRENT_BOT_ARMOR = RECORD_BOT_ARMOR = (frameComponent?.nd || 0) + (armorComponent?.ad || 0);

    // Query weapon stats
    const masterWeapon = await db.botMasters.where("name").equals(currentBot.weaponMaster).first();
    const secondaryWeapon = await db.botSecondaries.where("name").equals(currentBot.weaponSecondary).first();
    const bombWeapon = await db.botBombs.where("name").equals(currentBot.weaponBomb).first();

    const CURRENT_MASTER_WEAPON_RANGE = RECORD_MASTER_WEAPON_RANGE = masterWeapon?.wr || 0;
    const CURRENT_SECONDARY_WEAPON_RANGE = RECORD_SECONDARY_WEAPON_RANGE = secondaryWeapon?.wr || 0;
    const CURRENT_MASTER_WEAPON_DAMAGE = RECORD_MASTER_WEAPON_DAMAGE = masterWeapon?.wd || 0;
    const CURRENT_SECONDARY_WEAPON_DAMAGE = RECORD_SECONDARY_WEAPON_DAMAGE = secondaryWeapon?.wd || 0;

    // Query sensor stats
    const sensorComponent = await db.botSensors.where("name").equals(currentBot.sensor).first();
    const RECORD_BOT_SENSOR_RANGE = sensorComponent?.range || 0;
    const RECORD_BOT_SENSOR_COUNT = sensorComponent?.targets || 0;

    // Bomb damage
    const RECORD_BOMB1_DAMAGE = bombWeapon?.wd || 0;
    const RECORD_BOMB2_DAMAGE = Math.floor(RECORD_BOMB1_DAMAGE / 2);

    // Constants
    const CLOCKWISE_COMPASS_DIRECTION = "North,NorthEast,East,SouthEast,South,SouthWest,West,NorthWest".split(",");
    const COUNTERCLOCKWISE_COMPASS_DIRECTION = "North,NorthWest,West,SouthWest,South,SouthEast,East,NorthEast".split(",");

    // Temporary tracking variables
    const ACTIONS_COUNT_TEMP = "";
    const ACTIONS_MAX_TEMP = "";
    const ANI_MOVE_TO = "";
    const ANI_NUMBER_TEMP = "1-100";
    const ANI_SHORT_FACING = "";
    const CURRENT_BULLET_TARGET1 = "";
    const CURRENT_BULLET_TARGET2 = "";
    const CURRENT_COMMAND = "";
    const NEW_GAME_MAP_SQUARE = "";
    const NEXT_BOT_LOCATION = "";
    const NEXT_BOT_FACING = "";
    const NEXT_BULLET_LOCATION = "";
    const SENSOR_ALLIED_BOTS = "0,0,0,0,0";
    const SENSOR_ENEMY_BOTS = "0,0,0,0,0";

    // Delay constants
    const ANI_MICRO_DELAY = 0.5;
    const ANI_MACRO_DELAY = 1.0;

    // Bullet name
    const ANI_BULLET_NAME = "Bullet_All";

    // Keep backup copy
    const ALL_BOTS_IN_COMBAT_LIST_TEMP = currentBot;

    SHOW_COMBAT_RECORD_POPUP("GET_VALUES_FROM_RECORDS");
    return {
      CURRENT_BOT_NAME,
      CURRENT_BOT_NUMBER,
      CURRENT_BOT_LOCATION,
      RECORD_BOT_ARMY,
      CURRENT_BOT_FACING,
      ANI_BOT_NUMBER,
      ANI_BOT_FACING,
      ANI_IMAGE_NAME_PART,
      ANI_IMAGE_NAME_FULL,
      CURRENT_BULLET_LOCATION,
      CURRENT_BULLET_FACING,
      CURRENT_BOT_MOVEMENT,
      CURRENT_BOT_ARMOR,
      RECORD_BOT_ARMOR,
      CURRENT_MASTER_WEAPON_RANGE,
      RECORD_MASTER_WEAPON_RANGE,
      CURRENT_SECONDARY_WEAPON_RANGE,
      RECORD_SECONDARY_WEAPON_RANGE,
      CURRENT_MASTER_WEAPON_DAMAGE,
      RECORD_MASTER_WEAPON_DAMAGE,
      CURRENT_SECONDARY_WEAPON_DAMAGE,
      RECORD_SECONDARY_WEAPON_DAMAGE,
      RECORD_BOT_SENSOR_RANGE,
      RECORD_BOT_SENSOR_COUNT,
      RECORD_BOMB1_DAMAGE,
      RECORD_BOMB2_DAMAGE,
      CLOCKWISE_COMPASS_DIRECTION,
      COUNTERCLOCKWISE_COMPASS_DIRECTION,
      ACTIONS_COUNT_TEMP,
      ACTIONS_MAX_TEMP,
      ANI_MOVE_TO,
      ANI_NUMBER_TEMP,
      ANI_SHORT_FACING,
      CURRENT_BULLET_TARGET1,
      CURRENT_BULLET_TARGET2,
      CURRENT_COMMAND,
      NEW_GAME_MAP_SQUARE,
      NEXT_BOT_LOCATION,
      NEXT_BOT_FACING,
      NEXT_BULLET_LOCATION,
      SENSOR_ALLIED_BOTS,
      SENSOR_ENEMY_BOTS,
      ANI_MICRO_DELAY,
      ANI_MACRO_DELAY,
      ANI_BULLET_NAME,
      ALL_BOTS_IN_COMBAT_LIST_TEMP,
    };
  } catch (error) {
    console.error("GET_VALUES_FROM_RECORDS error:", error);
    SHOW_COMBAT_RECORD_POPUP("GET_VALUES_FROM_RECORDS");
    return { success: false, message: "Failed to get values from records." };
  }
}

/**
 * UPDATE_MAP_SQUARES
 * 
 * Updates the game map with current bot positions.
 * Iterates through all map squares and places bot numbers or zero values.
 * 
 * @param {array} gameMapSquares - Array of all game map squares
 * @param {array} allBotsInCombatList - List of all bots in combat with positions
 * @returns {array} - Updated game map with bot placements (GAME_MAP_BOTS)
 */
export function UPDATE_MAP_SQUARES(gameMapSquares, allBotsInCombatList) {
  console.log("UPDATE_MAP_SQUARES called");

  try {
    // Copy the bot list to temp
    const ALL_BOTS_IN_COMBAT_LIST_TEMP = [...allBotsInCombatList];
    const GAME_MAP_BOTS = [];

    let COUNT_TEMP = 0;

    // For each square on the game map
    for (const CURRENT_SQUARE of gameMapSquares) {
      COUNT_TEMP++;

      // Track if a bot is on this square
      let botFound = false;

      // For each bot position in the list
      for (const CURRENT_POSITION of ALL_BOTS_IN_COMBAT_LIST_TEMP) {
        // Check if bot is at this square location
        if (CURRENT_SQUARE === CURRENT_POSITION.location) {
          // Place bot number on this square
          GAME_MAP_BOTS.push(CURRENT_POSITION.botNumber + ",");
          botFound = true;
          break;
        }
      }

      // If no bot found on this square, mark as empty
      if (!botFound) {
        GAME_MAP_BOTS.push("0,");
      }
    }

    console.log(`UPDATE_MAP_SQUARES completed. Updated ${COUNT_TEMP} squares.`);
    SHOW_COMBAT_RECORD_POPUP("UPDATE_MAP_SQUARES");
    return GAME_MAP_BOTS;
  } catch (error) {
    console.error("UPDATE_MAP_SQUARES error:", error);
    SHOW_COMBAT_RECORD_POPUP("UPDATE_MAP_SQUARES");
    return [];
  }
}

/**
 * EXECUTE_ORDERS_LIST
 * 
 * Executes a sequence of combat orders for a bot.
 * Processes each command in the orders list and calls appropriate handlers.
 * 
 * @param {array} recordOrdersList - Array of command strings to execute
 * @param {array} allBotsInCombatList - List of all bots in combat
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function EXECUTE_ORDERS_LIST(recordOrdersList, allBotsInCombatList) {
  console.log("EXECUTE_ORDERS_LIST called");

  try {
    let CURRENT_IS_CONDITIONAL = "FALSE";
    let ACTIONS_COUNT_TEMP = 0;
    let ACTIONS_MAX_TEMP = recordOrdersList.length;

    // For each command in the orders list
    for (const CURRENT_COMMAND of recordOrdersList) {
      // Copy bot list to temp
      const ALL_BOTS_IN_COMBAT_LIST_TEMP = [...allBotsInCombatList];

      // Do while ACTIONS_COUNT_TEMP is not greater than ACTIONS_MAX_TEMP
      while (ACTIONS_COUNT_TEMP <= ACTIONS_MAX_TEMP) {
        if (CURRENT_IS_CONDITIONAL === "FALSE") {
          // Increment action counter
          ACTIONS_COUNT_TEMP++;

          // ============== MOVEMENT COMMANDS ==============
          if (CURRENT_COMMAND === "Move Forward 1") {
            await CURRENT_MOVE_BOT1();
          } else if (CURRENT_COMMAND === "Move Forward 2") {
            await CURRENT_MOVE_BOT2();
            await CURRENT_MOVE_BOT1();
          } else if (CURRENT_COMMAND === "Move Forward 3") {
            await CURRENT_MOVE_BOT3();
            await CURRENT_MOVE_BOT1();
          } else if (CURRENT_COMMAND === "Move Forward 4") {
            await CURRENT_MOVE_BOT4();
          } else if (CURRENT_COMMAND === "Move Forward 5") {
            await CURRENT_MOVE_BOT5();
          } else if (CURRENT_COMMAND === "Move Forward Max") {
            await CURRENT_MOVE_BOTMAX();
          }
          // ============== BACKWARD MOVEMENT ==============
          else if (CURRENT_COMMAND === "Move Backward 1") {
            await CURRENT_MOVE_BOT_BACK1();
          } else if (CURRENT_COMMAND === "Move Backward 2") {
            await CURRENT_MOVE_BOT_BACK2();
          } else if (CURRENT_COMMAND === "Move Backward 3") {
            await CURRENT_MOVE_BOT_BACK3();
          }
          // ============== ROTATION COMMANDS ==============
          else if (CURRENT_COMMAND === "Turn Left") {
            await CURRENT_ROTATE_BOT("left");
          } else if (CURRENT_COMMAND === "Turn Right") {
            await CURRENT_ROTATE_BOT("right");
          } else if (CURRENT_COMMAND === "Angle Left") {
            await CURRENT_ROTATE_BOT("left");
          } else if (CURRENT_COMMAND === "Angle Right") {
            await CURRENT_ROTATE_BOT("right");
          }
          // ============== MOVEMENT TOWARD ENEMY ==============
          else if (CURRENT_COMMAND === "Move toward located Enemy") {
            await CURRENT_MOVE_BLOCKED_ENEMY();
          } else if (CURRENT_COMMAND === "Move Toward Located Enemy") {
            await CURRENT_MOVE_TOWARD_ENEMY();
          }
          // ============== WEAPON FIRE COMMANDS ==============
          else if (CURRENT_COMMAND === "Fire Master Weapon") {
            await FIRE_MASTER_WEAPON();
          } else if (CURRENT_COMMAND === "Fire Seconday Weapon") {
            await FIRE_SECONDARY_WEAPON();
          } else if (CURRENT_COMMAND === "Fire All") {
            await FIRE_ALL_WEAPONS();
          }
          // ============== SPECIAL ABILITY COMMANDS ==============
          else if (CURRENT_COMMAND === "Activate Targeting Map") {
            await CURRENT_ACTIVATE_SCANNER();
          } else if (CURRENT_COMMAND === "Activate Self-Destruct") {
            await CURRENT_ACTIVATE_SELF_DESTRUCT();
          }
          // ============== CONDITIONAL COMMANDS ==============
          else if (CURRENT_COMMAND === "If No Allies Detected ...") {
            // Placeholder for conditional check
            CURRENT_IS_CONDITIONAL = "TRUE";
          } else if (CURRENT_COMMAND === "If Facing Off-Map ...") {
            CURRENT_IS_CONDITIONAL = "TRUE";
            await CURRENT_ROTATE_BOT("left");
          } else if (CURRENT_COMMAND === "If Any Enemies in Range ...") {
            CURRENT_IS_CONDITIONAL = "TRUE";
            await IDENTIFY_ANY_ENEMIES();
          } else if (CURRENT_COMMAND === "If Your Armor is Below 500 ...") {
            CURRENT_IS_CONDITIONAL = "TRUE";
            await CURRENT_ARMOR_WEAK(500);
          } else if (CURRENT_COMMAND === "If Your Armor is Below 300 ...") {
            CURRENT_IS_CONDITIONAL = "TRUE";
            await CURRENT_ARMOR_WEAK(300);
          } else if (CURRENT_COMMAND === "If Your Armor is Below 100 ...") {
            CURRENT_IS_CONDITIONAL = "TRUE";
            await CURRENT_ARMOR_WEAK(100);
          }

          // Break after processing
          break;
        } else {
          // If conditional flag was set, reset it
          CURRENT_IS_CONDITIONAL = "FALSE";
          break;
        }
      }
    }

    console.log(`EXECUTE_ORDERS_LIST completed. Executed ${ACTIONS_COUNT_TEMP} actions.`);
    SHOW_COMBAT_RECORD_POPUP("EXECUTE_ORDERS_LIST");
    return { success: true, message: "Orders executed successfully." };
  } catch (error) {
    console.error("EXECUTE_ORDERS_LIST error:", error);
    SHOW_COMBAT_RECORD_POPUP("EXECUTE_ORDERS_LIST");
    return { success: false, message: "Failed to execute orders list." };
  }
}

// ============================================================================
// PLACEHOLDER MOVEMENT FUNCTIONS
// These will be implemented with actual movement logic
// ============================================================================

export async function CURRENT_MOVE_BOT1() {
  console.log("CURRENT_MOVE_BOT1 called");
  SHOW_COMBAT_RECORD_POPUP("CURRENT_MOVE_BOT1");
}

export async function CURRENT_MOVE_BOT2() {
  console.log("CURRENT_MOVE_BOT2 called");
  SHOW_COMBAT_RECORD_POPUP("CURRENT_MOVE_BOT2");
}

export async function CURRENT_MOVE_BOT3() {
  console.log("CURRENT_MOVE_BOT3 called");
  SHOW_COMBAT_RECORD_POPUP("CURRENT_MOVE_BOT3");
}

export async function CURRENT_MOVE_BOT4() {
  console.log("CURRENT_MOVE_BOT4 called");
  SHOW_COMBAT_RECORD_POPUP("CURRENT_MOVE_BOT4");
}

export async function CURRENT_MOVE_BOT5() {
  console.log("CURRENT_MOVE_BOT5 called");
  SHOW_COMBAT_RECORD_POPUP("CURRENT_MOVE_BOT5");
}

export async function CURRENT_MOVE_BOTMAX() {
  console.log("CURRENT_MOVE_BOTMAX called");
  SHOW_COMBAT_RECORD_POPUP("CURRENT_MOVE_BOTMAX");
}

export async function CURRENT_MOVE_BOT_BACK1() {
  console.log("CURRENT_MOVE_BOT_BACK1 called");
  SHOW_COMBAT_RECORD_POPUP("CURRENT_MOVE_BOT_BACK1");
}

export async function CURRENT_MOVE_BOT_BACK2() {
  console.log("CURRENT_MOVE_BOT_BACK2 called");
  SHOW_COMBAT_RECORD_POPUP("CURRENT_MOVE_BOT_BACK2");
}

export async function CURRENT_MOVE_BOT_BACK3() {
  console.log("CURRENT_MOVE_BOT_BACK3 called");
  SHOW_COMBAT_RECORD_POPUP("CURRENT_MOVE_BOT_BACK3");
}

export async function CURRENT_ROTATE_BOT(direction) {
  console.log(`CURRENT_ROTATE_BOT called with direction: ${direction}`);
  SHOW_COMBAT_RECORD_POPUP("CURRENT_ROTATE_BOT");
}

export async function CURRENT_MOVE_BLOCKED_ENEMY() {
  console.log("CURRENT_MOVE_BLOCKED_ENEMY called");
  SHOW_COMBAT_RECORD_POPUP("CURRENT_MOVE_BLOCKED_ENEMY");
}

export async function CURRENT_MOVE_TOWARD_ENEMY() {
  console.log("CURRENT_MOVE_TOWARD_ENEMY called");
  SHOW_COMBAT_RECORD_POPUP("CURRENT_MOVE_TOWARD_ENEMY");
}

export async function FIRE_MASTER_WEAPON() {
  console.log("FIRE_MASTER_WEAPON called");
  SHOW_COMBAT_RECORD_POPUP("FIRE_MASTER_WEAPON");
}

export async function FIRE_SECONDARY_WEAPON() {
  console.log("FIRE_SECONDARY_WEAPON called");
  SHOW_COMBAT_RECORD_POPUP("FIRE_SECONDARY_WEAPON");
}

export async function FIRE_ALL_WEAPONS() {
  console.log("FIRE_ALL_WEAPONS called");
  SHOW_COMBAT_RECORD_POPUP("FIRE_ALL_WEAPONS");
}

export async function CURRENT_ACTIVATE_SCANNER() {
  console.log("CURRENT_ACTIVATE_SCANNER called");
  SHOW_COMBAT_RECORD_POPUP("CURRENT_ACTIVATE_SCANNER");
}

/**
 * CURRENT_ACTIVATE_SCANNER (Full Implementation)
 * 
 * Activates the bot's scanner to identify enemy targets within range.
 * Uses the targeting map to determine which enemies are visible and within scanner range.
 * Sets CURRENT_BULLET_TARGET1 and CURRENT_BULLET_TARGET2 with identified enemy locations.
 * 
 * @param {object} combatState - Object containing all combat variables
 * @returns {Promise<object>} - Updated combat state with targets identified
 */
export async function CURRENT_ACTIVATE_SCANNER_FULL(combatState) {
  console.log("CURRENT_ACTIVATE_SCANNER_FULL called");

  try {
    // Initialize target variables
    let CURRENT_BULLET_TARGET1 = "";
    let CURRENT_BULLET_TARGET2 = "";

    // Get scanner range from combat state
    const SCANNER_RANGE = combatState.RECORD_BOT_SENSOR_RANGE || 1;

    // Get current targeting map (without name and range info)
    const CURRENT_TARGETING_MAP = combatState.RECORD_TARGETING_MAP || [];

    // Rotate targeting map based on current bot facing
    const ROTATED_MAP = await ROTATE_TARGETING_MAP(CURRENT_TARGETING_MAP, combatState.CURRENT_BOT_FACING);

    // Initialize game map targeting with current bot positions
    let GAME_MAP_TARGETING = [...combatState.GAME_MAP_BOTS];

    // Filter targeting map by scanner range
    let SPACE_COUNT = 0;
    for (let i = 0; i < GAME_MAP_TARGETING.length; i++) {
      const SPACE_CURRENT = GAME_MAP_TARGETING[i];

      if (SPACE_CURRENT !== 0 && SPACE_CURRENT !== "0,") {
        // Check if space is within scanner range
        const isInRange = calculateDistance(i, combatState.CURRENT_BOT_LOCATION, SCANNER_RANGE);

        if (!isInRange) {
          // Out of range - set to 0
          GAME_MAP_TARGETING[i] = "0,";
        } else {
          // In range - use targeting map value
          GAME_MAP_TARGETING[i] = ROTATED_MAP[i] || "0,";
        }
      }
    }

    // Copy bot list to temp
    const ALL_BOTS_IN_COMBAT_LIST_TEMP = combatState.allBotsInCombatList || [];

    // Identify locations of up to 2 enemy bots in range
    SPACE_COUNT = 0;
    for (const CURRENT_BOT_TEMP of ALL_BOTS_IN_COMBAT_LIST_TEMP) {
      if (CURRENT_BULLET_TARGET2 !== "") {
        break; // Found 2 targets, stop
      }

      const BOT_LOCATION_TEMP = CURRENT_BOT_TEMP.location || "0,0";
      const CURRENT_TARGETING_BOT_ARMY = CURRENT_BOT_TEMP.army || 1;

      // Search through targeting map for this bot
      for (let mapIndex = 0; mapIndex < GAME_MAP_TARGETING.length; mapIndex++) {
        const SPACE_TEMP = GAME_MAP_TARGETING[mapIndex];
        SPACE_COUNT++;

        // If space is occupied and in targeting zone
        if (SPACE_TEMP !== "0," && SPACE_TEMP !== 0) {
          // Update map with bot number
          GAME_MAP_TARGETING[mapIndex] = CURRENT_BOT_TEMP.botNumber || "0,";

          // Check if this is an enemy (different army)
          if (CURRENT_TARGETING_BOT_ARMY !== combatState.RECORD_BOT_ARMY) {
            // Enemy bot found
            if (CURRENT_BULLET_TARGET1 === "") {
              CURRENT_BULLET_TARGET1 = BOT_LOCATION_TEMP;
            } else if (CURRENT_BULLET_TARGET2 === "") {
              CURRENT_BULLET_TARGET2 = BOT_LOCATION_TEMP;
            }
          }
        }
      }
    }

    console.log(`Scanner activated. Target1: ${CURRENT_BULLET_TARGET1}, Target2: ${CURRENT_BULLET_TARGET2}`);
    SHOW_COMBAT_RECORD_POPUP("CURRENT_ACTIVATE_SCANNER_FULL");

    return {
      ...combatState,
      CURRENT_BULLET_TARGET1,
      CURRENT_BULLET_TARGET2,
      GAME_MAP_TARGETING,
    };
  } catch (error) {
    console.error("CURRENT_ACTIVATE_SCANNER_FULL error:", error);
    SHOW_COMBAT_RECORD_POPUP("CURRENT_ACTIVATE_SCANNER_FULL");
    return combatState;
  }
}

/**
 * Helper function to calculate distance between two map positions
 * @param {number} space1 - First space index
 * @param {string} location2 - Second location string
 * @param {number} maxRange - Maximum range allowed
 * @returns {boolean} - True if within range
 */
function calculateDistance(space1, location2, maxRange) {
  // Parse location string (assumes format "x,y")
  const [x2, y2] = location2.split(",").map(Number);
  
  // Convert space index to x,y (assumes 10x10 grid)
  const x1 = space1 % 10;
  const y1 = Math.floor(space1 / 10);

  // Calculate Manhattan distance
  const distance = Math.abs(x1 - x2) + Math.abs(y1 - y2);
  const isWithinRange = distance <= maxRange;
  SHOW_COMBAT_RECORD_POPUP("calculateDistance");
  return isWithinRange;
}

/**
 * ROTATE_TARGETING_MAP
 * 
 * Rotates the targeting map based on bot's current facing direction.
 * This ensures the targeting grid aligns with the bot's orientation.
 * 
 * @param {array} targetingMap - Original targeting map grid
 * @param {string} facing - Current bot facing (N, NE, E, SE, S, SW, W, NW)
 * @returns {Promise<array>} - Rotated targeting map
 */
export async function ROTATE_TARGETING_MAP(targetingMap, facing) {
  console.log(`ROTATE_TARGETING_MAP called with facing: ${facing}`);

  try {
    // Map facing directions to rotation amounts (in 45-degree increments)
    const rotationMap = {
      "N": 0,    // 0 degrees
      "NE": 1,   // 45 degrees
      "E": 2,    // 90 degrees
      "SE": 3,   // 135 degrees
      "S": 4,    // 180 degrees
      "SW": 5,   // 225 degrees
      "W": 6,    // 270 degrees
      "NW": 7,   // 315 degrees
    };

    const rotations = rotationMap[facing] || 0;
    let rotatedMap = [...targetingMap];

    // Perform rotations
    for (let r = 0; r < rotations; r++) {
      rotatedMap = rotateGridClockwise(rotatedMap);
    }

    return rotatedMap;
  } catch (error) {
    console.error("ROTATE_TARGETING_MAP error:", error);
    return targetingMap;
  }
}

/**
 * Helper function to rotate a grid 90 degrees clockwise
 * @param {array} grid - Grid to rotate
 * @returns {array} - Rotated grid
 */
function rotateGridClockwise(grid) {
  // Assumes 7x7 grid for targeting map
  const size = 7;
  const rotated = Array(grid.length).fill(0);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const oldIndex = i * size + j;
      const newIndex = j * size + (size - 1 - i);
      rotated[newIndex] = grid[oldIndex];
    }
  }

  SHOW_COMBAT_RECORD_POPUP("rotateGridClockwise");
  return rotated;
}

export async function CURRENT_ACTIVATE_SELF_DESTRUCT() {
  console.log("CURRENT_ACTIVATE_SELF_DESTRUCT called");
  SHOW_COMBAT_RECORD_POPUP("CURRENT_ACTIVATE_SELF_DESTRUCT");
}

export async function IDENTIFY_ANY_ENEMIES() {
  console.log("IDENTIFY_ANY_ENEMIES called");
  SHOW_COMBAT_RECORD_POPUP("IDENTIFY_ANY_ENEMIES");
}

export async function CURRENT_ARMOR_WEAK(threshold) {
  console.log(`CURRENT_ARMOR_WEAK called with threshold: ${threshold}`);
  SHOW_COMBAT_RECORD_POPUP("CURRENT_ARMOR_WEAK");
}

export function CREATE_ALL_BOTS_IN_COMBAT_LIST(army1Bots = [], army2Bots = []) {
  const allBots = [...army1Bots, ...army2Bots];
  const firstArmyCount = Array.isArray(army1Bots) ? army1Bots.length : 0;

  return allBots.map((bot, index) => ({
    ...bot,
    combatBotNumber: bot.botNumber || index + 1,
    army: bot.army || (index < firstArmyCount ? 1 : 2),
  }));
  console.log(`CREATE_ALL_BOTS_IN_COMBAT_LIST called with threshold: ${threshold}`);
  SHOW_COMBAT_RECORD_POPUP("CREATE_ALL_BOTS_IN_COMBAT_LIST");
}
