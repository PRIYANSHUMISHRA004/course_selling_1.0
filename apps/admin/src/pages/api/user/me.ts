

import type { NextApiRequest, NextApiResponse } from "next";
import { User, connectDB } from "db";
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

  await connectDB();

  try {
    const decoded = verifyToken(req,process.env.USER_SECRET!);

    const user = await User.findOne({
      username: decoded.username,
    }).populate("courses");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      name: user.name,
      username: user.username,
      courses: user.courses || [],
    });
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}