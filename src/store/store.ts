
import { configureStore } from "@reduxjs/toolkit";
import battleLogReducer from "./battleLogSlice";

export const store = configureStore({
  reducer: {
    battleLog: battleLogReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


