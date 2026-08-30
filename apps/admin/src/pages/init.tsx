import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import Cookies from "js-cookie";
import axios from "axios";
import { purchasedCoursesState } from "store";

interface InitUserProps {
  apiUrl: string;
  role: any;
}

export default function InitUser({ apiUrl, role }: InitUserProps) {
  const setUser = useSetRecoilState(role);
  const setPurchased = useSetRecoilState(purchasedCoursesState);

  useEffect(() => {
    async function init() {
      const token = Cookies.get("token");

      if (!token) {
        setUser({
          userName: null,
          isLoading: false,
        });
        setPurchased({
          courses: [],
          isLoading: false,
        });
        return;
      }

      try {
        const res = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser({
          userName: res.data.name,
          isLoading: false,
        });

        if (res.data.courses) {
          setPurchased({
            courses: res.data.courses,
            isLoading: false,
          });
        }
      } catch {
        Cookies.remove("token");

        setUser({
          userName: null,
          isLoading: false,
        });
        setPurchased({
          courses: [],
          isLoading: false,
        });
      }
    }

    init();
  }, [setUser, setPurchased, apiUrl, role]);

  return null;
}