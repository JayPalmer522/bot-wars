
import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ATTEMPT_LOGIN } from "../utils/Profiles";
import { setCurrentUser } from "../store/authSlice";
import { db } from "../db/db";

export default function SplashScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // On startup only: if no profiles exist, go straight to Create Profile.
  // Skip this redirect when the user navigated back from CreateProfile.
  useEffect(() => {
    if (location.state?.fromCreateProfile) return;
    db.profiles.count().then((count) => {
      if (count === 0) navigate("/create-profile");
    }).catch(() => {});
  }, []);

  const handleLogin = async () => {
    const result = await ATTEMPT_LOGIN(username, password);
    if (result.success) {
      dispatch(setCurrentUser({ userId: result.userId!, username: result.userData?.username ?? username }));
      navigate("/navigation");
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
            sx={textFieldStyle}
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
            sx={textFieldStyle}
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
        <Button
          variant="contained"
          onClick={() => navigate("/combat")}
          sx={buttonStyle}
          disabled={!username.trim()}
        >
          Play BOT-WARS
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
  color: "#111",
};

const textFieldStyle = {
  bgcolor: "white",
  borderRadius: "4px",
  "& .MuiOutlinedInput-root": {
    bgcolor: "white",
    "& fieldset": { borderColor: "#888" },
    "&:hover fieldset": { borderColor: "#aaa" },
    "&.Mui-focused fieldset": { borderColor: "#aaa" },
  },
  "& .MuiInputBase-input": {
    color: "#111",
  },
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
