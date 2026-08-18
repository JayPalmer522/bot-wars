
import React, { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { db } from "../db/db";

export default function NavigationScreen() {
  const navigate = useNavigate();
  const username = useSelector((state: RootState) => state.auth.username);
  const userId   = useSelector((state: RootState) => state.auth.userId);

  useEffect(() => { if (!username) navigate("/"); }, [username]);

  async function exportArmyData() {
    if (!userId) return;

    const [armies, bots, orderLists, targetMaps] = await Promise.all([
      db.armies.where("userId").equals(userId).toArray(),
      db.bots.where("userId").equals(userId).toArray(),
      db.orderLists.where("userId").equals(userId).toArray(),
      db.targetMaps.where("userId").equals(userId).toArray(),
    ]);

    const olById  = new Map(orderLists.map(ol => [ol.id!, ol]));
    const tmById  = new Map(targetMaps.map(tm => [tm.id!, tm]));
    const botById = new Map(bots.map(b  => [b.id!,  b]));

    const payload = {
      orderLists: orderLists.map(ol => ({
        name:     ol.name,
        commands: ol.commands,
      })),
      targetMaps: targetMaps.map(tm => ({
        name:  tm.name,
        range: tm.range,
        grid:  tm.grid,
      })),
      bots: bots.map(bot => ({
        name:            bot.name,
        frame:           bot.frame,
        engine:          bot.engine,
        computer:        bot.computer,
        armor:           bot.armor,
        sensor:          bot.sensor,
        weaponMaster:    bot.weaponMaster,
        weaponSecondary: bot.weaponSecondary,
        weaponBomb:      bot.weaponBomb,
        botImage:        bot.botImage,
        ordersListName:  olById.get(bot.ordersListId!)?.name ?? "",
        targetMapName:   tmById.get(bot.targetMapId!)?.name  ?? "",
        slotsUsed:       bot.slotsUsed   ?? "",
        totalWeight:     bot.totalWeight ?? "",
        totalGold:       bot.totalGold   ?? "",
        totalPower:      bot.totalPower  ?? "",
        move:            bot.move        ?? "",
      })),
      armies: armies.map(army => ({
        name: army.name,
        bots: army.botIds.map(id => botById.get(id)?.name ?? String(id)),
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "army-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

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
          mb: 1,
          bgcolor: "transparent",
        }}
      >
        Navigate through BOT WARS
      </Typography>

      {username && (
        <Typography sx={{ fontFamily: "Courier New", fontSize: "13pt", color: "#88ccff", mb: 4 }}>
          Player: {username}
        </Typography>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 3,
          width: "70%",
        }}
      >
        <Button variant="contained" sx={buttonStyle} onClick={() => navigate("/bot")}>
          Create/Edit a Bot
        </Button>

        <Button variant="contained" sx={buttonStyle} onClick={() => navigate("/army")}>
          Create/Edit an Army
        </Button>

        <Button variant="contained" sx={buttonStyle} onClick={() => navigate("/orders")}>
          Create/Edit an Orders List
        </Button>

        <Button variant="contained" sx={buttonStyle} onClick={() => navigate("/targeting")}>
          Create/Edit a Targeting Map
        </Button>

        <Button variant="contained" sx={buttonStyle} onClick={() => navigate("/combat")}>
          Prepare for Combat
        </Button>

        <Button variant="contained" sx={buttonStyle} onClick={() => navigate("/instructions")}>
          View Instructions
        </Button>

        <Button variant="contained" sx={buttonStyle} onClick={() => navigate("/stats")}>
          View Player Stats
        </Button>

        <Button variant="contained" sx={buttonStyle} onClick={() => navigate("/")}>
          Switch Player / Logout
        </Button>

        {import.meta.env.DEV && (
          <Button
            variant="contained"
            sx={{ ...buttonStyle, gridColumn: "1 / -1", bgcolor: "#1a1a00", border: "2px solid #888800",
                  "&:hover": { bgcolor: "#2a2a00" } }}
            onClick={exportArmyData}
          >
            [DEV] Export army-data.json
          </Button>
        )}
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
  height: "70px",
  "&:hover": {
    bgcolor: "#001a66",
  },
};
