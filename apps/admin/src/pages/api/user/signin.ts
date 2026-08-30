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

  const { username, password } = req.body;

  const user = await User.findOne({
    username,
    password,
  });

  if (!user) {
    return res.status(401).json({
      message: "Invalid username or password",
    });
  }

  const token = jwt.sign(
    {
      username: user.username,
    },
    process.env.USER_SECRET!
  );

  return res.status(200).json({
    message: "Login successful",
    name: user.name,
    token,
  });
}
