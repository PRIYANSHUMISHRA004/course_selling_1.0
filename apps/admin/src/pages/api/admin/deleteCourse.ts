import type { NextApiRequest, NextApiResponse } from "next";
import { Admin, Course, User, connectDB } from "db";
import { verifyToken } from "auth";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
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
        message: "Admin not found",
      });
    }

    const { courseId } = req.query;

    if (!courseId || typeof courseId !== "string" || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Valid course ID is required",
      });
    }

    const course = await Course.findOneAndDelete({
      _id: courseId,
      adminId: admin._id,
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found or not owned by admin",
      });
    }

    // Clean up dangling references in users' purchased course arrays
    await User.updateMany(
      { courses: courseId },
      { $pull: { courses: courseId } }
    );

    return res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("deleteCourse API error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
