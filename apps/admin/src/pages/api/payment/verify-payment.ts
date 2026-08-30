import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB, User, Course } from "db";
import { verifyToken } from "auth";
import Razorpay from "razorpay";
import crypto from "crypto";
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
      !courseId ||
      !mongoose.Types.ObjectId.isValid(courseId)
    ) {
      return res.status(400).json({
        message: "Missing or invalid payment parameters",
      });
    }

    // Step 1: Verify HMAC signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    // Step 2: Fetch user and course
    const dbUser = await User.findOne({
      username: userPayload.username,
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

    // Step 3: Fetch Razorpay order from Razorpay API and verify order-course binding
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);

    if (!rzpOrder) {
      return res.status(400).json({
        message: "Could not retrieve Razorpay order details",
      });
    }

    // Verify order notes bind to the same course and user
    if (rzpOrder.notes?.courseId && rzpOrder.notes.courseId !== courseId) {
      return res.status(403).json({
        message: "Order course mismatch: Payment does not match the requested course",
      });
    }

    if (
      rzpOrder.notes?.username &&
      rzpOrder.notes.username !== dbUser.username &&
      rzpOrder.notes?.userId !== dbUser._id.toString()
    ) {
      return res.status(403).json({
        message: "Order user mismatch: Payment does not belong to this account",
      });
    }

    // Verify amount and currency
    const expectedAmount = Math.round(course.price * 100);
    if (rzpOrder.amount !== expectedAmount || rzpOrder.currency !== "INR") {
      return res.status(400).json({
        message: "Payment amount or currency mismatch",
      });
    }

    // Step 4: Add course to user's purchased courses
    await User.findByIdAndUpdate(
      dbUser._id,
      {
        $addToSet: {
          courses: course._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Course purchased successfully",
    });
  } catch (err) {
    console.error("verify-payment error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}