// src/app/api/classes/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";  // Adjust path if needed

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load classes" }, { status: 500 });
  }
}
