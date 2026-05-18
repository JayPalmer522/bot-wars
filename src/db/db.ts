import Dexie, { type Table } from "dexie";

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
}

export interface Army {
  id?: number;
  name: string;
  botIds: number[];
}

class BotWarsDB extends Dexie {
  orderLists!: Table<OrdersList>;
  targetMaps!: Table<TargetMap>;
  bots!: Table<Bot>;
  armies!: Table<Army>;

  constructor() {
    super("BotWarsDB");
    this.version(1).stores({
      orderLists: "++id, &name",
      targetMaps: "++id, &name",
      bots: "++id, &name, targetMapId, ordersListId",
      armies: "++id, &name",
    });
  }
}

export const db = new BotWarsDB();
