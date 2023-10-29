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
import { type UsersInRoom } from "@/pages/room/[roomId]/types";

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
    title: {
      display: true,
      text: "Resultado dos votos",
    },
  },
};

const labels = ["PP", "P", "M", "G"];

interface ResultChartProps {
  usersInRoom: UsersInRoom[];
}

const randomBackground = () => {
  const colors = [
    "rgb(4, 120, 87, 0.5)",
    "rgb(190, 18, 60, 0.5)",
    "rgb(126, 34, 206, 0.5)",
    "rgb(185, 28, 28, 0.5)",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export function ResultChart({ usersInRoom }: ResultChartProps) {
  const getVotesByType = (type: string) => {
    return usersInRoom?.filter((user) => user.choose === type);
  };

  const data = () => {
    return {
      labels,
      datasets: [
        {
          label: "Votos",
          data: labels.map((p) => getVotesByType(p).length),
          backgroundColor: "rgb(79, 70, 229)",
        },
      ],
    };
  };

  return <Bar options={options} data={data()} />;
}
