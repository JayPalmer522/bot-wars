import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BattleLogState {
  log: string[];
  combatRecord: object[];
}

const initialState: BattleLogState = {
  log: [],
  combatRecord: [],
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
  },
});

export const { addLogEntry, clearLog, setCombatRecord } = battleLogSlice.actions;
export default battleLogSlice.reducer;
