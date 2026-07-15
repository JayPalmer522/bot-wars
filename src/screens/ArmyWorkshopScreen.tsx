
import React, { useState, useEffect } from "react";
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
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { db } from "../db/db";

export default function ArmyWorkshopScreen() {
  const navigate = useNavigate();
  const userId = useSelector((state: RootState) => state.auth.userId);

  // Army name dropdown
  const [armyName, setArmyName] = useState("");
  const [armyNames, setArmyNames] = useState<string[]>([]);

  // Bot selection
  const [selectedBot, setSelectedBot] = useState("");
  const [botNames, setBotNames] = useState<string[]>([]);

  // Army bot list
  const [armyBots, setArmyBots] = useState<string[]>([]);
  const [selectedBotIndices, setSelectedBotIndices] = useState<Set<number>>(new Set());

  useEffect(() => { if (userId === null) navigate("/"); }, [userId]);

  // Load army and bot names on mount
  useEffect(() => {
    async function loadData() {
      if (!userId) return;
      const armies = await db.armies.where("userId").equals(userId).toArray();
      setArmyNames(armies.map(a => a.name).sort());

      const bots = await db.bots.where("userId").equals(userId).toArray();
      bots.sort((a, b) => a.name.localeCompare(b.name));
      setBotNames(bots.map(b => b.name));
      if (bots.length > 0) setSelectedBot(bots[0].name);
    }
    loadData();
  }, [userId]);

  // Load army bots when army name changes
  useEffect(() => {
    async function loadArmyBots() {
      if (armyName) {
        const army = await db.armies.where("[userId+name]").equals([userId, armyName]).first();
        if (army) {
          const botNames = await Promise.all(army.botIds.map(async (id) => {
            const bot = await db.bots.get(id);
            return bot ? bot.name : "";
          }));
          setArmyBots(botNames.filter(name => name));
        }
      } else {
        setArmyBots([]);
      }
      setSelectedBotIndices(new Set());
    }
    loadArmyBots();
  }, [armyName]);

  function handleValidate() {
    if (!armyName.trim()) {
      alert("Army Invalid\n\nEvery Army must have a name.");
      return;
    }
    if (armyBots.length !== 20) {
      alert(`Army Invalid\n\nAn Army must have exactly 20 bots. Current count: ${armyBots.length}.`);
      return;
    }
    alert("Army Valid");
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
      const bot = await db.bots.where("[userId+name]").equals([userId, botName]).first();
      if (!bot) {
        alert(`Bot "${botName}" not found in database. Save it first.`);
        return;
      }
      botIds.push(bot.id!);
    }
    try {
      const name = armyName.trim();
      const existing = await db.armies.where("[userId+name]").equals([userId, name]).first();
      if (existing) {
        await db.armies.update(existing.id!, { botIds });
      } else {
        await db.armies.add({ userId, name, botIds });
      }
      const all = await db.armies.where("userId").equals(userId).toArray();
      setArmyNames(all.map(a => a.name).sort());
      alert("Army Saved!");
    } catch (e: any) {
      alert("Save failed: " + (e?.message ?? e));
    }
  }

  function addBot() {
    if (armyBots.length >= 20) {
      alert("Max 20 bots per Army");
      return;
    }
    setArmyBots([...armyBots, selectedBot]);
  }

  function toggleBotSelection(index: number) {
    setSelectedBotIndices(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  function removeBot() {
    if (selectedBotIndices.size === 0) return;
    setArmyBots(armyBots.filter((_, i) => !selectedBotIndices.has(i)));
    setSelectedBotIndices(new Set());
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

  if (userId === null) return null;

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
            options={armyNames}
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
            botNames
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

          <Button
            variant="contained"
            sx={leftButtonStyle}
            onClick={() => { setArmyBots([]); setSelectedBotIndices(new Set()); }}
          >
            Clear List
          </Button>
        </Box>

        {/* Right Column: Scrollable List */}
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Typography sx={{
            fontFamily: "Courier New", fontWeight: "bold", fontSize: "12pt",
            color: armyBots.length === 20 ? "lightgreen" : "white", mb: "4px",
          }}>
            Bots: {armyBots.length} / 20
          </Typography>
        <Paper
          elevation={3}
          sx={{
            bgcolor: "white",
            border: "2px solid gray",
            flex: 1,
            overflowY: "scroll",
          }}
        >
          <List>
            {armyBots.map((bot, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  selected={selectedBotIndices.has(index)}
                  onClick={() => toggleBotSelection(index)}
                  sx={{
                    fontFamily: "Courier New",
                    fontSize: "12pt",
                    fontWeight: "bold",
                    color: "black",
                    bgcolor: selectedBotIndices.has(index) ? "#c8d8f0 !important" : "white",
                    py: 0,
                    minHeight: "unset",
                  }}
                >
                  {(index + 1).toString().padStart(2, "0")}. {bot}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
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

