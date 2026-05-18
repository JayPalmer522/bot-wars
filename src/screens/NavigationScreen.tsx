
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NavigationScreen() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        bgcolor: "#111", // Dark background
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
          mb: 6,
          bgcolor: "transparent",
        }}
      >
        Navigate through BOT WARS
      </Typography>

      {/* Two Columns of Buttons */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 3,
          width: "70%",
        }}
      >
        <Button
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate("/bot")}
        >
          Create/Edit a Bot
        </Button>

        <Button
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate("/army")}
        >
          Create/Edit an Army
        </Button>

        <Button
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate("/orders")}
        >
          Create/Edit an Orders List
        </Button>

        <Button
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate("/targeting")}
        >
          Create/Edit a Targeting Map
        </Button>

        <Button
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate("/combat")}
        >
          Prepare for Combat
        </Button>

        <Button
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate("/instructions")}
        >
          View Instructions
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

