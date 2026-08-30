import type { NextApiRequest, NextApiResponse } from "next";
import { Course, connectDB } from "db";

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

    const { id } = req.query;

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

    const courses = await Course.find({
      published: true,
    });

    return res.status(200).json({
      courses,
    });
  } catch {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}