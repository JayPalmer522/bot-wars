
import React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ResultsScreen() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        bgcolor: "#111", // Dark BOT WARS background
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
        RESULTS - BOT WARS
      </Typography>

      {/* Scrollable Results Box */}
      <Paper
        elevation={3}
        sx={{
          width: "80%",
          height: "60%",
          overflowY: "scroll",
          p: 3,
          bgcolor: "white",
          border: "2px solid gray",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Courier New",
            fontSize: "12pt",
            whiteSpace: "pre-wrap",
            color: "black",
          }}
        >
{`Combat results will appear here.

This placeholder screen is ready for integration with your future combat engine.

You can scroll this area and later fill it with:
• Turn-by-turn logs
• Damage reports
• Survivors
• Victory conditions
• Summary statistics

For now, this screen is fully functional for navigation and testing.`}
        </Typography>
      </Paper>

      {/* Bottom Buttons */}
      <Box
        sx={{
          position: "absolute",
          bottom: 30,
          width: "60%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate("/combat")}
        >
          Return to Combat
        </Button>

        <Button
          variant="contained"
          sx={buttonStyle}
          onClick={() => navigate("/navigation")}
        >
          Build Bots and Armies
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
  width: "45%",
  "&:hover": {
    bgcolor: "#001a66",
  },
};
