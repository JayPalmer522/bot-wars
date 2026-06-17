import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  userId: number | null;
  username: string | null;
}

const authSlice = createSlice({
  name: "auth",
  initialState: { userId: null, username: null } as AuthState,
  reducers: {
    setCurrentUser(state, action: PayloadAction<{ userId: number; username: string }>) {
      state.userId = action.payload.userId;
      state.username = action.payload.username;
    },
    clearCurrentUser(state) {
      state.userId = null;
      state.username = null;
    },
  },
});

export const { setCurrentUser, clearCurrentUser } = authSlice.actions;
export default authSlice.reducer;
