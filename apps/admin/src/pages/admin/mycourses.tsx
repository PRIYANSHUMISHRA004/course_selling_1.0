import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { Coursecard, AddIcon, SchoolIcon } from "ui";
import { useRouter } from "next/router";
import Head from "next/head";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          router.push("/admin/login");
          return;
        }

        const res = await axios.get("/api/admin/courses?mine=true", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCourses(res.data.courses || []);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [router]);

  function onClick(courseid: string) {
    router.push(`/admin/course/${courseid}`);
  }

  // ── Loading state ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-slate-500 font-medium">Loading courses...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Courses | Admin Portal</title>
      </Head>

      <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                My Courses
              </h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1">
                {courses.length} course{courses.length !== 1 ? "s" : ""} created by you.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/admin/addcourses")}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-sm shadow-sm shadow-blue-500/20 transition-all active:scale-[0.99]"
            >
              <AddIcon className="w-5 h-5" />
              <span>Add New Course</span>
            </button>
          </div>

          <hr className="border-slate-200" />

          {/* Courses Content */}
          {courses.length === 0 ? (
            <div className="p-8 sm:p-16 text-center rounded-3xl bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <SchoolIcon className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Radhe Radhe — You haven&apos;t created any courses yet.
              </h2>
              <p className="text-sm text-slate-500 mb-6 max-w-md">
                Create comprehensive lessons, set prices, and publish to students worldwide.
              </p>
              <button
                type="button"
                onClick={() => router.push("/admin/addcourses")}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
              >
                <AddIcon className="w-5 h-5" />
                <span>Create Course</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-start gap-4">
              <Coursecard courses={courses} onClick={onClick} />
            </div>
          )}

        </div>
      </div>
    </>
  );
}
