import { useState } from "react";
import type { LoginProps } from "store";
import { EyeIcon, EyeOffIcon } from "./components/icons";

export function Login({
  onClick,
  title = "Sign In",
  subtitle = "Continue to your account.",
  buttonText = "Sign In",
  signupText = "Don't have an account?",
  onSignupClick,
}: LoginProps) {
  const [username, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-[420px] bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-9 shadow-xl shadow-slate-200/50">
      <div className="space-y-6">

        {/* Header */}
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOffIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={() => onClick({ username, password })}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.99]"
        >
          {buttonText}
        </button>

        {/* Footer */}
        {onSignupClick && (
          <div className="space-y-4 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs uppercase text-slate-400 font-semibold absolute">
                or
              </span>
            </div>

            <div className="text-center text-sm text-slate-500">
              {signupText}{" "}
              <button
                type="button"
                onClick={onSignupClick}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors focus:outline-none"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
