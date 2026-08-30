import { selector } from "recoil";
import { userState } from "../atmos/user";
export const userEmail = selector({
  key: "userName",
  get: ({ get }) => {
    const state = get(userState);
    return state.userName;
  },
});
export const userLoading = selector({
  key: "userLoadingstate",
  get: ({ get }) => {
    const state = get(userState);
    return state.isLoading;
  },
});
