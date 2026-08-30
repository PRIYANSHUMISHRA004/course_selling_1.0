import type { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";
import { verifyToken } from "auth";
import { Course, User, connectDB } from "db";
import mongoose from "mongoose";

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

    let userPayload;
    try {
      userPayload = verifyToken(req, process.env.USER_SECRET!);
    } catch {
      return res.status(401).json({ message: "Unauthorized: Invalid or missing user token" });
    }

    const { courseId } = req.body;

    if (!courseId || typeof courseId !== "string" || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        message: "Valid course ID is required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (!course.published) {
      return res.status(400).json({
        message: "Cannot purchase an unpublished course",
      });
    }

    if (typeof course.price !== "number" || isNaN(course.price) || course.price <= 0) {
      return res.status(400).json({
        message: "Invalid course price",
      });
    }

    const dbUser = await User.findOne({
      username: userPayload.username,
    });

    if (!dbUser) {
      return res.status(404).json({
        message: "User account not found",
      });
    }

    const alreadyPurchased = dbUser.courses.some(
      (id: any) => id.toString() === courseId,
    );

    if (alreadyPurchased) {
      return res.status(409).json({
        message: "Course already purchased",
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const amount = Math.round(course.price * 100);

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${course._id.toString().slice(-8)}_${Date.now()}`,
      notes: {
        courseId: course._id.toString(),
        username: dbUser.username,
        userId: dbUser._id.toString(),
      },
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("create-order error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
