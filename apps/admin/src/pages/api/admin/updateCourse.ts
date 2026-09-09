import type { NextApiRequest, NextApiResponse } from "next";
import { Admin, Course, connectDB } from "db";
import { verifyToken } from "auth";
import mongoose from "mongoose";
import { z } from "zod";

const updateCourseSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(200, "Title cannot exceed 200 characters")
    .optional(),
  description: z.string().optional(),
  price: z.coerce
    .number()
    .min(0, "Price must be a valid non-negative number")
    .optional(),
  imageLink: z.string().optional(),
  published: z.boolean().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  const parseResult = updateCourseSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      message: parseResult.error.issues[0]?.message || "Invalid input data",
    });
  }

  const {
    courseId,
    title,
    description,
    imageLink,
    price,
    published,
  } = parseResult.data;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({
      message: "Valid course ID is required",
    });
  }

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

    const {
      courseId,
      title,
      description,
      imageLink,
      price,
      published,
    } = req.body;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Valid course ID is required",
      });
    }

    const updateFields: Record<string, any> = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      updateFields.title = title.trim();
    }
    if (description !== undefined) {
      updateFields.description = typeof description === "string" ? description.trim() : "";
    }
    if (imageLink !== undefined) {
      updateFields.imageLink = typeof imageLink === "string" ? imageLink.trim() : "";
    }
    if (price !== undefined) {
      const numericPrice = typeof price === "number" ? price : Number(price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ message: "Price must be a valid non-negative number" });
      }
      updateFields.price = numericPrice;
      updateFields.price = price;
    }
    if (published !== undefined) {
      updateFields.published = Boolean(published);
    }

    const course = await Course.findOneAndUpdate(
      {
        _id: courseId,
        adminId: admin._id,
      },
      {
        $set: updateFields,
      },
      {
        new: true,
      }
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found or not owned by admin",
      });
    }

    return res.status(200).json({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("updateCourse API Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}