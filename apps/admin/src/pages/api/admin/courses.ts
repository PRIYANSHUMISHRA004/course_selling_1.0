import type { NextApiRequest, NextApiResponse } from "next";
import { Admin, Course, connectDB } from "db";
import { verifyToken } from "auth";

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

    const adminData = verifyToken(req, process.env.ADMIN_SECRET!);

    const { id ,mine} = req.query;
 

    if (mine === "true") {
      const admin = await Admin.findOne({
        username: adminData.username,
      });

      if (!admin) {
        return res.status(404).json({
          message: "Admin not found",
        });
      }

      const courses = await Course.find({
        adminId: admin._id,
      });

      return res.status(200).json({
        courses,
      });
    }

    if (id) {
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

    const courses = await Course.find({});

    return res.status(200).json({
      courses,
    });
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}