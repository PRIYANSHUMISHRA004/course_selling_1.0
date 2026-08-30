import axios from "axios";
import { Signup, SchoolIcon, RocketIcon, GlobeIcon } from "ui";
import { adminState, userSignupData } from "store";
import { useSetRecoilState } from "recoil";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

export default function SignupPage() {
  const router = useRouter();
  const setUser = useSetRecoilState(adminState);

  async function onClick(data: userSignupData): Promise<void> {
    try {
      const res = await axios.post("/api/admin/signup", data);
      const { name, token, message } = res.data;

      alert(message || "Signup successful");

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
    } catch (err: any) {
      alert(err?.response?.data?.message || "Signup failed");
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-slate-50">
      {/* Left Column: New Instructors Panel */}
      <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-12 lg:p-16">
        <div className="max-w-md mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <SchoolIcon className="w-8 h-8 text-blue-400" />
            </div>
            <span className="text-3xl font-black tracking-tight">
              Coursecean
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
              Share your knowledge with the world.
            </h1>
            <p className="text-slate-300 leading-relaxed text-sm lg:text-base">
              Join a global community of expert instructors. Create and sell comprehensive online courses, build your professional personal brand, and earn revenue from students around the globe.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <RocketIcon className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-slate-200">
                Build dynamic lessons with descriptions
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <GlobeIcon className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-slate-200">
                Reach millions of global learners looking to level up
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Signup Card */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <Signup onClick={onClick} />
      </div>
    </div>
  );
}
