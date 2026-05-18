
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  FormControl,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function BotWorkshopScreen() {
  const navigate = useNavigate();

  // Name of Bot
  const [botName, setBotName] = useState("");

  // Dropdown states
  const [frame, setFrame] = useState("Micro-bot = BF 10 slots, 10 ND, 130 weight, 100 cost.");
  const [engine, setEngine] = useState("Gnat-Engine = BE 2 slots, 1000 PO, 100 weight, 300 cost.");
  const [computer, setComputer] = useState("Dohmer-Computer = BC 1 slots, 5 CI, 0 weight, 50 cost.");
  const [armor, setArmor] = useState("Paper-Plate = FA 5 slots, 50 AD, 200 weight, 100 cost.");
  const [sensor, setSensor] = useState("Blind-Night = TS identifies Max 1 targets in 1 range, 10 PC, 1 slots, 10 weight, 50 cost.");
  const [weaponMaster, setWeaponMaster] = useState("Rubber-Hammer = WM 10 WD, 1 WR, 1 slot, 100 PC, 100 weight, 300 cost.");
  const [weaponSecondary, setWeaponSecondary] = useState("NONE = WS 0 WD, 0 WR, 0 slot, 0 PC, 0 weight, 0 cost.");
  const [weaponBomb, setWeaponBomb] = useState("NONE = WB 0,0 WD, 0 slot, PC 0 PC, 0 weight, 0 cost.");
  const [targetingMap, setTargetingMap] = useState("Default Targeting Map Range 1");
  const [ordersList, setOrdersList] = useState("Default Orders List 5");
  const [botImage, setBotImage] = useState("Default Bot Image Small");

  // Placeholder validation routine
  function VERIFY_BOT_CHECK() {
    return "Bot Valid";
  }

  function handleValidate() {
    alert(VERIFY_BOT_CHECK());
  }

  function handleSave() {
    const result = VERIFY_BOT_CHECK();
    if (result === "Bot Valid" || !result) {
      alert("Bot Saved!");
    } else {
      alert("This Bot cannot be Saved.");
    }
  }

  // Helper to render dropdowns
  const renderDropdown = (label, value, setValue, options) => (
    <FormControl
      fullWidth
      sx={{
        mb: 4,
        // Ensure select text is left-justified
        textAlign: "left",
        // Style the select display area
        "& .MuiSelect-select": {
          bgcolor: "white",
          fontFamily: "Courier New",
          fontSize: "12pt",
          // reduce height by ~50% (adjust as needed)
          height: "24px",
          paddingTop: 0,
          paddingBottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          color: "black",
        },
        // If an outlined/input root exists, constrain its height as well
        "& .MuiOutlinedInput-root": {
          height: "24px",
        },
      }}
    >
      <Typography sx={{ fontFamily: "Courier New", color: "white", mb: "4px", fontSize: "12pt" }}>
        {label}
      </Typography>
      <Select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: "white",
              color: "black",
            },
          },
        }}
      >
        {options.map((opt) => (
          <MenuItem
            key={opt}
            value={opt}
            sx={{
              fontFamily: "Courier New",
              color: "black",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            {opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        bgcolor: "#111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 4,
        pb: 4,
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
        }}
      >
        BOT WORKSHOP
      </Typography>

      {/* Name of Bot */}
      <Box sx={{ width: "40%", mb: 4 }}>
        <FormControl fullWidth sx={{ mb: 4 }}>
          <Typography sx={{ fontFamily: "Courier New", color: "white", mb: "4px", fontSize: "12pt" }}>
            Name of Bot:
          </Typography>
          <TextField
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            placeholder={"e.g., Default Bot Small, Default Bot Medium, Default Bot Large"}
            variant="outlined"
            fullWidth
            sx={{
              bgcolor: "white",
              "& .MuiOutlinedInput-root": {
                height: "24px",
              },
              "& .MuiInputBase-input": {
                fontFamily: "Courier New",
                fontSize: "12pt",
                color: "black",
                paddingTop: 0,
                paddingBottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              },
            }}
          />
        </FormControl>
      </Box>

      {/* Two Columns of 11 Dropdowns */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          width: "100%",
        }}
      >
        {/* Column 1 */}
        <Box sx={{ width: "100%" }}>
          {renderDropdown("Select Bot Frame:", frame, setFrame, [
            "Micro-bot = BF 10 slots, 10 ND, 130 weight, 100 cost.",
            "Mini-bot = BF 20 slots, 20 ND, 160 weight, 200 cost.",
            "Baby-bot = BF 30 slots, 30 ND, 190 weight, 300 cost.",
            "Junior-bot = BF 40 slots, 40 ND, 520 weight, 400 cost.",
            "Adult-bot = BF 50 slots, 50 ND, 650 weight, 500 cost.",
            "Master-bot = BF 60 slots, 60 ND, 780 weight, 600 cost.",
            "Monster-bot = BF 70 slots, 70 ND, 910 weight, 700 cost.",
            "Giant-bot = BF 80 slots, 80 ND, 1040 weight, 800 cost.",
            "Titan-bot = BF 90 slots, 90 ND, 1170 weight, 900 cost.",
          ])}

          {renderDropdown("Select Bot Engine:", engine, setEngine, [
            "Gnat-Engine = BE 2 slots, 1000 PO, 100 weight, 300 cost.",
            "Mouse-Engine = BE 4 slots, 2000 PO, 200 weight, 600 cost.",
            "Horse-Engine = BE 6 slots, 3000 PO, 300 weight, 900 cost.",
            "Gorrila-Engine = BE 8 slots, 4000 PO, 400 weight, 1200 cost.",
            "Tiger-Engine = BE 10 slots, 5000 PO, 500 weight, 1500 cost.",
            "Elephant-Engine = BE 12 slots, 6000 PO, 600 weight, 1800 cost.",
            "Juggernaut-Engine = BE 14 slots, 7000 PO, 700 weight, 2100 cost.",
            "RedStar-Engine = BE 16 slots, 8000 PO, 800 weight, 2400 cost.",
            "Nova-Engine = BE 18 slots, 9000 PO, 900 weight, 2700 cost.",
          ])}

          {renderDropdown("Select Bot Computer:", computer, setComputer, [
            "Dohmer-Computer = BC 1 slots, 5 CI, 0 weight, 50 cost.",
            "Bennedict-Computer = BC 1 slots, 10 CI, 0 weight, 100 cost.",
            "Hale-Computer = BC 1 slots, 15 CI, 0 weight, 150 cost.",
            "Jefferson-Computer = BC 1 slots, 20 CI, 0 weight, 200 cost.",
            "Newton-Computer = BC 1 slots, 25 CI, 0 weight, 250 cost.",
            "Hawking-Computer = BC 1 slots, 30 CI, 0 weight, 300 cost.",
            "Aristotle-Computer = BC 1 slots, 35 CI, 0 weight, 350 cost.",
            "Einstein-Computer = BC 1 slots, 40 CI, 0 weight, 400 cost.",
            "Tesla-Computer = BC 1 slots, 45 CI, 0 weight, 450 cost.",
          ])}

          {renderDropdown("Select Frame Armor:", armor, setArmor, [
            "Paper-Plate = FA 5 slots, 50 AD, 200 weight, 100 cost.",
            "Tin-Plate = FA 10 slots, 100 AD, 300 weight, 200 cost.",
            "Copper-Plate = FA 15 slots, 150 AD, 400 weight, 300 cost.",
            "Iron-Plate = FA 20 slots, 200 AD, 500 weight, 400 cost.",
            "Aluminum-Plate = FA 25 slots, 250 AD, 600 weight, 500 cost.",
            "Tungston-Plate = FA 30 slots, 300 AD, 700 weight, 600 cost.",
            "Uru-Plate = FA 35 slots, 350 AD, 800 weight, 700 cost.",
            "Adamantium-Plate = FA 40 slots, 400 AD, 900 weight, 800 cost.",
            "Starcore-Plate = FA 45 slots, 450 AD, 1000 weight, 900 cost.",
          ])}

          {renderDropdown("Select Targeting Sensor:", sensor, setSensor, [
            "Blind-Night = TS identifies Max 1 targets in 1 range, 10 PC, 1 slots, 10 weight, 50 cost.",
            "Barely-Awake = TS identifies Max 2 targets in 1 range, 20 PC, 1 slots, 20 weight, 100 cost.",
            "Abstract_Thoughts = TS identifies Max 3 targets in 1 range, 30 PC, 1 slots, 30 weight, 150 cost.",
            "General-Awareness = TS identifies Max 2 targets in 2 range, 40 PC, 2 slots, 40 weight, 200 cost.",
            "Wary-Watchful = TS identifies 4 Max targets in 2 range, 50 PC, 2 slots, 50 weight, 250 cost.",
            "Total-Awareness = TS identifies Max 1 targets in 3 range, 60 PC, 2 slots, 60 weight, 300 cost.",
            "Deep-Concentration = TS identifies Max 2 targets in 3 range, 70 PC, 3 slots, 70 weight, 350 cost.",
            "Intense-Concentration = TS identifies Max 3 targets in 3 range, 80 PC, 3 slots, 80 weight, 400 cost.",
            "Godly-Omnificence = TS identifies Max 5 targets in 3 range, 90 PC, 3 slots, 90 weight, 450 cost.",
          ])}
        </Box>

        {/* Column 2 */}
        <Box sx={{ width: "100%" }}>
          {renderDropdown("Select Weapon Master:", weaponMaster, setWeaponMaster, [
            "Rubber-Hammer = WM 10 WD, 1 WR, 1 slot, 100 PC, 100 weight, 300 cost.",
            "Steel-Spike = WM 20 WD, 1 WR, 2 slots, 200 PC, 200 weight, 600 cost.",
            "Steel-Arrows = WM 30 WD, 2 WR, 3 slots, 300 PC, 300 weight, 900 cost.",
            "Flaming-Porjectiles = WM 40 WD, 2 WR, 4 slots, 400 PC, 400 weight, 1200 cost.",
            "Laser-Cannon = WM 50 WD, 3 WR, 5 slots, 500 PC, 500 weight, 1500 cost.",
            "Phaser-Cannon = WM 60 WD, 3 WR, 6 slots, 600 PC, 600 weight, 1800 cost.",
            "Mega-Missle = WM 70 WD, 4 WR, 7 slots, 700 PC, 700 weight, 2100 cost.",
            "Ruination-Rocket = WM 80 WD, 4 WR, 8 slots, 800 PC, 800 weight, 2400 cost.",
            "Antimatter-Cannon = WM 90 WD, 5 WR, 9 slots, 900 PC, 900 weight, 2700 cost.",
          ])}

          {renderDropdown("Select Weapon Secondary:", weaponSecondary, setWeaponSecondary, [
            "NONE = WS 0 WD, 0 WR, 0 slot, 0 PC, 0 weight, 0 cost.",
            "Rolled-Newspaper = WS 50 WD, 1 WR, 1 slot, 50 PC, 50 weight, 200 cost.",
            "Blunt-Sword = WS 10 WD, 1 WR, 2 slots, 100 PC, 100 weight, 400 cost.",
            "Curved-Crowbar = WS 15 WD, 1 WR, 3 slots, 150 PC, 150 weight, 600 cost.",
            "Spiked-Mace = WS 20 WD, 1 WR, 4 slots, 200 PC, 200 weight, 800 cost.",
            "Stone-Slingshot = WS 25 WD, 2 WR, 5 slots, 250 PC, 250 weight, 1000 cost.",
            "Blunderbuss-Pistol = WS 30 WD, 2 WR, 6 slots, 300 PC, 300 weight, 1200 cost.",
            "Sawed-Shotgun = WS 35 WD, 2 WR, 7 slots, 350 PC, 350 weight, 1400 cost.",
            "Machine-Gun = WS 40 WD, 3 WR, 8 slots, 400 PC, 400 weight, 1600 cost.",
            "Assassins-Rifle = WS 45 WD, 3 WR, 9 slots, 450 PC, 450 weight, 1800 cost.",
          ])}

          {renderDropdown("Select Weapon Bomb:", weaponBomb, setWeaponBomb, [
            "NONE = WB 0,0 WD, 0 slot, PC 0 PC, 0 weight, 0 cost.",
            "Sparking-Firecracker = WB 50,25 WD, 1 slot, PC 0 PC, 50 weight, 500 cost.",
            "Cherry-Bomb = WB 100,50 WD, 2 slots, 0 PC, 100 weight, 600 cost.",
            "Concussion-Grenade = WB 150,75 WD, 3 slots, 0 PC, 150 weight, 700 cost.",
            "TNT-Terror = WB 200,100 WD, 4 slots, 0 PC, 200 weight, 800 cost.",
            "Deadly-Dynamite = WB 250,125 WD, 5 slots, 0 PC, 250 weight, 1000 cost.",
            "Bursting-Blaster = WB 300,150 WD, 6 slots, 0 PC, 300 weight, 1200 cost.",
            "Basement-Pounder = WB 350,175 WD, 7 slots, 0 PC, 350 weight, 1400 cost.",
            "Mushroom-Cloud = WB 400,200 WD, 8 slots, 0 PC, 400 weight, 1600 cost.",
            "Nasty-Nuke = WB 450,250 WD, 9 slots, 0 PC, 450 weight, 1800 cost.",
          ])}

          {renderDropdown("Select Targeting Map:", targetingMap, setTargetingMap, [
            "Default Targeting Map Range 1",
            "Default Targeting Map Range 2",
            "Default Targeting Map Range 3",
          ])}

          {renderDropdown("Select Orders List:", ordersList, setOrdersList, [
            "Default Orders List 5",
            "Default Orders List 15",
            "Default Orders List 25",
          ])}

          {renderDropdown("Select Bot Image:", botImage, setBotImage, [
            "Default Bot Image Small",
            "Default Bot Image Medium",
            "Default Bot Image Large",
          ])}
        </Box>
      </Box>

      {/* Bottom Buttons */}
      <Box
        sx={{
          position: "absolute",
          bottom: 30,
          width: "70%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button variant="contained" sx={buttonStyle} onClick={handleValidate}>
          Validate Bot Design
        </Button>

        <Button variant="contained" sx={buttonStyle} onClick={handleSave}>
          Save Bot Design
        </Button>

        <Button
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate("/navigation")}
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
  color: "white",
  width: "30%",
  "&:hover": {
    bgcolor: "#001a66",
  },
};


