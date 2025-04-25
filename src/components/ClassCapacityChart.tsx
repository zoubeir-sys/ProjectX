"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import { useState } from "react";

type ClassData = {
  name: string;
  enrolled: number;
  capacity: number;
  utilization: number;
};

const ClassCapacityChart = ({
  data,
  average,
}: {
  data: ClassData[];
  average: number;
}) => {
  const [showPercentage, setShowPercentage] = useState(true);

  const toggleMode = () => setShowPercentage(!showPercentage);

  return (
    <div className="w-full h-96 bg-white rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Utilisation des classes</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500">Moyenne: {average}%</p>
          <button
            onClick={toggleMode}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
          >
            Afficher en {showPercentage ? "nombres" : "pourcentage"}
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            unit={showPercentage ? "%" : ""}
            domain={showPercentage ? [0, 120] : ["auto", "auto"]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const { enrolled, capacity, utilization } = payload[0].payload;
                return (
                  <div className="bg-white p-2 rounded shadow text-sm">
                    {showPercentage ? (
                      <>
                        <p>
                          <strong>{utilization}%</strong>
                        </p>
                        <p>
                          {enrolled} / {capacity} étudiants
                        </p>
                      </>
                    ) : (
                      <p>
                        {enrolled} / {capacity} étudiants
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey={showPercentage ? "utilization" : "enrolled"}
            barSize={40}
            isAnimationActive
          >
            <LabelList
              dataKey={showPercentage ? "utilization" : "enrolled"}
              position="top"
              content={({ value }) =>
                showPercentage ? `${value}%` : `${value} élèves`
              }
            />
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.utilization >= 100 ? "#f74747" : "#00a8f3"} // ✅ Red for >100% utilization
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClassCapacityChart;
