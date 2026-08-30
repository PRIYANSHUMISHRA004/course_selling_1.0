import type { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";
import { verifyToken } from "auth";
import { Course, User, connectDB } from "db";


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
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const user = verifyToken(req, process.env.USER_SECRET!);

    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        message: "Course Id is required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
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

    const alreadyPurchased = dbUser.courses.some(
      (id: any) => id.toString() === courseId,
    );

    if (alreadyPurchased) {
      return res.status(400).json({
        message: "Course already purchased",
      });
    }

    const amount = course.price * 100;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `course_${courseId}_${user.username}`,
    });
    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
