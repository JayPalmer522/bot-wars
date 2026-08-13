
import React, { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

// Patterns that mark end-of-battle outcome lines written by the combat engine.
const OUTCOME_LINE_RE = /^(Victory to Army|Army \d+ (is the Marginal|wins)|Both Armies|Draw)/i;

export default function ResultsScreen() {
  const navigate  = useNavigate();
  const username  = useSelector((state: RootState) => state.auth.username);
  const combatRecord = useSelector((state: RootState) => state.battleLog.combatRecord);
  const meta      = useSelector((state: RootState) => state.battleLog.combatMeta);

  useEffect(() => { if (!username) navigate("/"); }, [username]);

  // ── Outcome condition lines (written by combat engine after battle ends) ──
  const outcomeLines = (combatRecord as any[])
    .filter((e): e is string => typeof e === "string")
    .filter(line => OUTCOME_LINE_RE.test(line));

  // ── Winner label ──
  function winnerLabel(): string {
    if (!meta) return "";
    const { outcome, p1Name, p2Name, victoryType } = meta;
    if (outcome === "player1") return `${p1Name} wins! (${victoryType})`;
    if (outcome === "player2") return `${p2Name} wins! (${victoryType})`;
    if (outcome === "draw")    return "Draw — no winner.";
    return "Both Armies Destroyed.";
  }

  // ── Render one combat-record entry ──
  const renderEntry = (entry: any, index: number) => {
    if (typeof entry === "string") {
      return (
        <Typography key={index} sx={recordLineStyle}>
          {entry}
        </Typography>
      );
    }
    return (
      <Box key={index} sx={{ mb: 1, borderBottom: "1px solid #333", pb: 1 }}>
        {Object.entries(entry).map(([k, v]) => (
          <Typography key={k} sx={recordLineStyle}>
            {k}: {typeof v === "object" ? JSON.stringify(v) : String(v)}
          </Typography>
        ))}
      </Box>
    );
  };

  const hasRecord = combatRecord && combatRecord.length > 0;

  return (
    <Box sx={{ height: "100vh", width: "100vw", bgcolor: "#111", display: "flex", flexDirection: "column", alignItems: "center", pt: 4 }}>

      {/* Title */}
      <Typography variant="h3" sx={{ fontFamily: "Ebrima", fontWeight: "bold", fontSize: "30pt", color: "white", mb: 2 }}>
        RESULTS - BOT WARS
      </Typography>

      {/* ── Header: player info + winner + outcome conditions ── */}
      {meta && (
        <Box sx={{ width: "85%", bgcolor: "#1a2a3a", border: "2px solid gray", p: 2, mb: 1 }}>

          {/* Player line(s) */}
          {meta.mode === "vs-computer" ? (
            <Typography sx={headerLineStyle}>
              {meta.p1Rank}&nbsp;&nbsp;&nbsp;{meta.p1Name}&nbsp;&nbsp;&nbsp;Playing against Computer
            </Typography>
          ) : (
            <>
              <Typography sx={headerLineStyle}>
                {meta.p1Rank}&nbsp;&nbsp;&nbsp;{meta.p1Name}&nbsp;&nbsp;&nbsp;vs&nbsp;&nbsp;&nbsp;{meta.p2Rank}&nbsp;&nbsp;&nbsp;{meta.p2Name}
              </Typography>
            </>
          )}

          {/* Winner */}
          <Typography sx={{ ...headerLineStyle, color: "#ffdd88", mt: 1 }}>
            {winnerLabel()}
          </Typography>

          {/* Outcome condition lines from the combat record */}
          {outcomeLines.length > 0 && (
            <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid #446" }}>
              {outcomeLines.map((line, i) => (
                <Typography key={i} sx={{ ...headerLineStyle, color: "#aaddff" }}>
                  {line}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* ── Full combat record ── */}
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
          (combatRecord as any[]).map((entry, i) => renderEntry(entry, i))
        ) : (
          <Typography sx={{ color: "#888", fontFamily: "Courier New", fontSize: "12pt" }}>
            No combat record available. Run a battle from the Combat screen first.
          </Typography>
        )}
      </Box>

      {/* Bottom buttons */}
      <Box sx={{ position: "absolute", bottom: 30, width: "60%", display: "flex", justifyContent: "space-between" }}>
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

const headerLineStyle = {
  fontFamily: "Courier New",
  fontSize: "14pt",
  fontWeight: "bold",
  color: "white",
  whiteSpace: "pre-wrap" as const,
};

const recordLineStyle = {
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
