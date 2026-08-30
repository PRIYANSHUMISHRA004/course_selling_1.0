import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});
export const adminSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
});

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  order: {
    type: Number,
    default: 0,
  },
});

export const courseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    imageLink: String,
    published: Boolean,

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    lessons: {
      type: [lessonSchema],
      default: [],
    },

    category: {
      type: String,
      enum: [
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
      ],
      default: "Programming Languages",
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    language: {
      type: String,
      default: "English",
    },
   
    duration: {
      type: String,
    },
    
    thumbnail: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);

export const Admin =
  mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export const Course =
  mongoose.models.Course || mongoose.model("Course", courseSchema);
