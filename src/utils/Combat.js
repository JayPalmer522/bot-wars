/**
 * Combat.js
 *
 * Handles all combat simulation logic, turn-based mechanics, and battle calculations.
 */

//import db from "../db"; // missing or wrong path
import { db } from "../db/db";

//import { db } from "../db/db";

export let SHOW_COMBAT_RECORD = "TRUE";

// Extract component name from a full description string.
// e.g. "Micro-bot = BF 10 slots, 10 ND..." → "Micro-bot"
function extractComponentName(descriptionString) {
  return descriptionString?.split(" = ")[0]?.trim() || "";
}

/**
 * BEGIN_COMBAT
 * 
 * This function looks at the 2 armies named in the two textboxes on the
 * COMBAT_SCREEN, and searches for those 2 armies in the database. Then it goes
 * through each and gets the names of the Bots in the Army Database for 
 * army1Id (name of first army) and army2Id (name of second army), and goes 
 * to the Bots Database to get those Bots and add the data of each bot into an 
 * objects bots1 and bots2.
 *
 * After this is done, all needed data is gotten from the Army and Bots
 * Databases. There is still a Components Database where date for specific 
 * components, like weapon damage and scanner ranges, may be acquired. 
 *
 * The Combat settings (maxGold, maxWeight, maxPower, etc.) are used only to insure that these values are able to be listed on the RESULTS_SCREEN.
 * 
 * These objects (bots1 and bots2) are passed to the function 
 * CREATE_ALL_BOTS_IN_COMBAT_LIST, which returns ALL_BOTS_IN_COMBAT_LIST.
 * 
 * The BEGIN_COMBAT function also creates the COMBAT_RECORD object. The  
 * BEGIN_COMBAT logs the Settings Data (maxGold, etc.). All commands for the
 * 3rd stage of the game (Animations) are logged to COMBAT_RECORD.
 * 
 * After this, the function BEGIN_COMBAT calls the function
 * CREATE_ALL_BOTS_IN_COMBAT_LIST, which makes the main object for the game.
 * 
 * After this, the function BEGIN_COMBAT calls the function
 * MAIN_COMBAT_LOOP, passing to it the ALL_BOTS_IN_COMBAT_LIST.
 * 
 * The function BEGIN_COMBAT MUST ALSO PASS THE VALUE OF COMBAT_RECORD to 
 * the function MAIN_COMBAT_LOOP!!!!
 *
 * After the combat, the function MAIN_COMBAT_LOOP calls the logs the victory
 * and ratings of the player(s) in the PROFILES database.
 *
 * After the combat, the function MAIN_COMBAT_LOOP calls the ANIMATION process
 * and let's the player watch the game. 
 *
 * In the end, the function MAIN_COMBAT_LOOP calls the RESULTS_SCREEN after 
 * the animation is complete.
 * 
 */
export async function BEGIN_COMBAT(army1Id, army2Id, settings = {}) {
  console.log("...Function BEGIN_COMBAT End...");

  SHOW_COMBAT_RECORD = "TRUE";
  console.log(`BEGIN_COMBAT: Army1=${army1Id}, Army2=${army2Id}`);

  try {
    const army1 = await db.armies.get(army1Id);
    const army2 = await db.armies.get(army2Id);

    if (!army1 || !army2) {
      return { success: false, message: "One or both armies not found." };
    }

    const bots1 = await Promise.all(army1.botIds.map(id => db.bots.get(id)));
    const bots2 = await Promise.all(army2.botIds.map(id => db.bots.get(id)));

    const COMBAT_RECORD = [];
    COMBAT_RECORD.push({
      date: new Date().toLocaleDateString(),
      maxGoldSelection:   settings.maxGoldSelection   || "No limits",
      maxWeightSelection: settings.maxWeightSelection || "No limits",
      maxPowerSelection:  settings.maxPowerSelection  || "No limits",
      playerName: settings.playerName || "Unknown Player",
      army1Name: army1.name,
      army2Name: army2.name,
    });

    const ALL_BOTS_IN_COMBAT_LIST = CREATE_ALL_BOTS_IN_COMBAT_LIST(bots1, bots2);
    console.log("ALL_BOTS_IN_COMBAT_LIST:", JSON.stringify(ALL_BOTS_IN_COMBAT_LIST));

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
      settings,
      isActive: true,
    };
    console.log("COMBAT_RECORD:", JSON.stringify(COMBAT_RECORD));
	
    console.log(`Combat initialized: ${battleState.battleId}`);

    await MAIN_COMBAT_LOOP(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
	
  dumpDB();

db.orderLists.toArray().then(console.log);

db.bots.toArray().then(console.log);

db.armies.toArray().then(console.log);



	
  console.log("...Function BEGIN_COMBAT End...");

    return { success: true, battleId: battleState.battleId, combatRecord: COMBAT_RECORD };
  } catch (error) {
    console.error("BEGIN_COMBAT error:", error);
    return { success: false, message: "Failed to initialize combat." };
  }
}

/**
 * CREATE_ALL_BOTS_IN_COMBAT_LIST
 *
 * Merges both army bot lists into a single interleaved list in random order.
 * Randomly decides which army goes first.
 */
export function CREATE_ALL_BOTS_IN_COMBAT_LIST(army1Bots = [], army2Bots = []) {
			console.log("...Function CREATE_ALL_BOTS_IN_COMBAT_LIST Start...");

  const firstArmy = Math.floor(Math.random() * 2) + 1;

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const shuffledArmy1 = shuffle(army1Bots);
  const shuffledArmy2 = shuffle(army2Bots);

  const allBots = [];
  const maxLength = Math.max(shuffledArmy1.length, shuffledArmy2.length);

  for (let i = 0; i < maxLength; i++) {
    if (firstArmy === 1) {
      if (i < shuffledArmy1.length) allBots.push({ ...shuffledArmy1[i], army: 1 });
      if (i < shuffledArmy2.length) allBots.push({ ...shuffledArmy2[i], army: 2 });
    } else {
      if (i < shuffledArmy2.length) allBots.push({ ...shuffledArmy2[i], army: 2 });
      if (i < shuffledArmy1.length) allBots.push({ ...shuffledArmy1[i], army: 1 });
    }
  }
  console.log("...Function CREATE_ALL_BOTS_IN_COMBAT_LIST END...");
  return allBots.map((bot, index) => ({
    ...bot,
    combatBotNumber: bot.botNumber || index + 1,
  }));
}


/**
 * MAIN_COMBAT_LOOP
 * ///////////////////////////////////////////////
 * Begins the battle simulation loop. 
 * MANUALLY CREATED BY JAY!
 * /////////////////////////////////////////////
 * The MAIN_COMBAT_LOOP function takes in the ALL_BOTS_IN_COMBAT_LIST. 
 * ////////////////////////////////////////////
 * The MAIN_COMBAT_LOOP function MUST TAKE IN COMBAT_RECORD, TOO! 
 *
 * Then it calls the function STARTING_MAP_SQUARES, passing to it the 
 * ALL_BOTS_IN_COMBAT_LIST, and takes the return of GAME_MAP_BOTS, where all 
 * 100 spaces (in order) are listed with a zero and and occupied starting locations have the ID number of the Bot starting there. This returns to the
 * function MAIN_COMBAT_LOOP the onject GAME_MAP_BOTS.
 *
 * The MAIN_COMBAT_LOOP function takes GAME_MAP_BOTS and then it creates a duplicate of this called 
 * MASTER_ALL_BOTS_IN_COMBAT_LIST, which it scrolls
 * through endlessly until the game is declared ended because of 
 * either of 2 conditions: one team has no Bots left in the  
 * ALL_BOTS_IN_COMBAT_LIST or more than 50 turns have passed with no Bot 
 * sustaining damage. 
 * 
 * For each Bot still alive (not on the DEAD_BOTS_LIST) the function 
 * MAIN_COMBAT_LOOP calls the function EXECUTE_BOT_ACTION, passing to it 
 * the ALL_BOTS_IN_COMBAT_LIST, GAME_MAP_BOTS, and COMBAT_RECORD.
 *
 * In the end, the function BEGIN_COMBAT after the combat 
 * is over, passing to it the COMBAT_RECORD. 
*/ 
export async function MAIN_COMBAT_LOOP(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD) {
		console.log("...Function MAIN COMBAT LOOP Start...");
////////  Run STARTING_MAP_SQUARES /////////////////
  const [GAME_MAP_BOTS, GAME_MAP_SQUARES] = STARTING_MAP_SQUARES(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
//  console.log("GAME_MAP_BOTS:" + GAME_MAP_BOTS); //Working here.
//  console.log("GAME_MAP_SQUARES:" + GAME_MAP_SQUARES); //Working here.
//		console.log(" JJJJJ: " + JSON.stringify(ALL_BOTS_IN_COMBAT_LIST));

  let TOO_MANY_TURNS = 0;
  let BOT_IS_DESTROYED = ['41','42','43'];
  let CURRENT_BOT_NUMBER = 0;
//  console.log(" BOT_IS_DESTROYED.includes(42);: " + BOT_IS_DESTROYED.includes("42"));
// BOT_IS_DESTROYED.includes("42");
//  while (TOO_MANY_TURNS <= 10){
//	  TOO_MANY_TURNS++;
//console.log("...........TOO MANY TURNS...........");
	for (var j = 0; j < ALL_BOTS_IN_COMBAT_LIST.length; j++){
//		console.log("..... Inside FOR .....");
		let CURRENT_BOT = ALL_BOTS_IN_COMBAT_LIST[j];
//		console.log(" VVVVVVV: " + JSON.stringify(ALL_BOTS_IN_COMBAT_LIST[j].name) + "   " + JSON.stringify(ALL_BOTS_IN_COMBAT_LIST[j].combatBotNumber) + "  ordersListId: " + JSON.stringify(ALL_BOTS_IN_COMBAT_LIST[j].ordersListId));

		if (BOT_IS_DESTROYED.includes(CURRENT_BOT_NUMBER) && TOO_MANY_TURNS <= 50)
		  {
//			  console.log("........... IF DUAL CONDITIONS  TRUE ...........");
	  }else{ /// not true!!!
			TOO_MANY_TURNS++;//
			let commands = 3;//STUPID, but leave or it breaks!	
console.log(".XXX: " + (await db.orderLists.get(ALL_BOTS_IN_COMBAT_LIST[j].ordersListId)).commands[1]);

//////////// Call EXECUTE_ORDERS_LIST ////////////////////
			const MyOrders = EXECUTE_ORDERS_LIST(ALL_BOTS_IN_COMBAT_LIST, GAME_MAP_BOTS, COMBAT_RECORD, TOO_MANY_TURNS, BOT_IS_DESTROYED, CURRENT_BOT)
		}//if BOT_IS_DESTROYED/TOO_MANY_TURNS <= 50
	}//var j = 0 ALL_BOTS_IN_COMBAT_LIST.length j++
//	 		Run function REMOVE_DESTROYED_BOTS.			  
console.log("...Function MAIN COMBAT LOOP End...");
  return { success: true };
}



/**
 * STARTING_MAP_SQUARES
 * 
 * Create a game map for Bot starting positions, with numbers for each space, 
 * numbers 1 - 100, and places Bot ID numbers where the Bot is and zero values
 * for each Space where there is no Bot. These values will be separated by
 * commas.
 * This function takes in the object ALL_BOTS_IN_COMBAT_LIST and returns the 
 * object GAME_MAP_BOTS.
 */
export function STARTING_MAP_SQUARES(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD) {
    console.log("...Function STARTING_MAP_SQUARES Start...");
///////////////////////////////////////////////////
///////////// Creates a string ////////////////////
///////////////////////////////////////////////////
//  let MyFacing = "West";
//  let BotFacing = "";
//  for (let MyTemp = 1; MyTemp <= 40; MyTemp++) {
//	if (MyFacing == "West"){
//		BotFacing = BotFacing + MyTemp + ", West, ";
//     window.alert(" BotFacing: " + BotFacing);
//		MyFacing = "East";
//	}
//	else {
//		BotFacing = BotFacing + MyTemp + ", East, ";		
//		MyFacing = "West";
//	}	  
//  }
//    console.log(" BotFacing: " + BotFacing);
///////////////////////////////////////////////////
///////////// Creates an array ////////////////////
///////////////////////////////////////////////////
let MyBotFacing = ['North','West','East','West','East','West','East','West','East','West','East','West','East','West','East','West','East','West','East','West','East','West','East','West','East','West','East','West','East','West','East','West','East','West','East','West','East','West','East','West','East','South','South','South','South'];

let MyBotStarting = ['0','1','9','2','10','11','19','12','20','21','29','22','30','31','39','32','40','41','49','42','50','51','59','52','60','61','69','62','70','71','79','72','80','81','89','82','90','91','99','92','100'];
	
	
  try {
    // Edge squares: columns 1-2 and 9-10 of each row on a 10×10 grid
    const BOT_SQUARES = new Set();
    for (let k = 0; k < 10; k++) {
      BOT_SQUARES.add(10 * k + 1);
      BOT_SQUARES.add(10 * k + 2);
      BOT_SQUARES.add(10 * k + 9);
      BOT_SQUARES.add(10 * k + 10);
    }

    let botIndex = 0;
    const GAME_MAP_SQUARES = [];
    const GAME_MAP_BOTS = [];
    for (let square = 1; square <= 100; square++) {
      if (BOT_SQUARES.has(square) && botIndex < ALL_BOTS_IN_COMBAT_LIST.length) {
        GAME_MAP_BOTS.push(ALL_BOTS_IN_COMBAT_LIST[botIndex].combatBotNumber);
		let TEMP_BOT_NUMBER = ALL_BOTS_IN_COMBAT_LIST[botIndex].combatBotNumber;
        botIndex++;
        GAME_MAP_SQUARES.push(square);
///////////////  ADD TO COMBAT_RECORD /////////////////////////		
		COMBAT_RECORD.push("Place Bot " + TEMP_BOT_NUMBER + " facing "+ MyBotFacing[TEMP_BOT_NUMBER] + " on ANI_MAP_SPACE " + MyBotStarting[botIndex] + ".");
		
      } else {
        GAME_MAP_BOTS.push(0);
        GAME_MAP_SQUARES.push(square);
      }
    }

    console.log("STARTING_MAP_SQUARES complete:", JSON.stringify(GAME_MAP_BOTS));
//	 window.alert("GAME_MAP_BOTS: " + JSON.stringify(GAME_MAP_BOTS) + "GAME_MAP_SQUARE: " + JSON.stringify(GAME_MAP_SQUARES));
//    console.log("COMBAT_RECORD3: ", JSON.stringify(COMBAT_RECORD));

    console.log("...Function STARTING_MAP_SQUARES End...");	
    return [GAME_MAP_BOTS, GAME_MAP_SQUARES];
  } catch (error) {
    console.error("STARTING_MAP_SQUARES error:", error);
    return [];
  }
}


/**
 * EXECUTE_ORDERS_LIST
 * 
 * This function is called by the function MAIN_COMBAT_LOOP, which passes
 * to it the objects CURRENT_BOT, ALL_BOTS_IN_COMBAT_LIST, GAME_MAP_BOTS,
 * and the COMBAT_RECORD.
 * 
 * The EXECUTE_ORDERS_LIST gets the ORDERS_LIST from the Orders List Database 
 * for the CURRENT_BOT. Then it goes through each line of the ORDERS_LIST 
 * and executes a function for each command, passing all the needed objects.
 * 
 * Calls CURRENT_ACTIVATE_SCANNER sends CURRENT_BOT, ALL_BOTS_IN_COMBAT_LIST, GAME_MAP_BOTS, and COMBAT_RECORD. Returns CURRENT_BULLET_TARGET1 and 
 * CURRENT_BULLET_TARGET2.
 *
 * Calls CURRENT_MOVE_BOT1 passes CURRENT_BOT, ALL_BOTS_IN_COMBAT_LIST,
 * GAME_MAP_BOTS, and COMBAT_RECORD. Returns GAME_MAP_BOTS and COMBAT_RECORD. 
 * 
 * Calls CURRENT_MOVE_BOT2 passes CURRENT_BOT, ALL_BOTS_IN_COMBAT_LIST,
 * GAME_MAP_BOTS, and COMBAT_RECORD. Returns GAME_MAP_BOTS and COMBAT_RECORD. 
 * 
 * Calls CURRENT_MOVE_BOT3 passes CURRENT_BOT, ALL_BOTS_IN_COMBAT_LIST,
 * GAME_MAP_BOTS, and COMBAT_RECORD. Returns GAME_MAP_BOTS and COMBAT_RECORD. 
 * 
 * Calls CURRENT_MOVE_BOT4 passes CURRENT_BOT, ALL_BOTS_IN_COMBAT_LIST,
 * GAME_MAP_BOTS, and COMBAT_RECORD. Returns GAME_MAP_BOTS and COMBAT_RECORD. 
 * 
 * Calls CURRENT_MOVE_BOT5 passes CURRENT_BOT, ALL_BOTS_IN_COMBAT_LIST,
 * GAME_MAP_BOTS, and COMBAT_RECORD. Returns GAME_MAP_BOTS and COMBAT_RECORD. 
 * 
 * 
 * 
 * This function EXECUTE_ORDERS_LIST returns to the MAIN_COMBAT_LOOP, from 
 * which it came, and passes the objects ALL_BOTS_IN_COMBAT_LIST, 
 * GAME_MAP_BOTS, DEAD_BOTS_LIST, and the COMBAT_RECORD.
 * 
 */

export async function EXECUTE_ORDERS_LIST(ALL_BOTS_IN_COMBAT_LIST, GAME_MAP_BOTS, COMBAT_RECORD, TOO_MANY_TURNS, BOT_IS_DESTROYED, CURRENT_BOT) {
 console.log("...Function EXECUTE_ORDERS_LIST Start...");

 const strParse = JSON.stringify(CURRENT_BOT) + "EndOfData";
 const startParse = "combatBotNumber";
 const endParse = "EndOfData";
 const strParseReturn = ParseString(strParse, startParse, endParse);
 let strParseReturn2 = strParseReturn.slice(2);
 const BotID = strParseReturn2.slice(0, -1); 
 console.log("----" + BotID + "----");
 
const TotalOfCommands = (await db.orderLists.get(ALL_BOTS_IN_COMBAT_LIST[BotID].ordersListId)).commands.length;



console.log(".YYY: " + (await db.orderLists.get(ALL_BOTS_IN_COMBAT_LIST[1].ordersListId)).commands[1]);



console.log(".AAA: " + (await db.orderLists.get(ALL_BOTS_IN_COMBAT_LIST[BotID].ordersListId)).commands.length);


//console.log(".AAA: " + (await db.orderLists.get(ALL_BOTS_IN_COMBAT_LIST[1].ordersListId)).commands.length);

		for (var pcount = 0; pcount < TotalOfCommands; pcount++){

 	let MyCount = JSON.stringify(pcount);
	
console.log(".ZZZ: " + (await db.orderLists.get(ALL_BOTS_IN_COMBAT_LIST[BotID].ordersListId)).commands[MyCount]);

 console.log(pcount + "...BotID: " + BotID + " ...TotalOfCommands: " + TotalOfCommands + " MyCount: " + MyCount);
	


}//for (var p ....

// const TotalOfCommands = (await db.orderLists.get(1)).commands.length;
// console.log(" ..TotalOfCommands: " + TotalOfCommands);

// console.log(await db.orderLists.get(JSON.stringify(BotID)).commands.length);

// const TotalOfCommands = (await db.orderLists.get(JSON.stringify(BotID))).commands.length;
// console.log(" ..TotalOfCommands: " + TotalOfCommands);


// console.log(pcount + "...BotID: " + BotID + " ...TotalOfCommands: " + TotalOfCommands);


// console.log(await db.orderLists.get(BotID).commands[p]);

//const Kelpies = (await db.orderLists.get(BotID)).commands[p];
//console.log("===>>>: " + Kelpies);

//[pcount] = CURRENT_MOVE_BOT3(Kelpies, pcount); 
  
//[GAME_MAP_BOTS, GAME_MAP_SQUARES] = STARTING_MAP_SQUARES(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD, Kelpies);		

console.log("...Function EXECUTE_ORDERS_LIST End...");
 
 return [GAME_MAP_BOTS];
}

////////////////////////////////////////////////////////////////
function ParseString(strParse, startParse, endParse) {
 console.log("...Function ParseString Start...");

// console.log("...strParse: " + strParse + " ...startParse: " + startParse + " ...endParse: " + endParse);
  const startIndexParse = strParse.indexOf(startParse);
  if (startIndexParse === -1) return null;

  const endIndexParse = strParse.indexOf(endParse, startIndexParse + startParse.length);
  if (endIndexParse === -1) return null;
//  console.log("  - - - - " + strParse.substring(startIndexParse + startParse.length, endIndexParse));

  return strParse.substring(startIndexParse + startParse.length, endIndexParse);
}


//////////////// STRIP A CHARACTER ///////////////////////
//const original = "banana";
//const stripped = original.replaceAll("a", ""); 
//console.log(stripped); // "bnn"


// ============================================================================
// MOVEMENT FUNCTIONS (placeholder implementations)
// ============================================================================

export async function CURRENT_MOVE_BOT1()       { console.log("CURRENT_MOVE_BOT1"); }
export async function CURRENT_MOVE_BOT2()       { console.log("CURRENT_MOVE_BOT2");
		for (var m = 0; m < 1000; m++){
const TrapMe = m +100;
		}
 }
export async function CURRENT_MOVE_BOT3(Kelpies, pcount)       { 

console.log("...Function CURRENT_MOVE_BOT3 Start...");
//		for (var n = 0; n < 100; n++){
//const TrapMe = n +100;
//		}
		
 return [pcount];
 }
export async function CURRENT_MOVE_BOT4()       { console.log("CURRENT_MOVE_BOT4"); }
export async function CURRENT_MOVE_BOT5()       { console.log("CURRENT_MOVE_BOT5"); }
export async function CURRENT_MOVE_BOTMAX()     { console.log("CURRENT_MOVE_BOTMAX"); }
export async function CURRENT_MOVE_BOT_BACK1()  { console.log("CURRENT_MOVE_BOT_BACK1"); }
export async function CURRENT_MOVE_BOT_BACK2()  { console.log("CURRENT_MOVE_BOT_BACK2"); }
export async function CURRENT_MOVE_BOT_BACK3()  { console.log("CURRENT_MOVE_BOT_BACK3"); }

export async function CURRENT_ROTATE_BOT(direction) {
  console.log(`CURRENT_ROTATE_BOT: ${direction}`);
}

export async function CURRENT_MOVE_BLOCKED_ENEMY() { console.log("CURRENT_MOVE_BLOCKED_ENEMY"); }
export async function CURRENT_MOVE_TOWARD_ENEMY()  { console.log("CURRENT_MOVE_TOWARD_ENEMY"); }
export async function FIRE_MASTER_WEAPON()          { console.log("FIRE_MASTER_WEAPON"); }
export async function FIRE_SECONDARY_WEAPON()       { console.log("FIRE_SECONDARY_WEAPON"); }
export async function FIRE_ALL_WEAPONS()            { console.log("FIRE_ALL_WEAPONS"); }
export async function CURRENT_ACTIVATE_SCANNER()   { console.log("CURRENT_ACTIVATE_SCANNER"); }
export async function CURRENT_ACTIVATE_SELF_DESTRUCT() { console.log("CURRENT_ACTIVATE_SELF_DESTRUCT"); }
export async function IDENTIFY_ANY_ENEMIES()        { console.log("IDENTIFY_ANY_ENEMIES"); }

export async function CURRENT_ARMOR_WEAK(threshold) {
  console.log(`CURRENT_ARMOR_WEAK: threshold=${threshold}`);
}

// ============================================================================
// SCANNER / TARGETING
// ============================================================================

/**
 * CURRENT_ACTIVATE_SCANNER_FULL
 *
 * Activates the bot's scanner to identify enemy targets within range.
 */
export async function CURRENT_ACTIVATE_SCANNER_FULL(combatState) {
  console.log("CURRENT_ACTIVATE_SCANNER_FULL called");

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

      const BOT_LOCATION_TEMP        = CURRENT_BOT_TEMP.location || "0,0";
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

    console.log(`Scanner: Target1=${CURRENT_BULLET_TARGET1}, Target2=${CURRENT_BULLET_TARGET2}`);
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

/**
 * ROTATE_TARGETING_MAP
 */
export async function ROTATE_TARGETING_MAP(targetingMap, facing) {
  console.log(`ROTATE_TARGETING_MAP: facing=${facing}`);

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

/**
 * PROCESS_TURN
 */
export async function PROCESS_TURN(currentArmy, targetArmy) {
  console.log(`PROCESS_TURN: ${currentArmy.name} attacking ${targetArmy.name}`);
  
  
  return { success: true };
}

/**
 * EXECUTE_BOT_ACTION
 */
export async function EXECUTE_BOT_ACTION(bot, action, targetBot = null) {
  console.log(`EXECUTE_BOT_ACTION: Bot ${bot.name} executing ${action}`);
  return { success: true };
}

/**
 * CALCULATE_DAMAGE
 */
export function CALCULATE_DAMAGE(attacker, weapon, defender) {
  console.log(`CALCULATE_DAMAGE: ${attacker.name} with ${weapon} vs ${defender.name}`);
  return 0;
}

/**
 * CHECK_WIN_CONDITION
 */
export async function CHECK_WIN_CONDITION() {
  console.log("CHECK_WIN_CONDITION called");
  return { gameOver: false };
}

/**
 * END_COMBAT
 */
export async function END_COMBAT(winnerId, loserId) {
  console.log(`END_COMBAT: Winner=${winnerId}, Loser=${loserId}`);
  return { success: true };
}

/**
 * CHECK_BOT_TOTALS
 *
 * Calculates total bot statistics from selected component description strings.
 */
export function CHECK_BOT_TOTALS(frame, engine, computer, armor, sensor, weaponMaster, weaponSecondary, weaponBomb) {
  console.log("CHECK_BOT_TOTALS called");

  // SLOT_COUNT
  let SLOT_COUNT = 0;
  const engineMatch   = engine.match(/= BE (\d+) slot/);
  const compMatch     = computer.match(/= BC (\d+) slot/);
  const armorMatch    = armor.match(/= FA (\d+) slot/);
  const sensorMatch   = sensor.match(/PC, (\d+) slot/);
  const wmMatch       = weaponMaster.match(/WR, (\d+) slot/);
  const wsMatch       = weaponSecondary.match(/WR, (\d+) slot/);
  const wbMatch       = weaponBomb.match(/WD, (\d+) slot/);
  if (engineMatch)  SLOT_COUNT += parseInt(engineMatch[1]);
  if (compMatch)    SLOT_COUNT += parseInt(compMatch[1]);
  if (armorMatch)   SLOT_COUNT += parseInt(armorMatch[1]);
  if (sensorMatch)  SLOT_COUNT += parseInt(sensorMatch[1]);
  if (wmMatch)      SLOT_COUNT += parseInt(wmMatch[1]);
  if (wsMatch)      SLOT_COUNT += parseInt(wsMatch[1]);
  if (wbMatch)      SLOT_COUNT += parseInt(wbMatch[1]);

  const frameMatch = frame.match(/= BF (\d+) slot/);
  const frameSlots = frameMatch ? parseInt(frameMatch[1]) : 0;
  const slotsDisplay = `${frameSlots}/${SLOT_COUNT}`;
  const slotsColor = SLOT_COUNT > frameSlots ? "red" : "black";

  // WEIGHT_TOTAL
  let WEIGHT_TOTAL = 0;
  const frameWeightMatch  = frame.match(/ND, (\d+) weight/);
  const engineWeightMatch = engine.match(/PO, (\d+) weight/);
  const armorWeightMatch  = armor.match(/AD, (\d+) weight/);
  const sensorWeightMatch = sensor.match(/slots, (\d+) weight/);
  const wmWeightMatch     = weaponMaster.match(/PC, (\d+) weight/);
  const wsWeightMatch     = weaponSecondary.match(/PC, (\d+) weight/);
  const wbWeightMatch     = weaponBomb.match(/PC, (\d+) weight/);
  if (frameWeightMatch)  WEIGHT_TOTAL += parseInt(frameWeightMatch[1]);
  if (engineWeightMatch) WEIGHT_TOTAL += parseInt(engineWeightMatch[1]);
  if (armorWeightMatch)  WEIGHT_TOTAL += parseInt(armorWeightMatch[1]);
  if (sensorWeightMatch) WEIGHT_TOTAL += parseInt(sensorWeightMatch[1]);
  if (wmWeightMatch)     WEIGHT_TOTAL += parseInt(wmWeightMatch[1]);
  if (wsWeightMatch)     WEIGHT_TOTAL += parseInt(wsWeightMatch[1]);
  if (wbWeightMatch)     WEIGHT_TOTAL += parseInt(wbWeightMatch[1]);

  // GOLD_COUNT
  let GOLD_COUNT = 0;
  const frameGoldMatch    = frame.match(/weight, (\d+) cost/);
  const engineGoldMatch   = engine.match(/weight, (\d+) cost/);
  const computerGoldMatch = computer.match(/weight, (\d+) cost/);
  const armorGoldMatch    = armor.match(/weight, (\d+) cost/);
  const sensorGoldMatch   = sensor.match(/weight, (\d+) cost/);
  const wmGoldMatch       = weaponMaster.match(/weight, (\d+) cost/);
  const wsGoldMatch       = weaponSecondary.match(/weight, (\d+) cost/);
  const wbGoldMatch       = weaponBomb.match(/weight, (\d+) cost/);
  if (frameGoldMatch)    GOLD_COUNT += parseInt(frameGoldMatch[1]);
  if (engineGoldMatch)   GOLD_COUNT += parseInt(engineGoldMatch[1]);
  if (computerGoldMatch) GOLD_COUNT += parseInt(computerGoldMatch[1]);
  if (armorGoldMatch)    GOLD_COUNT += parseInt(armorGoldMatch[1]);
  if (sensorGoldMatch)   GOLD_COUNT += parseInt(sensorGoldMatch[1]);
  if (wmGoldMatch)       GOLD_COUNT += parseInt(wmGoldMatch[1]);
  if (wsGoldMatch)       GOLD_COUNT += parseInt(wsGoldMatch[1]);
  if (wbGoldMatch)       GOLD_COUNT += parseInt(wbGoldMatch[1]);

  // POWER_TOTAL (weapon power draw)
  let POWER_TOTAL = 0;
  const wmPowerMatch = weaponMaster.match(/= WM (\d+) WD,/);
  const wsPowerMatch = weaponSecondary.match(/= WS (\d+) WD,/);
  const wbPowerMatch = weaponBomb.match(/= WB (\d+),(\d+) WD,/);
  if (wmPowerMatch) POWER_TOTAL += parseInt(wmPowerMatch[1]);
  if (wsPowerMatch) POWER_TOTAL += parseInt(wsPowerMatch[1]);
  if (wbPowerMatch) POWER_TOTAL += parseInt(wbPowerMatch[1]) + parseInt(wbPowerMatch[2]);

  // POWER_OUTPUT (engine output)
  let POWER_OUTPUT = 0;
  const poMatch = engine.match(/slots, (\d+) PO,/);
  if (poMatch) POWER_OUTPUT += parseInt(poMatch[1]);

  const MAX_MOVEMENT = Math.floor((POWER_OUTPUT - POWER_TOTAL - WEIGHT_TOTAL - 1000) / 2000);

  return {
    slotsDisplay,
    slotsColor,
    totalWeight: WEIGHT_TOTAL.toString(),
    totalGold:   GOLD_COUNT.toString(),
    totalPower:  POWER_TOTAL.toString(),
    move:        MAX_MOVEMENT.toString(),
  };
}

/**
 * GET_VALUES_FROM_RECORDS
 *
 * Extracts and initializes all combat variables from the current bot record.
 */
export async function GET_VALUES_FROM_RECORDS(currentBot, armyNumber, currentBotNumber) {
  console.log(`GET_VALUES_FROM_RECORDS: bot=${currentBot.name}, army=${armyNumber}`);

  try {
    const CURRENT_BOT_NAME     = currentBot.name;
    const CURRENT_BOT_NUMBER   = currentBotNumber;
    const CURRENT_BOT_LOCATION = currentBot.location || "0,0";
    const RECORD_BOT_ARMY      = armyNumber;
    const CURRENT_BOT_FACING   = currentBot.facing || "N";

    const ANI_BOT_NUMBER       = CURRENT_BOT_NUMBER;
    const ANI_BOT_FACING       = CURRENT_BOT_FACING;
    const ANI_IMAGE_NAME_PART  = currentBot.botImage || "Default Bot Image";
    const ANI_IMAGE_NAME_FULL  = `${ANI_IMAGE_NAME_PART}_P${RECORD_BOT_ARMY}_D${ANI_BOT_FACING}`;

    const CURRENT_BULLET_LOCATION = CURRENT_BOT_LOCATION;
    const CURRENT_BULLET_FACING   = ANI_BOT_FACING;

    const moveValue          = parseInt(currentBot.move || "0");
    const CURRENT_BOT_MOVEMENT = moveValue > 0 ? moveValue : 0;

    // Extract component names from description strings before querying DB
    const frameComponent  = await db.botFrames.where("name").equals(extractComponentName(currentBot.frame)).first();
    const armorComponent  = await db.botArmors.where("name").equals(extractComponentName(currentBot.armor)).first();
    const masterWeapon    = await db.botMasters.where("name").equals(extractComponentName(currentBot.weaponMaster)).first();
    const secondaryWeapon = await db.botSecondaries.where("name").equals(extractComponentName(currentBot.weaponSecondary)).first();
    const bombWeapon      = await db.botBombs.where("name").equals(extractComponentName(currentBot.weaponBomb)).first();
    const sensorComponent = await db.botSensors.where("name").equals(extractComponentName(currentBot.sensor)).first();

    const RECORD_BOT_ARMOR             = (frameComponent?.nd || 0) + (armorComponent?.ad || 0);
    const CURRENT_BOT_ARMOR            = RECORD_BOT_ARMOR;

    const RECORD_MASTER_WEAPON_RANGE   = masterWeapon?.wr || 0;
    const CURRENT_MASTER_WEAPON_RANGE  = RECORD_MASTER_WEAPON_RANGE;

    const RECORD_SECONDARY_WEAPON_RANGE   = secondaryWeapon?.wr || 0;
    const CURRENT_SECONDARY_WEAPON_RANGE  = RECORD_SECONDARY_WEAPON_RANGE;

    const RECORD_MASTER_WEAPON_DAMAGE   = masterWeapon?.wd || 0;
    const CURRENT_MASTER_WEAPON_DAMAGE  = RECORD_MASTER_WEAPON_DAMAGE;

    const RECORD_SECONDARY_WEAPON_DAMAGE   = secondaryWeapon?.wd || 0;
    const CURRENT_SECONDARY_WEAPON_DAMAGE  = RECORD_SECONDARY_WEAPON_DAMAGE;

    const RECORD_BOT_SENSOR_RANGE = sensorComponent?.range || 0;
    const RECORD_BOT_SENSOR_COUNT = sensorComponent?.targets || 0;

    const RECORD_BOMB1_DAMAGE = bombWeapon?.wd || 0;
    const RECORD_BOMB2_DAMAGE = Math.floor(RECORD_BOMB1_DAMAGE / 2);

    const CLOCKWISE_COMPASS_DIRECTION        = "North,NorthEast,East,SouthEast,South,SouthWest,West,NorthWest".split(",");
    const COUNTERCLOCKWISE_COMPASS_DIRECTION = "North,NorthWest,West,SouthWest,South,SouthEast,East,NorthEast".split(",");

    const ACTIONS_COUNT_TEMP  = "";
    const ACTIONS_MAX_TEMP    = "";
    const ANI_MOVE_TO         = "";
    const ANI_NUMBER_TEMP     = "1-100";
    const ANI_SHORT_FACING    = "";
    const CURRENT_BULLET_TARGET1 = "";
    const CURRENT_BULLET_TARGET2 = "";
    const CURRENT_COMMAND     = "";
    const NEW_GAME_MAP_SQUARE = "";
    const NEXT_BOT_LOCATION   = "";
    const NEXT_BOT_FACING     = "";
    const NEXT_BULLET_LOCATION = "";
    const SENSOR_ALLIED_BOTS  = "0,0,0,0,0";
    const SENSOR_ENEMY_BOTS   = "0,0,0,0,0";
    const ANI_MICRO_DELAY     = 0.5;
    const ANI_MACRO_DELAY     = 1.0;
    const ANI_BULLET_NAME     = "Bullet_All";
    const ALL_BOTS_IN_COMBAT_LIST_TEMP = currentBot;

    return {
      CURRENT_BOT_NAME, CURRENT_BOT_NUMBER, CURRENT_BOT_LOCATION,
      RECORD_BOT_ARMY, CURRENT_BOT_FACING,
      ANI_BOT_NUMBER, ANI_BOT_FACING, ANI_IMAGE_NAME_PART, ANI_IMAGE_NAME_FULL,
      CURRENT_BULLET_LOCATION, CURRENT_BULLET_FACING,
      CURRENT_BOT_MOVEMENT,
      CURRENT_BOT_ARMOR, RECORD_BOT_ARMOR,
      CURRENT_MASTER_WEAPON_RANGE, RECORD_MASTER_WEAPON_RANGE,
      CURRENT_SECONDARY_WEAPON_RANGE, RECORD_SECONDARY_WEAPON_RANGE,
      CURRENT_MASTER_WEAPON_DAMAGE, RECORD_MASTER_WEAPON_DAMAGE,
      CURRENT_SECONDARY_WEAPON_DAMAGE, RECORD_SECONDARY_WEAPON_DAMAGE,
      RECORD_BOT_SENSOR_RANGE, RECORD_BOT_SENSOR_COUNT,
      RECORD_BOMB1_DAMAGE, RECORD_BOMB2_DAMAGE,
      CLOCKWISE_COMPASS_DIRECTION, COUNTERCLOCKWISE_COMPASS_DIRECTION,
      ACTIONS_COUNT_TEMP, ACTIONS_MAX_TEMP,
      ANI_MOVE_TO, ANI_NUMBER_TEMP, ANI_SHORT_FACING,
      CURRENT_BULLET_TARGET1, CURRENT_BULLET_TARGET2,
      CURRENT_COMMAND, NEW_GAME_MAP_SQUARE,
      NEXT_BOT_LOCATION, NEXT_BOT_FACING, NEXT_BULLET_LOCATION,
      SENSOR_ALLIED_BOTS, SENSOR_ENEMY_BOTS,
      ANI_MICRO_DELAY, ANI_MACRO_DELAY, ANI_BULLET_NAME,
      ALL_BOTS_IN_COMBAT_LIST_TEMP,
    };
  } catch (error) {
    console.error("GET_VALUES_FROM_RECORDS error:", error);
    return { success: false, message: "Failed to get values from records." };
  }
}


async function dumpDB() {
  const result = {};

  for (const table of db.tables) {
    const name = table.name;
    const rows = await table.toArray();
    result[name] = rows;
  }

  console.log(result);
}



/**
 * START_COMBAT
 */
export async function START_COMBAT() {
  console.log("START_COMBAT called");
  return { success: true };
}

// ============================================================================
// ARMY SETUP
// ============================================================================
