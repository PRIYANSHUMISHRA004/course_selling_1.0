import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import Cookies from "js-cookie";
import axios from "axios";
import { adminState, userState, purchasedCoursesState } from "store";

interface InitUserProps {
  role: "admin" | "user";
}

export default function InitUser({ role }: InitUserProps) {
  const setAdmin = useSetRecoilState(adminState);
  const setUser = useSetRecoilState(userState);
  const setPurchased = useSetRecoilState(purchasedCoursesState);

  useEffect(() => {
    async function init() {
      const isUser = role === "user";
      const setRoleState = isUser ? setUser : setAdmin;
      const cookieName = isUser ? "userToken" : "adminToken";
      const apiUrl = isUser ? "/api/user/me" : "/api/admin/me";
      const token = Cookies.get(cookieName);

      if (!token) {
        setRoleState({ userName: null, isLoading: false });
        if (isUser) {
          setPurchased({ courses: [], isLoading: false });
        }
        return;
      }

      try {
        const res = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRoleState({
          userName: res.data.name,
          isLoading: false,
        });

        if (isUser && res.data.courses) {
          setPurchased({
            courses: res.data.courses,
            isLoading: false,
          });
        }
      } catch {
        Cookies.remove(cookieName);

        setRoleState({
          userName: null,
          isLoading: false,
        });
        if (isUser) {
          setPurchased({
            courses: [],
            isLoading: false,
          });
        }
      }
    }

    init();
  }, [role, setAdmin, setUser, setPurchased]);

  return null;
}