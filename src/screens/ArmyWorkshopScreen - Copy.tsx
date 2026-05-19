
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  FormControl,
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { db } from "../db/db";

export default function ArmyWorkshopScreen() {
  const navigate = useNavigate();

  // Army name dropdown
  const [armyName, setArmyName] = useState("");

  // Bot selection
  const [selectedBot, setSelectedBot] = useState("Default Army Bot Small");

  // Army bot list
  const [armyBots, setArmyBots] = useState<string[]>([]);
  const [selectedBotIndex, setSelectedBotIndex] = useState<number | null>(null);

  // Placeholder validation routine
  function VERIFY_ARMY_CHECK() {
    return "Bot Valid";
  }

  function handleValidate() {
    const result = VERIFY_ARMY_CHECK();
    alert(result);
  }

  async function handleSave() {
    if (!armyName.trim()) {
      alert("Every Army must have a name.");
      return;
    }
    if (armyBots.length === 0) {
      alert("Every Army must have at least one bot.");
      return;
    }
    const botIds: number[] = [];
    for (const botName of armyBots) {
      const bot = await db.bots.where("name").equals(botName).first();
      if (!bot) {
        alert(`Bot "${botName}" not found in database. Save it first.`);
        return;
      }
      botIds.push(bot.id!);
    }
    try {
      await db.armies.put({ name: armyName.trim(), botIds });
      alert("Army Saved!");
    } catch (e: any) {
      alert("Save failed: " + (e?.message ?? e));
    }
  }

  function addBot() {
    setArmyBots([...armyBots, selectedBot]);
  }

  function removeBot() {
    if (selectedBotIndex !== null) {
      const updated = [...armyBots];
      updated.splice(selectedBotIndex, 1);
      setArmyBots(updated);
      setSelectedBotIndex(null);
    }
  }

  const renderDropdown = (label, value, setValue, options) => (
    <FormControl
      fullWidth
      sx={{
        mb: 4,
        textAlign: "left",
        "& .MuiSelect-select": {
          bgcolor: "white",
          fontFamily: "Courier New",
          fontSize: "12pt",
          fontWeight: "bold",
          height: "24px",
          paddingTop: 0,
          paddingBottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          color: "black",
        },
        "& .MuiOutlinedInput-root": {
          height: "24px",
        },
      }}
    >
      <Typography sx={{ fontFamily: "Courier New", color: "white", mb: "4px", fontSize: "12pt", fontWeight: "bold" }}>
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
              fontWeight: "bold",
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
        ARMY WORKSHOP
      </Typography>

      {/* Name of Army */}
      <Box sx={{ width: "40%", mb: 4 }}>
        <FormControl fullWidth sx={{ mb: 4 }}>
          <Typography sx={{ fontFamily: "Courier New", color: "white", mb: "4px", fontSize: "12pt", fontWeight: "bold" }}>
            Name of Army:
          </Typography>
          <Autocomplete
            value={armyName}
            onChange={(event, newValue) => setArmyName(newValue || "")}
            inputValue={armyName}
            onInputChange={(event, newInputValue) => setArmyName(newInputValue)}
            options={["Default Army Cheap", "Default Army Medium", "Default Army Expensive"]}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                sx={{
                  bgcolor: "white",
                  "& .MuiOutlinedInput-root": {
                    height: "24px",
                    padding: 0,
                  },
                  "& .MuiInputBase-input": {
                    fontFamily: "Courier New",
                    fontSize: "12pt",
                    fontWeight: "bold",
                    color: "black",
                    paddingTop: 0,
                    paddingBottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  },
                }}
              />
            )}
            ListboxProps={{
              sx: {
                bgcolor: "white",
                color: "black",
              },
            }}
            componentsProps={{
              paper: {
                sx: {
                  bgcolor: "white",
                  color: "black",
                  "& .MuiAutocomplete-option": {
                    fontFamily: "Courier New",
                    fontWeight: "bold",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  },
                },
              },
            }}
          />
        </FormControl>
      </Box>

      {/* Main Layout: Left controls + Right list */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 4,
          width: "80%",
          height: "50%",
        }}
      >
        {/* Left Column */}
        <Box>
          {renderDropdown(
            "Select Bot:",
            selectedBot,
            setSelectedBot,
            ["Default Army Bot Small", "Default Army Bot Medium", "Default Army Bot Large"]
          )}

          <Button
            variant="contained"
            sx={leftButtonStyle}
            onClick={addBot}
          >
            Add Bot to Army
          </Button>

          <Button
            variant="contained"
            sx={leftButtonStyle}
            onClick={removeBot}
          >
            Remove selected Bot
          </Button>
        </Box>

        {/* Right Column: Scrollable List */}
        <Paper
          elevation={3}
          sx={{
            bgcolor: "white",
            border: "2px solid gray",
            height: "100%",
            overflowY: "scroll",
          }}
        >
          <List>
            {armyBots.map((bot, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  selected={selectedBotIndex === index}
                  onClick={() => setSelectedBotIndex(index)}
                  sx={{ fontFamily: "Courier New" }}
                >
                  {bot}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
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
        <Button variant="contained" sx={bottomButtonStyle} onClick={handleValidate}>
          Validate Army Design
        </Button>

        <Button variant="contained" sx={bottomButtonStyle} onClick={handleSave}>
          Save Army Design
        </Button>

        <Button
          variant="contained"
          sx={bottomButtonStyle}
          onClick={() => navigate("/navigation")}
        >
          Build Bots and Armies
        </Button>
      </Box>
    </Box>
  );
}

const leftButtonStyle = {
  bgcolor: "darkblue",
  border: "2px solid gray",
  fontFamily: "Courier New",
  fontSize: "12pt",
  fontWeight: "bold",
  color: "white",
  width: "100%",
  mb: 2,
  "&:hover": {
    bgcolor: "#001a66",
  },
};

const bottomButtonStyle = {
  bgcolor: "darkblue",
  border: "2px solid gray",
  fontFamily: "Courier New",
  fontSize: "14pt",
  fontWeight: "bold",
  color: "white",
  width: "30%",
  "&:hover": {
    bgcolor: "#001a66",
  },
};

