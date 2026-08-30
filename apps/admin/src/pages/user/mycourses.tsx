import { useRouter } from "next/router";
import { useRecoilValue } from "recoil";
import { purchasedCoursesState } from "store";
import { SchoolIcon, PlayCircleOutlineIcon } from "ui";
import { CourseFormat } from "store";
import Head from "next/head";

// ── Inline placeholder SVG ──────────────────────────────────────────────────
const PLACEHOLDER_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='160' viewBox='0 0 280 160'%3E%3Crect width='280' height='160' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

// ── Vertical course card (matching Courses page design) ────────────────────
function LearningCard({
  course,
  onClick,
}: {
  course: CourseFormat;
  onClick: (id: string) => void;
}) {
  return (
    <div className="w-[300px] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
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
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Purchased
          </span>
        </div>
      </div>

      <div className="p-4 mt-auto">
        <button
          type="button"
          onClick={() => onClick(course._id)}
          className="w-full py-2 px-4 border border-emerald-600 hover:bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl transition-colors"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
}

export default function MyLearningPage() {
  const { courses } = useRecoilValue(purchasedCoursesState);
  const router = useRouter();

  function onClick(courseid: string) {
    router.push(`/user/course/${courseid}`);
  }

  return (
    <>
      <Head>
        <title>My Learning | Coursecean</title>
      </Head>

      <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {courses.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white border border-slate-200 rounded-3xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <SchoolIcon className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                Radhe Radhe, You haven&apos;t purchased any courses yet.
              </h2>
              <p className="text-sm text-slate-500 max-w-sm">
                Explore our rich library of courses and enroll to start your learning journey.
              </p>
              <button
                type="button"
                onClick={() => router.push("/user/courses")}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            /* Populated state */
            <div>
              <div className="flex items-baseline gap-2 mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                  My Learning
                </h1>
                <span className="text-sm text-slate-500 font-medium">
                  ({courses.length} {courses.length === 1 ? "course" : "courses"})
                </span>
              </div>

              <div className="flex flex-wrap justify-center gap-6">
                {courses.map((course, i) => (
                  <LearningCard key={course._id ?? i} course={course} onClick={onClick} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
