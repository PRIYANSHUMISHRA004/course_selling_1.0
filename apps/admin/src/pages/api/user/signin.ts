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

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

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
