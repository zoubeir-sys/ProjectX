import Image from "next/image";
import prisma from "@/lib/prisma";
import StudentTeacherRatioChart from "./StudentTeacherRatioChart";

const StudentTeacherRatioChartContainer = async () => {
  const classes = await prisma.class.findMany({
    include: {
      students: true,
      lessons: {
        include: {
          teacher: true,
        },
      },
    },
  });

  const data = classes.map((cls) => {
    const uniqueTeachers = Array.from(
      new Set(cls.lessons.map((lesson) => lesson.teacherId))
    );

    return {
      className: cls.name,
      students: cls.students.length,
      teachers: uniqueTeachers.length,
    };
  });

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Ratio Étudiants / Enseignants</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <StudentTeacherRatioChart data={data} />
    </div>
  );
};

export default StudentTeacherRatioChartContainer;
