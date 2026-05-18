
import React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function InstructionsScreen() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        bgcolor: "#111", // Dark background
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 4,
      }}
    >
      {/* Top Label */}
      <Typography
        variant="h3"
        sx={{
          fontFamily: "Ebrima",
          fontWeight: "bold",
          fontSize: "30pt",
          color: "white",
          mb: 4,
          bgcolor: "transparent",
        }}
      >
        How to Play BOT WARS!
      </Typography>

      {/* Scrollable Instructions Box */}
      <Paper
        elevation={3}
        sx={{
          width: "80%",
          height: "60%",
          overflowY: "scroll",
          p: 3,
          bgcolor: "white",
          border: "2px solid gray",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Courier New",
            fontSize: "20pt",
			fontWeight: "bold",
            whiteSpace: "pre-wrap",
            color: "black",
          }}
        >
{`BASIC INSTRUCTIONS: 

BOT WARS is a tactical combat simulation game where you design Bots, assemble Armies, create Orders Lists, build Targeting Maps, and send your forces into battle.

=== BOTS ===
Bots are the fundamental units of your army. Each Bot has attributes such as:
• Engine
• Armor
• Weapons
• Bombs
• Targeting Sensors

Use the Bot Workshop to design and save your Bots.

=== ARMIES ===
Armies are collections of 20 Bots. You choose which Bots to include, all the same or all different designs. Armies represent your entire fighting force in combat.

Use the Army Workshop to build and manage your armies.

=== ORDERS LISTS ===
Orders Lists define the sequence of actions individual Bots in your army will attempt during their combat. Examples include:
• Move Forward 3
• Activate Targeting Sensor
• Fire Master Weapon
• Fire Secondary Weapon
• Turn Right
• Move Backward 2
• Activate Self-Destruct

Use the Orders List Workshop to program your Bots, initiating all their actions from a list of commands.

=== TARGETING MAPS ===
Targeting Maps define how your army prioritizes its targets. You can assign ranges, identify allied vs. enemy Bots, and set targeting priorities.

Use the Targeting Map Workshop to build these maps.

=== COMBAT ===
Combat is an automated turn-based simulation. The Bots in your Army, with their components, Orders Lists, and Targeting Maps, which work together to determine how your Bots behave, march out into battle to pit your Army design against the design of an opponent.

The simulation resolves quickly and automatically:
• Movement
• Targeting
• Attacks
• Damage
• Victory Conditions

=== QUICK CREDITS ===
Game concept and design by Jay Palmer, author - JayPalmerBooks.com.

DETAILED INSTRUCTIONS: 

Bot Component Features, Abbreviations, and Advice for Playing:

• 0001. Slots are the spaces available on the Bot Frame to load other components onto this Bot. Not all slots need to be filled, but your components can't exceed this number of slots. NOTE: The total slots required for the best/biggest of all components is 211, but the total slots of the biggest Bot Frame is 90, so it's wise to specialize every Bot to a specific purpose, as no Bot can be the best at everything. 

• 0002. 'ND' is an abbreviation for the Natural Defense of your frame, which will add to the value of your selected armor to total the amount of damage that your Bot can withstand before it is destroyed and removed from the game.
VERSION 2: In Version 2, once 90% of all armor is destroyed, components will be exposed, and each damage suffered by the Bot will remove a random component from the Bot for the rest of the game. 

• 0003. Weight is the total weight of that Bot's frame and its components. Weight can be set as a limitation for some games, and if that Playing Condition is selected, then only Armies at or under that value will be available for selection. Weight of all components are combined and divided into the Bot's Power to derive the Bot's maximum speed (some power must be left to use weapons, or your Movement Max could be zero!). Bots too heavy for its Power level are reduced in speed.

• 0004. Cost is the amount of gold required to purchase that component. Costs can be a limitation for some games, and if that Playing Condition is selected, then only armies at or below cost for all its Bots will be available for selection. 
VERSION 2: In Version 2, in Eternal War Mode, all Armies start with a limited cost, and Victorious Armies will earn half their gold cost for each victory over another player, while Losing Armies will receive far less. For your next combat, you can spend up to your maximum gold in building your army. Eternal War Mode is the highest of all forms of Bot combat, where new opponents can only be added to a combat group by agreement of all other players.

• 0005. 'PO' is an abbreviation for Power Output. PO is a value assigned only to engines, and must be high enough that it does not subtract from the maximum movement allowance of an overly-heavy Bot.

• 0006. 'CI' is an abbreviation for Command Instruction. This is how many total commands a Bot may execute in its Order List. The smallest total is 5 commands, and the largest is 45. These commands do not include conditionals, which only count if the conditional was executed. For example, if the command is "Fire all.", that is one command, and it fires at whatever Bot exists in the direction that Bot is facing. If your 2 sequential commands are "If movement blocked by enemy ..." and "Fire All", but your progress to the adjacent space is not blocked by an enemy, then that is calculated as zero commands executed. For this reason, you can have as many commands in your Orders List as you want, but once your Bot has completed its maximum number of commands, all further commands in its Orders List will be ignored, and the Orders List will restart at the top-most command when the Bot gets their next turn. 

• 0007. 'PC' is Power Cost. When a Bot is using its Targeting Computer or firing a weapon, its PO (Power Output) is measured. If the Bot has a low ratio of PO compared to weight, then it must have enough power remaining to continue scanning, or to fire that weapon, or that command will not function and all further commands will be ignored for the rest of that turn. 
NOTE: Each movement has a PC of 2000!

• 0008. 'WD' is an abbreviation for Weapon Damage. This is the amount of damage that a Bot can suffer from each combat. If the WD (Weapon Damage) exceeds the total of its FA (Frame Armor) and NA (Natural Armor), then that Bot is destroyed and removed from the game.

• 0009. 'WR' is an abbreviation for Weapon Range. This is the maximum spaces on the Game Map that any weapon can reach and still do damage. 

• 0010. 'WB' is an abbreviation for Weapon Bomb. Weapon Bombs strike all Bots within a range of 2, both Allied Bots and Enemy Bots. WBs are heavy, expensive, and the Bot containing them is instantly destroyed when it detonates. Weapon Bombs are not detonated when the Bot is destroyed by allied or enemy damage. 

• 0011. 'BF' stands for Bot Frame, so you can identify this selection when you install it.

• 0012. 'BE' stands for Bot Engine, so you can identify this selection when you install it.

• 0013. 'BC' stands for Bot Computer, so you can identify this selection when you install it.

• 0014. 'FA' stands for Frame Armor, so you can identify this selection when you install it.

• 0015. 'WM' stands for Weapon Master, so you can identify this selection when you install it.

• 0016. 'WS' stands for Weapon Secondary, so you can identify this selection when you install it.

• 0017. 'WB' stands for Weapon Bomb, so you can identify this selection when you install it.

• 0018. 'TM' stands for Targeting Map, so you can identify this selection when you install it. 

• 0019. 'OL' stands for Orders List, so you can identify this selection when you install it. 

• 0020. 'BI' stands for Bot Frame, so you can identify this selection when you install it. 

• 0021. 'BI' stands for Bot Image, so you can identify this selection when you install it. In this version, these are simple placeholder graphic files, just to make sure it works. VERSION 2: In Version 2, these simple images will be updated.  

• 0022. 'Name of Bot' is a required field. If you save a Bot with the same name, you overwrite the old version. It is recommended that you devise a Bot Naming System which identifies each Bot to you. 

• 0023. 'Name of Army' is a required field. If you save an Army with the same name, you overwrite the old version. Armies are collections of exactly 20 Bots, no more, no less.

• 0024. 'Name of Orders List' is a required field. If you save a Bot with the same name, you overwrite the old version. All actions of your Bots are controlled by commands in that Bots Orders List. Orders Lists can't be changed in the middle of combat.

• 0025. 'Name of Targeting Map' is a required field. If you save a Bot with the same name, you overwrite the old version. When created, a Targeting Map is for a Bot facing North. In the game, the Targeting Map will rotate to face the direction that the Bot is facing.

• 0026. 'Select Bot Frame' determines the overall size of your Bot. The smallest and the largest are:
Micro-bot = BF 10 slots, 10 ND, 130 weight, 100 cost.
Titan-bot = BF 90 slots, 90 ND, 1170 weight, 900 cost. 

• 0027. 'Select Bot Engine' defines how much PO (Power Output) your Bot's engine can generate. Too little PO may reduce movement and limit Bot targeting scanners and weapons. The smallest and the largest are:
Gnat-Engine = BE 2 slots, 1000 PO, 100 weight, 300 cost. 
Nova-Engine = BE 18 slots, 9000 PO, 900 weight, 2700 cost. 

• 0028. 'Select Bot Computer' determines the maximum number of commands in the Orders List that the Bot may execute. The smallest and the largest are:
Dohmer-Computer = BC 1 slots, 5 CI, 0 weight, 50 cost. 
Tesla-Computer = BC 1 slots, 45 CI, 0 weight, 450 cost. 

• 0029. 'Select Frame Armor' is the extra armor added to the natural armor of the frame. The smallest and the largest are:
Paper-Plate = FA 5 slots, 50 AD, 200 weight, 100 cost. 
Starcore-Plate = FA 45 slots, 450 AD, 1000 weight, 900 cost. 

• 0030. 'Targeting Sensor' gives your Bot the ability to identify targets according to their selected Targeting Map, including the range and the maximum number of Bots that can be identified by that Bot's Targeting Sensor. The maximum range is 3 and the most targets that can be identified at any time is 5. This is important, for if your Targeting Map looks behind your Bot first, then it is most likely to identify allies before enemies, and after the maximum number of Bots are identified, its Targeting Sensor ceases to look for more Bots. If no enemies are identified, then no weapons will be fired. If your command is 'Fire All', then both weapons will fire simultaneously at the first identified enemy target. If you fire each weapon individually, then the first identified enemy target will be shot by your Master Weapon, and your second identified enemy target will be shot by your Secondary Weapon. The smallest and the largest are: 
Blind-Night = TS identifies Max 1 targets in 1 range, 10 PC, 1 slots, 10 weight, 50 cost.
Godly-Omnificence = TS identifies Max 5 targets in 3 range, 90 PC, 3 slots, 90 weight, 450 cost.

• 0031. 'Select Weapon Master' is the primary required weapon for any Bot. The smallest and the largest are:
Rubber-Hammer = WM 10 WD, 1 WR, 1 slot, 100 PC, 100 weight, 300 cost. 
Antimatter-Cannon = WM 90 WD, 5 WR, 9 slots, 900 PC, 900 weight, 2700 cost. 

• 0032. 'Select Weapon Secondary' is the second not-required weapon for any Bot. The smallest and the largest are:
Rolled-Newspaper = WS 50 WD, 1 WR, 1 slot, 50 PC, 50 weight, 200 cost. 
Assassins-Rifle = WS 45 WD, 3 WR, 9 slots, 450 PC, 450 weight, 1800 cost. 

• 0033. 'Select Weapon Bomb' is the optional self-destruct weapon for any Bot. Any Bot which self-destructs is removed from the game. The smallest and the largest are:
Sparking-Firecracker = WB 50,25 WD, 1 slot, PC 0 PC, 50 weight, 500 cost. 
Nasty-Nuke = WB 450,250 WD, 9 slots, 0 PC, 450 weight, 1800 cost. 

• 0034. 'Select Targeting Map' contains selections of Default Targeting Maps. Default Targeting Maps are available for all ranges, if preferred. Available Targeting Maps are tested to ensure that they do not exceed the limits of the selected Targeting Sensor. When activated, Targeting Sensors allow Bots to identify the locations of up to 5 Bots, the Game Map Location of each, and if they are an ally or an enemy Bot.

• 0035. At the end of each Bots turn, all damage is assessed. 

• 0036. The Master Weapon and the Secondary Weapon can only fire once per turn. Orders Lists where any weapon fires twice will be invalidated, unable to be saved.

• 0037. If, at any time, only one player's Bots exist on the Game Map, that player wins. Stats are created based on the degree of success (How many allied Bots remain and number of turns it took to win.). 

• 0038. If all Bots are destroyed on the same turn, such as when a bomb blows up the last of all the Bots, or 50 turns occur with no recorded damage, then both players lose the game. 

• 0039. Starting placements for all Bots are determined randomly and change for each combat. Bots entirely surrounded by allies and the edge of the map can't move, but they can shoot or explode.  

• 0040. The order in which Bots take their turns is chosen randomly at the start, alternating from one army to the other, and then cycles through the complete Bot list until victory conditions are met. 

• 0041. VERSION 2: In Version 2, all players will be limited to the Bots, Armies, Targeting Maps, and Orders Lists that they created (and the default versions available). In the current game, all variations saved are available to everyone. 

• 0042. VERSION 2: In Version 2, Players will be able to post open challenges on the Web, connect to other players online, text to those players, and form groups of players to compete in Eternal War Mode.

• 0043. VERSION 2: In Version 2, Players will be able to download their Bots, Armies, Targeting Maps, and Orders Lists to text files. At any time, these files may be uploaded to their respective pages, but they won't be saved into proper records until they pass a verification test to guard against improper modification. Until then, this game can only offer HotSeat gaming.

• 0044. Just FYI, all combat calculations for BOT-WARS is done in seconds, and all combat results are uploaded before the Combat Animation begins. Closing the browser before you see who wins (during the animation) will not change the recorded results.

• 0045. Combat Animation has Speed buttons which control the delay-time in between animated actions, so even in the midst of combat, you can control the speed of the animation showing the combat. 

• 0046. This is not a rule, but a recommendation: One of the most powerful commands is "If facing Off-Map ...". A Bot that runs into the edge of the map without this command will be trapped there. Adding "If facing Off-Map ...", followed by a direction to turn, will help protect you from games that no one wins. Unless your Bot is facing off the map, this won't count against your maximum commands count.

• 0047. Bots may deliver an extra-damage bonus if the Bot is directly facing its target. This applies to both allied and unidentified enemy Bots. However, Bots may deliver lesser-damage if their attack grazes other Bots before it hits its target. Clean, close shots are always best. 

• 0048. Targeting Maps take a snapshot of nearby Bots when they are activated. If you activate your targeting scanner, and then move, it will retain the locations of the Bots around your previous location. You may want to activate your Targeting Scanner a second time before you shoot at nearby targets or self-destruct.

• • • • • • • • • • • • • • • • • • • • • • • • 

IMPORTANT!

Once again, this game was created using free Copilot AI, in Javascript, with JSON records, by Jay Palmer, who lives just outside of Seattle, WA, USA. I didn't put any viruses or anything bad in it, but legally I have to say: PLAY AT YOUR OWN RISK. The game designer (me) assumes no resposibility or liability to anyone for anything. 

This game is offered for free use by any player. If anyone attempts to charge you a fee for playing this game, then they have stolen my code, and you shouldn't trust them. 

PAYMENT: 

If you enjoy this game, I don't ask for any payment or charity. 
(If you have a friend who can't afford food, please help them first!) 
However, if you're honorable and of a generous temperment, I am an author of many novels, and I'd be honored if you'd visit my author website: JayPalmerBooks.com. I write Historical Fiction, Fantasy, Science Fiction, Superhero, Horror, Steampunk, Paranormal Romance, and Mystery, and have something for every reading level, from First Chapter Books for Kids to Adults Only (There's an 'Age Chart' on my website!). If you find something that you like, for yourself, for a friend, or for a local school or library, I'd consider it a blessing if you bought a paperback, ebook, or audiobook. If you read one of my books and post a review, I'll be eternally grateful!

Thank you, and I hope you enjoy playing my game: BOT-WARS!
Jay Palmer 
JayPalmerBooks.com 
`}
        </Typography>
      </Paper>

      {/* Bottom Buttons */}
      <Box
        sx={{
          position: "absolute",
          bottom: 30,
          width: "60%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={buttonStyle}
        >
          Login
        </Button>

        <Button
          variant="contained"
          onClick={() => navigate("/navigation")}
          sx={buttonStyle}
        >
          Build Bots and Armies
        </Button>
      </Box>
    </Box>
  );
}

const buttonStyle = {
  bgcolor: "darkblue",
  border: "2px solid gray",
  fontFamily: "Courier New",
  fontSize: "14pt",
  fontWeight: "bold",
  color: "white",
  width: "45%",
  "&:hover": {
    bgcolor: "#001a66",
  },
};

