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
    console.log(".COMBAT_RECORD:", JSON.stringify(COMBAT_RECORD));

    console.log(".ALL_BOTS_IN_COMBAT_LIST:", JSON.stringify(ALL_BOTS_IN_COMBAT_LIST));

   const ALL_ORDERS_LISTS = CREATE_ALL_ORDERS_LISTS(ALL_BOTS_IN_COMBAT_LIST);
	
	
    console.log(`Combat initialized: ${battleState.battleId}`);

    await MAIN_COMBAT_LOOP(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);


console.log("... JAYTEST 4 ...");	
  dumpDB();

db.orderLists.toArray().then(console.log);

db.orderLists.toArray().then(console.log);

db.bots.toArray().then(console.log);
 
db.armies.toArray().then(console.log);

console.log("... JAYTEST 5 ...");
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

//////////////////////////////
//////////////////////////////
//////////////////////////////
//////////////////////////////

async function CREATE_ALL_ORDERS_LISTS(ALL_BOTS_IN_COMBAT_LIST) {
  console.log("...Function CREATE_ALL_ORDERS_LISTS Start...");
var ALL_ORDERS_TEMP = [];
  
var xxxTest = db.orderLists.toArray().then(console.log);
console.log("xxxTest");
console.log(xxxTest);
var ids = [0];

console.log("DonewithTesting");
  
console.log("... JAYTEST 7 ...");
  var OrdersLitstIDs = "";
  var TestCount = 0;
  var idsCount = 0;
console.log("... JAYTEST 8 ...");
///// THIS SECTION GETS ALL THE ORDERS LISTS ID NUMBERS!!!!!!!
  for (var Pcount = 0; Pcount < ALL_BOTS_IN_COMBAT_LIST.length; Pcount++){
	let CURRENT_BOT = ALL_BOTS_IN_COMBAT_LIST[Pcount];
    const ALL_ORDERS_LISTS = [];
	var startParse = "ordersListId";
	var endParse = "slotsUsed";
	var strParse = JSON.stringify(CURRENT_BOT);
	var strParseReturn = ParseString(strParse, startParse, endParse);
//	console.log("strParseReturnXXX: ");
//	console.log(strParseReturn);
///// THIS SECTION STRIPS NON-NUMERIC CHARACTERS!!!!!!!
	let strParseReturn2 = strParseReturn.slice(2);
//	console.log("strParseReturn2YYY: ");
//	console.log(strParseReturn2);
	var OrdersListID = strParseReturn2.slice(0, -2); 
//	console.log(" OrdersListID: --OrdersListID--" + OrdersListID + "----");
//	console.log("OrdersListIDXXX: ");
//	console.log(OrdersListID);	
//	console.log("... JAYTEST 10 ...");
///// THIS SECTION STRIPS OUT DUPLICATE NUMBERS!!!!!!!
	if (OrdersListID != "undefined"){
//		console.log("OrdersListIDYYY: ");
//		console.log(OrdersListID);
//		console.log("OrdersListID != undefined");
		if (OrdersLitstIDs.includes(OrdersListID)){
		} else {
//		console.log("--- else ---");
//			console.log("OrdersListIDZZZ: ");
//			console.log(OrdersListID);
/////////////			OrdersListID = Number(OrdersListID); /////////

			Number(OrdersListID); /////////
//			console.log("OrdersListIDJJJ: ");
//			console.log(OrdersListID);
			ids[idsCount] = [OrdersListID];
//			ALL_ORDERS_TEMP[idsCount].push(OrdersListID);
            Number(OrdersListID);
			ALL_ORDERS_TEMP[idsCount] = OrdersListID;
//console.log("ALL_ORDERS_TEMP[idsCount]");
//console.log(ALL_ORDERS_TEMP[idsCount]);
//console.log("JAYTEST 66");

			idsCount++;
			TestCount++;

			OrdersLitstIDs = OrdersLitstIDs + OrdersListID;
//			console.log("OrdersListID: ");
//			console.log(OrdersListID);
//			console.log(" OrdersLitstIDs: ");
//			console.log(OrdersLitstIDs);
		}
	}
  }//for
  
console.log("ALL_ORDERS_TEMP: ");
console.log(ALL_ORDERS_TEMP[0]);
console.log(ALL_ORDERS_TEMP[1]);
console.log(ALL_ORDERS_TEMP[2]);
///// THIS SECTION CONVERTS ALL STRINGS TO NUMBERS!!!!!!!
 
console.log(" YYYYYYYYYYYYYYYYYYYY");	  
//console.log(ALL_ORDERS_TEMP);
console.log(!isNaN(ALL_ORDERS_TEMP[0]));
console.log(!isNaN(ALL_ORDERS_TEMP[1]));
console.log(!isNaN(ALL_ORDERS_TEMP[2]));
console.log(isNaN(ALL_ORDERS_TEMP[0]));
console.log(isNaN(ALL_ORDERS_TEMP[1]));
console.log(isNaN(ALL_ORDERS_TEMP[2]));
///Number(ids); /////////
//ids = ids.map(x => Number(x.replace(/"/g,"")));
console.log("... JAYTEST FUCK!!!! ...");
//ALL_ORDERS_TEMP = ALL_ORDERS_TEMP.map(x => Number(x.replace(/"/g,"")));
console.log("stringify(ALL_ORDERS_TEMP)");
console.log(JSON.stringify(ALL_ORDERS_TEMP));

//var TEST666 = ("["+ids[0]+","+ids[1]+","+ids[2]+"]);
//var TEST666 = [1,2,3,4,5,];
//var TEST666 = "[1,2,3,4,5,]";
//var lists = await loadOrdersLists(TEST666); // BAD!
var lists = await loadOrdersLists([1,2,3,4,5]); //// WORKS!!!!!
//var lists = await loadOrdersLists(ALL_ORDERS_TEMP); //????????
///////////////// CALL TO GET COMMANDS ////////////////////////
//const lists = await loadOrdersLists(TEST666, ids); // BAD!
//const lists = await loadOrdersLists(["1","2","3","4","5"]); // BAD!
//const lists = await loadOrdersLists("["+ids[0]+","+ids[1]+","+ids[2]+"]); //BREAKS EVERYTHING!!!
//const lists = await loadOrdersLists(ids); // BAD!
console.log("BACK FROM FUNCTION!");
console.log(lists);
console.log(JSON.stringify(lists));
console.log(lists[1].commands);
console.log(lists[2].commands);
console.log(lists[3].commands);
//console.log(lists[4].commands);
//console.log(lists[5].commands);
///////////////// CALL TO GET COMMANDS ////////////////////////

//  console.log(" result:");
//  console.log(JSON.stringify(result));
//const manager = await buildOrdersListsManager(OrdersLitstIDs);

console.log("... JAYTEST 2 ...");

  console.log(" OrdersLitstIDs7:");
  console.log(OrdersLitstIDs);
  
console.log(JSON.stringify(manager));

var ALL_ORDERS_LISTS = JSON.stringify(manager);

console.log(ALL_ORDERS_LISTS);
console.log(JSON.stringify(ALL_ORDERS_LISTS));


var list2 = manager.getList(2);
var commands2 = manager.getCommands(2);

console.log(JSON.stringify(list2));
console.log(JSON.stringify(commands2));
console.log("... JAYTEST 3 ...");
  
  
const count = OrdersLitstIDs.split(",").length;

let commands = 3;//STUPID, but leave or it breaks!	
let MyCountA = 1;
let j = 6;
console.log(".XXYYZZ: " + (await db.orderLists.get(ALL_BOTS_IN_COMBAT_LIST[j].ordersListId)).commands[1]);
MyCountA = console.log(".XXXXYYYYZZXZ: " + (await db.orderLists.get(ALL_BOTS_IN_COMBAT_LIST[j].ordersListId)).commands[1].length);//WORKS!!!
			console.log("MyCountA");
			console.log(MyCountA);	
			console.log(" KKKKKKKKKKKKKKKKKK");	

 MyCountA = await db.orderLists.get(ALL_BOTS_IN_COMBAT_LIST[j].ordersListId).commands.length;
			console.log(MyCountA);	
			console.log(" KKKKKKKKKKKKKKKKKK");	

		for (var Rcount = 0; Rcount < TestCount + TestCount; Rcount++){
			console.log(" JJJJJJJJJJJJJJJJ");	
			console.log(OrdersLitstIDs[Rcount]);
const MY_CURRENT_COMMAND = (await db.orderLists.get(1)).commands[1]; 

			console.log(MY_CURRENT_COMMAND);
			Rcount++;
		}

  console.log("...Function CREATE_ALL_ORDERS_LISTS End...");
}


/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

async function TEMPloadOrdersLists(ids) {
console.log("...Function loadOrdersLists(ids) Start...");
  const idsLength = ids.length;
console.log("ENTER FOR ...............................");
  for (var idCountK = 0; idCountK < idsLength; idCountK++){
console.log("Jay was tired of code that didnt work!");
console.log(idCountK);
  } ////// for ...

	console.log("After await mmmmmmmmmmmmmmmm");
  return result;
} // End of Function ...



/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

async function loadOrdersListsJAY(ids) {
console.log("...Function loadOrdersLists(ids) Start...");

console.log(JSON.stringify(ids));
  var result = {};
  var idValue = 0;
  var idsLength = ids.length;
  var list = "";
//console.log(ids[0]);
//console.log(ids[1]);
//console.log(ids[2]);
console.log("idsLength");
console.log(idsLength);
//Number(idsLength);
//console.log(!isNaN(idsLength));
//console.log(isNaN(idsLength));
console.log("ENTER FOR ...............................");
  for (var idCountJ = 0; idCountJ < idsLength; idCountJ++){
console.log("Jay was tired of code that didnt work!");
console.log("idCountJ");
console.log(idCountJ);
console.log("idsLength");
console.log(idsLength);
//console.log(ids[0]);
//console.log(ids[1]);
//console.log(ids[2]);

//console.log(zzzzzzzzzzzzzzzzz);
//console.log(idValue);
	  idValue = Number(ids[idCountJ]);

//		list = await db.orderLists.name.commands.get(idValue); //BREAKS ALL!
//      list = await db.orderLists.get(idValue).name; //UNDEFINED!
//      list = await db.orderLists.get(idValue).name.commands.Array; //BREAKS ALL!
//      list = await db.orderLists.get(idValue).name.commands; //BREAKS ALL!
//      list = await db.orderLists.commands.get(idValue); //BREAKS ALL!
//      list = await db.orderLists.get(idValue).commands; //UNDEFINED!
//      list = await db.orderLists.get(idValue).commands[1]; //BREAKS ALL!
//      list = await db.orderLists.get(idValue).id.commands; //BREAKS ALL!
//      list = await db.orderLists.get(idValue).name.commands[1]; //BREAKS ALL!
//      list = await db.orderLists.get(idValue); //PARTIAL WORKS!
//      list = await db.orderLists.get[idValue]/commands; //BREAKS ALL!
//      list = await db.orderLists.get[idValue]; //UNDEFINED!
//      list = await db.orderLists.get([idValue]); //UNDEFINED!
//      list = await db.orderLists.get(idValue).Array; //UNDEFINED!
//      list = await db.orderLists.get(idValue).Array[3]; //BREAKS ALL!
//      list = await db.orderLists.get(idValue).commands.Array; //BREAKS ALL!
      list = await db.orderLists.get(idValue); //PARTIAL WORKS!
	console.log("Here's the value of list" );
	console.log(list);
	console.log("After await mmmmmmmmmmmmmmmm");
//    result[idCountJ] = list;
  } ////// for ...

	console.log("After await nnnnnnnnnnnnnnn");
  return result;
} // End of Function ...







async function loadOrdersLists(ids) {
console.log("... function loadOrdersLists Start ...");
  const result = {};
  for (var id of ids) {
console.log(id + " id BEFORE");
	  Number(id);
console.log(!isNaN(id));
console.log(isNaN(id));
console.log("Value of id: ");
    var list = await db.orderLists.get(id).then (console.log("list: " + JSON.stringify(list))); 
console.log(id + " id AFTER");
    result[id] = list;
  }
console.log("... function loadOrdersLists End ...");
  return result;
} // End of Function ...







 

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
  const [BASIC_MAP_NUMBERS, GAME_MAP_BOTS, GAME_MAP_BULLETS, GAME_MAP_FACING, GAME_MAP_DAMAGE] = STARTING_MAP_SQUARES(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
  console.log("Main Loop GAME_MAP_BOTS:" + GAME_MAP_BOTS); //Working here.
//  console.log("GAME_MAP_SQUARES:" + GAME_MAP_SQUARES); //Working here.
//		console.log(" JJJJJ: " + JSON.stringify(ALL_BOTS_IN_COMBAT_LIST));

  let TOO_MANY_TURNS = 0;
  let BOT_IS_DESTROYED = ['41','42','43'];
  let CURRENT_BOT_NUMBER = 0;
	for (var j = 0; j < ALL_BOTS_IN_COMBAT_LIST.length; j++){
//		console.log("..... Inside FOR .....");
		let CURRENT_BOT = ALL_BOTS_IN_COMBAT_LIST[j];


		if (BOT_IS_DESTROYED.includes(CURRENT_BOT_NUMBER) && TOO_MANY_TURNS <= 50)
		  {
//			  console.log("........... IF DUAL CONDITIONS  TRUE ...........");
	  }else{ /// not true!!!
			TOO_MANY_TURNS++;//
			let commands = 3;//STUPID, but leave or it breaks!	
console.log(".XXX: " + (await db.orderLists.get(ALL_BOTS_IN_COMBAT_LIST[j].ordersListId)).commands[1]);

//////////// Call EXECUTE_ORDERS_LIST ////////////////////
			const MyOrders = EXECUTE_ORDERS_LIST(ALL_BOTS_IN_COMBAT_LIST, GAME_MAP_BOTS, GAME_MAP_BULLETS, COMBAT_RECORD, TOO_MANY_TURNS, BOT_IS_DESTROYED, GAME_MAP_FACING, CURRENT_BOT, GAME_MAP_DAMAGE)
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

let MyBotStarting = ['1','9','2','10','11','19','12','20','21','29','22','30','31','39','32','40','41','49','42','50','51','59','52','60','61','69','62','70','71','79','72','80','81','89','82','90','91','99','92','100'];

console.log("...Funk 1...");
	
let botIndex = 0;
var BotCount = 0;
var BotID = "";
var BotFlag = true;
var FACING_DIR = "E";
var STARTING_LOC = "'0'";
var CURRENT_BOT = "'0'";
var MY_BOT = "";
var CURRENT_BOT_COUNT = 1;
//var GAME_MAP_FACING = [];
const GAME_MAP_BULLETS = [];
const GAME_MAP_SQUARES = [];
const GAME_MAP_DAMAGE = [];
//const GAME_MAP_BOTS = [];
const BASIC_MAP_NUMBERS = [];	
const _MAP_NUMBERS = [];	


///// Create BASIC_MAP_NUMBERS and GAME_MAP_BULLETS //////
for (let k = 1; k <= 100; k++) {
    BASIC_MAP_NUMBERS.push(k); /// BASIC_MAP_NUMBERS - SUCCESS!
    GAME_MAP_BULLETS.push(0); /// BASIC_MAP_NUMBERS - SUCCESS!
}// (let k = 1; #1 ...


///////////// Create GAME_MAP_BOTS /////////////////

const GAME_MAP_BOTS =  ["1","3","0","0","0","0","0","0","2","4","5","7","0","0","0","0","0","0","6","8","9","11","0","0","0","0","0","0","10","12","13","15","0","0","0","0","0","0","14","16","17","19","0","0","0","0","0","0","18","20","21","23","0","0","0","0","0","0","22","24","25","27","0","0","0","0","0","0","26","28","29","31","0","0","0","0","0","0","30","32","33","35","0","0","0","0","0","0","34","36","37","39","0","0","0","0","0","0","38","40"]
 
 
//for (let k = 1; k <= 100; k++) {
//	STARTING_LOC = JSON.stringify(k);
//	if (MyBotStarting.includes(STARTING_LOC)){ // If a starting location ...
//console.log("--kA-" + k + "--BotCount-" + BotCount + "--CURRENT_BOT_COUNT-" + CURRENT_BOT_COUNT + "--GAME_MAP_BOTS--");
//		CURRENT_BOT_COUNT = JSON.stringify(CURRENT_BOT_COUNT);
//		BotID = MyBotStarting[BotCount];
//		GAME_MAP_BOTS.push(BotID);	
//		BotCount++;
//		CURRENT_BOT_COUNT++;
//		}//if (MyBotStarting.includes(k)
//	else {
//		GAME_MAP_BOTS.push("0");
//	}//else if (MyBotStarting.includes
//}// for (let k = 0 ...


////////////// Create GAME_MAP_FACING ////////////

const GAME_MAP_FACING = ["E","E","0","0","0","0","0","0","W","W","E","E","0","0","0","0","0","0","W","W","E","E","0","0","0","0","0","0","W","W","E","E","0","0","0","0","0","0","W","W","E","E","0","0","0","0","0","0","W","W","E","E","0","0","0","0","0","0","W","W","E","E","0","0","0","0","0","0","W","W","E","E","0","0","0","0","0","0","W","W","E","E","0","0","0","0","0","0","W","W","E","E","0","0","0","0","0","0","W","W"];




////////////// Create GAME_MAP_DAMAGE ////////////

var strParse = "";
var startParse = "";
var endParse = "";
var strParseReturn = "";
var strParseReturn2 = "";
var strFrame = "";
var strArmor = "";
var strArmor1 = "";
var strArmor2 = "";
var BOT_ARMOR = "";

BotCount = 0;
for (MY_BOT of GAME_MAP_BOTS)  {
	if (MY_BOT == "0"){
//console.log("-MY_BOT-" + MY_BOT + " ==  0");
		GAME_MAP_DAMAGE.push("0");
	} else { // if (MY_BOT == "0
		BotCount++;
		for (CURRENT_BOT of ALL_BOTS_IN_COMBAT_LIST) {
			strParse = JSON.stringify(CURRENT_BOT) + "EndOfData";
//console.log("strParse: " + strParse);			
			startParse = "combatBotNumber";
			endParse = "EndOfData";
			strFrame = ParseString(strParse, startParse, endParse);
			strParse = JSON.stringify(CURRENT_BOT) + "EndOfData";
//console.log("strParse: " + strParse);			
			startParse = "slots, ";
			endParse = " ND,";
			strArmor1 = ParseString(strParse, startParse, endParse);
//console.log("--strArmor1--" + strArmor1);
			startParse = "armor";
			endParse = "sensor";
			strArmor = ParseString(strParse, startParse, endParse);
//console.log("--strArmor--" + strArmor);
			startParse = "slots, ";
			endParse = " AD,";
			strArmor2 = ParseString(strArmor, startParse, endParse);
//console.log("--strArmor2--" + strArmor2);
			BOT_ARMOR = Number(strArmor1) + Number(strArmor2);
//console.log("--BOT_ARMOR--" + BOT_ARMOR);

//			strParse = JSON.stringify(CURRENT_BOT) + "EndOfData";
			startParse = "combatBotNumber";
			endParse = "EndOfData";
			strParseReturn = ParseString(strParse, startParse, endParse);
			strParseReturn2 = strParseReturn.slice(2);
			BotID = strParseReturn2.slice(0, -1); 
//console.log("...--BotCount--" + BotCount + "--BotID--" + BotID + "----"); 
//////MAP WITH ARMY ID ????
//////MAP WITH Master Damage ????
//////MAP WITH Secondary Damage ????
			if (BotCount == BotID){
				GAME_MAP_DAMAGE.push(JSON.stringify(BOT_ARMOR));
			}//if (MY_BOT == BotID
		}//for (CURRENT_BOT of ALL_BOTS_IN_COMBAT_LIST
	}//else {if (MY_BOT == "0 
}// for (CURRENT_BOT of	

console.log("BASIC_MAP_NUMBERS:", JSON.stringify(BASIC_MAP_NUMBERS));
console.log("GAME_MAP_BOTS:", JSON.stringify(GAME_MAP_BOTS));
console.log("GAME_MAP_BULLETS:", JSON.stringify(GAME_MAP_BULLETS));
console.log("GAME_MAP_FACING:", JSON.stringify(GAME_MAP_FACING));
console.log("GAME_MAP_DAMAGE:", JSON.stringify(GAME_MAP_DAMAGE));

console.log("...Function STARTING_MAP_SQUARES End...");

	return [BASIC_MAP_NUMBERS, GAME_MAP_BOTS, GAME_MAP_BULLETS, GAME_MAP_FACING, GAME_MAP_DAMAGE];//GAME_MAP_SQUARES, 
} // End of Function
	


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

export async function EXECUTE_ORDERS_LIST(ALL_BOTS_IN_COMBAT_LIST, GAME_MAP_BOTS, GAME_MAP_BULLETS, COMBAT_RECORD, TOO_MANY_TURNS, BOT_IS_DESTROYED, GAME_MAP_FACING, CURRENT_BOT, GAME_MAP_DAMAGE) {
 console.log("...Function EXECUTE_ORDERS_LIST Start...");


 var TotalOfCommands = "";
 var EXECUTE_CURRENT_COMMAND = "";
 const strParse = JSON.stringify(CURRENT_BOT) + "EndOfData";
 const startParse = "combatBotNumber";
 const endParse = "EndOfData";
 const strParseReturn = ParseString(strParse, startParse, endParse);
 let strParseReturn2 = strParseReturn.slice(2);
 const BotID = strParseReturn2.slice(0, -1); 
 console.log("--BotID--" + BotID + "----");
///// THIS SECTION STRIPS NON-NUMERIC CHARACTERS!!!!!!!
	strParseReturn2 = strParseReturn.slice(2);
	console.log("strParseReturn2LLL: ");
	console.log(strParseReturn2);
	var OrdersListID = strParseReturn2.slice(0, -2); 
//	console.log(" OrdersListID: --OrdersListID--" + OrdersListID + "----");

//const TotalOfCommands = (await db.orderLists.get(ALL_BOTS_IN_COMBAT_LIST[BotID].ordersListId)).commands.length;

		for (var pcount = 0; pcount < 20; pcount++){
			let MyCount = JSON.stringify(pcount);

// EXECUTE_CURRENT_COMMAND = "Turn Right";
EXECUTE_CURRENT_COMMAND = "Move Forward 1";




console.log("TEST 21");
console.log("..EXECUTE_CURRENT_COMMAND: " + EXECUTE_CURRENT_COMMAND);


	if (EXECUTE_CURRENT_COMMAND == "Move Forward 1"){
		console.log("...Call EXECUTE_CURRENT_COMMAND = Move Forward 1");
		[GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE]=CURRENT_MOVE_BOT1(COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE);
		}

/*
The TypeError: object is not iterable error occurs because your code tried to loop over, spread, or destructure a standard JavaScript Object ({}) using a mechanism that only works on iterable data types like Array, Map, or Set. Standard objects do not implement the required Symbol.iterator method by default. Because this happened inside a (in promise) block, the error was triggered inside an asynchronous operation like an async/await function, a .then() block, or a network request handler.Common Root CausesCheck your code for the following four frequent mistakes:1. Array destructuring a plain objectYou used square brackets [] instead of curly braces {} when unpacking a returned object. This often happens with React hooks or API responses.Wrong: const [data, setData] = fetchUser(); (if fetchUser returns an object)Fix: const { data, setData } = fetchUser();2. Spreading a plain object into an arrayYou used the ... spread operator on an object inside array brackets.Wrong: const newArray = [...myObject];Fix: const newArray = [{ ...myObject }]; or const newArray = Object.values(myObject);3. Looping with for...ofYou used for...of instead of for...in to loop over an object's properties.Wrong: for (let item of myObject) { ... }Fix: for (let key in myObject) { ... } or for (let item of Object.values(myObject)) { ... }4. Invalid arguments in Promise.all or Object.fromEntries

*/

	if (EXECUTE_CURRENT_COMMAND == "Turn Left"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Turn Left");
		[GAME_MAP_FACING, COMBAT_RECORD] = CURRENT_TURN_LEFT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT);		
		}

	if (EXECUTE_CURRENT_COMMAND == "Turn Right"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Turn Right");
		[GAME_MAP_FACING, COMBAT_RECORD] = CURRENT_TURN_RIGHT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS);
		}

	if (EXECUTE_CURRENT_COMMAND == "Veer Left"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Veer Left");
		[GAME_MAP_FACING, COMBAT_RECORD] = CURRENT_VEER_LEFT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT);		
		}

	if (EXECUTE_CURRENT_COMMAND == "Veer Right"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Veer Right");
		[GAME_MAP_FACING, COMBAT_RECORD] = CURRENT_VEER_RIGHT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT);		
		}


	
	if (EXECUTE_CURRENT_COMMAND == "Fire Master Weapon"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Fire Master Weapon");
		////////  Run Fire Master Weapon /////////////////
//		[GAME_MAP_BOTS, GAME_MAP_SQUARES] = FIRE_MASTER_WEAPON(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
		
		}

	if (EXECUTE_CURRENT_COMMAND == "Fire Seconday Weapon"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Fire Seconday Weapon");
//		[GAME_MAP_BOTS, GAME_MAP_SQUARES] = FIRE_MASTER_WEAPON(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
		
		}

	if (EXECUTE_CURRENT_COMMAND == "If Any Enemies in Range ..."){
		console.log("Call EXECUTE_CURRENT_COMMAND = If Any Enemies in Range ...");
//		[GAME_MAP_BOTS, GAME_MAP_SQUARES] = FIRE_MASTER_WEAPON(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
		
		}


	if (EXECUTE_CURRENT_COMMAND == "Activate Targeting Map"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Activate Targeting Map");
//		[GAME_MAP_BOTS, GAME_MAP_SQUARES] = FIRE_MASTER_WEAPON(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
		
		}

	if (EXECUTE_CURRENT_COMMAND == "Move toward located Enemy"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Move toward located Enemy");
		[[GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE]] = CURRENT_MOVE_TOWARD_ENEMY(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
		
		}

	if (EXECUTE_CURRENT_COMMAND == "Move Forward 2"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Move Forward 2");
//		let myReturnValue = CURRENT_MOVE_BOT2(myReturnValue);
//		[GAME_MAP_BOTS, GAME_MAP_SQUARES] = CURRENT_MOVE_BOT2(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
		
		}


	if (EXECUTE_CURRENT_COMMAND == "Move Forward 3"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Move Forward 3");
//		[GAME_MAP_BOTS, GAME_MAP_SQUARES] = CURRENT_MOVE_BOT3(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
		console.log("TEST 20");
//		let myReturnValue = CURRENT_MOVE_BOT3(myReturnValue);		
		}

	if (EXECUTE_CURRENT_COMMAND == "Move Forward 4"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Move Forward 4");
//		[GAME_MAP_BOTS, GAME_MAP_SQUARES] = CURRENT_MOVE_BOT4(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
		
		}


	if (EXECUTE_CURRENT_COMMAND == "Move Forward 5"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Move Forward 5");
//		[GAME_MAP_BOTS, GAME_MAP_SQUARES] = CURRENT_MOVE_BOT5(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
		
		}


	if (EXECUTE_CURRENT_COMMAND == "If Your Armor is Below 300 ..."){
		console.log("Call EXECUTE_CURRENT_COMMAND = If Your Armor is Below 300 ...");
//		[GAME_MAP_BOTS, GAME_MAP_SQUARES] = FIRE_MASTER_WEAPON(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
		
		}


	if (EXECUTE_CURRENT_COMMAND == "Move Backward 1"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Move Backward 1");
//		[GAME_MAP_BOTS, GAME_MAP_SQUARES] = CURRENT_MOVE_BOT_BACK1(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
		
		}


	if (EXECUTE_CURRENT_COMMAND == "Move Backward 2"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Move Backward 2");
//		[GAME_MAP_BOTS, GAME_MAP_SQUARES] = CURRENT_MOVE_BOT_BACK2(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
		
		}


	if (EXECUTE_CURRENT_COMMAND == "Move Backward 3"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Move Backward 3");
//		[GAME_MAP_BOTS, GAME_MAP_SQUARES] = CURRENT_MOVE_BOT_BACK3(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
		
		}


	if (EXECUTE_CURRENT_COMMAND == "Move toward located Enemy"){
		console.log("Call EXECUTE_CURRENT_COMMAND = Move toward located Enemy");
//		[GAME_MAP_BOTS, GAME_MAP_SQUARES] = MOVE_TOWARD_LOCATED_ENEMY(ALL_BOTS_IN_COMBAT_LIST, COMBAT_RECORD);
		
		}



}//for (var p ....

	

console.log("...Function EXECUTE_ORDERS_LIST End...");
 
 return [GAME_MAP_BOTS];
}

////////////////////////////////////////////////////////////////
function ParseString(strParse, startParse, endParse) {
 //console.log("...Function ParseString Start...");

 //console.log("...strParse: " + strParse + " ...startParse: " + startParse + " ...endParse: " + endParse);
  const startIndexParse = strParse.indexOf(startParse);
  if (startIndexParse === -1) return null;

  const endIndexParse = strParse.indexOf(endParse, startIndexParse + startParse.length);
  if (endIndexParse === -1) return null;

  return strParse.substring(startIndexParse + startParse.length, endIndexParse);
}


//////////////// STRIP A CHARACTER ///////////////////////
//const original = "banana";
//const stripped = original.replaceAll("a", ""); 
//console.log(stripped); // "bnn"


// ==================================================================
// MOVEMENT FUNCTIONS (placeholder implementations)
//===================================================================


//JAYJAY



export async function CURRENT_MOVE_BOT1(COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS, GAME_MAP_FACING, GAME_MAP_DAMAGE){
console.log("...... Function CURRENT_MOVE_BOT1 Start ..."); 
//console.log("GAME_MAP_FACING Before: " + JSON.stringify(GAME_MAP_FACING));
//console.log("..GAME_MAP_BOTS:" + JSON.stringify(GAME_MAP_BOTS));
	var MY_BOT = "";  //CombatNumber of the Bot
	var BotCount = 1;  //Number of Bot in the Array 
	var CurrentSpace = 1; //Space on numbered map 
	var NextSpace = 0; //Space on numbered map 
	var NewSpace = ""; //Value on numbered map 
	var OldSpace = ""; //Value on numbered map 
	var IsOffMap = false;
	var NextArraySpace = ""; //Number in the Array  
	var CurrentArraySpace = ""; //Number in the Array 
	
////////////////////// 	GET combatBotNumber ////////////////////////
	var startParse = "combatBotNumber";
	var endParse = "EndOfData";
	var strParse = JSON.stringify(CURRENT_BOT) + "EndOfData";
	var strParseReturn = ParseString(strParse, startParse, endParse);
	var strParseReturn2 = strParseReturn.slice(2);
	var BotID = strParseReturn2.slice(0, -1); 

console.log("--JAYTEST 50--"); 
	for (MY_BOT of GAME_MAP_BOTS)  {
		if (MY_BOT == BotID){
console.log("--BotID--" + BotID); 
console.log("--MY_BOT--" + MY_BOT); 
console.log("--BotCount--" + BotCount); 
console.log("--CurrentSpace--" + CurrentSpace);

			CurrentArraySpace = JSON.stringify(CurrentSpace - 1);
			NextArraySpace = JSON.stringify(NextSpace - 1);

///////////////////////// MOVE 1 /////////////////////////////
console.log(" BotID: " + BotID + " NextSpace: " + NextSpace + "  CurrentSpace: " + CurrentSpace + "   .CURRENT_MOVE_BOT1");
			if (GAME_MAP_FACING[CurrentArraySpace] == "N"){NextSpace = CurrentSpace - 10};
			if (GAME_MAP_FACING[CurrentArraySpace] == "NE"){NextSpace = CurrentSpace - 9};
			if (GAME_MAP_FACING[CurrentArraySpace] == "E"){NextSpace = CurrentSpace + 1};
			if (GAME_MAP_FACING[CurrentArraySpace] == "SE"){NextSpace = CurrentSpace + 11};
			if (GAME_MAP_FACING[CurrentArraySpace] == "S"){NextSpace = CurrentSpace + 10};
			if (GAME_MAP_FACING[CurrentArraySpace] == "SW"){NextSpace = CurrentSpace + 9};
			if (GAME_MAP_FACING[CurrentArraySpace] == "W"){NextSpace = CurrentSpace - 1};
			if (GAME_MAP_FACING[CurrentArraySpace] == "NW"){NextSpace = CurrentSpace - 11};
			
console.log(" BotID: " + BotID + " NextSpace: " + NextSpace + "  CurrentSpace: " + CurrentSpace + "   .CURRENT_MOVE_BOT1");

// at this point, you've identified the Bot you're trying to move, the space you're on, and the spot you want to move to. If the space is occupied, then send a message to Combat Record that this Bot's movement is blocked. Else swap the numbers of the two spaces in GAME_MAP_FACING, GAME_MAP_BOTS, and GAME_MAP_DAMAGE. Then send a message to Combat Record that this Bot's movement is complete.


//!!!!!!!!!!! CHECK FOR OFF MAP 1 !!!!!!!!!!!!!!!
			if (NextSpace > 100){OldSpace = IsOffMap = true;}//OFF MAP 
			if (NextSpace < 1){OldSpace = IsOffMap = true;}//OFF MAP 
			if (CurrentSpace == NextSpace){OldSpace = IsOffMap = true;}//OFF MAP 
			if (CurrentSpace == NextSpace){OldSpace = IsOffMap = true;}//OFF MAP 
			if (CurrentSpace < 20 && NextSpace > 80){OldSpace = IsOffMap = true;}//OFF MAP 
			if (CurrentSpace > 80 && NextSpace < 20){OldSpace = IsOffMap = true;}//OFF MAP 
//!!!!!!!!!!! CHECK FOR OFF MAP  2 !!!!!!!!!!!!!!!
			if (IsOffMap == true){//OFF MAP 
console.log("****** Bot is OFF MAP!");
//					COMBAT_RECORD.push("Silly Bot " + BotID + " on ANI_MAP_SPACE " + CurrentSpace + " is trying to move off of the game map.");
console.log("*** Silly Bot " + BotID + " on ANI_MAP_SPACE " + CurrentSpace + " is trying to move off of the game map. *****");
			}//OFF MAP 
			if (IsOffMap == false){// IsOffMap == false .. NOT OFF MAP 
console.log("****** Bot is ON MAP!");

////////////////// IF SPACE IS OCCUPIED /////////////////////
console.log("--JAYTEST 57--"); 
			NextArraySpace = JSON.stringify(NextSpace - 1);
console.log(" NextArraySpace: " + NextArraySpace + "  NextArraySpace VALUE: " + GAME_MAP_BOTS[NextArraySpace]);

				if (GAME_MAP_BOTS[NextArraySpace] !== "0"){// Space is Occupied ...
console.log("--JAYTEST 60-- Next Space Occupied"); 
//				COMBAT_RECORD.push("Trapped Bot " + BotID + " on ANI_MAP_SPACE " + CurrentSpace + " can't move to occupied " + NextSpace + ".");
console.log("*** Trapped Bot " + BotID + " on ANI_MAP_SPACE " + CurrentSpace + " can't move to occupied " + NextSpace + ". *****");

console.log("...GAME_MAP_FACING:");
console.log(JSON.stringify(GAME_MAP_FACING));

console.log("...GAME_MAP_BOTS:");
console.log(JSON.stringify(GAME_MAP_BOTS));

console.log("...GAME_MAP_DAMAGE:");
console.log(JSON.stringify(GAME_MAP_DAMAGE));
				}// if (GAME_MAP_BOTS[NextArraySpace] !== "0" .. Occupied ..
			
			
////////////////// BEGIN MOVEMENT only /////////////////////
				if (GAME_MAP_BOTS[NextArraySpace] == "0"){// Space Unoccupied ...
console.log("--JAYTEST 60-- Next Space Unoccupied"); 

					if (NextSpace > 100){OldSpace = IsOffMap = true;}//OFF MAP 
					if (NextSpace < 1){OldSpace = IsOffMap = true;}//OFF MAP 
					if (CurrentSpace == NextSpace){OldSpace = IsOffMap = true;}//OFF MAP 
					if (CurrentSpace == NextSpace){OldSpace = IsOffMap = true;}//OFF MAP 
					if (CurrentSpace < 20 && NextSpace > 80){OldSpace = IsOffMap = true;}//OFF MAP 
					if (CurrentSpace > 80 && NextSpace < 20){OldSpace = IsOffMap = true;}//OFF MAP 
console.log("--JAYTEST 62--"); 

//////////////////////// MAKE CHANGES ////////////////////////////

console.log("...GAME_MAP_FACING:");
console.log(JSON.stringify(GAME_MAP_FACING));

console.log("...GAME_MAP_BOTS:");
console.log(JSON.stringify(GAME_MAP_BOTS));

console.log("...GAME_MAP_DAMAGE:");
console.log(JSON.stringify(GAME_MAP_DAMAGE));


					NextArraySpace = JSON.stringify(NextSpace - 1);
					
console.log(" NextArraySpace: " + NextArraySpace + " NextArraySpace VALUE: " + GAME_MAP_BOTS[NextArraySpace]);

					CurrentArraySpace = JSON.stringify(CurrentSpace - 1);
			
console.log(" CurrentArraySpace: " + CurrentArraySpace + "  NextArraySpace VALUE: ]" + GAME_MAP_BOTS[CurrentArraySpace]);

					OldSpace = GAME_MAP_FACING[CurrentArraySpace]; 
					NewSpace = GAME_MAP_FACING[NextArraySpace]; 
					
					GAME_MAP_FACING[CurrentArraySpace] = NewSpace;
					GAME_MAP_FACING[NextArraySpace] = OldSpace;
					
					OldSpace = GAME_MAP_BOTS[CurrentArraySpace]; 
					NewSpace = GAME_MAP_BOTS[NextArraySpace]; 

					GAME_MAP_BOTS[CurrentArraySpace] = NewSpace;
					GAME_MAP_BOTS[NextArraySpace] = OldSpace;

					OldSpace = GAME_MAP_DAMAGE[CurrentArraySpace]; 
					NewSpace = GAME_MAP_DAMAGE[NextArraySpace]; 
					
					GAME_MAP_DAMAGE[CurrentArraySpace] = NewSpace;
					GAME_MAP_DAMAGE[NextArraySpace] = OldSpace;


console.log("*** Move Bot " + BotID + " from ANI_MAP_SPACE " + CurrentSpace + " to " + NextSpace + ". *****");


console.log("...GAME_MAP_FACING:");
console.log(JSON.stringify(GAME_MAP_FACING));

console.log("...GAME_MAP_BOTS:");
console.log(JSON.stringify(GAME_MAP_BOTS));

console.log("...GAME_MAP_DAMAGE:");
console.log(JSON.stringify(GAME_MAP_DAMAGE));

console.log("--JAYTEST 56--"); 
					BotID = "";  //change of CombatNumber to keep it from cycling more than once.
				}// if (GAME_MAP_BOTS[NextArraySpace] == "0" .. Unoccupied ..
			
			}// IsOffMap == false .. NOT OFF MAP 
		
			BotCount++;
		}// if (MY_BOT == BotID
	CurrentSpace++;
	}// for (MY_BOT of GAME_MAP_BOTS
console.log("...Function CURRENT_MOVE_BOT1 End..."); 
return [GAME_MAP_FACING, COMBAT_RECORD, GAME_MAP_BOTS, GAME_MAP_DAMAGE];
}//End of Function 





export async function CURRENT_TURN_RIGHT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS) { console.log("Start Function CURRENT_TURN_RIGHT"); 
console.log("GAME_MAP_BOTS:" + JSON.stringify(GAME_MAP_BOTS));
console.log("GAME_MAP_FACING Before: " + JSON.stringify(GAME_MAP_FACING));
	var BotCount = 0;
	var SpaceCount = 0;
	var MY_BOT = "";
	var NewDir = "";
	var startParse = "combatBotNumber";
	var endParse = "EndOfData";
	var strParse = JSON.stringify(CURRENT_BOT) + "EndOfData";
	var strParseReturn = ParseString(strParse, startParse, endParse);
	var strParseReturn2 = strParseReturn.slice(2);
	var BotID = strParseReturn2.slice(0, -1); 
console.log("--JAYTEST 51--"); 

	for (MY_BOT of GAME_MAP_BOTS)  {
		if (MY_BOT == BotID){
console.log("--JAYTEST 52--"); 
console.log("--BotID--" + BotID); 
console.log("--MY_BOT--" + MY_BOT); 
console.log("--BotCount--" + BotCount); 
console.log("--SpaceCount--" + SpaceCount); 
///////////////////////// TURN RIGHT /////////////////////////////
			if (GAME_MAP_FACING[SpaceCount] == "N"){NewDir = "E"};
			if (GAME_MAP_FACING[SpaceCount] == "NE"){NewDir = "SE"};
			if (GAME_MAP_FACING[SpaceCount] == "E"){NewDir = "S"};
			if (GAME_MAP_FACING[SpaceCount] == "SE"){NewDir = "SW"};
			if (GAME_MAP_FACING[SpaceCount] == "S"){NewDir = "W"};
			if (GAME_MAP_FACING[SpaceCount] == "SW"){NewDir = "NW"};
			if (GAME_MAP_FACING[SpaceCount] == "W"){NewDir = "N"};
			if (GAME_MAP_FACING[SpaceCount] == "NW"){NewDir = "NE"};
			GAME_MAP_FACING[SpaceCount] = NewDir;
			COMBAT_RECORD.push("Rotate Bot " + BotID + " to face " + NewDir + " on ANI_MAP_SPACE " + SpaceCount + 1  + ".");
			COMBAT_RECORD.push("Rotate Bot " + BotID + " to face " + NewDir + " on ANI_MAP_SPACE " + SpaceCount -1  + ".");
			console.log("Rotate Bot " + BotID + " to face " + NewDir + " on ANI_MAP_SPACE " + SpaceCount + ".");
			BotCount++;
		}// if (MY_BOT == "0 .CURRENT_TURN_RIGHT
	SpaceCount++;
	}//for (MY_BOT of GAME_MAP_BOTS

console.log("GAME_MAP_FACING After: " + JSON.stringify(GAME_MAP_FACING));
return [GAME_MAP_FACING, COMBAT_RECORD];}

// const fruits = ['apple', 'banana', 'cherry'];
//fruits[1] = 'blueberry'; 
//console.log(fruits); // ['apple', 'blueberry', 'cherry']



export async function CURRENT_TURN_LEFT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS)       { console.log("Start Function CURRENT_TURN_LEFT"); 

console.log("GAME_MAP_BOTS:", JSON.stringify(GAME_MAP_BOTS));
console.log("GAME_MAP_FACING Before: " + JSON.stringify(GAME_MAP_FACING));
	var BotCount = 0;
	var SpaceCount = 0;
	var MY_BOT = "";
	var NewDir = "";
	var startParse = "combatBotNumber";
	var endParse = "EndOfData";
	var strParse = JSON.stringify(CURRENT_BOT) + "EndOfData";
	var strParseReturn = ParseString(strParse, startParse, endParse);
	var strParseReturn2 = strParseReturn.slice(2);
	var BotID = strParseReturn2.slice(0, -1); 
	for (MY_BOT of GAME_MAP_BOTS)  {
		if (MY_BOT == BotID){
console.log("--JAYTEST 53--"); 
console.log("--BotID--" + BotID); 
console.log("--MY_BOT--" + MY_BOT); 
console.log("--BotCount--" + BotCount); 
console.log("--SpaceCount--" + SpaceCount); 
/////////////////////////TURN LEFT /////////////////////////////
			if (GAME_MAP_FACING[SpaceCount] == "N"){NewDir = "W"};
			if (GAME_MAP_FACING[SpaceCount] == "NE"){NewDir = "SW"};
			if (GAME_MAP_FACING[SpaceCount] == "E"){NewDir = "N"};
			if (GAME_MAP_FACING[SpaceCount] == "SE"){NewDir = "NW"};
			if (GAME_MAP_FACING[SpaceCount] == "S"){NewDir = "E"};
			if (GAME_MAP_FACING[SpaceCount] == "SW"){NewDir = "NE"};
			if (GAME_MAP_FACING[SpaceCount] == "W"){NewDir = "S"};
			if (GAME_MAP_FACING[SpaceCount] == "NW"){NewDir = "SE"};
			GAME_MAP_FACING[SpaceCount] = NewDir;
			COMBAT_RECORD.push("Rotate Bot " + BotID + " to face " + NewDir + " on ANI_MAP_SPACE " + SpaceCount + 1  + ".");
			COMBAT_RECORD.push("Rotate Bot " + BotID + " to face " + NewDir + " on ANI_MAP_SPACE " + SpaceCount -1  + ".");
			console.log("Rotate Bot " + BotID + " to face " + NewDir + " on ANI_MAP_SPACE " + SpaceCount + ".");
			BotCount++;
		}// if (MY_BOT == "0 .CURRENT_TURN_LEFT
	SpaceCount++;
	}//for (MY_BOT of GAME_MAP_BOTS
return [GAME_MAP_FACING, COMBAT_RECORD];}


export async function CURRENT_VEER_RIGHT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS)       { console.log("Start Function CURRENT_VEER_RIGHT"); 
console.log("GAME_MAP_BOTS:", JSON.stringify(GAME_MAP_BOTS));
console.log("GAME_MAP_FACING Before: ", JSON.stringify(GAME_MAP_FACING));
	var BotCount = 0;
	var SpaceCount = 0;
	var MY_BOT = "";
	var NewDir = "";
	var startParse = "combatBotNumber";
	var endParse = "EndOfData";
	var strParse = JSON.stringify(CURRENT_BOT) + "EndOfData";
	var strParseReturn = ParseString(strParse, startParse, endParse);
	var strParseReturn2 = strParseReturn.slice(2);
	var BotID = strParseReturn2.slice(0, -1); 
	for (MY_BOT of GAME_MAP_BOTS)  {
		if (MY_BOT == BotID){
console.log("--JAYTEST 54--"); 
console.log("--BotID--" + BotID); 
console.log("--MY_BOT--" + MY_BOT); 
console.log("--BotCount--" + BotCount); 
console.log("--SpaceCount--" + SpaceCount); 
/////////////////////////TURN LEFT /////////////////////////////
			if (GAME_MAP_FACING[SpaceCount] == "N"){NewDir = "NE"};
			if (GAME_MAP_FACING[SpaceCount] == "NE"){NewDir = "E"};
			if (GAME_MAP_FACING[SpaceCount] == "E"){NewDir = "SE"};
			if (GAME_MAP_FACING[SpaceCount] == "SE"){NewDir = "S"};
			if (GAME_MAP_FACING[SpaceCount] == "S"){NewDir = "SW"};
			if (GAME_MAP_FACING[SpaceCount] == "SW"){NewDir = "W"};
			if (GAME_MAP_FACING[SpaceCount] == "W"){NewDir = "NW"};
			if (GAME_MAP_FACING[SpaceCount] == "NW"){NewDir = "N"};
			GAME_MAP_FACING[SpaceCount] = NewDir;
			COMBAT_RECORD.push("Rotate Bot " + BotID + " to face " + NewDir + " on ANI_MAP_SPACE " + SpaceCount + 1  + ".");
			COMBAT_RECORD.push("Rotate Bot " + BotID + " to face " + NewDir + " on ANI_MAP_SPACE " + SpaceCount -1  + ".");
			console.log("Rotate Bot " + BotID + " to face " + NewDir + " on ANI_MAP_SPACE " + SpaceCount + ".");
			BotCount++;
		}// if (MY_BOT == "0 .CURRENT_VEER_RIGHT 
	SpaceCount++;
	}//for (MY_BOT of GAME_MAP_BOTS
return [GAME_MAP_FACING, COMBAT_RECORD];}


export async function CURRENT_VEER_LEFT(GAME_MAP_FACING, COMBAT_RECORD, CURRENT_BOT, GAME_MAP_BOTS)       { console.log("Start Function CURRENT_VEER_LEFT"); 
console.log("GAME_MAP_BOTS:", JSON.stringify(GAME_MAP_BOTS));
console.log("GAME_MAP_FACING Before: ", JSON.stringify(GAME_MAP_FACING));
	var BotCount = 0;
	var SpaceCount = 0;
	var MY_BOT = "";
	var NewDir = "";
	var startParse = "combatBotNumber";
	var endParse = "EndOfData";
	var strParse = JSON.stringify(CURRENT_BOT) + "EndOfData";
	var strParseReturn = ParseString(strParse, startParse, endParse);
	var strParseReturn2 = strParseReturn.slice(2);
	var BotID = strParseReturn2.slice(0, -1); 
	for (MY_BOT of GAME_MAP_BOTS)  {
		if (MY_BOT == BotID){
console.log("--JAYTEST 55--"); 
console.log("--BotID--" + BotID); 
console.log("--MY_BOT--" + MY_BOT); 
console.log("--BotCount--" + BotCount); 
console.log("--SpaceCount--" + SpaceCount); 
/////////////////////////TURN LEFT /////////////////////////////
			if (GAME_MAP_FACING[SpaceCount] == "N"){NewDir = "NW"};
			if (GAME_MAP_FACING[SpaceCount] == "NE"){NewDir = "N"};
			if (GAME_MAP_FACING[SpaceCount] == "E"){NewDir = "NE"};
			if (GAME_MAP_FACING[SpaceCount] == "SE"){NewDir = "E"};
			if (GAME_MAP_FACING[SpaceCount] == "S"){NewDir = "SE"};
			if (GAME_MAP_FACING[SpaceCount] == "SW"){NewDir = "S"};
			if (GAME_MAP_FACING[SpaceCount] == "W"){NewDir = "NW"};
			if (GAME_MAP_FACING[SpaceCount] == "NW"){NewDir = "W"};
			GAME_MAP_FACING[SpaceCount] = NewDir;
			COMBAT_RECORD.push("Rotate Bot " + BotID + " to face " + NewDir + " on ANI_MAP_SPACE " + SpaceCount + 1  + ".");
			COMBAT_RECORD.push("Rotate Bot " + BotID + " to face " + NewDir + " on ANI_MAP_SPACE " + SpaceCount -1  + ".");
			console.log("Rotate Bot " + BotID + " to face " + NewDir + " on ANI_MAP_SPACE " + SpaceCount + ".");
			BotCount++;
		}// if (MY_BOT == "0 .CURRENT_VEER_LEFT
	SpaceCount++;
	}//for (MY_BOT of GAME_MAP_BOTS
return [GAME_MAP_FACING, COMBAT_RECORD];}




export async function CURRENT_MOVE_BOT2(myReturnValue)       { console.log("Start Function CURRENT_MOVE_BOT2");
return [myReturnValue]; }
export async function CURRENT_MOVE_BOT3(myReturnValue)       { 

console.log("Start Function CURRENT_MOVE_BOT3 Start...");
console.log("TEST 22");
 return [myReturnValue];
 }
export async function CURRENT_MOVE_BOT4(myReturnValue)       { console.log("Start Function CURRENT_MOVE_BOT4"); 
return [myReturnValue];}
export async function CURRENT_MOVE_BOT5(myReturnValue)       { console.log("Start Function CURRENT_MOVE_BOT5"); 
return [myReturnValue];}
export async function CURRENT_MOVE_BOTMAX(myReturnValue)     { console.log("Start Function CURRENT_MOVE_BOTMAX"); 
return [myReturnValue];}
export async function CURRENT_MOVE_BOT_BACK1(myReturnValue)  { console.log("Start Function CURRENT_MOVE_BOT_BACK1"); 
return [myReturnValue];}
export async function CURRENT_MOVE_BOT_BACK2(myReturnValue)  { console.log("Start Function CURRENT_MOVE_BOT_BACK2"); 
return [myReturnValue];}
export async function CURRENT_MOVE_BOT_BACK3(myReturnValue)  { console.log("Start Function CURRENT_MOVE_BOT_BACK3"); 
return [myReturnValue];}

export async function CURRENT_ROTATE_BOT(direction) {
  console.log(`CURRENT_ROTATE_BOT: ${direction}`);
return [myReturnValue];}

export async function CURRENT_MOVE_BLOCKED_ENEMY(myReturnValue) { console.log("Start Function CURRENT_MOVE_BLOCKED_ENEMY"); 
return [myReturnValue];}
export async function CURRENT_MOVE_TOWARD_ENEMY(myReturnValue)  { console.log("Start Function CURRENT_MOVE_TOWARD_ENEMY"); 
return [myReturnValue];}
export async function FIRE_MASTER_WEAPON(myReturnValue)          { console.log("Start Function FIRE_MASTER_WEAPON"); 
return [myReturnValue];}
export async function FIRE_SECONDARY_WEAPON(myReturnValue)       { console.log("Start Function FIRE_SECONDARY_WEAPON"); 
return [myReturnValue];}
export async function FIRE_ALL_WEAPONS(myReturnValue)            { console.log("Start Function FIRE_ALL_WEAPONS"); 
return [myReturnValue];}
export async function CURRENT_ACTIVATE_SCANNER(myReturnValue)   { console.log("Start Function CURRENT_ACTIVATE_SCANNER"); 
return [myReturnValue];}
export async function CURRENT_ACTIVATE_SELF_DESTRUCT(myReturnValue) { console.log("Start Function CURRENT_ACTIVATE_SELF_DESTRUCT"); 
return [myReturnValue];}
export async function IDENTIFY_ANY_ENEMIES(myReturnValue)        { console.log("Start Function IDENTIFY_ANY_ENEMIES"); 
return [myReturnValue];}

export async function MOVE_TOWARD_LOCATED_ENEMY(myReturnValue)        { console.log("Start Function MOVE_TOWARD_LOCATED_ENEMY"); 
return [myReturnValue];}


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
  // WEIGHT_TOTAL
  // POWER_TOTAL (weapon power draw)
  // POWER_OUTPUT (engine output)

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
console.log("... JAYTEST 6 ...");	
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

//=====================================================================
// COMBAT_RECORD_STRINGS //======================================================================
/*
Place Bot 01 facing West on ANI_MAP_SPACE 9.
Start turn of Bot 01 facing West on ANI_MAP_SPACE 9.
Rotate Bot 01 to face SouthWest on ANI_MAP_SPACE 9.
Activate Scan Bot 01 facing SouthWest on ANI_MAP_SPACE 9.
Locate Enemy Bots at ANI_MAP_SPACE 0, 0, 0, 0, 0.
Locate Allied Bots at ANI_MAP_SPACE 19, 29, 39, 20, 10.
Move Bot 01 facing SouthWest from ANI_MAP_SPACE 9 to 18.
Fired Bullet All on ANI_MAP_SPACE 18 facing SouthWest Range 4.
Traveling Bullet All on ANI_MAP_SPACE 27 facing South Range 3.
Traveling Bullet All on ANI_MAP_SPACE 36 facing South Range 2.
Traveling Bullet All on ANI_MAP_SPACE 45 facing South Range 1.
Striking Bullet All on ANI_MAP_SPACE 54 facing South Range 0.
Damage strikes Bot 26 on ANI_MAP_SPACE 54 total 150.
Destroyed Bot 26 on ANI_MAP_SPACE 54.
Victory to Player1 by Army2 surviving Allied 7 Bots surviving Enemies 0 Bots. 
*/