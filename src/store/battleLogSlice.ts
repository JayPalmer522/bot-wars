import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BattleLogState {
  log: string[];
}

const initialState: BattleLogState = {
  log: [],
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
  },
});

export const { addLogEntry, clearLog } = battleLogSlice.actions;
export default battleLogSlice.reducer;
