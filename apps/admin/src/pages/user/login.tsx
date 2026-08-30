import axios from "axios";
import { Login } from "ui";
import { userData, userState } from "store";
import { useSetRecoilState } from "recoil";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useSetRecoilState(userState);

  async function onClick(data: userData): Promise<void> {
    try {
      const res = await axios.post("/api/user/signin", data);
      const { name, token } = res.data;

      console.log(`Radhe Radhe data is `, res.data);

      if (name) {
        setUser({
          userName: name,
          isLoading: false,
        });

        console.log("Setting user to:", name);

        Cookies.set("token", token, {
          expires: 1,
        });

        router.push("/user/courses");
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        alert("Authentication failed. Invalid username or password.");
      } else {
        alert("Something went wrong. Please try again.");
      }

      console.error(error);
    }
  }
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Login onClick={onClick} />
    </div>
  );
}
