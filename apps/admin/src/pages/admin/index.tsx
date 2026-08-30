import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { adminState, coursesState } from "store";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  Coursecard,
  AddIcon,
  ArrowRightIcon,
  SchoolIcon,
} from "ui";

// Helper: returns a time-based greeting with emoji
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning ☀️";
  if (hour >= 12 && hour < 17) return "Good Afternoon 🌤️";
  if (hour >= 17 && hour < 21) return "Good Evening 🌆";
  return "Good Night 🌙";
}

// Helper: capitalizes the first letter of a string; falls back to "Admin"
function capitalizeFirst(str: string | null | undefined): string {
  if (!str) return "Admin";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function Home() {
  const admin = useRecoilValue(adminState);
  const [coursesData, setCoursesData] = useRecoilState(coursesState);
  const router = useRouter();

  useEffect(() => {
    if (!admin.userName) return;

    async function fetchCourses() {
      try {
        const token = Cookies.get("token");
        if (!token) return;

        const res = await axios.get("/api/admin/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCoursesData({
          courses: res.data.courses || [],
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch admin courses:", error);
        setCoursesData({
          courses: [],
          isLoading: false,
        });
      }
    }

    fetchCourses();
  }, [admin.userName, setCoursesData]);

  if (admin.isLoading || (admin.userName !== null && coursesData.isLoading)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (admin.userName === null) {
    return (
      <>
        <Head>
          <title>Admin Portal | Coursecean</title>
          <meta name="description" content="Welcome to the Coursecean Instructor and Administrator Portal." />
        </Head>

        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-200/50 text-center space-y-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <SchoolIcon className="w-10 h-10 text-blue-600" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Coursecean Secure Admin Portal
              </h1>
              <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
                Welcome to the central instructor command console. Log in or create an account to start designing, pricing, and publishing your online courses.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto w-full">
              <button
                type="button"
                onClick={() => router.push("/admin/login")}
                className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/25 transition-all active:scale-[0.99]"
              >
                Sign In to Portal
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/signup")}
                className="w-full py-3.5 px-6 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-sm transition-colors"
              >
                Create Account
              </button>
            </div>

            <hr className="border-slate-200 my-6" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  Curriculum Editor
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Draft comprehensive lesson contents, set flexible pricing, and manage course statuses.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  Secure console
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Access is locked behind strict JWT credentials verification keeping user profiles confidential.
                </p>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  Responsive workspace
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tailored specifically for administrative curation layout based on best-practice SaaS guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const recentCourses = [...coursesData.courses].reverse().slice(0, 3);

  return (
    <>
      <Head>
        <title>Dashboard | Admin Portal</title>
        <meta name="description" content="Manage your courses, view course catalog, and edit learning paths." />
      </Head>

      <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Hero Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {getGreeting()}, {capitalizeFirst(admin.userName)} 👋
              </h1>
              <p className="text-base sm:text-lg font-semibold text-slate-600 mt-1">
                Welcome back!
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage your courses, publish new content and grow your learning platform.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/admin/addcourses")}
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all active:scale-[0.99]"
            >
              <AddIcon className="w-5 h-5" />
              <span>Add Course</span>
            </button>
          </div>

          <hr className="border-slate-200" />

          {/* Quick Action Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: My Courses */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2 mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  My Courses
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {coursesData.courses
                    ? `You currently manage ${coursesData.courses.length} courses.`
                    : "Browse and review all course materials, descriptions, and pricing details."}
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => router.push("/admin/mycourses")}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
                >
                  View Courses
                </button>
              </div>
            </div>

            {/* Card 2: Create Course */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2 mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Create Course
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Draft a new course curriculum with customizable lessons, pricing and statuses.
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => router.push("/admin/addcourses")}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
                >
                  Add Course
                </button>
              </div>
            </div>

            {/* Card 3: Draft Courses */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2 mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Draft Courses
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Inspect, configure, and publish your draft materials to student catalog.
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => router.push("/admin/mycourses")}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Recent Courses Section */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Recent Courses
            </h2>

            {coursesData.courses.length === 0 ? (
              /* Empty State */
              <div className="p-8 sm:p-16 text-center rounded-3xl bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <SchoolIcon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  You haven't created any courses yet.
                </h3>
                <button
                  type="button"
                  onClick={() => router.push("/admin/addcourses")}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all"
                >
                  <AddIcon className="w-5 h-5" />
                  <span>Create your first course</span>
                </button>
              </div>
            ) : (
              /* Course Card List */
              <div>
                <div className="flex flex-wrap justify-start gap-4">
                  <Coursecard
                    courses={recentCourses}
                    onClick={(courseId) => router.push(`/admin/course/${courseId}`)}
                  />
                </div>

                <div className="flex justify-center mt-8">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/courses")}
                    className="flex items-center gap-2 px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-xl text-sm transition-all"
                  >
                    <span>View All Courses</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}