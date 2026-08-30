

import type { NextApiRequest, NextApiResponse } from "next";
import { Admin, connectDB } from "db";
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

    const admin = await Admin.findOne({
      username: adminData.username,
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      name: admin.name,
      username: admin.username,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}