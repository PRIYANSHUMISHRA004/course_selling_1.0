import { atom } from "recoil";
import { CourseFormat } from "../types/Courseformat";

export interface PurchasedCoursesState {
  courses: CourseFormat[];
  isLoading: boolean;
}

export const purchasedCoursesState = atom<PurchasedCoursesState>({
  key: "purchasedCoursesState",
  default: {
    courses: [],
    isLoading: true,
  },
});
