
import { configureStore } from "@reduxjs/toolkit";
import battleLogReducer from "./battleLogSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    battleLog: battleLogReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
