import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CourseFormat, LessonFormat, userState, purchasedCoursesState } from "store";
import { useRecoilValue, useSetRecoilState } from "recoil";
import Cookies from "js-cookie";
import Head from "next/head";
import {
  ArrowLeftIcon,
  MenuBookIcon,
} from "ui";

export default function UserCoursePage() {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState<CourseFormat | null>(null);
  const [lessons, setLessons] = useState<LessonFormat[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // ── Access Control State ────────────────────────────────────────────────────
  const user = useRecoilValue(userState);
  const { courses: purchasedCourses, isLoading: isPurchasedLoading } = useRecoilValue(purchasedCoursesState);
  const setPurchased = useSetRecoilState(purchasedCoursesState);

  const isLoggedIn = !user.isLoading && user.userName !== null;
  const isPurchased = !isPurchasedLoading && purchasedCourses.some((c) => c._id === id);
  const hasAccess = isLoggedIn && isPurchased;

  // ── Purchase Course Action — full Razorpay flow ────────────────────────────
  const buyCourse = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      // ── Step 1: Ask the backend to create a Razorpay order ─────────────────
      const orderRes = await axios.post(
        "/api/payment/create-order",
        { courseId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, currency, keyId } = orderRes.data;

      // ── Step 2: Open the Razorpay checkout popup ────────────────────────────
      const options = {
        key: keyId,
        amount,
        currency,
        name: course?.title ?? "Course Purchase",
        description: `Purchase of ${course?.title ?? "Course"}`.slice(0, 255),
        image: course?.imageLink ?? "",
        order_id: orderId,

        // ── Step 3: On successful payment, verify on the backend ─────────────
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await axios.post(
              "/api/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: id,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Payment successful! Course unlocked.");

            // ── Step 4: Refresh purchasedCourses in Recoil ──────────
            const userMeRes = await axios.get("/api/user/me", {
              headers: { Authorization: `Bearer ${token}` },
            });
            setPurchased({
              courses: userMeRes.data.courses || [],
              isLoading: false,
            });
          } catch (verifyErr: any) {
            console.error("Payment verification failed:", verifyErr);
            const msg =
              verifyErr?.response?.data?.message ||
              "Payment verification failed. Please contact support.";
            alert(msg);
          }
        },

        prefill: { name: user.userName ?? "" },
        theme: { color: "#1976d2" },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", (response: any) => {
        console.error("Razorpay payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (err: any) {
      console.error("buyCourse error:", err);
      const msg =
        err?.response?.data?.message || "Failed to initiate payment. Please try again.";
      alert(msg);
    }
  };

  // ── Fetch course ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchCourse() {
      if (!id) return;
      try {
        const res = await axios.get(`/api/user/courses?id=${id}`);
        const fetched: CourseFormat = res.data.course;
        setCourse(fetched);
        const rawLessons: LessonFormat[] = (fetched.lessons ?? []).map((l: any) => ({
          _id: l._id,
          title: l.title || "",
          description: l.description || l.content || "",
          order: typeof l.order === "number" ? l.order : 0,
        }));
        const sorted = [...rawLessons].sort((a, b) => a.order - b.order);
        setLessons(sorted);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCourse();
  }, [id]);

  // ── Loading guard ───────────────────────────────────────────────────────────
  if (!course || user.isLoading || isPurchasedLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-slate-500 font-medium">Loading...</div>
      </div>
    );
  }

  const activeLesson = lessons.find((l) => l._id === activeLessonId) ?? null;

  return (
    <>
      <Head>
        <title>{course.title} | Coursecean</title>
      </Head>

      <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">

        {/* ══════════════════════════════════════════
            SIDEBAR — Lesson list
        ══════════════════════════════════════════ */}
        {hasAccess && (
          <aside className="w-full md:w-80 shrink-0 bg-white border-r border-slate-200 flex flex-col">
            {/* Course header */}
            <div className="p-5 border-b border-slate-200 space-y-3">
              <button
                type="button"
                onClick={() => router.push("/user/courses")}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeftIcon className="w-3.5 h-3.5" />
                <span>All Courses</span>
              </button>

              <h2 className="text-base font-bold text-slate-900 leading-snug">
                {course.title}
              </h2>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                <MenuBookIcon className="w-4 h-4 text-slate-400" />
                <span>{lessons.length} lessons available</span>
              </div>
            </div>

            {/* Lesson list */}
            {lessons.length === 0 ? (
              <p className="p-6 text-center text-slate-500 text-xs">
                No lessons available yet.
              </p>
            ) : (
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {lessons.map((lesson, idx) => {
                  const active = activeLessonId === lesson._id;

                  return (
                    <button
                      key={lesson._id}
                      type="button"
                      onClick={() => setActiveLessonId(lesson._id)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3.5 transition-colors ${active
                        ? "bg-blue-50/80 border-l-4 border-blue-600 font-bold text-blue-900"
                        : "hover:bg-slate-50 text-slate-700"
                        }`}
                    >
                      <span className="text-xs font-semibold text-slate-400 w-5 shrink-0">
                        {idx + 1}.
                      </span>
                      <span className="text-xs leading-snug flex-1 truncate">
                        {lesson.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>
        )}

        {/* ══════════════════════════════════════════
            MAIN AREA — Overview or Lesson content
        ══════════════════════════════════════════ */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">

          {/* ── Course overview ── */}
          {(!activeLesson || !hasAccess) && (
            <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <img
                src={course.imageLink}
                alt={course.title}
                className="w-full h-64 object-cover rounded-2xl mb-6 shadow-sm"
              />

              <div className="flex flex-wrap gap-2 mb-4">
                {course.level && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 text-blue-700 bg-blue-50">
                    {course.level}
                  </span>
                )}
                {course.category && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-700 bg-slate-50">
                    {course.category}
                  </span>
                )}
                {course.language && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-700 bg-slate-50">
                    {course.language}
                  </span>
                )}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-700 bg-slate-50">
                  {lessons.length} Lessons
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                {course.title}
              </h1>

              <p className="text-xl font-bold text-slate-700 mb-4">
                ₹{course.price}
              </p>

              <hr className="border-slate-200 my-4" />

              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {course.description}
              </p>

              {hasAccess && lessons.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveLessonId(lessons[0]._id)}
                  className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-sm shadow-sm transition-all"
                >
                  Start Learning →
                </button>
              )}

              {!isLoggedIn && (
                <div className="mt-6 p-6 bg-blue-50/70 border border-blue-200 rounded-2xl text-center space-y-3">
                  <p className="text-sm font-semibold text-slate-800">
                    Login to purchase this course and access all lessons.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/user/login")}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
                  >
                    Login
                  </button>
                </div>
              )}

              {isLoggedIn && !isPurchased && (
                <div className="mt-6 p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <p className="text-sm font-semibold text-slate-800">
                    Purchase this course to unlock all lessons.
                  </p>
                  <button
                    type="button"
                    onClick={buyCourse}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
                  >
                    Buy Course
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Lesson document ── */}
          {hasAccess && activeLesson && (
            <div className="max-w-3xl mx-auto space-y-4">

              {/* Navigation: prev / next */}
              {(() => {
                const idx = lessons.findIndex((l) => l._id === activeLesson._id);
                const prev = idx > 0 ? lessons[idx - 1] : null;
                const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;

                return (
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <button
                      type="button"
                      disabled={!prev}
                      onClick={() => prev && setActiveLessonId(prev._id)}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg text-slate-700 transition-colors"
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveLessonId(null)}
                      className="px-3 py-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      Course Overview
                    </button>
                    <button
                      type="button"
                      disabled={!next}
                      onClick={() => next && setActiveLessonId(next._id)}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg text-slate-700 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                );
              })()}

              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
                {/* Lesson header */}
                <div className="mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    LESSON {lessons.findIndex((l) => l._id === activeLesson._id) + 1} OF {lessons.length}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {activeLesson.title}
                  </h2>
                </div>

                <hr className="border-slate-200 mb-6" />

                {/* Lesson content / description */}
                {activeLesson.description ? (
                  <p className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {activeLesson.description}
                  </p>
                ) : (
                  <p className="text-slate-400 text-sm italic">
                    This lesson has no content yet.
                  </p>
                )}

                <hr className="border-slate-200 my-8" />

                {/* Bottom Navigation */}
                {(() => {
                  const idx = lessons.findIndex((l) => l._id === activeLesson._id);
                  const next = lessons[idx + 1];
                  return (
                    <div className="flex justify-end items-center">
                      {next && (
                        <button
                          type="button"
                          onClick={() => setActiveLessonId(next._id)}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all"
                        >
                          Next Lesson →
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

            </div>
          )}

        </main>
      </div>
    </>
  );
}
