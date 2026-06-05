
import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { CREATE_PROFILE } from "../utils/Profiles";

export default function CreateProfileScreen() {
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg("");
    const result = await CREATE_PROFILE(profileName, email, password);
    setSaving(false);
    if (result.success) {
      setStatusMsg("Profile created! Redirecting to login...");
      setTimeout(() => navigate("/"), 1200);
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
        Create your BOT WARS profile
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "350px" }}>
        <Box>
          <Typography sx={labelStyle}>Profile Name:</Typography>
          <TextField
            fullWidth
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            inputProps={{ maxLength: 30, style: inputInner }}
            sx={{ bgcolor: "white" }}
          />
        </Box>

        <Box>
          <Typography sx={labelStyle}>Profile Password:</Typography>
          <TextField
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputProps={{ maxLength: 50, style: inputInner }}
            sx={{ bgcolor: "white" }}
          />
        </Box>

        <Box>
          <Typography sx={labelStyle}>Profile Email Address:</Typography>
          <TextField
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputProps={{ maxLength: 100, style: inputInner }}
            sx={{ bgcolor: "white" }}
          />
        </Box>

        {statusMsg && (
          <Typography sx={{ color: statusMsg.startsWith("Profile created") ? "lightgreen" : "#ff8888", fontFamily: "Courier New", fontSize: "11pt", textAlign: "center" }}>
            {statusMsg}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 30,
          width: "70%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button variant="contained" onClick={handleSave} disabled={saving} sx={buttonStyle}>
          {saving ? "Saving..." : "Save Profile"}
        </Button>
        <Button variant="contained" onClick={() => navigate("/navigation")} sx={buttonStyle}>
          Build Bots and Armies
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
