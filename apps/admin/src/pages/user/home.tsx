"use client";
import { useRecoilValue } from "recoil";
import { userState, coursesState, purchasedCoursesState } from "store";
import { CourseFormat } from "store";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  ArrowRightIcon,
  PlayCircleIcon,
  CodeIcon,
  BrainIcon,
  TreeIcon,
  DatabaseIcon,
  WebIcon,
  SchoolIcon,
  TrendingUpIcon,
} from "ui";

// ─── Category Data ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "Web Development", icon: <WebIcon className="w-4 h-4" />,      color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100" },
  { label: "AI",              icon: <BrainIcon className="w-4 h-4" />,    color: "text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100" },
  { label: "DSA",             icon: <TreeIcon className="w-4 h-4" />,     color: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
  { label: "Backend",         icon: <DatabaseIcon className="w-4 h-4" />, color: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100" },
  { label: "Frontend",        icon: <CodeIcon className="w-4 h-4" />,     color: "text-pink-600 bg-pink-50 border-pink-200 hover:bg-pink-100" },
];

// ─── Inline SVG fallback ──────────────────────────────────────────────────────
const PLACEHOLDER_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='180' viewBox='0 0 300 180'%3E%3Crect width='300' height='180' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='13' fill='%2394a3b8'%3ENo Image Available%3C/text%3E%3C/svg%3E";

// ─── Greeting helper ──────────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Featured Course Card ─────────────────────────────────────────────────────
function FeaturedCard({ course, onClick }: { course: CourseFormat; onClick: (id: string) => void }) {
  return (
    <div className="w-[280px] shrink-0 rounded-2xl bg-white border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl shadow-sm">
      <img
        src={course.imageLink || PLACEHOLDER_SRC}
        alt={course.title}
        className="w-full h-40 object-cover shrink-0"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SRC;
        }}
      />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-1">
            {course.title}
          </h3>
          <p className="text-sm font-semibold text-slate-600 mb-2">
            ₹{course.price}
          </p>
          <span
            className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
              course.published
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {course.published ? "Published" : "Draft"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onClick(course._id)}
          className="w-full mt-4 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
        >
          View Course
        </button>
      </div>
    </div>
  );
}

// ─── Continue Learning Card ───────────────────────────────────────────────────
function ContinueCard({
  course,
  onClick,
}: {
  course: CourseFormat;
  onClick: (id: string) => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3.5">
        {/* Thumbnail */}
        <img
          src={course.imageLink || PLACEHOLDER_SRC}
          alt={course.title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SRC;
          }}
          className="w-16 h-16 rounded-xl object-cover shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 truncate mb-2">
            {course.title}
          </h3>

          <button
            type="button"
            onClick={() => onClick(course._id)}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <span>Continue Course</span>
            <ArrowRightIcon className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserHome() {
  const router = useRouter();
  const user = useRecoilValue(userState);
  const { courses: featuredCourses } = useRecoilValue(coursesState);
  const { courses: myCourses } = useRecoilValue(purchasedCoursesState);

  const displayName = user.userName
    ? user.userName.charAt(0).toUpperCase() + user.userName.slice(1)
    : "Learner";

  function goToCourse(id: string) {
    router.push(`/user/course/${id}`);
  }

  return (
    <>
      <Head>
        <title>Home — Coursecean</title>
        <meta name="description" content="Your personalised learning dashboard on Coursecean." />
      </Head>

      <div className="bg-slate-50 min-h-screen pb-16">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-blue-950 via-blue-800 to-purple-900 text-white pt-12 md:pt-16 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-extrabold text-base">
                {displayName.charAt(0)}
              </div>
              <span className="text-sm font-medium text-blue-100">
                👋 Welcome back, {displayName}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-3">
              {getGreeting()}!<br />
              Continue your learning journey.
            </h1>

            <p className="text-sm sm:text-base text-blue-100/80 mb-8 max-w-lg leading-relaxed">
              Explore thousands of courses taught by industry experts and level up your skills today.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push("/user/courses")}
                className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-blue-50 text-blue-900 font-bold rounded-2xl text-sm shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all"
              >
                <span>Browse Courses</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>

              {myCourses.length > 0 && (
                <button
                  type="button"
                  onClick={() => router.push("/user/mycourses")}
                  className="flex items-center gap-2 px-6 py-3.5 border border-white/40 hover:border-white hover:bg-white/10 text-white font-semibold rounded-2xl text-sm transition-all"
                >
                  <PlayCircleIcon className="w-4 h-4" />
                  <span>My Learning</span>
                </button>
              )}
            </div>
          </div>

          {/* Decorative ambient blobs */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>
          <div className="absolute right-40 bottom-0 w-60 h-60 rounded-full bg-blue-400/10 blur-2xl pointer-events-none"></div>
        </div>

        {/* ── Categories ─────────────────────────────────────────────────── */}
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">
            Categories
          </h2>

          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map(({ label, icon, color }) => (
              <button
                key={label}
                type="button"
                onClick={() => router.push("/user/courses")}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl font-semibold text-xs transition-all hover:-translate-y-0.5 shadow-sm ${color}`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div> */}

        {/* ── Featured Courses ────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Featured Courses
            </h2>
            <button
              type="button"
              onClick={() => router.push("/user/courses")}
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>View all</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          {featuredCourses.length === 0 ? (
            /* Empty state */
            <div className="bg-white border border-dashed border-slate-200 rounded-3xl py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <SchoolIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-500">
                No courses available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-none">
              {featuredCourses.slice(0, 6).map((course) => (
                <FeaturedCard key={course._id} course={course} onClick={goToCourse} />
              ))}
            </div>
          )}
        </div>

        {/* ── Continue Learning ───────────────────────────────────────────── */}
        {myCourses.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Continue Learning
                </h2>
              </div>
              {myCourses.length > 3 && (
                <button
                  type="button"
                  onClick={() => router.push("/user/mycourses")}
                  className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  <span>View all</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCourses.slice(0, 3).map((course) => (
                <ContinueCard
                  key={course._id}
                  course={course}
                  onClick={goToCourse}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state when no purchased courses ──────────────────────── */}
        {myCourses.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-3xl p-8 sm:p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
                <PlayCircleIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Start your learning journey
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                You haven't enrolled in any courses yet. Browse our catalogue and find something you love!
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/user/courses")}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all"
                >
                  <span>Browse Courses</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}