import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { Coursecard } from "ui";
import type { CourseFormat } from "store";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

export default function AdminCoursePage() {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState<CourseFormat | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      if (!id) return;
      try {
        const token = Cookies.get("adminToken");
        const res = await axios.get(`/api/admin/courses?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.course) {
          setCourse(res.data.course);
        }
      } catch (err) {
        console.error("Failed to fetch course:", err);
      }
    }
    fetchCourse();
  }, [id]);

  const updateCourse = async () => {
    if (!course) return;
    setLoading(true);
    try {
      const token = Cookies.get("adminToken");

      const res = await axios.put(
        "/api/admin/updateCourse",
        {
          courseId: id,
          title: course.title,
          description: course.description,
          price: course.price,
          imageLink: course.imageLink,
          published: course.published,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.course) {
        setCourse(res.data.course);
      }

      alert(res.data?.message || "Course updated successfully");
    } catch (err: any) {
      console.error("Failed to update course:", err);
      const msg = err?.response?.data?.message || "Failed to update course";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async () => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    try {
      const token = Cookies.get("adminToken");
      const res = await axios.delete(`/api/admin/deleteCourse?courseId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data?.message || "Course deleted successfully");
      router.push("/admin/courses");
    } catch (err: any) {
      console.error("Failed to delete course:", err);
      const msg = err?.response?.data?.message || "Failed to delete course";
      alert(msg);
    }
  };

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-slate-500 font-medium">Loading course details...</div>
      </div>
    );
  }

  const previewCourse: CourseFormat[] = [
    {
      _id: course._id,
      title: course.title || "Course Title Preview",
      description: course.description,
      price: course.price,
      imageLink: course.imageLink,
      published: course.published,
    },
  ];

  return (
    <>
      <Head>
        <title>Edit {course.title} | Admin Portal</title>
      </Head>

      <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ════════════════════════════════
                LEFT COLUMN — Edit Form (7 cols)
            ════════════════════════════════ */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
                Edit Course
              </h2>

              <div className="space-y-5">
                {/* ── Title ── */}
                <div>
                  <FieldLabel>Course Title *</FieldLabel>
                  <input
                    type="text"
                    placeholder="Course Title"
                    value={course.title}
                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                {/* ── Description (Protected Content) ── */}
                <div>
                  <FieldLabel>Course Content / Description</FieldLabel>
                  <textarea
                    rows={6}
                    placeholder="Full course content / material visible after purchase..."
                    value={course.description || ""}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <span className="text-xs text-slate-400 mt-1 block">
                    Protected course content only visible to enrolled students.
                  </span>
                </div>

                {/* ── Price ── */}
                <div>
                  <FieldLabel>Price (₹)</FieldLabel>
                  <input
                    type="number"
                    min={0}
                    value={course.price}
                    onChange={(e) =>
                      setCourse({
                        ...course,
                        price: e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                {/* ── Image URL ── */}
                <div>
                  <FieldLabel>Cover Image URL</FieldLabel>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={course.imageLink}
                    onChange={(e) => setCourse({ ...course, imageLink: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <hr className="border-slate-200" />

                {/* ── Published toggle ── */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      Publish Course
                    </span>
                    <span className="text-xs text-slate-500">
                      Students can purchase once published
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={course.published}
                      onChange={(e) =>
                        setCourse({ ...course, published: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span
                      className={`ml-3 text-xs font-bold px-2 py-0.5 rounded-full ${
                        course.published
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {course.published ? "Live" : "Draft"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={updateCourse}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-sm shadow-blue-500/20 transition-all active:scale-[0.99]"
                >
                  {loading ? "Updating..." : "Update Course"}
                </button>
                <button
                  type="button"
                  onClick={deleteCourse}
                  className="w-full py-2.5 px-4 border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  Delete Course
                </button>
              </div>
            </div>

            {/* ════════════════════════════════
                RIGHT COLUMN — Live Preview (5 cols)
            ════════════════════════════════ */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <span className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                Live Preview
              </span>

              <Coursecard
                courses={previewCourse}
                onClick={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

