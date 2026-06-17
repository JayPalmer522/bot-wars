
import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { db, BattleHistory } from "../db/db";

interface VsComputerStats {
  battles: number;
  wins: number;
  losses: number;
  draws: number;
  bothLose: number;
}

interface VsPlayerStats {
  opponentName: string;
  battles: number;
  wins: number;
  losses: number;
  draws: number;
  bothLose: number;
}

export default function PlayerStatsScreen() {
  const navigate = useNavigate();
  const userId   = useSelector((state: RootState) => state.auth.userId);
  const username = useSelector((state: RootState) => state.auth.username);

  const [vcStats, setVcStats] = useState<VsComputerStats | null>(null);
  const [pvpStats, setPvpStats] = useState<VsPlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function loadStats() {
      const asP1 = await db.battleHistory.where("player1Id").equals(userId!).toArray();
      const asP2 = await db.battleHistory.where("player2Id").equals(userId!).toArray();

      // vs Computer — always recorded as player1
      const vcBattles = asP1.filter(b => b.mode === "vs-computer");
      setVcStats({
        battles:  vcBattles.length,
        wins:     vcBattles.filter(b => b.result === "player1").length,
        losses:   vcBattles.filter(b => b.result === "player2").length,
        draws:    vcBattles.filter(b => b.result === "draw").length,
        bothLose: vcBattles.filter(b => b.result === "both-lose").length,
      });

      // vs Player
      const pvpAsP1 = asP1.filter(b => b.mode === "vs-player");
      const pvpAsP2 = asP2.filter(b => b.mode === "vs-player");

      const map: Record<number, VsPlayerStats> = {};

      for (const b of pvpAsP1) {
        const opId = b.player2Id!;
        if (!map[opId]) map[opId] = { opponentName: b.player2Name, battles: 0, wins: 0, losses: 0, draws: 0, bothLose: 0 };
        map[opId].battles++;
        if (b.result === "player1")   map[opId].wins++;
        else if (b.result === "player2") map[opId].losses++;
        else if (b.result === "draw")    map[opId].draws++;
        else                             map[opId].bothLose++;
      }

      for (const b of pvpAsP2) {
        const opId = b.player1Id;
        if (!map[opId]) map[opId] = { opponentName: b.player1Name, battles: 0, wins: 0, losses: 0, draws: 0, bothLose: 0 };
        map[opId].battles++;
        if (b.result === "player2")   map[opId].wins++;
        else if (b.result === "player1") map[opId].losses++;
        else if (b.result === "draw")    map[opId].draws++;
        else                             map[opId].bothLose++;
      }

      setPvpStats(Object.values(map).sort((a, b) => b.battles - a.battles));
      setLoading(false);
    }

    loadStats();
  }, [userId]);

  // Overall PvP totals
  const pvpTotals = pvpStats.reduce(
    (acc, s) => ({
      battles:  acc.battles  + s.battles,
      wins:     acc.wins     + s.wins,
      losses:   acc.losses   + s.losses,
      draws:    acc.draws    + s.draws,
      bothLose: acc.bothLose + s.bothLose,
    }),
    { battles: 0, wins: 0, losses: 0, draws: 0, bothLose: 0 }
  );

  const StatRow = ({ label, stats }: { label: string; stats: { battles: number; wins: number; losses: number; draws: number; bothLose: number } }) => (
    <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", gap: 1, mb: 1, alignItems: "center" }}>
      <Typography sx={cellStyle}>{label}</Typography>
      <Typography sx={{ ...cellStyle, textAlign: "center" }}>{stats.battles}</Typography>
      <Typography sx={{ ...cellStyle, textAlign: "center", color: "lightgreen" }}>{stats.wins}</Typography>
      <Typography sx={{ ...cellStyle, textAlign: "center", color: "#ff8888" }}>{stats.losses}</Typography>
      <Typography sx={{ ...cellStyle, textAlign: "center", color: "#ffdd88" }}>{stats.draws}</Typography>
      <Typography sx={{ ...cellStyle, textAlign: "center", color: "#aaaaaa" }}>{stats.bothLose}</Typography>
    </Box>
  );

  return (
    <Box sx={{ height: "100vh", width: "100vw", bgcolor: "#111", display: "flex", flexDirection: "column", alignItems: "center", pt: 4 }}>
      <Typography variant="h3" sx={{ fontFamily: "Ebrima", fontWeight: "bold", fontSize: "30pt", color: "white", mb: 1 }}>
        PLAYER STATS
      </Typography>
      <Typography sx={{ fontFamily: "Courier New", fontSize: "14pt", color: "#88ccff", mb: 4 }}>
        {username}
      </Typography>

      {loading ? (
        <Typography sx={cellStyle}>Loading stats...</Typography>
      ) : (
        <Box sx={{ width: "80%", overflowY: "auto", mb: 10 }}>

          {/* Column headers */}
          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", gap: 1, mb: 1, borderBottom: "2px solid #555", pb: 1 }}>
            <Typography sx={{ ...headerStyle, textAlign: "left" }}>Opponent</Typography>
            <Typography sx={headerStyle}>Battles</Typography>
            <Typography sx={{ ...headerStyle, color: "lightgreen" }}>Wins</Typography>
            <Typography sx={{ ...headerStyle, color: "#ff8888" }}>Losses</Typography>
            <Typography sx={{ ...headerStyle, color: "#ffdd88" }}>Draws</Typography>
            <Typography sx={{ ...headerStyle, color: "#aaaaaa" }}>Both Lose</Typography>
          </Box>

          {/* vs Computer */}
          <Typography sx={sectionHeaderStyle}>VS COMPUTER</Typography>
          {vcStats && vcStats.battles > 0 ? (
            <StatRow label="Computer" stats={vcStats} />
          ) : (
            <Typography sx={{ ...cellStyle, color: "#666", mb: 2 }}>No battles vs Computer yet.</Typography>
          )}

          {/* vs Players */}
          <Typography sx={{ ...sectionHeaderStyle, mt: 3 }}>VS PLAYERS</Typography>
          {pvpStats.length === 0 ? (
            <Typography sx={{ ...cellStyle, color: "#666", mb: 2 }}>No player-vs-player battles yet.</Typography>
          ) : (
            <>
              {pvpStats.map(s => (
                <StatRow key={s.opponentName} label={s.opponentName} stats={s} />
              ))}
              <Box sx={{ borderTop: "1px solid #555", mt: 2, pt: 1 }}>
                <StatRow label="OVERALL vs Players" stats={pvpTotals} />
              </Box>
            </>
          )}
        </Box>
      )}

      <Box sx={{ position: "absolute", bottom: 30, width: "60%", display: "flex", justifyContent: "space-between" }}>
        <Button variant="contained" sx={btnStyle} onClick={() => navigate("/combat")}>
          Return to Combat
        </Button>
        <Button variant="contained" sx={btnStyle} onClick={() => navigate("/navigation")}>
          Build Bots and Armies
        </Button>
      </Box>
    </Box>
  );
}

const cellStyle = {
  fontFamily: "Courier New", fontSize: "11pt", color: "white",
};

const headerStyle = {
  fontFamily: "Courier New", fontSize: "11pt", fontWeight: "bold",
  color: "white", textAlign: "center" as const,
};

const sectionHeaderStyle = {
  fontFamily: "Courier New", fontSize: "13pt", fontWeight: "bold",
  color: "#88ccff", mb: 1, mt: 1,
};

const btnStyle = {
  bgcolor: "darkblue", border: "2px solid gray", fontFamily: "Courier New",
  fontSize: "14pt", fontWeight: "bold", color: "white", width: "45%",
  "&:hover": { bgcolor: "#001a66" },
};
