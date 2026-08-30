import type { NextApiRequest, NextApiResponse } from "next";
import { User, connectDB } from "db";
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
