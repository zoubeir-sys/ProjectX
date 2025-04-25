import Image from "next/image";
import prisma from "@/lib/prisma";
import ClassScoresChart from "./ClassScoresChart";

const ClassScoresChartContainer = async () => {
  const subjects = await prisma.subject.findMany({
    include: {
      lessons: {
        include: {
          exams: { include: { results: true } },
          assignments: { include: { results: true } },
        },
      },
    },
  });

  const data = subjects.map((subject) => {
    const examScores = subject.lessons.flatMap((lesson) =>
      lesson.exams.flatMap((exam) => exam.results.map((r) => r.score))
    );

    const assignmentScores = subject.lessons.flatMap((lesson) =>
      lesson.assignments.flatMap((assignment) => assignment.results.map((r) => r.score))
    );

    const avg = (arr: number[]) =>
      arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    return {
      subject: subject.name,
      examAvg: avg(examScores),
      assignmentAvg: avg(assignmentScores),
    };
  });

  return (
    <div className="bg-white rounded-xl p-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Scores moyens par matière</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <ClassScoresChart data={data} />
    </div>
  );
};

export default ClassScoresChartContainer;
