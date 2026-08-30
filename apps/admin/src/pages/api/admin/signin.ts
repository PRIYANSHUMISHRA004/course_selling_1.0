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

  const { username, password } = req.body;

  const admin = await Admin.findOne({
    username,
    password,
  });

  if (!admin) {
    return res.status(401).json({
      message: "Invalid username or password",
      token: null,
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
console.log("Radhe radhe admin is",admin.name)
  return res.status(200).json({
    message: "Login successful",
    name: admin.name,
    token,
  });
}