// src/app/api/attendance/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";  // Adjust path if needed

export async function POST(req: Request) {
  const { date, classId, attendances } = await req.json();

  if (!date || !classId || !attendances) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const attendancePromises = attendances.map((attendance: { studentId: string; present: boolean; note?: string }) =>
      prisma.attendance.create({
        data: {
          date: new Date(date),
          present: attendance.present,
          studentId: attendance.studentId,
          lessonId: parseInt(classId), // Assuming you're associating attendance with lessons
          
        },
      })
    );

    await Promise.all(attendancePromises);

    return NextResponse.json({ message: "Attendance saved successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
