
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export default function ResultsScreen() {
  const navigate = useNavigate();
  const combatRecord = useSelector((state: RootState) => state.battleLog.combatRecord);
  const log = useSelector((state: RootState) => state.battleLog.log);

  const renderEntry = (entry: any, index: number) => {
    if (typeof entry === "string") {
      return (
        <Typography key={index} sx={logLineStyle}>
          {entry}
        </Typography>
      );
    }
    // Object entries (settings header, etc.)
    return (
      <Box key={index} sx={{ mb: 1, borderBottom: "1px solid #444", pb: 1 }}>
        {Object.entries(entry).map(([k, v]) => (
          <Typography key={k} sx={logLineStyle}>
            {k}: {typeof v === "object" ? JSON.stringify(v) : String(v)}
          </Typography>
        ))}
      </Box>
    );
  };

  const hasRecord = combatRecord && combatRecord.length > 0;

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
      <Typography
        variant="h3"
        sx={{
          fontFamily: "Ebrima",
          fontWeight: "bold",
          fontSize: "30pt",
          color: "white",
          mb: 2,
        }}
      >
        RESULTS - BOT WARS
      </Typography>

      {log.length > 0 && (
        <Typography sx={{ color: "#aaa", fontFamily: "Courier New", fontSize: "10pt", mb: 1 }}>
          {log[log.length - 1]}
        </Typography>
      )}

      <Box
        sx={{
          width: "85%",
          flex: 1,
          overflowY: "auto",
          mb: 10,
          p: 2,
          bgcolor: "#1a1a1a",
          border: "2px solid gray",
        }}
      >
        {hasRecord ? (
          combatRecord.map((entry, i) => renderEntry(entry, i))
        ) : (
          <Typography sx={{ color: "#888", fontFamily: "Courier New", fontSize: "12pt" }}>
            No combat record available. Run a battle from the Combat screen first.
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 30,
          width: "60%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button variant="contained" sx={buttonStyle} onClick={() => navigate("/combat")}>
          Return to Combat
        </Button>
        <Button variant="contained" sx={buttonStyle} onClick={() => navigate("/navigation")}>
          Build Bots and Armies
        </Button>
      </Box>
    </Box>
  );
}

const logLineStyle = {
  fontFamily: "Courier New",
  fontSize: "11pt",
  color: "white",
  whiteSpace: "pre-wrap" as const,
  lineHeight: 1.6,
};

const buttonStyle = {
  bgcolor: "darkblue",
  border: "2px solid gray",
  fontFamily: "Courier New",
  fontSize: "14pt",
  fontWeight: "bold",
  color: "white",
  width: "45%",
  "&:hover": { bgcolor: "#001a66" },
};
