import React from "react";
import { CourseFormat } from "store";

const PLACEHOLDER_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='180' viewBox='0 0 300 180'%3E%3Crect width='300' height='180' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='13' fill='%2394a3b8'%3ENo Image Available%3C/text%3E%3C/svg%3E";

export function CoursecardAdmin({
  courses,
  onClick,
}: {
  courses: CourseFormat[];
  onClick: (courseid: string) => void;
}) {
  return (
    <>
      {courses.map((course, i) => (
        <div
          key={course._id ?? i}
          className="m-2.5 w-[300px] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
        >
          <img
            src={course.imageLink || PLACEHOLDER_SRC}
            alt={course.title}
            className="w-full h-[180px] object-cover shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SRC;
            }}
          />

          <h3 className="text-lg font-bold text-slate-800 text-center mt-3 px-3 line-clamp-1">
            {course.title}
          </h3>

          <div className="flex items-center justify-center gap-2 mt-2 px-3">
            <span className="text-base font-semibold text-slate-900">
              ₹{course.price}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                course.published
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {course.published ? "Published" : "Draft"}
            </span>
          </div>

          <div className="flex justify-center p-3 mt-auto">
            <button
              type="button"
              onClick={() => onClick(course._id)}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

export function Coursecard({
  courses,
  onClick,
}: {
  courses: CourseFormat[];
  onClick: (courseid: string) => void;
}) {
  return (
    <>
      {courses.map((course, i) => (
        <div
          key={course._id ?? i}
          className="m-2.5 w-[300px] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
        >
          <img
            src={course.imageLink || PLACEHOLDER_SRC}
            alt={course.title}
            className="w-full h-[180px] object-cover shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SRC;
            }}
          />

          <h3 className="text-lg font-bold text-slate-800 text-center mt-3 px-3 line-clamp-1">
            {course.title}
          </h3>

          <div className="flex items-center justify-center gap-2 mt-2 px-3">
            <span className="text-base font-semibold text-slate-900">
              ₹{course.price}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                course.published
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {course.published ? "Published" : "Draft"}
            </span>
          </div>

          <div className="flex justify-center p-3 mt-auto">
            <button
              type="button"
              onClick={() => onClick(course._id)}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
              View Course
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
