import type { NextApiRequest, NextApiResponse } from "next";
import { Course, User, connectDB } from "db";
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

    const { id } = req.query;

    if (id) {
      // Check if user is authenticated and has purchased this course
      let isPurchased = false;
      if (req.headers.authorization) {
        try {
          const userData = verifyToken(req, process.env.USER_SECRET!);
          const dbUser = await User.findOne({ username: userData.username });
          if (dbUser && dbUser.courses.some((cId: any) => cId.toString() === id.toString())) {
            isPurchased = true;
          }
        } catch {
          // Token invalid or expired — treat as public guest
          isPurchased = false;
        }
      }

      if (isPurchased) {
        // Return full course including protected description
        const course = await Course.findById(id);
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }
        return res.status(200).json({ course });
      }

      // Public preview: NEVER return description
      const course = await Course.findOne({ _id: id, published: true }).select(
        "_id title imageLink price published"
      );

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      return res.status(200).json({
        course,
      });
    }

    // Public course catalog: NEVER return description
    const courses = await Course.find({
      published: true,
    }).select("_id title imageLink price published");

    return res.status(200).json({
      courses,
    });
  } catch {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}