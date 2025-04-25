"use client";

import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Jan",
    revenus: 4000,
    depenses: 2400,
  },
  {
    name: "Feb",
    revenus: 3000,
    depenses: 1398,
  },
  {
    name: "Mar",
    revenus: 2000,
    depenses: 9800,
  },
  {
    name: "Apr",
    revenus: 2780,
    depenses: 3908,
  },
  {
    name: "May",
    revenus: 1890,
    depenses: 4800,
  },
  {
    name: "Jun",
    revenus: 2390,
    depenses: 3800,
  },
  {
    name: "Jul",
    revenus: 3490,
    depenses: 4300,
  },
  {
    name: "Aug",
    revenus: 5000,
    depenses: 3200,
  },
  {
    name: "Sep",
    revenus: 3690,
    depenses: 4300,
  },
  {
    name: "Oct",
    revenus: 3890,
    depenses: 4300,
  },
  {
    name: "Nov",
    revenus: 4490,
    depenses: 4300,
  },
  {
    name: "Dec",
    revenus: 6000,
    depenses: 3500,
  },
];

const FinanceChart = () => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Finance</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false}  tickMargin={20}/>
          <Tooltip />
          <Legend
            align="center"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
          />
          <Line
            type="monotone"
            dataKey="revenus"
            stroke="#00a8f3"
            strokeWidth={5}
          />
          <Line type="monotone" dataKey="depenses" stroke="#fd0000" strokeWidth={5}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;
