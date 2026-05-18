
import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CreateProfileScreen() {
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
        Create your BOT WARS profile
      </Typography>

      {/* Centered Textboxes */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: "350px",
        }}
      >
        {/* Profile Name */}
        <Box>
          <Typography
            sx={{
              fontFamily: "Courier New",
              fontSize: "12pt",
              color: "white",
              mb: 1,
            }}
          >
            Profile Name:
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
            sx={{ bgcolor: "white" }}
          />
        </Box>

        {/* Profile Password */}
        <Box>
          <Typography
            sx={{
              fontFamily: "Courier New",
              fontSize: "12pt",
              color: "white",
              mb: 1,
            }}
          >
            Profile Password:
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
            sx={{ bgcolor: "white" }}
          />
        </Box>

        {/* Profile Email */}
        <Box>
          <Typography
            sx={{
              fontFamily: "Courier New",
              fontSize: "12pt",
              color: "white",
              mb: 1,
            }}
          >
            Profile Email Address:
          </Typography>
          <TextField
            type="email"
            fullWidth
            inputProps={{
              maxLength: 30,
              style: {
                fontFamily: "Courier New",
                fontSize: "12pt",
              },
            }}
            sx={{ bgcolor: "white" }}
          />
        </Box>
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
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={buttonStyle}
        >
          Save Profile
        </Button>

        <Button
          variant="contained"
          onClick={() => navigate("/navigation")}
          sx={buttonStyle}
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


