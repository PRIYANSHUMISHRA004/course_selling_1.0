import axios from "axios";
import { Login, SchoolIcon, SpeedIcon, UserBadgeIcon } from "ui";
import { userData, adminState } from "store";
import { useSetRecoilState } from "recoil";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useSetRecoilState(adminState);

  async function onClick(data: userData): Promise<void> {
    try {
      const res = await axios.post("/api/admin/signin", data);
      const { name, token } = res.data;

      if (name) {
        setUser({
          userName: name,
          isLoading: false,
        });

        Cookies.set("token", token, {
          expires: 1,
        });

        router.push("/admin");
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
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-slate-50">
      {/* Left Column: Return Instructors Panel */}
      <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 text-white p-12 lg:p-16">
        <div className="max-w-md mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <SchoolIcon className="w-8 h-8 text-blue-300" />
            </div>
            <span className="text-3xl font-black tracking-tight">
              Coursecean
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
              Welcome back, Instructor!
            </h1>
            <p className="text-slate-300 leading-relaxed text-sm lg:text-base">
              Pick up right where you left off. Log in to manage your students, review course analytics, publish new content, and customize your learning paths.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <SpeedIcon className="w-5 h-5 text-blue-300" />
              </div>
              <span className="text-sm font-semibold text-slate-200">
                Instant analytics & course publishing
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <UserBadgeIcon className="w-5 h-5 text-blue-300" />
              </div>
              <span className="text-sm font-semibold text-slate-200">
                Manage all your students from one central workspace
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Login Card */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <Login onClick={onClick} />
      </div>
    </div>
  );
}
