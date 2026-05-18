
import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
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
        Welcome to BOT WARS!
      </Typography>

      {/* Centered Textboxes */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: "300px",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Courier New",
              fontSize: "12pt",
              color: "white",
              mb: 1,
            }}
          >
            Enter Name:
          </Typography>
          <TextField
            fullWidth
            inputProps={{
              maxLength: 30,
              style: {
                fontFamily: "Courier New",
                fontSize: "12pt",
              },
            }}
            sx={{
              bgcolor: "white",
            }}
          />
        </Box>

        <Box>
          <Typography
            sx={{
              fontFamily: "Courier New",
              fontSize: "12pt",
              color: "white",
              mb: 1,
            }}
          >
            Enter Password:
          </Typography>
          <TextField
            type="password"
            fullWidth
            inputProps={{
              maxLength: 30,
              style: {
                fontFamily: "Courier New",
                fontSize: "12pt",
              },
            }}
            sx={{
              bgcolor: "white",
            }}
          />
        </Box>
      </Box>

      {/* Bottom Buttons */}
      <Box
        sx={{
          position: "absolute",
          bottom: 30,
          width: "90%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="contained"
          onClick={() => navigate("/instructions")}
          sx={buttonStyle}
        >
          View Instructions
        </Button>

        <Button
          variant="contained"
          onClick={() => navigate("/create-profile")}
          sx={buttonStyle}
        >
          Build a Profile
        </Button>

        <Button
          variant="contained"
          onClick={() => navigate("/navigation")}
          sx={buttonStyle}
        >
          Build Bots and Armies
        </Button>

        <Button
          variant="contained"
          onClick={() => navigate("/combat")}
          sx={buttonStyle}
        >
          Play Bot-War
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
  width: "22%",
  "&:hover": {
    bgcolor: "#001a66",
  },
};

