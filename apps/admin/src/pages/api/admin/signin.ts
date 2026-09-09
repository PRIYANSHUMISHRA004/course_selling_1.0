import type { NextApiRequest, NextApiResponse } from "next";
import { Admin, connectDB } from "db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";

const adminSigninSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username must be at most 100 characters"),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(100, "Password cannot exceed 100 characters"),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  const parseResult = adminSigninSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      message: parseResult.error.issues[0]?.message || "Invalid input data",
    });
  }

  const { username, password } = parseResult.data;

  try {
    await connectDB();

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const admin = await Admin.findOne({
      username: username.trim(),
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        username: admin.username,
      },
      process.env.ADMIN_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      name: admin.name,
      token,
    });
  } catch (err) {
    console.error("Admin signin error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}