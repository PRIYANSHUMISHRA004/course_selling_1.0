import { atom } from "recoil";
import type { CourseFormat } from "../types/Courseformat";

export interface CoursesState {
  courses: CourseFormat[];
  isLoading: boolean;
}

export const coursesState = atom<CoursesState>({
  key: "coursesState",
  default: {
    courses: [],
    isLoading: true,
  },
});
