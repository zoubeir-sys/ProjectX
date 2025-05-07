import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { classId, studentId, grades, average } = await req.json();
    console.log("Received data:", { classId, studentId, gradesCount: grades?.length, average });

    if (!classId || !studentId || !grades || grades.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create results for each grade
    for (const grade of grades) {
      try {
        console.log("Processing grade:", grade);

        // Find the subject
        const subject = await prisma.subject.findFirst({
          where: { name: grade.subject },
        });

        if (!subject) {
          console.log(`Subject not found: ${grade.subject}, creating it...`);
          // Create the subject if it doesn't exist
          const newSubject = await prisma.subject.create({
            data: { name: grade.subject }
          });

          // Create a lesson for this subject and class
          const newLesson = await prisma.lesson.create({
            data: {
              name: `${grade.subject} Lesson`,
              subjectId: newSubject.id,
              classId: parseInt(classId),
              startTime: new Date(),
              endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
              teacherId: "teacher1", // Use a default teacher ID or get from request
            }
          });

          // Create an exam for this subject and class
          const newExam = await prisma.exam.create({
            data: {
              startTime: new Date(),
              endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
              subjectId: newSubject.id,
              classId: parseInt(classId)
            }
          });

          // Create an assignment for this lesson
          const newAssignment = await prisma.assignment.create({
            data: {
              title: `${grade.subject} Assignment`,
              description: `Assignment for ${grade.subject}`,
              dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week later
              lessonId: newLesson.id,
            }
          });

          // Create exam result
          await prisma.result.create({
            data: {
              score: grade.examValue,
              studentId: studentId,
              examId: newExam.id, // Use the newly created exam ID
            },
          });

          // Create assignment result
          await prisma.result.create({
            data: {
              score: grade.assignmentValue,
              studentId: studentId,
              assignmentId: newAssignment.id, // Use the newly created assignment ID
            },
          });

          continue; // Skip to next grade after creating everything
        }

        // Find the lesson for this subject and class
        let lesson = await prisma.lesson.findFirst({
          where: {
            subjectId: subject.id,
            classId: parseInt(classId),
          },
        });

        if (!lesson) {
          console.log(`No lesson found for subject ${grade.subject} in class ${classId}, creating one...`);
          // Create a lesson if it doesn't exist
          lesson = await prisma.lesson.create({
            data: {
              name: `${grade.subject} Lesson`,
              subjectId: subject.id,
              classId: parseInt(classId),
              startTime: new Date(),
              endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
              teacherId: "teacher1", // Use a default teacher ID or get from request
            }
          });
        }

        // Find or create an exam for this lesson
        let exam = await prisma.exam.findFirst({
          where: {
            subjectId: subject.id,
            classId: parseInt(classId)
          },
        });

        if (!exam) {
          exam = await prisma.exam.create({
            data: {
              startTime: new Date(),
              endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
              subjectId: subject.id,
              classId: parseInt(classId)
            }
          });
        }

        // Find or create an assignment for this lesson
        let assignment = await prisma.assignment.findFirst({
          where: {
            lessonId: lesson.id,
          },
        });

        if (!assignment) {
          assignment = await prisma.assignment.create({
            data: {
              title: `${grade.subject} Assignment`,
              description: `Assignment for ${grade.subject}`,
              dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week later
              lessonId: lesson.id,
            }
          });
        }

        // Check if results already exist for this student and exam
        const existingExamResult = await prisma.result.findFirst({
          where: {
            studentId: studentId,
            examId: exam.id,
          },
        });

        // Update or create exam result
        if (existingExamResult) {
          await prisma.result.update({
            where: { id: existingExamResult.id },
            data: { score: grade.examValue },
          });
        } else {
          await prisma.result.create({
            data: {
              score: grade.examValue,
              studentId: studentId,
              examId: exam.id,
            },
          });
        }

        // Check if assignment result already exists
        const existingAssignmentResult = await prisma.result.findFirst({
          where: {
            studentId: studentId,
            assignmentId: assignment.id,
          },
        });

        // Update or create assignment result
        // Update or create assignment result
        if (existingAssignmentResult) {
          await prisma.result.update({
            where: { id: existingAssignmentResult.id },
            data: { score: grade.assignmentValue },
          });
          console.log(`Updated assignment result for ${grade.subject} to ${grade.assignmentValue}`);
        } else {
          await prisma.result.create({
            data: {
              score: grade.assignmentValue,
              studentId: studentId,
              assignmentId: assignment.id,
            },
          });
          console.log(`Created assignment result for ${grade.subject} with score ${grade.assignmentValue}`);
        }
      } catch (gradeError) {
        console.error("Error processing grade:", gradeError);
        return NextResponse.json({
          error: `Error processing grade for subject "${grade.subject}"`,
          details: (gradeError as Error).message,
          stack: (gradeError as Error).stack // Add stack trace for debugging
        }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "Results saved successfully" });
  } catch (error) {
    console.error("Error saving results:", error);
    return NextResponse.json({
      error: "Failed to save results",
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const classId = searchParams.get("classId");

  if (!studentId && !classId) {
    return NextResponse.json({ error: "Student ID or Class ID is required" }, { status: 400 });
  }

  try {
    const results = await prisma.result.findMany({
      where: {
        ...(studentId && { studentId }),
        ...(classId && {
          student: {
            classId: parseInt(classId)
          }
        }),
      },
      include: {
        student: {
          select: {
            name: true,
            surname: true,
          },
        },
        exam: {
          include: {
            subject: true,
          },
        },
        assignment: {
          include: {
            lesson: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}









