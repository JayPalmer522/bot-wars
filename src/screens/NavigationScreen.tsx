
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export default function NavigationScreen() {
  const navigate = useNavigate();
  const username = useSelector((state: RootState) => state.auth.username);

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
