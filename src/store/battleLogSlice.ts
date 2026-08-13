import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CombatMeta {
  mode: "vs-computer" | "vs-player";
  p1Name: string;
  p1Rank: string;
  p2Name: string;   // "Computer" when vs-computer
  p2Rank: string;   // "" when vs-computer
  outcome: "player1" | "player2" | "draw" | "both-lose";
  victoryType: string;
}

interface BattleLogState {
  log: string[];
  combatRecord: object[];
  combatMeta: CombatMeta | null;
}

const initialState: BattleLogState = {
  log: [],
  combatRecord: [],
  combatMeta: null,
};

const battleLogSlice = createSlice({
  name: "battleLog",
  initialState,
  reducers: {
    addLogEntry: (state, action: PayloadAction<string>) => {
      state.log.push(action.payload);
    },
    clearLog: (state) => {
      state.log = [];
    },
    setCombatRecord: (state, action: PayloadAction<object[]>) => {
      state.combatRecord = action.payload;
    },
    setCombatMeta: (state, action: PayloadAction<CombatMeta>) => {
      state.combatMeta = action.payload;
    },
  },
});

export const { addLogEntry, clearLog, setCombatRecord, setCombatMeta } = battleLogSlice.actions;
export default battleLogSlice.reducer;
