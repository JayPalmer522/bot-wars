import { db } from "./db";

const RAIDER_ORDERS = [
  "Activate Targeting Map",
  "If Any Enemies in Range ...",
  "Fire Master Weapon",
  "Move toward located Enemy",
  "Fire Seconday Weapon",
  "If Facing Off-Map ...",
  "Turn Right",
  "Move Forward 3",
  "Move Forward 3",
  "Turn Right",
  "Move Forward 2",
  "If Movement Blocked by Enemy ...",
  "Fire All",
  "Turn Right",
  "Move Forward 1",
  "If Movement Blocked by Ally ...",
  "Angle Left",
  "Move Forward 2",
  "If Your Armor is Below 300 ...",
  "Move Backward 2",
  "Turn Right",
  "Turn Right",
  "Move Forward 2",
  "Fire Master Weapon",
  "Fire Seconday Weapon",
];

const TROOPER_ORDERS = [
  "Activate Targeting Map",
  "If Any Enemies in Range ...",
  "Move toward located Enemy",
  "Fire All",
  "Fire Master Weapon",
  "Fire Seconday Weapon",
  "If Your Armor is Below 300 ...",
  "Move Backward 1",
  "Turn Right",
  "Turn Right",
  "Move Forward 1",
  "Turn Left",
  "Move Forward 2",
  "Fire Master Weapon",
  "If Facing Off-Map ...",
  "Turn Right",
  "Move Forward 2",
  "If Movement Blocked by Enemy ...",
  "Fire All",
  "Turn Left",
  "Move Forward 2",
  "If Movement Blocked by Ally ...",
  "Angle Right",
  "Move Forward 1",
  "Fire Master Weapon",
  "If Any Enemies in Range ...",
  "Fire All",
  "Move Forward 2",
  "Turn Right",
  "Move Forward 2",
  "Fire Master Weapon",
  "Fire Seconday Weapon",
  "If Your Armor is Below 300 ...",
  "Move Backward 1",
  "Turn Right",
  "Turn Right",
  "Move Forward 2",
  "Activate Targeting Map",
  "If Any Enemies in Range ...",
  "Move toward located Enemy",
  "Fire All",
  "Fire Master Weapon",
  "Fire Seconday Weapon",
  "Move Forward 1",
  "Turn Left",
];

const FORTRESS_ORDERS = [
  "Activate Targeting Map",
  "If Any Enemies in Range ...",
  "Fire All",
  "Fire Master Weapon",
  "Fire Seconday Weapon",
  "Move toward located Enemy",
  "If Facing Off-Map ...",
  "Turn Right",
  "Move Forward 1",
  "Fire Master Weapon",
  "Fire Seconday Weapon",
  "Fire All",
  "If Any Enemies in Range ...",
  "Fire All",
  "Move Forward 1",
  "Turn Right",
  "Fire Master Weapon",
  "If Facing Off-Map ...",
  "Turn Left",
  "Move Forward 1",
  "Fire All",
  "Fire Master Weapon",
  "Fire Seconday Weapon",
  "If Any Enemies in Range ...",
  "Fire All",
  "Move toward located Enemy",
  "Fire Master Weapon",
  "Fire Seconday Weapon",
  "Fire All",
  "Move Forward 1",
  "Turn Left",
  "Move Forward 1",
  "Fire Master Weapon",
  "Fire Seconday Weapon",
  "If Your Armor is Below 300 ...",
  "Activate Self-Destruct",
  "If Any Enemies in Range ...",
  "Fire All",
  "Fire Master Weapon",
  "Move Forward 1",
  "Turn Right",
  "Move Forward 1",
  "Fire All",
  "Fire Master Weapon",
  "Fire Seconday Weapon",
];

function emptyGrid(): string[][] {
  return Array.from({ length: 7 }, () => Array.from({ length: 7 }, () => ""));
}

export async function seedUserDefaults(userId: number): Promise<void> {
  const raiderId   = await db.orderLists.add({ userId, name: "Raider Orders",   commands: RAIDER_ORDERS });
  const trooperId  = await db.orderLists.add({ userId, name: "Trooper Orders",  commands: TROOPER_ORDERS });
  const fortressId = await db.orderLists.add({ userId, name: "Fortress Orders", commands: FORTRESS_ORDERS });

  const raiderMapId   = await db.targetMaps.add({ userId, name: "Raider Map",   range: 2, grid: emptyGrid() });
  const trooperMapId  = await db.targetMaps.add({ userId, name: "Trooper Map",  range: 3, grid: emptyGrid() });
  const fortressMapId = await db.targetMaps.add({ userId, name: "Fortress Map", range: 3, grid: emptyGrid() });

  const raiderId_n   = raiderId   as number;
  const trooperId_n  = trooperId  as number;
  const fortressId_n = fortressId as number;
  const raiderMapId_n   = raiderMapId   as number;
  const trooperMapId_n  = trooperMapId  as number;
  const fortressMapId_n = fortressMapId as number;

  // Light — Raider: Nova-Engine (move=3), Iron-Plate (200 AD), Adult-bot (40 slots)
  // Slots used: 18+1+20+2+5+4 = 50/40
  const lightId = await db.bots.add({
    userId,
    name: "Raider",
    frame:           "Adult-bot = BF 40 slots, 50 ND, 650 weight, 500 cost.",
    engine:          "Nova-Engine = BE 18 slots, 9000 PO, 900 weight, 2700 cost.",
    computer:        "Newton-Computer = BC 1 slots, 25 CI, 0 weight, 250 cost.",
    armor:           "Iron-Plate = FA 20 slots, 200 AD, 500 weight, 400 cost.",
    sensor:          "Wary-Watchful = TS identifies 4 Max targets in 2 range, 50 PC, 2 slots, 50 weight, 250 cost.",
    weaponMaster:    "Laser-Cannon = WM 50 WD, 3 WR, 5 slots, 500 PC, 500 weight, 1500 cost.",
    weaponSecondary: "Spiked-Mace = WS 20 WD, 1 WR, 4 slots, 200 PC, 200 weight, 800 cost.",
    weaponBomb:      "NONE = WB 0,0 WD, 0 slot, PC 0 PC, 0 weight, 0 cost.",
    botImage:        "SmallBot",
    ordersListId:    raiderId_n,
    targetMapId:     raiderMapId_n,
    slotsUsed:       "50/40",
    totalWeight:     "2800",
    totalGold:       "6400",
    totalPower:      "750",
    move:            "3",
  });

  // Medium — Trooper: Tiger-Engine (move=2), Uru-Plate (350 AD), Master-bot (45 slots)
  // Slots used: 10+1+35+3+7+4 = 60/45
  const medId = await db.bots.add({
    userId,
    name: "Trooper",
    frame:           "Master-bot = BF 45 slots, 60 ND, 780 weight, 600 cost.",
    engine:          "Tiger-Engine = BE 10 slots, 5000 PO, 500 weight, 1500 cost.",
    computer:        "Tesla-Computer = BC 1 slots, 45 CI, 0 weight, 450 cost.",
    armor:           "Uru-Plate = FA 35 slots, 350 AD, 800 weight, 700 cost.",
    sensor:          "Intense-Concentration = TS identifies Max 3 targets in 3 range, 80 PC, 3 slots, 80 weight, 400 cost.",
    weaponMaster:    "Mega-Missle = WM 70 WD, 4 WR, 7 slots, 700 PC, 700 weight, 2100 cost.",
    weaponSecondary: "Spiked-Mace = WS 20 WD, 1 WR, 4 slots, 200 PC, 200 weight, 800 cost.",
    weaponBomb:      "NONE = WB 0,0 WD, 0 slot, PC 0 PC, 0 weight, 0 cost.",
    botImage:        "MedBot",
    ordersListId:    trooperId_n,
    targetMapId:     trooperMapId_n,
    slotsUsed:       "60/45",
    totalWeight:     "3060",
    totalGold:       "6550",
    totalPower:      "980",
    move:            "2",
  });

  // Heavy — Fortress: Horse-Engine (move=1), Starcore-Plate (450 AD), Titan-bot (60 slots)
  // Slots used: 6+1+45+3+9+9 = 73/60
  const heavyId = await db.bots.add({
    userId,
    name: "Fortress",
    frame:           "Titan-bot = BF 60 slots, 90 ND, 1170 weight, 900 cost.",
    engine:          "Horse-Engine = BE 6 slots, 3000 PO, 300 weight, 900 cost.",
    computer:        "Tesla-Computer = BC 1 slots, 45 CI, 0 weight, 450 cost.",
    armor:           "Starcore-Plate = FA 45 slots, 450 AD, 1000 weight, 900 cost.",
    sensor:          "Godly-Omnificence = TS identifies Max 5 targets in 3 range, 90 PC, 3 slots, 90 weight, 450 cost.",
    weaponMaster:    "Antimatter-Cannon = WM 90 WD, 5 WR, 9 slots, 900 PC, 900 weight, 2700 cost.",
    weaponSecondary: "Assassins-Rifle = WS 45 WD, 3 WR, 9 slots, 450 PC, 450 weight, 1800 cost.",
    weaponBomb:      "NONE = WB 0,0 WD, 0 slot, PC 0 PC, 0 weight, 0 cost.",
    botImage:        "BigBot",
    ordersListId:    fortressId_n,
    targetMapId:     fortressMapId_n,
    slotsUsed:       "73/60",
    totalWeight:     "3910",
    totalGold:       "8100",
    totalPower:      "1440",
    move:            "1",
  });

  const lightId_n  = lightId  as number;
  const medId_n    = medId    as number;
  const heavyId_n  = heavyId  as number;

  // Armies: 20 of each bot type
  await db.armies.add({ userId, name: "Raider Army",   botIds: Array(20).fill(lightId_n) });
  await db.armies.add({ userId, name: "Trooper Army",  botIds: Array(20).fill(medId_n) });
  await db.armies.add({ userId, name: "Fortress Army", botIds: Array(20).fill(heavyId_n) });
}
