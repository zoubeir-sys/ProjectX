// src/app/api/students/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";  // Adjust path if needed

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  if (!classId) {
    return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
  }

  try {
    const students = await prisma.student.findMany({
      where: {
        classId: parseInt(classId),
      },
      select: {
        id: true,
        name: true,
        surname: true,
        img: true,
      },
    });
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load students" }, { status: 500 });
  }
}
