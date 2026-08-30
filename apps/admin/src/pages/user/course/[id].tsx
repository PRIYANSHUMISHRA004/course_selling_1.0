import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CourseFormat, userState, purchasedCoursesState } from "store";
import { useRecoilValue, useSetRecoilState } from "recoil";
import Cookies from "js-cookie";
import Head from "next/head";
import { ArrowLeftIcon } from "ui";

export default function UserCoursePage() {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState<CourseFormat | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Access Control State ────────────────────────────────────────────────────
  const user = useRecoilValue(userState);
  const { courses: purchasedCourses, isLoading: isPurchasedLoading } = useRecoilValue(purchasedCoursesState);
  const setPurchased = useSetRecoilState(purchasedCoursesState);

  const isLoggedIn = !user.isLoading && user.userName !== null;
  const isPurchased = !isPurchasedLoading && purchasedCourses.some((c) => c._id === id);

  // ── Purchase Course Action — Razorpay flow ──────────────────────────────────
  const buyCourse = async () => {
    try {
      const token = Cookies.get("userToken");
      if (!token) {
        router.push("/user/login");
        return;
      }

      // Step 1: Create Razorpay order
      const orderRes = await axios.post(
        "/api/payment/create-order",
        { courseId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, currency, keyId } = orderRes.data;

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: keyId,
        amount,
        currency,
        name: course?.title ?? "Course Purchase",
        description: `Purchase of ${course?.title ?? "Course"}`.slice(0, 255),
        image: course?.imageLink ?? "",
        order_id: orderId,

        // Step 3: Verify signature on backend upon payment
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

            // Step 4: Refresh user's purchased courses in Recoil
            const userMeRes = await axios.get("/api/user/me", {
              headers: { Authorization: `Bearer ${token}` },
            });
            setPurchased({
              courses: userMeRes.data.courses || [],
              isLoading: false,
            });

            // Refetch course with auth header so description is returned
            const updatedCourseRes = await axios.get(`/api/user/courses?id=${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (updatedCourseRes.data?.course) {
              setCourse(updatedCourseRes.data.course);
            }
          } catch (verifyErr: any) {
            console.error("Payment verification failed:", verifyErr);
            const msg =
              verifyErr?.response?.data?.message ||
              "Payment verification failed. Please contact support.";
            alert(msg);
          }
        },

        prefill: { name: user.userName ?? "" },
        theme: { color: "#2563eb" },
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
        const token = Cookies.get("userToken");
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const res = await axios.get(`/api/user/courses?id=${id}`, { headers });
        setCourse(res.data.course);
      } catch (err) {
        console.error("Failed to fetch course:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [id]);

  // ── Loading guard ───────────────────────────────────────────────────────────
  if (loading || !course || user.isLoading || isPurchasedLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-slate-500 font-medium">Loading course...</div>
      </div>
    );
  }

  // If user has purchased, prefer the purchased course description if available
  const purchasedCourseData = purchasedCourses.find((c) => c._id === id);
  const descriptionContent = course.description || purchasedCourseData?.description || "";

  return (
    <>
      <Head>
        <title>{course.title} | CourseApp</title>
      </Head>

      <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <button
            type="button"
            onClick={() => router.push(isPurchased ? "/user/mycourses" : "/user/courses")}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>{isPurchased ? "Back to My Learning" : "Back to All Courses"}</span>
          </button>

          {/* ══════════════════════════════════════════════════════════════════
              PURCHASED COURSE VIEW — Title, Image, Full Description
          ══════════════════════════════════════════════════════════════════ */}
          {isPurchased ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Enrolled
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {course.title}
              </h1>

              {course.imageLink && (
                <img
                  src={course.imageLink}
                  alt={course.title}
                  className="w-full max-h-96 object-cover rounded-2xl shadow-sm"
                />
              )}

              <hr className="border-slate-200 my-6" />

              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  Course Content
                </h2>
                {descriptionContent ? (
                  <p className="text-slate-800 text-base leading-relaxed whitespace-pre-line">
                    {descriptionContent}
                  </p>
                ) : (
                  <p className="text-slate-400 text-sm italic">
                    No content provided for this course yet.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* ══════════════════════════════════════════════════════════════════
                PUBLIC / UNPURCHASED VIEW — Image, Title, Price, Buy Button
                (NO course description shown before purchase)
            ══════════════════════════════════════════════════════════════════ */
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-center">
              {course.imageLink && (
                <img
                  src={course.imageLink}
                  alt={course.title}
                  className="w-full max-h-96 object-cover rounded-2xl shadow-sm mx-auto"
                />
              )}

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {course.title}
              </h1>

              <div className="text-2xl font-bold text-slate-900">
                ₹{course.price}
              </div>

              <hr className="border-slate-200 my-6" />

              {!isLoggedIn ? (
                <div className="p-6 bg-blue-50/70 border border-blue-200 rounded-2xl max-w-md mx-auto space-y-3">
                  <p className="text-sm font-semibold text-slate-800">
                    Sign in to purchase this course and unlock full access.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/user/login")}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto space-y-3">
                  <button
                    type="button"
                    onClick={buyCourse}
                    className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-base shadow-md shadow-blue-500/25 transition-all"
                  >
                    Buy Course for ₹{course.price}
                  </button>
                  <p className="text-xs text-slate-500">
                    One-time payment. Instant full course access upon payment verification.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

