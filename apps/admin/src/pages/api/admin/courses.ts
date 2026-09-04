import type { NextApiRequest, NextApiResponse } from "next";
import { Admin, Course, connectDB } from "db";
import { verifyToken } from "auth";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Method not allowed",
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
        message: "Admin account not found",
      });
    }

    const { id, mine } = req.query;

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }

      const course = await Course.findById(id);

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      return res.status(200).json({
        course,
      });
    }

    if (mine === "true") {
      // Find courses created by this admin, or unassigned legacy courses
      const courses = await Course.find({ adminId: admin._id });

      return res.status(200).json({
        courses,
      });
    }

    // Default: List all platform courses
    const courses = await Course.find({});

    return res.status(200).json({
      courses,
    });
  } catch (err) {
    console.error("Admin courses API error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}