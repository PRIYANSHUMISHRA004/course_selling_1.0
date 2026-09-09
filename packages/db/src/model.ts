import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  name: String,
  username: {type: String, unique: true},
  password: String,
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

export const adminSchema = new mongoose.Schema({
  name: String,
  username: {type: String, unique: true},
  password: String,
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

