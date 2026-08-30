import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { RoleCard, AdminShieldIcon, SchoolIcon } from "ui";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>CourseApp - One Platform. Two Experiences.</title>
        <meta
          name="description"
          content="Choose whether to manage courses as an administrator or learn as a student."
        />
      </Head>

      <main className="min-h-screen w-full bg-slate-900 text-white flex flex-col justify-center items-center px-4 py-8 sm:py-12 box-border">
        {/* Header Section */}
        <div className="max-w-xl w-full mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3 font-sans">
            One Platform. Two Experiences.
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Choose whether you want to manage your courses as an administrator or start learning as a student.
          </p>
        </div>

        {/* Cards Wrapper */}
        <div className="w-full max-w-4xl px-2">
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-stretch">
            {/* Administrator Card */}
            <RoleCard
              icon={<AdminShieldIcon className="w-7 h-7" />}
              title="Administrator Portal"
              description="Create, publish and manage your courses."
              features={["Create Courses", "Update Courses", "View Analytics"]}
              buttonText="Continue as Admin"
              onClick={() => router.push("/admin/")}
              accentColor="#2563eb"
            />

            {/* Student Card */}
            <RoleCard
              icon={<SchoolIcon className="w-7 h-7" />}
              title="Student Portal"
              description="Browse, purchase and learn from premium courses."
              features={["Browse Courses", "Purchase Courses", "Track Learning"]}
              buttonText="Continue as Student"
              onClick={() => router.push("/user/home")}
              accentColor="#0284c7"
            />
          </div>
        </div>
      </main>
    </>
  );
}