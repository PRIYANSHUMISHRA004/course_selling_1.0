import type { NextApiRequest, NextApiResponse } from "next";
import { User, connectDB } from "db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userSigninSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username must be at most 100 characters"),
  password: z
    .string()
    .trim()
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

  const parseResult = userSigninSchema.safeParse(req.body);

  if (!parseResult.success) {
    const firstErrorMessage =
      parseResult.error.issues[0]?.message || "Invalid input data";
    return res.status(400).json({
      message: firstErrorMessage,
      issues: parseResult.error.issues,
    });
  }

  const { username, password } = parseResult.data;

  try {
    await connectDB();

    const user = await User.findOne({
      username: username.trim(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.USER_SECRET!,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      name: user.name,
      token,
    });
  } catch (err) {
    console.error("User signin error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
