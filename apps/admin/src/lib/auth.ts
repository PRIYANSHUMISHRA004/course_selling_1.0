import type { NextApiRequest } from "next";
import jwt from "jsonwebtoken";

export interface AdminPayload {
  username: string;
}

export function verifyAdmin(req: NextApiRequest) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new Error("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.ADMIN_SECRET!
    ) as AdminPayload;

    return decoded;
  } catch (err) {
    throw new Error("Invalid token");
  }
}