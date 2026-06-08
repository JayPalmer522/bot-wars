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
  // ── Bots (and their prerequisites) ──────────────────────────────────────────
  const botCount = await db.bots.count();
  if (botCount === 0) {
    await seedComponents();

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
      botImage:        "SmallBot",
      targetMapId:     tm1,
      ordersListId:    ol5,
      slotsUsed:       "24",
      totalWeight:     "550",
      totalGold:       "1000",
      totalPower:      "10",
      move:            "1",
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
      botImage:        "MedBot",
      targetMapId:     tm2,
      ordersListId:    ol15,
      slotsUsed:       "111",
      totalWeight:     "2950",
      totalGold:       "5000",
      totalPower:      "50",
      move:            "2",
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
      botImage:        "BigBot",
      targetMapId:     tm3,
      ordersListId:    ol25,
      slotsUsed:       "262",
      totalWeight:     "6740",
      totalGold:       "13950",
      totalPower:      "90",
      move:            "3",
    },
  ]);
  } // end botCount === 0

  // ── Armies ───────────────────────────────────────────────────────────────────
  const armyCount = await db.armies.count();
  if (armyCount === 0) {
    const smallBot  = await db.bots.where("name").equals("Default Bot Small").first();
    const medBot    = await db.bots.where("name").equals("Default Bot Medium").first();
    const largeBot  = await db.bots.where("name").equals("Default Bot Large").first();

    if (smallBot && medBot && largeBot) {
      await db.armies.bulkAdd([
        { name: "Default Army Small",  botIds: Array(20).fill(smallBot.id!) },
        { name: "Default Army Medium", botIds: Array(20).fill(medBot.id!) },
        { name: "Default Army Large",  botIds: Array(20).fill(largeBot.id!) },
      ]);
    }
  }
}

async function seedComponents(): Promise<void> {
  const frameCount = await db.botFrames.count();
  if (frameCount > 0) return;

  await db.botFrames.bulkAdd([
    { name: "Micro-bot", slots: 10, nd: 10, weight: 130, cost: 100 },
    { name: "Mini-bot", slots: 20, nd: 20, weight: 160, cost: 200 },
    { name: "Baby-bot", slots: 30, nd: 30, weight: 190, cost: 300 },
    { name: "Junior-bot", slots: 40, nd: 40, weight: 520, cost: 400 },
    { name: "Adult-bot", slots: 50, nd: 50, weight: 650, cost: 500 },
    { name: "Master-bot", slots: 60, nd: 60, weight: 780, cost: 600 },
    { name: "Monster-bot", slots: 70, nd: 70, weight: 910, cost: 700 },
    { name: "Giant-bot", slots: 80, nd: 80, weight: 1040, cost: 800 },
    { name: "Titan-bot", slots: 90, nd: 90, weight: 1170, cost: 900 },
  ]);

  await db.botEngines.bulkAdd([
    { name: "Gnat-Engine", slots: 2, po: 1000, weight: 100, cost: 300 },
    { name: "Mouse-Engine", slots: 4, po: 2000, weight: 200, cost: 600 },
    { name: "Horse-Engine", slots: 6, po: 3000, weight: 300, cost: 900 },
    { name: "Gorrila-Engine", slots: 8, po: 4000, weight: 400, cost: 1200 },
    { name: "Tiger-Engine", slots: 10, po: 5000, weight: 500, cost: 1500 },
    { name: "Elephant-Engine", slots: 12, po: 6000, weight: 600, cost: 1800 },
    { name: "Juggernaut-Engine", slots: 14, po: 7000, weight: 700, cost: 2100 },
    { name: "RedStar-Engine", slots: 16, po: 8000, weight: 800, cost: 2400 },
    { name: "Nova-Engine", slots: 18, po: 9000, weight: 900, cost: 2700 },
  ]);

  await db.botComputers.bulkAdd([
    { name: "Dohmer-Computer", slots: 1, ci: 5, weight: 0, cost: 50 },
    { name: "Bennedict-Computer", slots: 1, ci: 10, weight: 0, cost: 100 },
    { name: "Hale-Computer", slots: 1, ci: 15, weight: 0, cost: 150 },
    { name: "Jefferson-Computer", slots: 1, ci: 20, weight: 0, cost: 200 },
    { name: "Newton-Computer", slots: 1, ci: 25, weight: 0, cost: 250 },
    { name: "Hawking-Computer", slots: 1, ci: 30, weight: 0, cost: 300 },
    { name: "Aristotle-Computer", slots: 1, ci: 35, weight: 0, cost: 350 },
    { name: "Einstein-Computer", slots: 1, ci: 40, weight: 0, cost: 400 },
    { name: "Tesla-Computer", slots: 1, ci: 45, weight: 0, cost: 450 },
  ]);

  await db.botArmors.bulkAdd([
    { name: "Paper-Plate", slots: 5, ad: 50, weight: 200, cost: 100 },
    { name: "Tin-Plate", slots: 10, ad: 100, weight: 300, cost: 200 },
    { name: "Copper-Plate", slots: 15, ad: 150, weight: 400, cost: 300 },
    { name: "Iron-Plate", slots: 20, ad: 200, weight: 500, cost: 400 },
    { name: "Aluminum-Plate", slots: 25, ad: 250, weight: 600, cost: 500 },
    { name: "Tungston-Plate", slots: 30, ad: 300, weight: 700, cost: 600 },
    { name: "Uru-Plate", slots: 35, ad: 350, weight: 800, cost: 700 },
    { name: "Adamantium-Plate", slots: 40, ad: 400, weight: 900, cost: 800 },
    { name: "Starcore-Plate", slots: 45, ad: 450, weight: 1000, cost: 900 },
  ]);

  await db.botSensors.bulkAdd([
    { name: "Blind-Night", targets: 1, range: 1, pc: 10, slots: 1, weight: 10, cost: 50 },
    { name: "Barely-Awake", targets: 2, range: 1, pc: 20, slots: 1, weight: 20, cost: 100 },
    { name: "Abstract_Thoughts", targets: 3, range: 1, pc: 30, slots: 1, weight: 30, cost: 150 },
    { name: "General-Awareness", targets: 2, range: 2, pc: 40, slots: 2, weight: 40, cost: 200 },
    { name: "Wary-Watchful", targets: 4, range: 2, pc: 50, slots: 2, weight: 50, cost: 250 },
    { name: "Total-Awareness", targets: 1, range: 3, pc: 60, slots: 2, weight: 60, cost: 300 },
    { name: "Deep-Concentration", targets: 2, range: 3, pc: 70, slots: 3, weight: 70, cost: 350 },
    { name: "Intense-Concentration", targets: 3, range: 3, pc: 80, slots: 3, weight: 80, cost: 400 },
    { name: "Godly-Omnificence", targets: 5, range: 3, pc: 90, slots: 3, weight: 90, cost: 450 },
  ]);

  await db.botMasters.bulkAdd([
    { name: "Rubber-Hammer", wd: 10, wr: 1, slots: 1, pc: 100, weight: 100, cost: 300 },
    { name: "Steel-Spike", wd: 20, wr: 1, slots: 2, pc: 200, weight: 200, cost: 600 },
    { name: "Steel-Arrows", wd: 30, wr: 2, slots: 3, pc: 300, weight: 300, cost: 900 },
    { name: "Flaming-Porjectiles", wd: 40, wr: 2, slots: 4, pc: 400, weight: 400, cost: 1200 },
    { name: "Laser-Cannon", wd: 50, wr: 3, slots: 5, pc: 500, weight: 500, cost: 1500 },
    { name: "Phaser-Cannon", wd: 60, wr: 3, slots: 6, pc: 600, weight: 600, cost: 1800 },
    { name: "Mega-Missle", wd: 70, wr: 4, slots: 7, pc: 700, weight: 700, cost: 2100 },
    { name: "Ruination-Rocket", wd: 80, wr: 4, slots: 8, pc: 800, weight: 800, cost: 2400 },
    { name: "Antimatter-Cannon", wd: 90, wr: 5, slots: 9, pc: 900, weight: 900, cost: 2700 },
  ]);

  await db.botSecondaries.bulkAdd([
    { name: "NONE", wd: 0, wr: 0, slots: 0, pc: 0, weight: 0, cost: 0 },
    { name: "Rolled-Newspaper", wd: 50, wr: 1, slots: 1, pc: 50, weight: 50, cost: 200 },
    { name: "Blunt-Sword", wd: 10, wr: 1, slots: 2, pc: 100, weight: 100, cost: 400 },
    { name: "Curved-Crowbar", wd: 15, wr: 1, slots: 3, pc: 150, weight: 150, cost: 600 },
    { name: "Spiked-Mace", wd: 20, wr: 1, slots: 4, pc: 200, weight: 200, cost: 800 },
    { name: "Stone-Slingshot", wd: 25, wr: 2, slots: 5, pc: 250, weight: 250, cost: 1000 },
    { name: "Blunderbuss-Pistol", wd: 30, wr: 2, slots: 6, pc: 300, weight: 300, cost: 1200 },
    { name: "Sawed-Shotgun", wd: 35, wr: 2, slots: 7, pc: 350, weight: 350, cost: 1400 },
    { name: "Machine-Gun", wd: 40, wr: 3, slots: 8, pc: 400, weight: 400, cost: 1600 },
    { name: "Assassins-Rifle", wd: 45, wr: 3, slots: 9, pc: 450, weight: 450, cost: 1800 },
  ]);

  await db.botBombs.bulkAdd([
    { name: "NONE", wd: 0, slots: 0, pc: 0, weight: 0, cost: 0 },
    { name: "Sparking-Firecracker", wd: 50, slots: 1, pc: 0, weight: 50, cost: 500 },
    { name: "Cherry-Bomb", wd: 100, slots: 2, pc: 0, weight: 100, cost: 600 },
    { name: "Concussion-Grenade", wd: 150, slots: 3, pc: 0, weight: 150, cost: 700 },
    { name: "TNT-Terror", wd: 200, slots: 4, pc: 0, weight: 200, cost: 800 },
    { name: "Deadly-Dynamite", wd: 250, slots: 5, pc: 0, weight: 250, cost: 1000 },
    { name: "Bursting-Blaster", wd: 300, slots: 6, pc: 0, weight: 300, cost: 1200 },
    { name: "Basement-Pounder", wd: 350, slots: 7, pc: 0, weight: 350, cost: 1400 },
    { name: "Mushroom-Cloud", wd: 400, slots: 8, pc: 0, weight: 400, cost: 1600 },
    { name: "Nasty-Nuke", wd: 450, slots: 9, pc: 0, weight: 450, cost: 1800 },
  ]);
}

const VALID_BOT_IMAGES = new Set([
  "SmallBot", "SmallMedBot", "SmallShootingBomb",
  "MedBot", "MedBigBot",
  "BigBot", "LargeBomb", "LargeShootingBomb",
]);

const LEGACY_IMAGE_MAP: Record<string, string> = {
  "Default Bot Image Small":  "SmallBot",
  "Default Bot Image Medium": "MedBot",
  "Default Bot Image Large":  "BigBot",
};

export async function migrateExistingData(): Promise<void> {
  const bots = await db.bots.toArray();
  for (const bot of bots) {
    if (!VALID_BOT_IMAGES.has(bot.botImage)) {
      const fixed = LEGACY_IMAGE_MAP[bot.botImage] ?? "SmallBot";
      await db.bots.update(bot.id!, { botImage: fixed });
    }
  }
}
