
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { db } from "../db/db";

export default function TargetingMapWorkshopScreen() {
  const navigate = useNavigate();
  const userId = useSelector((state: RootState) => state.auth.userId);
  // Name of Targeting Map
  const [mapName, setMapName] = useState("");
  const [mapNames, setMapNames] = useState<string[]>([]);

  // Range buttons
  const [range, setRange] = useState(3);

  // Targeting Map counter
  const [TS_COUNT, setTS_COUNT] = useState(1);

  // Track temporarily red buttons
  const [tempRedButtons, setTempRedButtons] = useState<Set<string>>(new Set());

  // Sensor types popup
  const [showSensorTypes, setShowSensorTypes] = useState(false);

  // 7x7 grid state
  const emptyGrid = Array.from({ length: 7 }, () =>
    Array.from({ length: 7 }, () => "")
  );
  const [grid, setGrid] = useState(emptyGrid);

  useEffect(() => { if (userId === null) navigate("/"); }, [userId]);

  useEffect(() => {
    if (!userId) return;
    db.targetMaps.where("userId").equals(userId).toArray().then(all =>
      setMapNames(all.map(m => m.name).sort())
    );
  }, [userId]);

  async function loadMap(name: string) {
    const map = await db.targetMaps.where("[userId+name]").equals([userId, name]).first();
    if (map) {
      setRange(map.range);
      setGrid(map.grid);
      setTS_COUNT(1);
    }
  }

  // Placeholder validation routine
  function VERIFY_TARGETING_MAP() {
    return "Orders List Valid";
  }

  function handleValidate() {
    const result = VERIFY_TARGETING_MAP();
    alert(result);
  }

  async function handleSave() {
    if (!mapName.trim()) {
      alert("Every Targeting Map must have a name.");
      return;
    }
    try {
      const name = mapName.trim();
      const existing = await db.targetMaps.where("[userId+name]").equals([userId, name]).first();
      if (existing) {
        await db.targetMaps.update(existing.id!, { range, grid });
      } else {
        await db.targetMaps.add({ userId, name, range, grid });
      }
      const all = await db.targetMaps.where("userId").equals(userId).toArray();
      setMapNames(all.map(m => m.name).sort());
      alert("Targeting Map Saved!");
    } catch (e: any) {
      alert("Save failed: " + (e?.message ?? e));
    }
  }

  function clearAll() {
    setGrid(emptyGrid);
    setTS_COUNT(1);
  }

  // Handle showing sensor types
  const handleShowSensorTypes = () => {
    setShowSensorTypes(true);
  };
  const handleRangeChange = (newRange: number) => {
    setRange(newRange);
    setTS_COUNT(1);
    
    // Create new grid with appropriate labels
    const newGrid = Array.from({ length: 7 }, (_, row) =>
      Array.from({ length: 7 }, (_, col) => {
        const isCenter = row === 3 && col === 3;
        if (isCenter) return ""; // BOT button stays empty
        
        // Determine if this button will be black based on new range
        const outerRows = [0, 1, 5, 6];
        const outerCols = [0, 1, 5, 6];
        const isOuterZone = outerRows.includes(row) || outerCols.includes(col);
        
        const edgeRows = [0, 6];
        const edgeCols = [0, 6];
        const isEdgeZone = edgeRows.includes(row) || edgeCols.includes(col);
        
        let isBlack = false;
        if (newRange === 1 && isOuterZone) {
          isBlack = true;
        } else if (newRange === 2 && isEdgeZone) {
          isBlack = true;
        }
        
        return isBlack ? "0" : "";
      })
    );
    
    setGrid(newGrid);
  };
  const handleTargetButtonClick = (row: number, col: number) => {
    const buttonKey = `${row}-${col}`;
    
    // Get current button data
    const currentValue = grid[row][col];
    
    if (currentValue === "") {
      // Empty button: set label to TS_COUNT and increment
      const newGrid = grid.map((r, i) =>
        i === row ? r.map((c, j) => (j === col ? TS_COUNT.toString() : c)) : r
      );
      setGrid(newGrid);
      setTS_COUNT(TS_COUNT + 1);
    } else {
      // Non-empty button: flash red for 1 second
      setTempRedButtons((prev) => new Set(prev).add(buttonKey));
      setTimeout(() => {
        setTempRedButtons((prev) => {
          const updated = new Set(prev);
          updated.delete(buttonKey);
          return updated;
        });
      }, 1000);
    }
  };

  // Render a single targeting button
  const renderTargetButton = (row, col) => {
    const isCenter = row === 3 && col === 3;
    const buttonKey = `${row}-${col}`;
    const gridValue = grid[row][col];
    const isTempRed = tempRedButtons.has(buttonKey);
    
    // Determine if button is in outer zone (first, second, next-to-last, and last rows/columns)
    const outerRows = [0, 1, 5, 6];
    const outerCols = [0, 1, 5, 6];
    const isOuterZone = outerRows.includes(row) || outerCols.includes(col);
    
    // Determine if button is on first or last row/column (for Range 2)
    const edgeRows = [0, 6];
    const edgeCols = [0, 6];
    const isEdgeZone = edgeRows.includes(row) || edgeCols.includes(col);
    
    // Apply styling based on range and position
    let buttonColor = isCenter ? "darkblue" : "white";
    let labelText = isCenter ? "Bot" : "";
    let fontSize = isCenter ? "10pt" : "0pt";
    
    if (range === 1 && isOuterZone) {
      buttonColor = "black";
      labelText = "0";
      fontSize = "14pt";
    } else if (range === 2 && !isCenter) {
      if (isEdgeZone) {
        buttonColor = "black";
        labelText = "0";
        fontSize = "14pt";
      } else {
        buttonColor = "white";
        labelText = gridValue;
        fontSize = gridValue ? "12pt" : "0pt";
      }
    } else if (range === 3 && !isCenter) {
      buttonColor = "white";
      labelText = gridValue;
      fontSize = gridValue ? "12pt" : "0pt";
    } else if (!isCenter) {
      // Default for other ranges: use grid value
      labelText = gridValue;
      fontSize = gridValue ? "12pt" : "0pt";
    }
    
    // Override color if temporarily red
    if (isTempRed && buttonColor === "white") {
      buttonColor = "red";
    }

    return (
      <Button
        key={`${row}-${col}`}
        variant="contained"
        disabled={buttonColor === "black"}
        onClick={() => {
          if (buttonColor === "white" || buttonColor === "red") {
            handleTargetButtonClick(row, col);
          }
        }}
        sx={{
          width: 45,
          height: 45,
          minWidth: 45,
          minHeight: 45,
          bgcolor: buttonColor,
          color: isCenter ? "white" : "black",
          border: "2px solid gray",
          fontFamily: "Courier New",
          fontSize: fontSize,
          p: 0,
          fontWeight: "bold",
          "&:hover:not(:disabled)": {
            bgcolor: buttonColor === "darkblue" ? "#001a66" : buttonColor === "red" ? "#cc0000" : "#f0f0f0",
            cursor: "pointer",
          },
          "&:disabled": {
            bgcolor: "black",
            color: "black",
            border: "2px solid gray",
            cursor: "not-allowed",
          },
        }}
      >
        {labelText}
      </Button>
    );
  };

  const renderDropdown = (label, value, setValue, options) => (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel sx={{ fontFamily: "Courier New" }}>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => setValue(e.target.value)}
        sx={{
          bgcolor: "white",
          fontFamily: "Courier New",
          fontSize: "12pt",
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt} value={opt} sx={{ fontFamily: "Courier New" }}>
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
        TARGETING MAP WORKSHOP
      </Typography>

      {/* Name of Targeting Map */}
      <Box sx={{ width: "40%", mb: 3 }}>
        <Typography
          sx={{
            fontFamily: "Courier New",
            fontSize: "14pt",
            color: "white",
            mb: 1,
            fontWeight: "bold",
          }}
        >
          Name of Targeting Map:
        </Typography>
        <Autocomplete
          value={mapName}
          onChange={(event, newValue) => {
            const name = newValue || "";
            setMapName(name);
            if (name && mapNames.includes(name)) loadMap(name);
          }}
          inputValue={mapName}
          onInputChange={(event, newInputValue) => setMapName(newInputValue)}
          options={mapNames}
          freeSolo
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              sx={{
                bgcolor: "white",
                fontFamily: "Courier New",
                fontSize: "12pt",
                color: "black",
                fontWeight: "bold",
                "& .MuiOutlinedInput-root": {
                  height: "24px",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiOutlinedInput-input": {
                  padding: "0",
                  textAlign: "left",
                  color: "black",
                  fontWeight: "bold",
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
                  color: "black",
                  display: "flex",
                  alignItems: "center",
                  textAlign: "left",
                },
              },
            },
          }}
        />
      </Box>

      {/* Range of Scanner */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Courier New",
            fontSize: "14pt",
            color: "white",
          }}
        >
          Range of Scanner:
        </Typography>

        {[1, 2, 3].map((r) => (
          <Button
            key={r}
            variant="contained"
            onClick={() => handleRangeChange(r)}
            sx={{
              width: 45,
              height: 45,
              minWidth: 45,
              minHeight: 45,
              bgcolor: range === r ? "darkblue" : "white",
              color: range === r ? "white" : "black",
              border: "2px solid gray",
              fontFamily: "Courier New",
              fontSize: "14pt",
            }}
          >
            {r}
          </Button>
        ))}
      </Box>

      {/* Main Layout: Left button + Grid + Right button */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 4,
          alignItems: "center",
          mb: 6,
        }}
      >
        {/* Left: Review Targeting Sensor Types */}
        <Button
          variant="contained"
          onClick={handleShowSensorTypes}
          sx={{
            bgcolor: "darkblue",
            border: "2px solid gray",
            fontFamily: "Courier New",
            fontSize: "12pt",
            color: "white",
            width: 140,
            height: 140,
            whiteSpace: "pre-line",
            "&:hover": { bgcolor: "#001a66" },
          }}
        >
          Review{"\n"}Targeting{"\n"}Sensor{"\n"}Types
        </Button>

        {/* Center: 7x7 Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 45px)",
            gridTemplateRows: "repeat(7, 45px)",
            gap: 1,
          }}
        >
          {Array.from({ length: 7 }).map((_, row) =>
            Array.from({ length: 7 }).map((_, col) =>
              renderTargetButton(row, col)
            )
          )}
        </Box>

        {/* Right: Clear All */}
        <Button
          variant="contained"
          onClick={clearAll}
          sx={{
            bgcolor: "darkblue",
            border: "2px solid gray",
            fontFamily: "Courier New",
            fontSize: "12pt",
            color: "white",
            width: 120,
            height: 60,
            "&:hover": { bgcolor: "#001a66" },
          }}
        >
          Clear All
        </Button>
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
          Validate Targeting Map
        </Button>

        <Button variant="contained" sx={bottomButtonStyle} onClick={handleSave}>
          Save Targeting Map
        </Button>

        <Button
          variant="contained"
          sx={bottomButtonStyle}
          onClick={() => navigate("/navigation")}
        >
          Build Bots and Armies
        </Button>
      </Box>

      {/* Sensor Types Dialog */}
      <Dialog
        open={showSensorTypes}
        onClose={() => setShowSensorTypes(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: "Courier New", fontWeight: "bold" }}>
          All Targeting Sensor Types
        </DialogTitle>
        <DialogContent sx={{ fontFamily: "Courier New", fontSize: "12pt", whiteSpace: "pre" }}>
          {`Blind-Night = TS identifies Max 1 targets in 1 range, 10 PC, 1 slots, 10 weight, 50 cost.
Barely-Awake = TS identifies Max 2 targets in 1 range, 20 PC, 1 slots, 20 weight, 100 cost.
Abstract_Thoughts = TS identifies Max 3 targets in 1 range, 30 PC, 1 slots, 30 weight, 150 cost.
General-Awareness = TS identifies Max 2 targets in 2 range, 40 PC, 2 slots, 40 weight, 200 cost.
Wary-Watchful = TS identifies 4 Max targets in 2 range, 50 PC, 2 slots, 50 weight, 250 cost.
Total-Awareness = TS identifies Max 1 targets in 3 range, 60 PC, 2 slots, 60 weight, 300 cost.
Deep-Concentration = TS identifies Max 2 targets in 3 range, 70 PC, 3 slots, 70 weight, 350 cost.
Intense-Concentration = TS identifies Max 3 targets in 3 range, 80 PC, 3 slots, 80 weight, 400 cost.
Godly-Omnificence = TS identifies Max 5 targets in 3 range, 90 PC, 3 slots, 90 weight, 450 cost.`}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowSensorTypes(false)}
            variant="contained"
            sx={{
              bgcolor: "darkblue",
              color: "white",
              fontFamily: "Courier New",
              fontWeight: "bold",
              "&:hover": { bgcolor: "#001a66" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const bottomButtonStyle = {
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
