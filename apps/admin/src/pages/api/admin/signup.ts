import type { NextApiRequest, NextApiResponse } from "next";
import { Admin, connectDB } from "db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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

    const { name, username, password } = req.body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (!password || typeof password !== "string" || password.length < 4) {
      return res.status(400).json({ message: "Password must be at least 4 characters" });
    }

    const existingAdmin = await Admin.findOne({ username: username.trim() });

    if (existingAdmin) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      name: name?.trim() || username.trim(),
      username: username.trim(),
      password: hashedPassword,
    });

    await admin.save();

    const token = jwt.sign(
      {
        username: admin.username,
      },
      process.env.ADMIN_SECRET!,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "Admin created successfully",
      name: admin.name,
      token,
    });
  } catch (err) {
    console.error("Admin signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}