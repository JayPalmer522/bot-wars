import { db } from "./db";

function buildGrid(range: number): string[][] {
  return Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: 7 }, (_, col) => {
      if (row === 3 && col === 3) return "";
      const outer = [0, 1, 5, 6].includes(row) || [0, 1, 5, 6].includes(col);
      const edge  = [0, 6].includes(row)        || [0, 6].includes(col);
      if (range === 1 && outer) return "0";
      if (range === 2 && edge)  return "0";
      return "";
    })
  );
}

async function getOrCreateOrderList(name: string, commands: string[]): Promise<number> {
  const existing = await db.orderLists.where("name").equals(name).first();
  if (existing) return existing.id!;
  return (await db.orderLists.add({ name, commands })) as number;
}

async function getOrCreateTargetMap(name: string, range: number): Promise<number> {
  const existing = await db.targetMaps.where("name").equals(name).first();
  if (existing) return existing.id!;
  return (await db.targetMaps.add({ name, range, grid: buildGrid(range) })) as number;
}

export async function seedDefaults(): Promise<void> {
  const botCount = await db.bots.count();
  if (botCount > 0) return;

  const ol5  = await getOrCreateOrderList("Default Orders List 5", [
    "Move Forward 1", "Fire Master Weapon", "Turn Right", "Move Forward 1", "Turn Left",
  ]);
  const ol15 = await getOrCreateOrderList("Default Orders List 15", [
    "Activate Targeting Map", "If Any Enemies in Range ...", "Move toward located Enemy",
    "Fire Master Weapon", "Fire Seconday Weapon", "Turn Right", "Move Forward 2",
    "Turn Left", "Move Forward 2", "Fire Master Weapon",
    "If Your Armor is Below 300 ...", "Move Backward 1", "Turn Right", "Turn Right",
    "Move Forward 1",
  ]);
  const ol25 = await getOrCreateOrderList("Default Orders List 25", [
    "Activate Targeting Map", "If Any Enemies in Range ...", "Move toward located Enemy",
    "Fire All", "Fire Master Weapon", "Fire Seconday Weapon", "Turn Right",
    "Move Forward 1", "If Movement Blocked by Enemy ...", "Fire Master Weapon",
    "Turn Left", "Move Forward 2", "If Movement Blocked by Ally ...", "Angle Right",
    "Move Forward 1", "If Your Armor is Below 500 ...", "Fire Master Weapon",
    "If Your Armor is Below 300 ...", "Activate Self-Destruct", "If Your Armor is Below 100 ...",
    "Move Backward 2", "Turn Right", "Turn Right", "If Facing Off-Map ...", "Move Forward 3",
  ]);

  const tm1 = await getOrCreateTargetMap("Default Targeting Map Range 1", 1);
  const tm2 = await getOrCreateTargetMap("Default Targeting Map Range 2", 2);
  const tm3 = await getOrCreateTargetMap("Default Targeting Map Range 3", 3);

  await db.bots.bulkAdd([
    {
      name: "Default Bot Small",
      frame:           "Micro-bot = BF 10 slots, 10 ND, 130 weight, 100 cost.",
      engine:          "Gnat-Engine = BE 2 slots, 1000 PO, 100 weight, 300 cost.",
      computer:        "Dohmer-Computer = BC 1 slots, 5 CI, 0 weight, 50 cost.",
      armor:           "Paper-Plate = FA 5 slots, 50 AD, 200 weight, 100 cost.",
      sensor:          "Blind-Night = TS identifies Max 1 targets in 1 range, 10 PC, 1 slots, 10 weight, 50 cost.",
      weaponMaster:    "Rubber-Hammer = WM 10 WD, 1 WR, 1 slot, 100 PC, 100 weight, 300 cost.",
      weaponSecondary: "NONE = WS 0 WD, 0 WR, 0 slot, 0 PC, 0 weight, 0 cost.",
      weaponBomb:      "NONE = WB 0,0 WD, 0 slot, PC 0 PC, 0 weight, 0 cost.",
      botImage:        "Default Bot Image Small",
      targetMapId:     tm1,
      ordersListId:    ol5,
    },
    {
      name: "Default Bot Medium",
      frame:           "Adult-bot = BF 50 slots, 50 ND, 650 weight, 500 cost.",
      engine:          "Tiger-Engine = BE 10 slots, 5000 PO, 500 weight, 1500 cost.",
      computer:        "Newton-Computer = BC 1 slots, 25 CI, 0 weight, 250 cost.",
      armor:           "Aluminum-Plate = FA 25 slots, 250 AD, 600 weight, 500 cost.",
      sensor:          "Wary-Watchful = TS identifies 4 Max targets in 2 range, 50 PC, 2 slots, 50 weight, 250 cost.",
      weaponMaster:    "Laser-Cannon = WM 50 WD, 3 WR, 5 slots, 500 PC, 500 weight, 1500 cost.",
      weaponSecondary: "Stone-Slingshot = WS 25 WD, 2 WR, 5 slots, 250 PC, 250 weight, 1000 cost.",
      weaponBomb:      "NONE = WB 0,0 WD, 0 slot, PC 0 PC, 0 weight, 0 cost.",
      botImage:        "Default Bot Image Medium",
      targetMapId:     tm2,
      ordersListId:    ol15,
    },
    {
      name: "Default Bot Large",
      frame:           "Titan-bot = BF 90 slots, 90 ND, 1170 weight, 900 cost.",
      engine:          "Nova-Engine = BE 18 slots, 9000 PO, 900 weight, 2700 cost.",
      computer:        "Tesla-Computer = BC 1 slots, 45 CI, 0 weight, 450 cost.",
      armor:           "Starcore-Plate = FA 45 slots, 450 AD, 1000 weight, 900 cost.",
      sensor:          "Godly-Omnificence = TS identifies Max 5 targets in 3 range, 90 PC, 3 slots, 90 weight, 450 cost.",
      weaponMaster:    "Antimatter-Cannon = WM 90 WD, 5 WR, 9 slots, 900 PC, 900 weight, 2700 cost.",
      weaponSecondary: "Assassins-Rifle = WS 45 WD, 3 WR, 9 slots, 450 PC, 450 weight, 1800 cost.",
      weaponBomb:      "Nasty-Nuke = WB 450,250 WD, 9 slots, 0 PC, 450 weight, 1800 cost.",
      botImage:        "Default Bot Image Large",
      targetMapId:     tm3,
      ordersListId:    ol25,
    },
  ]);
}
