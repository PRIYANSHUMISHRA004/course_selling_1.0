import type { NextApiRequest, NextApiResponse } from "next";
import { Admin, Course, connectDB } from "db";
import { verifyToken } from "auth";
import { z } from "zod";

const createCourseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),
  description: z.string().trim().optional().default(""),
  price: z.coerce
    .number()
    .min(0, "Price must be a valid non-negative number"),
  imageLink: z.string().trim().optional().default(""),
  published: z.boolean().optional().default(false),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  const parseResult = createCourseSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      message: parseResult.error.issues[0]?.message || "Invalid course data",
    });
  }

  const { title, description, price, imageLink, published } = parseResult.data;

  try {
    await connectDB();

    let adminData;
    try {
      adminData = verifyToken(req, process.env.ADMIN_SECRET!);
    } catch {
      return res.status(401).json({ message: "Unauthorized: Invalid or missing admin token" });
    }

    const admin = await Admin.findOne({
      username: adminData.username,
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    const course = new Course({
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      price,
      imageLink: typeof imageLink === "string" ? imageLink.trim() : "",
      published: Boolean(published),
      adminId: admin._id,
    });

    await course.save();

    return res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (err) {
    console.error("createCourses API Error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}