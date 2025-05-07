import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";
import SalleForm from "./forms/SalleForm";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "salle";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { classes: studentClasses, grades: studentGrades };
        break;
      case "exam":
        const examSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        const examSalles = await prisma.salle.findMany({
          select: { id: true, name: true, floor: true },
        });
        const examClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        const examLessons = await prisma.lesson.findMany({
          select: { id: true, name: true, classId: true },
        });
        relatedData = { 
          subjects: examSubjects,
          salles: examSalles,
          classes: examClasses,
          lessons: examLessons
        };
        break;
      case "lesson":
        const lessonSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        const lessonClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        const lessonTeachers = await prisma.teacher.findMany({
          select: { 
            id: true, 
            name: true, 
            surname: true,
            subjects: {
              select: { id: true }
            }
          },
        });
        const lessonSalles = await prisma.salle.findMany({
          select: { id: true, name: true, floor: true }
        });
        relatedData = { 
          subjects: lessonSubjects, 
          classes: lessonClasses, 
          teachers: lessonTeachers,
          salles: lessonSalles
        };
        break;
      case "assignment":
        const lessons = await prisma.lesson.findMany({
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                surname: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
              },
            },
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          ...(role === "teacher" ? { where: { teacherId: currentUserId! } } : {}),
        });
        
        relatedData = { lessons };
        break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;








