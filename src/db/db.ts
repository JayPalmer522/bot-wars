
import Dexie, { Table } from "dexie";

export interface OrdersList {
  id?: number;
  userId: number;
  name: string;
  commands: string[];
}

export interface TargetMap {
  id?: number;
  userId: number;
  name: string;
  range: number;
  grid: string[][];
}

export interface Bot {
  id?: number;
  userId: number;
  name: string;
  frame: string;
  engine: string;
  computer: string;
  armor: string;
  sensor: string;
  weaponMaster: string;
  weaponSecondary: string;
  weaponBomb: string;
  botImage: string;
  targetMapId: number;
  ordersListId: number;
  slotsUsed: string;
  totalWeight: string;
  totalGold: string;
  totalPower: string;
  move: string;
}

export interface Army {
  id?: number;
  userId: number;
  name: string;
  botIds: number[];
}

export interface BotFrame { id?: number; name: string; slots: number; nd: number; weight: number; cost: number; }
export interface BotEngine { id?: number; name: string; slots: number; po: number; weight: number; cost: number; }
export interface BotComputer { id?: number; name: string; slots: number; ci: number; weight: number; cost: number; }
export interface BotArmor { id?: number; name: string; slots: number; ad: number; weight: number; cost: number; }
export interface BotSensor { id?: number; name: string; targets: number; range: number; pc: number; slots: number; weight: number; cost: number; }
export interface BotMaster { id?: number; name: string; wd: number; wr: number; slots: number; pc: number; weight: number; cost: number; }
export interface BotSecondary { id?: number; name: string; wd: number; wr: number; slots: number; pc: number; weight: number; cost: number; }
export interface BotBomb { id?: number; name: string; wd: number; slots: number; pc: number; weight: number; cost: number; }

export interface BattleHistory {
  id?: number;
  date: string;
  mode: "vs-computer" | "vs-player";
  player1Id: number;
  player1Name: string;
  player1ArmyName: string;
  player2Id: number | null;
  player2Name: string;
  player2ArmyName: string;
  result: "player1" | "player2" | "draw" | "both-lose";
}

export interface Profile {
  id?: number;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  stats: {
    wins: number;
    losses: number;
    totalBattles: number;
    winPercentage?: number;
    rank?: string;
  };
}

export class BotWarsDB extends Dexie {
  orderLists!: Table<OrdersList>;
  targetMaps!: Table<TargetMap>;
  bots!: Table<Bot>;
  armies!: Table<Army>;
  botFrames!: Table<BotFrame>;
  botEngines!: Table<BotEngine>;
  botComputers!: Table<BotComputer>;
  botArmors!: Table<BotArmor>;
  botSensors!: Table<BotSensor>;
  botMasters!: Table<BotMaster>;
  botSecondaries!: Table<BotSecondary>;
  botBombs!: Table<BotBomb>;
  profiles!: Table<Profile>;
  battleHistory!: Table<BattleHistory>;

  constructor() {
    super("BotWarsDB");

    this.version(4).stores({
      orderLists: "++id,&name",
      targetMaps: "++id,&name",
      bots: "++id,&name,targetMapId,ordersListId",
      armies: "++id,&name",
      botFrames: "++id,&name",
      botEngines: "++id,&name",
      botComputers: "++id,&name",
      botArmors: "++id,&name",
      botSensors: "++id,&name",
      botMasters: "++id,&name",
      botSecondaries: "++id,&name",
      botBombs: "++id,&name",
      profiles: "++id,&username,email"
    });

    // v5: user-scoped tables with compound unique indexes
    // Upgrade clears old user data (no userId → incompatible with new compound indexes)
    this.version(5).stores({
      orderLists: "++id,&[userId+name],userId",
      targetMaps: "++id,&[userId+name],userId",
      bots: "++id,&[userId+name],userId,targetMapId,ordersListId",
      armies: "++id,&[userId+name],userId",
      botFrames: "++id,&name",
      botEngines: "++id,&name",
      botComputers: "++id,&name",
      botArmors: "++id,&name",
      botSensors: "++id,&name",
      botMasters: "++id,&name",
      botSecondaries: "++id,&name",
      botBombs: "++id,&name",
      profiles: "++id,&username,email"
    }).upgrade(tx =>
      Promise.all([
        tx.table("bots").clear(),
        tx.table("armies").clear(),
        tx.table("orderLists").clear(),
        tx.table("targetMaps").clear(),
      ])
    );

    // v6: adds battle history table
    this.version(6).stores({
      battleHistory: "++id,player1Id,player2Id,date",
    });

    // v7: fix SmallMedBot → SmallBot (SmallMedBot only has one sprite file: P1_DN)
    this.version(7).stores({}).upgrade(tx =>
      tx.table("bots").toCollection().modify((bot: Bot) => {
        if (bot.botImage === "SmallMedBot") bot.botImage = "SmallBot";
      })
    );

    // v8: reduce frame slot counts (Mini 20→15, Junior 40→35, Adult 50→40,
    //      Master 60→45, Monster 70→50, Giant 80→55, Titan 90→60)
    this.version(8).stores({}).upgrade(async tx => {
      const FRAME_SLOT_MAP: Record<string, number> = {
        "Mini-bot":    15,
        "Junior-bot":  35,
        "Adult-bot":   40,
        "Master-bot":  45,
        "Monster-bot": 50,
        "Giant-bot":   55,
        "Titan-bot":   60,
      };

      const FRAME_DESC_MAP: Record<string, string> = {
        "Mini-bot = BF 20 slots, 20 ND, 160 weight, 200 cost.":    "Mini-bot = BF 15 slots, 20 ND, 160 weight, 200 cost.",
        "Junior-bot = BF 40 slots, 40 ND, 520 weight, 400 cost.":  "Junior-bot = BF 35 slots, 40 ND, 520 weight, 400 cost.",
        "Adult-bot = BF 50 slots, 50 ND, 650 weight, 500 cost.":   "Adult-bot = BF 40 slots, 50 ND, 650 weight, 500 cost.",
        "Master-bot = BF 60 slots, 60 ND, 780 weight, 600 cost.":  "Master-bot = BF 45 slots, 60 ND, 780 weight, 600 cost.",
        "Monster-bot = BF 70 slots, 70 ND, 910 weight, 700 cost.": "Monster-bot = BF 50 slots, 70 ND, 910 weight, 700 cost.",
        "Giant-bot = BF 80 slots, 80 ND, 1040 weight, 800 cost.":  "Giant-bot = BF 55 slots, 80 ND, 1040 weight, 800 cost.",
        "Titan-bot = BF 90 slots, 90 ND, 1170 weight, 900 cost.":  "Titan-bot = BF 60 slots, 90 ND, 1170 weight, 900 cost.",
      };

      // Update slots in the botFrames catalog
      await tx.table("botFrames").toCollection().modify((frame: any) => {
        const newSlots = FRAME_SLOT_MAP[frame.name];
        if (newSlots !== undefined) frame.slots = newSlots;
      });

      // Update frame description string and slotsUsed denominator in every bot row
      await tx.table("bots").toCollection().modify((bot: any) => {
        const newDesc = FRAME_DESC_MAP[bot.frame];
        if (!newDesc) return;
        bot.frame = newDesc;
        const capMatch = newDesc.match(/(\d+)\s+slots/);
        const usedMatch = (bot.slotsUsed ?? "").match(/^(\d+)\//);
        if (capMatch && usedMatch) {
          bot.slotsUsed = `${usedMatch[1]}/${capMatch[1]}`;
        }
      });
    });
  }
}

export const db = new BotWarsDB();
