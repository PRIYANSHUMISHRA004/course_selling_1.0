import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useRecoilState, useRecoilValue } from "recoil";
import { coursesState, purchasedCoursesState } from "store";
import Head from "next/head";

const PLACEHOLDER_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='180' viewBox='0 0 300 180'%3E%3Crect width='300' height='180' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='13' fill='%2394a3b8'%3ENo Image Available%3C/text%3E%3C/svg%3E";

export default function CoursesPage() {
  const router = useRouter();
  const [coursesData, setCoursesData] = useRecoilState(coursesState);
  const { courses: purchasedCourses } = useRecoilValue(purchasedCoursesState);
  const [loading, setLoading] = useState(coursesData.isLoading);

  useEffect(() => {
    async function fetchLatestCourses() {
      try {
        const res = await axios.get("/api/user/courses");
        setCoursesData({
          courses: res.data.courses || [],
          isLoading: false,
        });
      } catch (err) {
        console.error("Failed to fetch user courses:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLatestCourses();
  }, [setCoursesData]);

  const courses = coursesData.courses;

  function openCourseDetails(courseId: string) {
    router.push(`/user/course/${courseId}`);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-slate-500 font-medium">
        Loading courses...
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-slate-500 font-medium">
        Radhe Radhe, No Courses Available
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Courses | Coursecean</title>
      </Head>

      <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap  gap-6">
            {courses.map((course, i) => {
              const isPurchased = purchasedCourses.some((c) => c._id === course._id);

              return (
                <div
                  key={course._id ?? i}
                  onClick={() => openCourseDetails(course._id)}
                  className="w-[280px] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col "
                >
                  <img
                    src={course.imageLink || PLACEHOLDER_SRC}
                    alt={course.title}
                    className="w-full h-[180px] object-cover shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SRC;
                    }}
                  />

                  <div className="p-4 flex-1 flex flex-col justify-between ">
                    <h3 className="text-base font-bold text-slate-800 line-clamp-2 flex justify-center">
                      {course.title}
                    </h3>

                    {isPurchased && (
                      <div className="mt-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex justify-center">
                          Enrolled
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
