import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalender";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";
import 'moment/locale/fr';

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  const dataRes = await prisma.lesson.findMany({
    where: {
      ...(type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as number }),
    },
    include: {
      class: true, // Include class information
      salle: true, // Include salle information
    },
  });

  const data = dataRes.map((lesson) => ({
    title: `Class: ${lesson.class?.name || 'No Class'}, Salle: ${lesson.salle?.name || 'No Room'}, Lesson: ${lesson.name}`,
    start: lesson.startTime,
    end: lesson.endTime,
  }));

  const schedule = adjustScheduleToCurrentWeek(data);

  return (
    <div className="">
      <BigCalendar data={schedule} />
    </div>
  );
};

// Helper function to format time
const formatTime = (startTime: Date, endTime: Date) => {
  const start = new Date(startTime).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const end = new Date(endTime).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${start} - ${end}`;
};

export default BigCalendarContainer;





