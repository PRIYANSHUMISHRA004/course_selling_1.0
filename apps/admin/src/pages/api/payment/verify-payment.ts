import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB, User, Course } from "db";
import { verifyToken } from "auth";
import crypto from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method Not Allowed",
    });
  }

  try {
    await connectDB();

    const user = verifyToken(req, process.env.USER_SECRET!);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !courseId
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    const dbUser = await User.findOne({
      username: user.username,
    });

    if (!dbUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    await User.updateOne(
      { username: user.username },
      {
        $addToSet: {
          courses: course._id,
        },
      },
    );

    return res.status(200).json({
      message: "Course purchased successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}