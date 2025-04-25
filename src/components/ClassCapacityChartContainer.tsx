import prisma from "@/lib/prisma";
import ClassCapacityChart from "./ClassCapacityChart";

const ClassCapacityChartContainer = async () => {
  const classes = await prisma.class.findMany({
    include: {
      students: true,
    },
  });

  const formattedData = classes
    .map((cls) => ({
      name: cls.name,
      enrolled: cls.students.length,
      capacity: cls.capacity,
      utilization: Math.round((cls.students.length / cls.capacity) * 100),
    }))
    .sort((a, b) => b.utilization - a.utilization); // 🔁 Sort by utilization

  const average =
    Math.round(
      formattedData.reduce((acc, cur) => acc + cur.utilization, 0) /
        formattedData.length
    );

  return (
    <div className="w-full h-full">
      <ClassCapacityChart data={formattedData} average={average} />
    </div>
  );
};

export default ClassCapacityChartContainer;
