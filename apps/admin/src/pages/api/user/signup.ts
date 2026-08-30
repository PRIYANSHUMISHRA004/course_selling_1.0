import type { NextApiRequest, NextApiResponse } from "next";
import { User, connectDB } from "db";
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

  const { name, username, password } = req.body;

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return res.status(409).json({
      message: "User already exists",
    });
  }

  const user = new User({
    name,
    username,
    password,
  });

  await user.save();

  const token = jwt.sign(
    {
      username,
    },
    process.env.USER_SECRET!
  );

  return res.status(201).json({
    message: "User created successfully",
    name,
    token,
  });
}
