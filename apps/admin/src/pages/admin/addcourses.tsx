import { Coursecard, AutoStoriesIcon } from "ui";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useState } from "react";
import Head from "next/head";
import type { CourseFormat } from "store";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

export default function AddCourse() {
  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: 0,
    imageLink: "",
    published: false,
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const addCourse = async () => {
    const token = Cookies.get("adminToken");
    if (!token) {
      alert("Authentication token not found. Please log in again.");
      return;
    }

    if (!course.title.trim()) {
      alert("Please enter a course title.");
      return;
    }

    const payload = {
      title: course.title,
      description: course.description,
      price: course.price,
      imageLink: course.imageLink,
      published: course.published,
    };

    setLoading(true);
    try {
      const res = await axios.post("/api/admin/createCourses", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const msg = res.data?.message || "Course created successfully";
      alert(msg);
      router.push("/admin/courses");
    } catch (err: any) {
      console.error("Add course error:", err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create course";
      alert(`Error: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const previewCourse: CourseFormat[] = [
    {
      _id: "preview",
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
        <title>Create Course | Admin Portal</title>
      </Head>

      <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── Page Header ── */}
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <AutoStoriesIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Create New Course
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Fill in the details on the left — the preview updates live on the right.
              </p>
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ════════════════════════════════
                LEFT COLUMN — Form (7 cols)
            ════════════════════════════════ */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Course Details
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Course description will be the protected content accessible to students after purchase.
                </p>
              </div>

              <hr className="border-slate-200" />

              <div className="p-6 sm:p-8 space-y-6">
                {/* ── Course Title ── */}
                <div>
                  <FieldLabel>Course Title *</FieldLabel>
                  <input
                    type="text"
                    placeholder="e.g. Complete React Developer Course"
                    value={course.title}
                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <span className="text-xs text-slate-400 mt-1 block">
                    Give your course a clear title
                  </span>
                </div>

                {/* ── Description (Protected Course Content) ── */}
                <div>
                  <FieldLabel>Course Content / Description</FieldLabel>
                  <textarea
                    rows={6}
                    placeholder="Write the full course content and material here. Only paying students will have access to read this..."
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <span className="text-xs text-slate-400 mt-1 block">
                    This description acts as the complete purchased course content.
                  </span>
                </div>

                {/* ── Price ── */}
                <div>
                  <FieldLabel>Price (₹)</FieldLabel>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={course.price}
                    onChange={(e) =>
                      setCourse({ ...course, price: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <span className="text-xs text-slate-400 mt-1 block">
                    Set course price in INR (₹)
                  </span>
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
                  <span className="text-xs text-slate-400 mt-1 block">
                    Direct link to the course thumbnail image
                  </span>
                </div>

                <hr className="border-slate-200" />

                {/* ── Publish Toggle ── */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      Publish Course
                    </span>
                    <span className="text-xs text-slate-500">
                      Students can purchase once the course is published
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

              {/* ── Footer Actions ── */}
              <hr className="border-slate-200" />
              <div className="px-6 sm:px-8 py-4 bg-slate-50/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addCourse}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-sm shadow-blue-500/20 transition-all active:scale-[0.99]"
                >
                  {loading ? "Creating..." : "Create Course"}
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

