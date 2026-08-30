import { useMemo } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { useRecoilValue } from "recoil";
import { userState, coursesState, purchasedCoursesState } from "store";
import Head from "next/head";

const PLACEHOLDER_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='180' viewBox='0 0 300 180'%3E%3Crect width='300' height='180' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='13' fill='%2394a3b8'%3ENo Image Available%3C/text%3E%3C/svg%3E";

export default function CoursesPage() {
  const router = useRouter();
  const user = useRecoilValue(userState);


  const { courses } = useRecoilValue(coursesState);
  const { courses: purchasedCourses } = useRecoilValue(purchasedCoursesState);

  // Derive the set of purchased IDs for O(1) lookup
  const purchasedIds = useMemo(
    () => new Set(purchasedCourses.map((c) => c._id)),
    [purchasedCourses]
  );

  function handleBuy(courseId: string) {
    const token = Cookies.get("token");
    if (!token) {
      // Guest — redirect to login
      router.push("/user/login");
      return;
    }
    router.push(`/user/course/${courseId}`);
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
          <div className="flex flex-wrap justify-center gap-6">
            {courses.map((course, i) => {
              const isPurchased = purchasedIds.has(course._id);

              return (
                <div
                  key={course._id ?? i}
                  className="w-[300px] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <img
                    src={course.imageLink || PLACEHOLDER_SRC}
                    alt={course.title}
                    className="w-full h-[180px] object-cover shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SRC;
                    }}
                  />

                  <div className="p-4 pb-0 flex-1">
                    <h3 className="text-lg font-bold text-slate-800 text-center line-clamp-2">
                      {course.title}
                    </h3>

                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-base font-semibold text-slate-900">
                        ₹{course.price}
                      </span>

                      {isPurchased && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Purchased
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Push button to bottom so cards align in the same row */}
                  <div className="p-4 mt-auto">
                    {isPurchased ? (
                      <button
                        type="button"
                        onClick={() => router.push(`/user/course/${course._id}`)}
                        className="w-full py-2 px-4 border border-emerald-600 hover:bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl transition-colors"
                      >
                        Continue Learning
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBuy(course._id)}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                      >
                        Buy Course
                      </button>
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
