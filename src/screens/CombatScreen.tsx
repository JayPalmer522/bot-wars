
import React, { useState, useEffect, useRef } from "react";
import {
  Box, Button, Typography, FormControl, TextField, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { addLogEntry, clearLog, setCombatRecord, setCombatMeta } from "../store/battleLogSlice";
import { BEGIN_COMBAT, SHOW_COMBAT_RECORD } from "../utils/Combat";
import { BEGIN_ANIMATION, REPLAY_COMBAT_RECORD, SET_MICRO_DELAY, SET_MACRO_DELAY, SET_AUDIO_CONTEXT } from "../utils/Animation";
import { ATTEMPT_LOGIN, UPDATE_BATTLE_RESULT } from "../utils/Profiles";
import { db } from "../db/db";

type Mode = "vs-computer" | "vs-player";
type PvpStep = "p1-army" | "p2-login" | "p2-army";

interface CombatResultInfo {
  outcome: "player1" | "player2" | "draw" | "both-lose";
  victoryType: string;
  winnerName: string;
  loserName: string;
  p1Name: string;
  p1Rank: string;
  p2Name: string;
  p2Rank: string;
  mode: "vs-computer" | "vs-player";
}

function parseLim(s: string): number | null {
  return s === "No limits" ? null : parseInt(s.replace(" Max", "").replace(",", ""));
}

async function loadFilteredArmies(forUserId: number, maxGold: string, maxWeight: string, maxPower: string): Promise<string[]> {
  const goldLim   = parseLim(maxGold);
  const weightLim = parseLim(maxWeight);
  const powerLim  = parseLim(maxPower);

  const armies = await db.armies.where("userId").equals(forUserId).toArray();
  const qualified: string[] = [];
  for (const army of armies) {
    const botResults = await db.bots.bulkGet(army.botIds);
    const allPass = botResults.every(bot => {
      if (bot === undefined) return true;
      const g = parseInt(bot.totalGold   || "0");
      const w = parseInt(bot.totalWeight || "0");
      const p = parseInt(bot.totalPower  || "0");
      if (goldLim   !== null && g > goldLim)   return false;
      if (weightLim !== null && w > weightLim) return false;
      if (powerLim  !== null && p > powerLim)  return false;
      return true;
    });
    if (allPass) qualified.push(army.name);
  }
  return qualified.sort();
}

function detectOutcome(record: any[]): { outcome: "player1" | "player2" | "draw" | "both-lose"; victoryType: string } {
  const text = record.filter(r => typeof r === "string").join(" ");
  if (/Both Armies Lose|both armies destroyed/i.test(text)) return { outcome: "both-lose", victoryType: "Both Armies Destroyed" };
  if (/Army 1 is the Marginal/i.test(text))  return { outcome: "player1", victoryType: "Marginal Victory" };
  if (/Victory to Army 1|Army 1 wins/i.test(text)) return { outcome: "player1", victoryType: "Victory" };
  if (/Army 2 is the Marginal/i.test(text))  return { outcome: "player2", victoryType: "Marginal Victory" };
  if (/Victory to Army 2|Army 2 wins/i.test(text)) return { outcome: "player2", victoryType: "Victory" };
  return { outcome: "draw", victoryType: "Draw" };
}

export default function CombatScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId   = useSelector((state: RootState) => state.auth.userId);
  const username = useSelector((state: RootState) => state.auth.username);

  // Mode
  const [mode, setMode] = useState<Mode>("vs-computer");

  // Army selection (both modes)
  const [army1, setArmy1] = useState("");
  const [army2, setArmy2] = useState("");
  const [p1ArmyOptions, setP1ArmyOptions] = useState<string[]>([]);

  // PvP flow
  const [pvpStep, setPvpStep]         = useState<PvpStep>("p1-army");
  const [p2Username, setP2Username]   = useState("");
  const [p2Password, setP2Password]   = useState("");
  const [p2UserId, setP2UserId]       = useState<number | null>(null);
  const [p2DisplayName, setP2DisplayName] = useState("");
  const [p2ArmyOptions, setP2ArmyOptions] = useState<string[]>([]);
  const [p2StatusMsg, setP2StatusMsg] = useState("");
  const [p2Logging, setP2Logging]     = useState(false);

  // Limits / delays
  const [maxGold, setMaxGold]     = useState("No limits");
  const [maxWeight, setMaxWeight] = useState("No limits");
  const [maxPower, setMaxPower]   = useState("No limits");
  const [microDelay, setMicroDelay] = useState(200);
  const [macroDelay, setMacroDelay] = useState(500);
  const [localRecord, setLocalRecord] = useState<any[]>([]);
  const [liveRecord, setLiveRecord] = useState<any[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTurnText, setCurrentTurnText] = useState("");
  const [combatResult, setCombatResult] = useState<CombatResultInfo | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logBoxRef = useRef<HTMLDivElement>(null);
  const [showCover, setShowCover] = useState(true);

  const MICRO_PRESETS = [0, 100, 200, 500, 1000];
  const MACRO_PRESETS = [0, 200, 500, 1000, 2000];
  const limits = ["No limits", "10,000 Max", "15,000 Max", "20,000 Max", "30,000 Max", "40,000 Max", "50,000 Max"];

  useEffect(() => { if (userId === null) navigate("/"); }, [userId]);

  // Reload p1 armies whenever userId or any limit changes
  useEffect(() => {
    if (!userId) return;
    loadFilteredArmies(userId, maxGold, maxWeight, maxPower).then(names => {
      setP1ArmyOptions(names);
      setArmy1(prev => names.includes(prev) ? prev : (names[0] ?? ""));
      if (mode === "vs-computer") {
        setArmy2(prev => names.includes(prev) ? prev : (names[0] ?? ""));
      }
    });
  }, [userId, maxGold, maxWeight, maxPower, mode]);

  // Reload p2 armies whenever p2UserId or any limit changes
  useEffect(() => {
    if (!p2UserId) { setP2ArmyOptions([]); return; }
    loadFilteredArmies(p2UserId, maxGold, maxWeight, maxPower).then(names => {
      setP2ArmyOptions(names);
      setArmy2(prev => names.includes(prev) ? prev : (names[0] ?? ""));
    });
  }, [p2UserId, maxGold, maxWeight, maxPower]);

  useEffect(() => {
    if (canvasRef.current) BEGIN_ANIMATION(canvasRef.current);
  }, []);

  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [liveRecord]);

  const applyMicroDelay = (ms: number) => { setMicroDelay(ms); SET_MICRO_DELAY(ms); };
  const applyMacroDelay = (ms: number) => { setMacroDelay(ms); SET_MACRO_DELAY(ms); };

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setPvpStep("p1-army");
    setP2Username(""); setP2Password("");
    setP2UserId(null); setP2DisplayName("");
    setP2ArmyOptions([]); setP2StatusMsg("");
    setArmy2(p1ArmyOptions[0] ?? "");
  }

  async function handleP2Login() {
    if (!p2Username.trim()) { setP2StatusMsg("Username is required."); return; }
    if (!p2Password.trim()) { setP2StatusMsg("Password is required."); return; }
    setP2Logging(true);
    setP2StatusMsg("");
    const result = await ATTEMPT_LOGIN(p2Username, p2Password);
    setP2Logging(false);
    if (!result.success) { setP2StatusMsg(result.message); return; }
    if (result.userId === userId) { setP2StatusMsg("Player 2 must be a different player."); return; }
    const p2Id   = result.userId!;
    const p2Name = result.userData?.username ?? p2Username;
    setP2UserId(p2Id);
    setP2DisplayName(p2Name);
    setPvpStep("p2-army");
    // p2ArmyOptions and army2 are set by the [p2UserId, maxGold, maxWeight, maxPower] effect
  }

  async function recordBattle(outcome: "player1" | "player2" | "draw" | "both-lose", p2Id: number | null, p2Name: string) {
    try {
      await db.battleHistory.add({
        date: new Date().toISOString(),
        mode,
        player1Id: userId!,
        player1Name: username!,
        player1ArmyName: army1,
        player2Id: p2Id,
        player2Name: p2Name,
        player2ArmyName: army2,
        result: outcome,
      });
    } catch (e) {
      console.error("Failed to record battle:", e);
    }
  }

  async function simulateCombat() {
    // Unlock Web Audio from the user-gesture scope (synchronous, before any await)
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const audioCtx = new AudioCtx();
      audioCtx.resume().catch(() => {});  // ensure it is in 'running' state
      SET_AUDIO_CONTEXT(audioCtx);
    }

    setShowCover(false);
    const army1Data = await db.armies.where("[userId+name]").equals([userId!, army1]).first();
    const a2UserId  = mode === "vs-player" ? p2UserId! : userId!;
    const army2Data = await db.armies.where("[userId+name]").equals([a2UserId, army2]).first();
    if (!army1Data || !army2Data) { alert("Armies not found"); return; }

    const parseLimit = (l: string) => l === "No limits" ? null : parseInt(l.replace(" Max", "").replace(",", ""));
    const settings = {
      maxGold: parseLimit(maxGold), maxWeight: parseLimit(maxWeight), maxPower: parseLimit(maxPower),
      maxGoldSelection: maxGold, maxWeightSelection: maxWeight, maxPowerSelection: maxPower,
      playerName: username ?? "Player 1",
    };

    const result = await BEGIN_COMBAT(army1Data.id, army2Data.id, settings);
    if (result.success) {
      const record = result.combatRecord || [];
      setLocalRecord(record);
      dispatch(clearLog());
      dispatch(addLogEntry("Battle ID: " + result.battleId));
      dispatch(setCombatRecord(record));

      const p2Id   = mode === "vs-player" ? p2UserId   : null;
      const p2Name = mode === "vs-player" ? p2DisplayName : "Computer";

      const { outcome, victoryType } = detectOutcome(record);
      await recordBattle(outcome, p2Id, p2Name);
      await UPDATE_BATTLE_RESULT(outcome, userId!, p2Id);

      // Load updated ranks (recalculated by UPDATE_BATTLE_RESULT) and store in Redux
      const p1Profile = await db.profiles.get(userId!);
      const p1Rank = p1Profile?.stats?.rank ?? "Ensign";
      let p2Rank = "";
      if (p2Id !== null) {
        const p2Profile = await db.profiles.get(p2Id);
        p2Rank = p2Profile?.stats?.rank ?? "Ensign";
      }
      dispatch(setCombatMeta({ mode, p1Name: username ?? "Player 1", p1Rank, p2Name, p2Rank, outcome, victoryType }));

      const p1Name = username ?? "Player 1";
      const TURN_START_RE = /^\[INFO\] Bot \d+ \(army (\d+), "(.+)"\) begins turn/;

      setCurrentTurnText("");
      setLiveRecord([]);
      setIsAnimating(true);
      if (canvasRef.current) {
        if (result.initialMapState) {
          await REPLAY_COMBAT_RECORD(canvasRef.current, record, result.initialMapState,
            (entry: any) => {
              setLiveRecord(prev => [...prev, entry]);
              if (typeof entry === "string") {
                const m = entry.match(TURN_START_RE);
                if (m) {
                  const armyNum = parseInt(m[1]);
                  const botName = m[2];
                  const playerName = armyNum === 1 ? p1Name : p2Name;
                  setCurrentTurnText(`${playerName}   ${botName}`);
                }
              }
            }
          );
        } else {
          await BEGIN_ANIMATION(canvasRef.current);
        }
        // Wait for one more paint so the final canvas frame is visible before the dialog opens
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      }
      setIsAnimating(false);
      setCurrentTurnText("Game Over");
      setCombatResult({
        outcome,
        victoryType,
        winnerName: outcome === "player1" ? p1Name : outcome === "player2" ? p2Name : "",
        loserName:  outcome === "player1" ? p2Name : outcome === "player2" ? p1Name : "",
        p1Name,
        p1Rank,
        p2Name,
        p2Rank,
        mode,
      });
    } else {
      alert(result.message);
    }
  }

  const renderDropdown = (label: string, value: string, setValue: (v: string) => void, options: string[]) => (
    <FormControl fullWidth sx={{ mb: 2, textAlign: "left" }}>
      {label && (
        <Typography sx={{ color: "white", fontWeight: "bold", mb: "4px", fontSize: "12pt" }}>
          {label}
        </Typography>
      )}
      <Select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        sx={{
          bgcolor: "white", fontFamily: "Courier New", fontSize: "12pt",
          "& .MuiSelect-select": { fontWeight: "bold", height: "24px", paddingTop: 0, paddingBottom: 0, display: "flex", alignItems: "center", color: "black" },
          "& .MuiOutlinedInput-root": { height: "24px" },
        }}
        MenuProps={{ PaperProps: { sx: { bgcolor: "white", "& .MuiMenuItem-root": { fontWeight: "bold", height: "24px", display: "flex", alignItems: "center", color: "black" } } } }}
      >
        {options.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
      </Select>
    </FormControl>
  );

  function renderSpeedControls() {
    return (
      <>
        <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "11pt", mb: "4px", mt: 1 }}>Micro Delay:</Typography>
        <Box sx={{ display: "flex", gap: "4px", mb: 1, flexWrap: "wrap" }}>
          {MICRO_PRESETS.map(ms => (
            <Button key={ms} variant="contained" onClick={() => applyMicroDelay(ms)}
              sx={{ ...delayBtnStyle, bgcolor: microDelay === ms ? "#0044cc" : "darkblue", border: microDelay === ms ? "2px solid white" : "2px solid gray" }}>
              {ms === 0 ? "0" : `${ms / 1000}s`}
            </Button>
          ))}
        </Box>
        <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "11pt", mb: "4px" }}>Macro Delay:</Typography>
        <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {MACRO_PRESETS.map(ms => (
            <Button key={ms} variant="contained" onClick={() => applyMacroDelay(ms)}
              sx={{ ...delayBtnStyle, bgcolor: macroDelay === ms ? "#0044cc" : "darkblue", border: macroDelay === ms ? "2px solid white" : "2px solid gray" }}>
              {ms === 0 ? "0" : `${ms / 1000}s`}
            </Button>
          ))}
        </Box>
      </>
    );
  }

  function renderVsComputerRight() {
    return (
      <>
        <Button variant="contained" sx={{ ...rightButtonStyle, mb: 3 }} onClick={simulateCombat} disabled={!army1 || !army2}>
          Begin Combat
        </Button>
        {renderDropdown("Army 1:", army1, setArmy1, p1ArmyOptions)}
        {renderDropdown("Army 2:", army2, setArmy2, p1ArmyOptions)}
        {renderSpeedControls()}
      </>
    );
  }

  function renderVsPlayerRight() {
    if (pvpStep === "p1-army") {
      return (
        <Box>
          <Typography sx={playerHeaderStyle("#88ccff")}>PLAYER 1: {username}</Typography>
          <Typography sx={stepLabelStyle}>Select your army:</Typography>
          {renderDropdown("", army1, setArmy1, p1ArmyOptions)}
          {p1ArmyOptions.length === 0 && (
            <Typography sx={warnStyle}>You have no armies yet. Build one first.</Typography>
          )}
          <Button variant="contained" sx={rightButtonStyle} onClick={() => setPvpStep("p2-login")} disabled={!army1}>
            Continue → Player 2 Login
          </Button>
        </Box>
      );
    }

    if (pvpStep === "p2-login") {
      return (
        <Box>
          <Typography sx={playerHeaderStyle("#ffcc88")}>PLAYER 2 LOGIN</Typography>
          <Typography sx={stepLabelStyle}>Username:</Typography>
          <TextField fullWidth value={p2Username} onChange={e => setP2Username(e.target.value)}
            inputProps={{ maxLength: 30, style: { fontFamily: "Courier New", fontSize: "12pt", color: "#111" } }}
            sx={{ ...textFieldStyle, mb: 1 }} />
          <Typography sx={stepLabelStyle}>Password:</Typography>
          <TextField type="password" fullWidth value={p2Password} onChange={e => setP2Password(e.target.value)}
            inputProps={{ maxLength: 30, style: { fontFamily: "Courier New", fontSize: "12pt", color: "#111" } }}
            sx={{ ...textFieldStyle, mb: 2 }} />
          {p2StatusMsg && <Typography sx={warnStyle}>{p2StatusMsg}</Typography>}
          <Button variant="contained" sx={rightButtonStyle} onClick={handleP2Login} disabled={p2Logging}>
            {p2Logging ? "Logging in..." : "Login as Player 2"}
          </Button>
          <Button variant="contained" sx={{ ...rightButtonStyle, bgcolor: "#333", mt: 1, "&:hover": { bgcolor: "#444" } }}
            onClick={() => setPvpStep("p1-army")}>
            ← Back
          </Button>
        </Box>
      );
    }

    if (pvpStep === "p2-army") {
      return (
        <Box>
          <Typography sx={playerHeaderStyle("#ffcc88")}>PLAYER 2: {p2DisplayName}</Typography>
          <Typography sx={stepLabelStyle}>Select your army:</Typography>
          {p2ArmyOptions.length === 0 ? (
            <Typography sx={warnStyle}>Player 2 has no armies. They must build one first.</Typography>
          ) : (
            renderDropdown("", army2, setArmy2, p2ArmyOptions)
          )}
          <Button variant="contained" sx={rightButtonStyle} onClick={simulateCombat}
            disabled={!army2 || p2ArmyOptions.length === 0}>
            Begin Combat
          </Button>
          <Button variant="contained" sx={{ ...rightButtonStyle, bgcolor: "#333", mt: 1, "&:hover": { bgcolor: "#444" } }}
            onClick={() => setPvpStep("p2-login")}>
            ← Back
          </Button>
          {renderSpeedControls()}
        </Box>
      );
    }

    return null;
  }

  return (
    <Box sx={{ height: "100vh", width: "100vw", bgcolor: "#111", display: "flex", flexDirection: "column", alignItems: "center", pt: 4 }}>
      <Typography variant="h3" sx={{ fontFamily: "Ebrima", fontWeight: "bold", fontSize: "30pt", color: "white", mb: 2 }}>
        COMBAT - BOT WARS
      </Typography>

      {/* Main layout */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 4, alignItems: "flex-start", width: "90%" }}>
        {/* LEFT: limits + combat record */}
        <Box sx={{ width: "100%" }}>
          {renderDropdown("Max Gold:", maxGold, setMaxGold, limits)}
          {renderDropdown("Max Weight:", maxWeight, setMaxWeight, limits)}
          {renderDropdown("Max Power:", maxPower, setMaxPower, limits)}
          <Box ref={logBoxRef} sx={{ width: "95%", height: "280px", bgcolor: "#222", border: "2px solid gray", mt: 1, p: 1, overflowY: "auto", fontFamily: "Courier New", fontSize: "10pt", fontWeight: "bold", color: "white", textAlign: "left" }}>
            {SHOW_COMBAT_RECORD === "TRUE" ? (() => {
              const displayRecord = isAnimating ? liveRecord : localRecord;
              return displayRecord.length > 0 ? (
                displayRecord.map((rec, i) =>
                  typeof rec === "string"
                    ? <div key={i} style={{ marginBottom: "2px" }}>{rec}</div>
                    : <div key={i} style={{ marginBottom: "6px", borderBottom: "1px solid #444", paddingBottom: "4px" }}>
                        {Object.entries(rec).map(([k, v]) => <div key={k}>{k}: {typeof v === "object" ? JSON.stringify(v) : String(v)}</div>)}
                      </div>
                )
              ) : "Combat Record will appear here when combat begins";
            })() : "Combat Record display disabled"}
          </Box>
        </Box>

        {/* CENTER: canvas with cover overlay + turn indicator */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Box sx={{ position: "relative", display: "inline-block" }}>
            <canvas ref={canvasRef} width={433} height={433} style={{ border: "2px solid gray", display: "block" }} />
            {showCover && (
              <Box
                component="img"
                src="/Graphics/ComBatMapCover3.png"
                alt=""
                onClick={() => window.open("https://jaypalmerbooks.com", "_blank")}
                sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "block", cursor: "pointer" }}
              />
            )}
          </Box>
          <Typography sx={{
            fontFamily: "Courier New", fontSize: "14pt", fontWeight: "bold",
            color: "white", mt: 1, minHeight: "1.6em", textAlign: "center", width: "100%",
          }}>
            {currentTurnText}
          </Typography>
        </Box>

        {/* RIGHT: mode controls */}
        <Box sx={{ width: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography sx={{ color: "white", fontFamily: "Courier New", fontSize: "12pt", fontWeight: "bold", whiteSpace: "nowrap" }}>
              Mode:
            </Typography>
            <Select
              value={mode}
              onChange={(e) => switchMode(e.target.value as Mode)}
              size="small"
              sx={{
                bgcolor: "white", fontFamily: "Courier New", fontSize: "12pt", fontWeight: "bold",
                flex: 1,
                "& .MuiSelect-select": { color: "black", py: "4px" },
              }}
              MenuProps={{ PaperProps: { sx: { bgcolor: "white", "& .MuiMenuItem-root": { fontFamily: "Courier New", fontWeight: "bold", color: "black" } } } }}
            >
              <MenuItem value="vs-computer">Player vs Computer</MenuItem>
              <MenuItem value="vs-player">Player vs Player</MenuItem>
            </Select>
          </Box>
          {mode === "vs-computer" ? renderVsComputerRight() : renderVsPlayerRight()}
        </Box>
      </Box>

      {/* Bottom buttons */}
      <Box sx={{ position: "absolute", bottom: 30, width: "70%", display: "flex", justifyContent: "space-between" }}>
        <Button variant="contained" sx={bottomBtnStyle} onClick={() => navigate("/results")}>
          View Results
        </Button>
        <Button variant="contained" sx={bottomBtnStyle} onClick={() => navigate("/stats")}>
          View Stats
        </Button>
        <Button variant="contained" sx={bottomBtnStyle} onClick={() => navigate("/navigation")}>
          Build Bots and Armies
        </Button>
      </Box>

      {/* Post-combat result dialog */}
      <Dialog
        open={combatResult !== null}
        PaperProps={{ sx: { bgcolor: "#111", border: "2px solid #555", minWidth: "420px" } }}
      >
        <DialogTitle sx={{ fontFamily: "Ebrima", fontWeight: "bold", fontSize: "22pt", color: "white", textAlign: "center", pb: 0 }}>
          Combat Result
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", pt: 2 }}>
          {combatResult && (() => {
            const { outcome, victoryType, winnerName, loserName, p1Name, p1Rank, p2Name, p2Rank, mode } = combatResult;
            const isVsHuman = mode === "vs-player";
            const computerWins = mode === "vs-computer" && outcome === "player2";
            const winnerRank = outcome === "player1" ? p1Rank : p2Rank;
            const loserRank  = outcome === "player1" ? p2Rank : p1Rank;
            const winnerDisplay = computerWins ? winnerName : `${winnerRank}   ${winnerName}`;
            const loserIsComputer = mode === "vs-computer" && outcome === "player1";
            const loserDisplay  = loserIsComputer ? loserName : `${loserRank}   ${loserName}`;

            if (outcome === "both-lose") return (
              <>
                <Typography sx={resultHeadStyle("#ff8888")}>Both Armies Destroyed!</Typography>
                <Typography sx={resultSubStyle}>No survivors on either side.</Typography>
                <Typography sx={{ ...resultSubStyle, color: "#aaa", mt: 1 }}>
                  {isVsHuman
                    ? `${p1Rank}   ${p1Name}   vs   ${p2Rank}   ${p2Name}`
                    : `${p1Rank}   ${p1Name}   vs   Computer`
                  }
                </Typography>
              </>
            );
            if (outcome === "draw") return (
              <>
                <Typography sx={resultHeadStyle("#ffdd88")}>Draw!</Typography>
                <Typography sx={resultSubStyle}>Neither army could claim victory.</Typography>
                <Typography sx={{ ...resultSubStyle, color: "#aaa", mt: 1 }}>
                  {isVsHuman
                    ? `${p1Rank}   ${p1Name}   vs   ${p2Rank}   ${p2Name}`
                    : `${p1Rank}   ${p1Name}   vs   Computer`
                  }
                </Typography>
              </>
            );
            return (
              <>
                <Typography sx={resultHeadStyle("lightgreen")}>{winnerDisplay} Wins!</Typography>
                <Typography sx={resultSubStyle}>{victoryType}</Typography>
                <Typography sx={{ ...resultSubStyle, color: "#aaa", mt: 1 }}>
                  Defeated: {loserDisplay}
                </Typography>
              </>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 2 }}>
          <Button onClick={() => setCombatResult(null)} sx={dialogBtnStyle}>
            Continue
          </Button>
          <Button onClick={() => { setCombatResult(null); navigate("/results"); }} sx={dialogBtnStyle}>
            View Battle Log
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const playerHeaderStyle = (color: string) => ({
  fontFamily: "Courier New", fontSize: "14pt", fontWeight: "bold",
  color, mb: 2, textAlign: "center" as const,
});
const stepLabelStyle = { color: "white", fontFamily: "Courier New", fontSize: "12pt", mb: "4px" };
const warnStyle = { color: "#ff8888", fontFamily: "Courier New", fontSize: "11pt", mb: 1 };

const textFieldStyle = {
  bgcolor: "white", borderRadius: "4px",
  "& .MuiOutlinedInput-root": { bgcolor: "white", "& fieldset": { borderColor: "#888" } },
  "& .MuiInputBase-input": { color: "#111" },
};

const rightButtonStyle = {
  bgcolor: "darkblue", border: "2px solid gray", fontFamily: "Courier New",
  fontSize: "12pt", fontWeight: "bold", color: "white", width: "100%", mb: 1,
  "&:hover": { bgcolor: "#001a66" },
};

const bottomBtnStyle = {
  bgcolor: "darkblue", border: "2px solid gray", fontFamily: "Courier New",
  fontSize: "14pt", fontWeight: "bold", color: "white", width: "30%",
  "&:hover": { bgcolor: "#001a66" },
};

const delayBtnStyle = {
  fontFamily: "Courier New", fontSize: "10pt", fontWeight: "bold", color: "white",
  minWidth: "42px", height: "32px", padding: "0 6px", "&:hover": { bgcolor: "#0033aa" },
};

const resultHeadStyle = (color: string) => ({
  fontFamily: "Ebrima", fontWeight: "bold", fontSize: "20pt", color, mb: 1,
});
const resultSubStyle = {
  fontFamily: "Courier New", fontSize: "13pt", color: "white",
};
const dialogBtnStyle = {
  bgcolor: "darkblue", border: "2px solid gray", fontFamily: "Courier New",
  fontSize: "12pt", fontWeight: "bold", color: "white", px: 3,
  "&:hover": { bgcolor: "#001a66" },
};
