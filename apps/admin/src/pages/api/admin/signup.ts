import type { NextApiRequest, NextApiResponse } from "next";
import { Admin, connectDB } from "db";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  await connectDB();

  const {name, username, password } = req.body;

  const existingAdmin = await Admin.findOne({
    username,
  });

  if (existingAdmin) {
    return res.status(400).json({
      message: "Username already exists",
    });
  }

  const admin = new Admin({
    name,
    username,
    password,
  });

  await admin.save();

  const token = jwt.sign(
    {
      username: admin.username,
    },
    process.env.ADMIN_SECRET!,
   { expiresIn: "1d"}
  );

  return res.status(200).json({
    message: "Admin created successfully",
    name: admin.name,
    token,
  });
}