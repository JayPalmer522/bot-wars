import { db } from "./db";

export async function seedDefaults(): Promise<void> {
  await seedComponents();
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
