
import Dexie, { Table } from "dexie";

export interface OrdersList {
  id?: number;
  name: string;
  commands: string[];
}

export interface TargetMap {
  id?: number;
  name: string;
  range: number;
  grid: string[][];
}

export interface Bot {
  id?: number;
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
  }
}

export const db = new BotWarsDB();




