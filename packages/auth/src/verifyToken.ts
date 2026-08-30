import jwt from "jsonwebtoken";

export interface TokenPayload {
  username: string;
}

interface AuthRequest {
  headers: {
    authorization?: string;
  };
}

export function verifyToken(
  req: AuthRequest,
  secret: string
): TokenPayload {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new Error("No token provided");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new Error("Invalid authorization header");
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string") {
      throw new Error("Invalid token payload");
    }

    return {
      username: decoded.username as string,
    };
  } catch {
    throw new Error("Invalid token");
  }
}