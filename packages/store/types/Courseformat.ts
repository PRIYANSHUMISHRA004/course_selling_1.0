// ── Lesson subdocument type ────────────────────────────────────────────────────
export interface LessonFormat {
  _id: string;
  title: string;
  description: string;
  order: number;
}

export interface CourseFormat {
  // ── Original fields ────────────────────────────────────────────────────────
  _id: string;
  title: string;
  description: string; // Course overview — never reused inside lessons
  price: number;
  imageLink: string;
  published: boolean;

  // ── Embedded lessons (LMS extension) ──────────────────────────────────────
  lessons?: LessonFormat[];

  // ── New optional fields ────────────────────────────────────────────────────
  thumbnail?: string;
  category?: string;
  level?: "Beginner" | "Intermediate" | "Advanced";
  language?: string;
  duration?: string;
  tags?: string[];
  totalLessons?: number;

  // ── Timestamps (set by Mongoose) ───────────────────────────────────────────
  createdAt?: string;
  updatedAt?: string;
}

// ── Shared constants for Categories, Levels and Languages ──────────────────────
export const CATEGORIES = [
  "Web Development",
  "Frontend",
  "Backend",
  "Full Stack",
  "AI & Machine Learning",
  "Data Structures & Algorithms",
  "Database",
  "DevOps",
  "Cloud Computing",
  "Mobile Development",
  "Cyber Security",
  "Programming Languages",
  "Other",
] as const;

export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export const LANGUAGES = [
  "English",
  "Hindi",
] as const;