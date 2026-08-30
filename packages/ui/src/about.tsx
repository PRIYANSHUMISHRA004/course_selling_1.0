import React from "react";

export function About() {
  return (
    <div className="max-w-4xl mx-auto my-10 p-6 md:p-10 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center mb-6 tracking-tight">
        About This Project
      </h1>

      <div className="space-y-4 text-base text-slate-700 leading-relaxed">
        <p>
          This Course Selling Platform was built as a learning project to gain
          hands-on experience with full-stack web development using Next.js,
          TypeScript, MongoDB, JWT Authentication, and Tailwind CSS.
        </p>

        <p>
          The project allows administrators to sign up, sign in, create courses,
          update courses, and manage their content through a secure dashboard.
          Users can browse available courses and interact with the platform.
        </p>

        <p>
          While building this project, I learned API development, database design,
          authentication using JWT, protected routes, state management, dynamic
          routing, and frontend-backend integration in Next.js.
        </p>

        <p>
          The main goal of this project was not only to build a working
          application but also to understand how modern web applications are
          structured and deployed in real-world environments.
        </p>
      </div>
    </div>
  );
}