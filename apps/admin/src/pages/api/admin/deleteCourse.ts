import type { NextApiRequest, NextApiResponse } from "next";
import { Admin, Course, connectDB } from "db";
import { verifyToken } from "auth";

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

    const adminData = verifyToken(req, process.env.ADMIN_SECRET!);

    const admin = await Admin.findOne({
      username: adminData.username,
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required",
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

    return res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}
