
import React, { useState, useEffect, useRef } from "react";
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
import { useDispatch } from "react-redux";
import { addLogEntry, clearLog, setCombatRecord } from "../store/battleLogSlice";
import { BEGIN_COMBAT, SHOW_COMBAT_RECORD } from "../utils/Combat";
import { BEGIN_ANIMATION, REPLAY_COMBAT_RECORD, SET_MICRO_DELAY, SET_MACRO_DELAY } from "../utils/Animation";
import { db } from "../db/db";

export default function CombatScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Dropdown states
  const [army1, setArmy1] = useState("Default Army Small");
  const [army2, setArmy2] = useState("Default Army Small");
  const [armyOptions, setArmyOptions] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    db.armies.toArray().then(armies => {
      setArmyOptions(armies.map(a => a.name));
    });
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      BEGIN_ANIMATION(canvasRef.current);
    }
  }, []);

  const [maxGold, setMaxGold] = useState("No limits");
  const [maxWeight, setMaxWeight] = useState("No limits");
  const [maxPower, setMaxPower] = useState("No limits");
  const [combatRecord, setLocalCombatRecord] = useState([]);

  const [microDelay, setMicroDelay] = useState(200);
  const [macroDelay, setMacroDelay] = useState(500);

  const MICRO_PRESETS = [0, 100, 200, 500, 1000];
  const MACRO_PRESETS = [0, 200, 500, 1000, 2000];

  const applyMicroDelay = (ms: number) => { setMicroDelay(ms); SET_MICRO_DELAY(ms); };
  const applyMacroDelay = (ms: number) => { setMacroDelay(ms); SET_MACRO_DELAY(ms); };

  const limits = [
    "No limits",
    "10,000 Max",
    "15,000 Max",
    "20,000 Max",
    "30,000 Max",
    "40,000 Max",
    "50,000 Max",
  ];

  const simulateCombat = async () => {
    // Get army IDs
    const army1Data = await db.armies.where("name").equals(army1).first();
    const army2Data = await db.armies.where("name").equals(army2).first();

    if (!army1Data || !army2Data) {
      alert("Armies not found");
      return;
    }

    // Parse settings
    const parseLimit = (limit) => limit === "No limits" ? null : parseInt(limit.replace(" Max", "").replace(",", ""));

    const settings = {
      maxGold: parseLimit(maxGold),
      maxWeight: parseLimit(maxWeight),
      maxPower: parseLimit(maxPower),
      maxGoldSelection: maxGold,
      maxWeightSelection: maxWeight,
      maxPowerSelection: maxPower,
      playerName: "Unknown Player",
    };

    const result = await BEGIN_COMBAT(army1Data.id, army2Data.id, settings);

    if (result.success) {
      setLocalCombatRecord(result.combatRecord || []);
      dispatch(clearLog());
      dispatch(addLogEntry("Battle ID: " + result.battleId));
      dispatch(setCombatRecord(result.combatRecord || []));

      // Replay combat — draws initial placement then animates each log event
      if (canvasRef.current && result.initialMapState) {
        REPLAY_COMBAT_RECORD(canvasRef.current, result.combatRecord || [], result.initialMapState);
      }
    } else {
      alert(result.message);
    }
  };

  const renderDropdown = (label, value, setValue, options) => (
    <FormControl fullWidth sx={{ mb: 4, textAlign: "left" }}>
      <Typography sx={{ color: "white", fontWeight: "bold", mb: "4px", fontSize: "12pt" }}>
        {label}
      </Typography>
      <Select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        sx={{
          bgcolor: "white",
          fontFamily: "Courier New",
          fontSize: "12pt",
          "& .MuiSelect-select": {
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
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: "white",
              "& .MuiMenuItem-root": {
                fontWeight: "bold",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                color: "black",
              },
            },
          },
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
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
        COMBAT - BOT WARS
      </Typography>

      {/* Main Layout: Left controls + Game Map + Right controls */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 4,
          alignItems: "flex-start",
          width: "90%",
        }}
      >
        {/* LEFT SIDE CONTROLS */}
        <Box sx={{ width: "100%" }}>
          {renderDropdown("Max Gold:", maxGold, setMaxGold, [ ...limits])}
          {renderDropdown("Max Weight:", maxWeight, setMaxWeight, [ ...limits])}
          {renderDropdown("Max Power:", maxPower, setMaxPower, [ ...limits])}

          {/* Combat Record Label */}
          <Box
            sx={{
              width: "95%",
              height: "433px",
              bgcolor: "#222",
              border: "2px solid gray",
              mt: 2,
              p: 1,
              overflowY: "auto",
              fontFamily: "Courier New",
              fontSize: "10pt",
              fontWeight: "bold",
              color: "white",
              textAlign: "left",
            }}
          >
            {SHOW_COMBAT_RECORD === "TRUE" && combatRecord.length > 0 ? (
              combatRecord.map((record, index) => {
                if (typeof record === "string") {
                  return <div key={index} style={{ marginBottom: "2px" }}>{record}</div>;
                }
                // Settings header object
                return (
                  <div key={index} style={{ marginBottom: "6px", borderBottom: "1px solid #444", paddingBottom: "4px" }}>
                    {Object.entries(record).map(([key, value]) => (
                      <div key={key}>
                        {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </div>
                    ))}
                  </div>
                );
              })
            ) : (
              SHOW_COMBAT_RECORD === "TRUE"
                ? "Combat Record will appear here when combat begins"
                : "Combat Record display disabled"
            )}
          </Box>
        </Box>

        {/* GAME MAP */}
        <canvas
          ref={canvasRef}
          width={433}
          height={433}
          style={{ border: "2px solid gray", display: "block" }}
        />

        {/* RIGHT SIDE CONTROLS */}
        <Box sx={{ width: "100%" }}>
          <Button
            variant="contained"
            sx={rightButtonStyle}
            onClick={simulateCombat}
          >
            Begin Combat
          </Button>

          {renderDropdown("Army 1:", army1, setArmy1, armyOptions)}

          {renderDropdown("Army 2:", army2, setArmy2, armyOptions)}

          {/* Micro Delay buttons */}
          <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "12pt", mb: "4px" }}>
            Micro Delay:
          </Typography>
          <Box sx={{ display: "flex", gap: "4px", mb: 2, flexWrap: "wrap" }}>
            {MICRO_PRESETS.map(ms => (
              <Button
                key={ms}
                variant="contained"
                onClick={() => applyMicroDelay(ms)}
                sx={{
                  ...delayButtonStyle,
                  bgcolor: microDelay === ms ? "#0044cc" : "darkblue",
                  border: microDelay === ms ? "2px solid white" : "2px solid gray",
                }}
              >
                {ms === 0 ? "0" : ms < 1000 ? `${ms / 1000}s` : "1s"}
              </Button>
            ))}
          </Box>

          {/* Macro Delay buttons */}
          <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "12pt", mb: "4px" }}>
            Macro Delay:
          </Typography>
          <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {MACRO_PRESETS.map(ms => (
              <Button
                key={ms}
                variant="contained"
                onClick={() => applyMacroDelay(ms)}
                sx={{
                  ...delayButtonStyle,
                  bgcolor: macroDelay === ms ? "#0044cc" : "darkblue",
                  border: macroDelay === ms ? "2px solid white" : "2px solid gray",
                }}
              >
                {ms === 0 ? "0" : ms < 1000 ? `${ms / 1000}s` : `${ms / 1000}s`}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      {/* BOTTOM BUTTONS */}
      <Box
        sx={{
          position: "absolute",
          bottom: 30,
          width: "70%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="contained"
          sx={bottomButtonStyle}
          onClick={() => navigate("/results")}
        >
          View Results
        </Button>

        <Button
          variant="contained"
          sx={bottomButtonStyle}
          onClick={() => navigate("/")}
        >
          Start Again
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

const rightButtonStyle = {
  bgcolor: "darkblue",
  border: "2px solid gray",
  fontFamily: "Courier New",
  fontSize: "14pt",
  fontWeight: "bold",
  color: "white",
  width: "100%",
  height: "60px",
  mb: 3,
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

const delayButtonStyle = {
  fontFamily: "Courier New",
  fontSize: "10pt",
  fontWeight: "bold",
  color: "white",
  minWidth: "42px",
  height: "32px",
  padding: "0 6px",
  "&:hover": {
    bgcolor: "#0033aa",
  },
};
