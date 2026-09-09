import type { NextApiRequest, NextApiResponse } from "next";
import { Admin, connectDB } from "db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";

const adminSignupSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name must be at most 100 characters")
    .optional()
    .or(z.literal("")),
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
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  const parseResult = adminSignupSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      message: parseResult.error.issues[0]?.message || "Invalid input data",
    });
  }

  const { name, username, password } = parseResult.data;

  try {
    await connectDB();

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
      { expiresIn: "1d" },
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
