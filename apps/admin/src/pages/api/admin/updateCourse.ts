

import type { NextApiRequest, NextApiResponse } from "next";
import { Admin, Course, connectDB } from "db";
import { verifyToken } from "auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    await connectDB();

    const adminData = verifyToken(req, process.env.ADMIN_SECRET!);

    const admin = await Admin.findOne({
      username: adminData.username,
    });

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    const {
      courseId,
      title,
      description,
      imageLink,
      price,
      published,
      category,
      level,
      language,
      duration,
      thumbnail,
      tags,
      totalLessons,
      lessons,
    } = req.body;

    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required",
      });
    }

    const updateFields: Record<string, any> = {};

    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (imageLink !== undefined) updateFields.imageLink = imageLink;
    if (price !== undefined) updateFields.price = price;
    if (published !== undefined) updateFields.published = published;
    if (category !== undefined) updateFields.category = category;
    if (level !== undefined) updateFields.level = level;
    if (language !== undefined) updateFields.language = language;
    if (duration !== undefined) updateFields.duration = duration;
    if (thumbnail !== undefined) updateFields.thumbnail = thumbnail;
    if (tags !== undefined) updateFields.tags = tags;
    if (lessons !== undefined) {
      updateFields.lessons = lessons;
      if (totalLessons === undefined) {
        updateFields.totalLessons = lessons.length;
      }
    }
    if (totalLessons !== undefined) updateFields.totalLessons = totalLessons;

    const course = await Course.findOneAndUpdate(
      {
        _id: courseId,
        adminId: admin._id,
      },
      {
        $set: updateFields,
      },
      {
        new: true,
      }
    );

    if (!course) {
      return res.status(404).json({
        message: "Course not found or not owned by admin",
      });
    }

    return res.status(200).json({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("updateCourse API Error:", error);
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
}