import type { NextApiRequest, NextApiResponse } from "next";
import { Admin, Course, connectDB } from "db";
import { verifyToken } from "auth";

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

    let adminData;
    try {
      adminData = verifyToken(req, process.env.ADMIN_SECRET!);
    } catch {
      return res.status(401).json({ message: "Unauthorized: Invalid or missing admin token" });
    }

    const admin = await Admin.findOne({
      username: adminData.username,
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    const { title, description, price, imageLink, published } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const numericPrice = typeof price === "number" ? price : Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ message: "Price must be a valid non-negative number" });
    }

    const course = new Course({
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      price: numericPrice,
      imageLink: typeof imageLink === "string" ? imageLink.trim() : "",
      published: Boolean(published),
      adminId: admin._id,
    });

    await course.save();

    return res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (err) {
    console.error("createCourses API Error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}