"use client";
import Link from "next/link";
import { useRecoilState } from "recoil";
import { userState, adminState } from "store";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { SchoolIcon, SearchIcon, LogoutIcon } from "./components/icons";

interface AppbarProps {
  role: "admin" | "user";
}

export function Appbar({ role }: AppbarProps) {
  const router = useRouter();
  const stateAtom = role === "admin" ? adminState : userState;
  const [user, setState] = useRecoilState(stateAtom);
  const displayName = user.userName
    ? user.userName.charAt(0).toUpperCase() + user.userName.slice(1)
    : "Learner";
  const homeRoute = `/${role}/`;
  const signupRoute = `/${role}/signup`;
  const loginRoute = `/${role}/login`;

  const handleLogout = () => {
 
    setState({
      userName: null,
      isLoading: false,
    });
   
    Cookies.remove("token");
   
    router.replace("/");
  };

  const isLoggedIn = !!user.userName;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 md:px-8 min-h-[70px]">
        {/* Left Side: Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href={homeRoute}
            className="flex items-center gap-2 no-underline"
          >
            <SchoolIcon className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
              Coursecean{role === "admin" ? " Admin" : ""}
            </span>
          </Link>

          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-6">
              {role === "user" ? (
                // ── User nav links ──────────────────────────────────────────
                <>
                  {[
                    { label: "Home",        href: "/user/home" },
                    { label: "Courses",     href: "/user/courses" },
                    { label: "My Learning", href: "/user/mycourses" },
                    { label: "About",       href: "/user/about" },
                  ].map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`text-sm font-semibold transition-colors duration-200 ${
                        router.pathname === href
                          ? "text-blue-600"
                          : "text-slate-600 hover:text-blue-600"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </>
              ) : (
                // ── Admin nav links ─────────────────────────────────────────
                <>
                  <Link
                    href={homeRoute}
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      router.pathname === homeRoute
                        ? "text-blue-600"
                        : "text-slate-600 hover:text-blue-600"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={`/${role}/mycourses`}
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      router.pathname === `/${role}/mycourses`
                        ? "text-blue-600"
                        : "text-slate-600 hover:text-blue-600"
                    }`}
                  >
                    My Courses
                  </Link>
                  <Link
                    href={`/${role}/addcourses`}
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      router.pathname === `/${role}/addcourses`
                        ? "text-blue-600"
                        : "text-slate-600 hover:text-blue-600"
                    }`}
                  >
                    Add Course
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Center: Search Bar (only when logged in) */}
        {/* {isLoggedIn && (
          <div className="hidden sm:flex items-center w-[180px] md:w-[240px] relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>
        )} */}

        {/* Right Side: Profile Info / Auth Actions */}
        <div className="flex items-center gap-5">
          {isLoggedIn ? (
            <>
              {/* User Identity */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
                  {user.userName ? user.userName.charAt(0).toUpperCase() : (role === "admin" ? "A" : "U")}
                </div>
                <div className="hidden sm:flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-slate-900 leading-tight">
                    {displayName}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded self-start ${
                      role === "admin"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {role === "admin" ? "Admin" : "User"}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 py-1 px-3 border border-slate-300 hover:border-red-400 text-slate-600 hover:text-red-600 hover:bg-red-50/50 rounded-lg text-xs font-semibold transition-colors"
              >
                <LogoutIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.push(loginRoute)}
                className="py-1.5 px-4 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => router.push(signupRoute)}
                className="py-2 px-5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition-all"
              >
                Create Account
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
