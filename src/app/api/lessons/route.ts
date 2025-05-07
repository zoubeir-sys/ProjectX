// src/app/api/lessons/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const { userId } = auth();

  if (!classId) {
    return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const lessons = await prisma.lesson.findMany({
      where: {
        classId: parseInt(classId),
        teacherId: userId,
      },
      select: {
        id: true,
        name: true,
        classId: true,
      },
    });
    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json({ error: "Failed to load lessons" }, { status: 500 });
  }
}
