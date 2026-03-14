import { configureStore, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const loginSlice = createSlice({
  name: "login",
  initialState: false as boolean,
  reducers: {
    login() {
      return true;
    },
    logout() {
      return false;
    },
    // 앱 시작 시 토큰 있으면 true/없으면 false로 세팅할 때 사용
    setLogin(_state, action: PayloadAction<boolean>) {
      return action.payload;
    },
  },
});

const store = configureStore({
  reducer: {
    user: loginSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
export const { login, logout, setLogin } = loginSlice.actions;