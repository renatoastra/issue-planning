import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { type UsersInRoom } from "@/types/users-in-room";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
};

const labels = ["PP", "P", "M", "G", "GG"];

interface ResultChartProps {
  result: UsersInRoom[] | undefined;
}

export function ResultChart({ result }: ResultChartProps) {
  const getVotesByType = (type: string) => {
    return result?.filter((user: UsersInRoom) => user.choose === type);
  };
  const data = () => {
    return {
      labels,
      datasets: [
        {
          label: "Votes",
          data: labels.map((p) => getVotesByType(p)?.length ?? 0),
          backgroundColor: "rgb(168, 85, 247)",
          borderColor: "rgb(79, 70, 229)",
          borderWidth: 1,
        },
      ],
    };
  };

  return <Bar options={options} data={data()} />;
}
