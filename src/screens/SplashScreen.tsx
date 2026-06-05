
import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ATTEMPT_LOGIN } from "../utils/Profiles";

export default function SplashScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const handleLogin = async () => {
    const result = await ATTEMPT_LOGIN(username, password);
    if (result.success) {
      setStatusMsg(`Welcome back, ${result.userData?.username ?? username}!`);
      setTimeout(() => navigate("/navigation"), 800);
    } else {
      setStatusMsg(result.message);
    }
  };

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
          mb: 6,
          bgcolor: "transparent",
        }}
      >
        Welcome to BOT WARS!
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "300px" }}>
        <Box>
          <Typography sx={labelStyle}>Enter Name:</Typography>
          <TextField
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            inputProps={{ maxLength: 30, style: inputInner }}
            sx={{ bgcolor: "white" }}
          />
        </Box>

        <Box>
          <Typography sx={labelStyle}>Enter Password:</Typography>
          <TextField
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputProps={{ maxLength: 30, style: inputInner }}
            sx={{ bgcolor: "white" }}
          />
        </Box>

        <Button variant="contained" sx={loginButtonStyle} onClick={handleLogin}>
          Login
        </Button>

        {statusMsg && (
          <Typography sx={{ color: statusMsg.startsWith("Welcome") ? "lightgreen" : "#ff8888", fontFamily: "Courier New", fontSize: "11pt", textAlign: "center" }}>
            {statusMsg}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 30,
          width: "90%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button variant="contained" onClick={() => navigate("/instructions")} sx={buttonStyle}>
          View Instructions
        </Button>
        <Button variant="contained" onClick={() => navigate("/create-profile")} sx={buttonStyle}>
          Build a Profile
        </Button>
        <Button variant="contained" onClick={() => navigate("/navigation")} sx={buttonStyle}>
          Build Bots and Armies
        </Button>
        <Button variant="contained" onClick={() => navigate("/combat")} sx={buttonStyle}>
          Play Bot-War
        </Button>
      </Box>
    </Box>
  );
}

const labelStyle = {
  fontFamily: "Courier New",
  fontSize: "12pt",
  color: "white",
  mb: 1,
};

const inputInner = {
  fontFamily: "Courier New",
  fontSize: "12pt",
};

const loginButtonStyle = {
  bgcolor: "darkblue",
  border: "2px solid gray",
  fontFamily: "Courier New",
  fontSize: "14pt",
  fontWeight: "bold",
  color: "white",
  "&:hover": { bgcolor: "#001a66" },
};

const buttonStyle = {
  bgcolor: "darkblue",
  border: "2px solid gray",
  fontFamily: "Courier New",
  fontSize: "14pt",
  fontWeight: "bold",
  color: "white",
  width: "22%",
  "&:hover": { bgcolor: "#001a66" },
};
