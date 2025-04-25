"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ClassScoresChart = ({
  data,
}: {
  data: { subject: string; examAvg: number; assignmentAvg: number }[];
}) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="subject"
          angle={-35}
          textAnchor="end"
          interval={0}
          height={80}
          tick={{ fontSize: 12 }}
        />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="examAvg" fill="#4ade80" name="Examens" radius={[10, 10, 0, 0]} />
        <Bar dataKey="assignmentAvg" fill="#f87171" name="Devoirs" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ClassScoresChart;
