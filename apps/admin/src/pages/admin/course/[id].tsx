import {
  AddIcon,
  DeleteIcon,
  SaveIcon,
  EditIcon,
} from "ui";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { CourseFormat, LessonFormat, CATEGORIES, LEVELS, LANGUAGES } from "store";

// ── Helpers ──────────────────────────────────────────────────────────────────

function newLesson(order: number): LessonFormat {
  return { _id: `new_${Date.now()}`, title: "", description: "", order };
}

/** Strips temporary client-generated IDs so MongoDB generates valid ObjectIds */
function sanitizeLessons(lessonsList: LessonFormat[]) {
  return lessonsList.map((l) => {
    if (typeof l._id === "string" && l._id.startsWith("new_")) {
      const { _id, ...rest } = l;
      return rest;
    }
    return l;
  });
}

/** Small section label */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCoursePage() {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState<CourseFormat | null>(null);
  const [tagsRaw, setTagsRaw] = useState("");
  const [lessons, setLessons] = useState<LessonFormat[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  /** Syncs both course and lessons state from a fetched or updated course */
  const syncCourse = (data: CourseFormat) => {
    setCourse(data);
    setTagsRaw(data.tags?.join(", ") ?? "");
    const normalizedLessons: LessonFormat[] = (data.lessons ?? []).map((l: any) => ({
      _id: l._id,
      title: l.title || "",
      description: l.description || l.content || "",
      order: typeof l.order === "number" ? l.order : 0,
    }));
    const sorted = [...normalizedLessons].sort((a, b) => a.order - b.order);
    setLessons(sorted);
  };

  // ── Fetch course ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchCourse() {
      if (!id) return;
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`/api/admin/courses?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.course) {
          syncCourse(res.data.course);
        }
      } catch (err) {
        console.error("Failed to fetch course:", err);
      }
    }
    fetchCourse();
  }, [id]);

  // ── Course update (metadata and lessons) ───────────────────────────────────
  const updateCourse = async () => {
    if (!course) return;
    try {
      const token = Cookies.get("token");

      const tags = tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { lessons: _discard, ...courseMetadata } = course;

      const res = await axios.put(
        "/api/admin/updateCourse",
        {
          courseId: id,
          ...courseMetadata,
          lessons: sanitizeLessons(lessons),
          thumbnail: course.imageLink,
          tags,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.course) {
        syncCourse(res.data.course);
      }

      alert(res.data?.message || "Course updated successfully");
    } catch (err: any) {
      console.error("Failed to update course:", err);
      const msg = err?.response?.data?.message || "Failed to update course";
      alert(msg);
    }
  };

  // ── Delete course ───────────────────────────────────────────────────────────
  const deleteCourse = async () => {
    if (!window.confirm("Delete this course? This cannot be undone.")) return;
    try {
      const token = Cookies.get("token");
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

  // ── Persist lessons array to DB ─────────────────────────────────────────────
  const saveLessons = async (updatedLessons: LessonFormat[]) => {
    try {
      const token = Cookies.get("token");

      const res = await axios.put(
        "/api/admin/updateCourse",
        {
          courseId: id,
          lessons: sanitizeLessons(updatedLessons),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.course) {
        syncCourse(res.data.course);
      }
    } catch (err: any) {
      console.error("Failed to save lessons:", err);
      const msg = err?.response?.data?.message || "Failed to save lessons";
      alert(msg);
    }
  };

  // ── Lesson: add ─────────────────────────────────────────────────────────────
  const addLesson = () => {
    const next = newLesson(lessons.length);
    const updated = [...lessons, next];
    setLessons(updated);
    setEditingId(next._id);
  };

  // ── Lesson: delete ──────────────────────────────────────────────────────────
  const deleteLesson = async (lessonId: string) => {
    if (!window.confirm("Delete this lesson?")) return;
    const updated = lessons.filter((l) => l._id !== lessonId);
    setLessons(updated);
    if (editingId === lessonId) setEditingId(null);
    await saveLessons(updated);
  };

  // ── Lesson: field change ────────────────────────────────────────────────────
  const updateLesson = (lessonId: string, field: keyof LessonFormat, value: string | number) => {
    setLessons((prev) =>
      prev.map((l) => (l._id === lessonId ? { ...l, [field]: value } : l))
    );
  };

  // ── Lesson: save (persist) ──────────────────────────────────────────────────
  const saveLesson = async (lessonId: string) => {
    const lesson = lessons.find((l) => l._id === lessonId);
    if (!lesson?.title.trim()) {
      alert("Lesson title cannot be empty");
      return;
    }
    await saveLessons(lessons);
    setEditingId(null);
  };

  // ── Loading guard ───────────────────────────────────────────────────────────
  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-slate-500 font-medium">Loading...</div>
      </div>
    );
  }

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Edit {course.title} | Admin Portal</title>
      </Head>

      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">

          {/* ══════════════════════════════════════════
              LEFT PANEL — Course metadata editor
          ══════════════════════════════════════════ */}
          <div className="flex-1 w-full min-w-[300px] bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-6">
              Edit Course
            </h2>

            <div className="space-y-5">

              {/* ── Title ── */}
              <div>
                <FieldLabel>Title *</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. Complete React Developer Bootcamp"
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* ── Description ── */}
              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  rows={3}
                  placeholder="Describe what students will learn..."
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
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
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <span className="text-xs text-slate-400 mt-1 block">
                  Also used as thumbnail automatically
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
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <span className="text-xs text-slate-400 mt-1 block">
                  Set to 0 for a free course
                </span>
              </div>

              <hr className="border-slate-200" />

              {/* ── Category / Level / Language ── */}
              <div className="space-y-4">
                <div>
                  <FieldLabel>Category</FieldLabel>
                  <select
                    value={course.category ?? ""}
                    onChange={(e) => setCourse({ ...course, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  >
                    <option value="">None</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Level</FieldLabel>
                    <select
                      value={course.level ?? ""}
                      onChange={(e) =>
                        setCourse({
                          ...course,
                          level: e.target.value as CourseFormat["level"],
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    >
                      <option value="">None</option>
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <FieldLabel>Language</FieldLabel>
                    <select
                      value={course.language ?? ""}
                      onChange={(e) => setCourse({ ...course, language: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    >
                      <option value="">None</option>
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Duration ── */}
              <div>
                <FieldLabel>Duration</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. 12 hours, 6 weeks"
                  value={course.duration ?? ""}
                  onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* ── Tags ── */}
              <div>
                <FieldLabel>Tags</FieldLabel>
                <input
                  type="text"
                  placeholder="e.g. react, javascript, web development"
                  value={tagsRaw}
                  onChange={(e) => setTagsRaw(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <span className="text-xs text-slate-400 mt-1 block">
                  Comma-separated values
                </span>
                {tagsRaw.trim() && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tagsRaw
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <hr className="border-slate-200" />

              {/* ── Published toggle ── */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    Publish Course
                  </span>
                  <span className="text-xs text-slate-500">
                    Students can enroll once published
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

            <button
              type="button"
              onClick={updateCourse}
              className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-sm shadow-sm shadow-blue-500/20 transition-all active:scale-[0.99]"
            >
              Update Course
            </button>
            <button
              type="button"
              onClick={deleteCourse}
              className="w-full mt-3 py-2.5 px-4 border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl text-sm transition-colors"
            >
              Delete Course
            </button>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT PANEL — Lessons editor
          ══════════════════════════════════════════ */}
          <div className="flex-1 w-full min-w-[320px] bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Lessons
                <span className="text-sm font-normal text-slate-500">
                  ({lessons.length})
                </span>
              </h2>
              <button
                type="button"
                onClick={addLesson}
                className="flex items-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <AddIcon className="w-4 h-4" />
                <span>Add Lesson</span>
              </button>
            </div>

            {lessons.length === 0 && (
              <p className="text-slate-500 text-center py-8 text-sm">
                No lessons yet. Click &quot;Add Lesson&quot; to create the first one.
              </p>
            )}

            <div className="space-y-3">
              {lessons.map((lesson, idx) => {
                const isEditing = editingId === lesson._id;

                return (
                  <div
                    key={lesson._id}
                    className={`border rounded-2xl overflow-hidden transition-all ${
                      isEditing
                        ? "border-blue-500 ring-2 ring-blue-500/10 shadow-sm"
                        : "border-slate-200"
                    }`}
                  >
                    {/* ── Lesson row header ── */}
                    <div
                      className={`flex items-center gap-2 px-4 py-3 ${
                        isEditing ? "bg-blue-50/60" : "bg-slate-50"
                      }`}
                    >
                      {/* Order badge */}
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </span>

                      <span className="text-sm font-semibold text-slate-800 flex-1 truncate">
                        {lesson.title || <em className="text-slate-400">Untitled lesson</em>}
                      </span>

                      <span className="text-xs font-medium text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                        Order: {lesson.order}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title={isEditing ? "Close" : "Edit"}
                          onClick={() => setEditingId(isEditing ? null : lesson._id)}
                          className={`p-1 rounded-lg transition-colors ${
                            isEditing
                              ? "text-blue-600 bg-blue-100/70"
                              : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                          }`}
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete lesson"
                          onClick={() => deleteLesson(lesson._id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* ── Expanded editor ── */}
                    {isEditing && (
                      <div className="p-4 bg-white border-t border-slate-200 space-y-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            Lesson Title
                          </label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => updateLesson(lesson._id, "title", e.target.value)}
                            placeholder="e.g. Introduction to React"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            Lesson Description
                          </label>
                          <textarea
                            rows={4}
                            value={lesson.description ?? ""}
                            onChange={(e) => updateLesson(lesson._id, "description", e.target.value)}
                            placeholder="Write lesson description and content here..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">
                            Order
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={lesson.order}
                            onChange={(e) => updateLesson(lesson._id, "order", e.target.value === "" ? 0 : Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                          />
                          <span className="text-xs text-slate-400 mt-0.5 block">
                            Admin specifies order number (e.g. 0, 1, 2). Lower number = earlier in list.
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => saveLesson(lesson._id)}
                          className="flex items-center gap-1.5 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors"
                        >
                          <SaveIcon className="w-4 h-4" />
                          <span>Save Lesson</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ══════════════════════════════════════════
              PREVIEW PANEL — course snapshot
          ══════════════════════════════════════════ */}
          <div className="w-full lg:w-72 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-base font-bold text-slate-900 text-center mb-3">
              Live Preview
            </h2>

            <img
              src={course.imageLink}
              alt={course.title}
              className="w-full h-44 object-cover rounded-2xl"
            />
            <h3 className="text-lg font-bold text-slate-900 text-center mt-3 line-clamp-2">
              {course.title}
            </h3>
            <p className="text-base font-semibold text-slate-900 text-center mt-1">
              ₹{course.price}
            </p>
            <p className="text-xs text-slate-500 mt-2 line-clamp-3">
              {course.description}
            </p>

            {/* ── Extra metadata preview ── */}
            <div className="space-y-1.5 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <p>Status: <strong className="text-slate-800">{course.published ? "Published" : "Draft"}</strong></p>
              <p>Lessons: <strong className="text-slate-800">{lessons.length}</strong></p>
              {course.category && <p>Category: <strong className="text-slate-800">{course.category}</strong></p>}
              {course.level && <p>Level: <strong className="text-slate-800">{course.level}</strong></p>}
              {course.language && <p>Language: <strong className="text-slate-800">{course.language}</strong></p>}
              {course.duration && <p>Duration: <strong className="text-slate-800">{course.duration}</strong></p>}
              {tagsRaw.trim() && (
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    TAGS
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {tagsRaw
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
