import type { NextApiRequest, NextApiResponse } from "next";
import { User, connectDB } from "db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userSignupSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(100, "Name must be at most 100 characters"),
  
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

  const parseResult = userSignupSchema.safeParse(req.body);

  if (!parseResult.success) {
    const firstErrorMessage =
      parseResult.error.issues[0]?.message || "Invalid input data";
    return res.status(400).json({
      message: firstErrorMessage,
      issues: parseResult.error.issues,
    });
  }

  const { name, username, password } = parseResult.data;

  try {
    await connectDB();

    const existingUser = await User.findOne({ username: username.trim() });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name?.trim() || username.trim(),
      username: username.trim(),
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.USER_SECRET!,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "User created successfully",
      name: user.name,
      token,
    });
  } catch (err) {
    console.error("User signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
