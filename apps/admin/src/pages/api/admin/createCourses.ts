import type { NextApiRequest, NextApiResponse } from "next";
import { Admin, Course, connectDB } from "db";
import { verifyToken } from "auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    await connectDB();

    const adminData = verifyToken(req, process.env.ADMIN_SECRET!);

    const admin = await Admin.findOne({
      username: adminData.username,
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    const courseData = { ...req.body };

    // thumbnail falls back to imageLink when not explicitly supplied
    if (!courseData.thumbnail && courseData.imageLink) {
      courseData.thumbnail = courseData.imageLink;
    }

    const course = new Course({
      ...courseData,
      adminId: admin._id,
    });

    await course.save();

    return res.status(200).json({
      message: "Course created",
      course,
    });
  } catch (err) {
    console.error(err);
    const error = err as { statusCode?: number; message?: string };
    const status = error.statusCode || 500;
    const message = error.message || "Server error";
    return res.status(status).json({
      message,
    });
  }
}