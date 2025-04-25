"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const StudentTeacherRatioChart = ({
  data,
}: {
  data: { className: string; students: number; teachers: number }[];
}) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="className" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="students" fill="#00a8f3" name="Étudiants" radius={[6, 6, 0, 0]} />
        <Bar dataKey="teachers" fill="#8ce08c" name="Enseignants" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StudentTeacherRatioChart;
