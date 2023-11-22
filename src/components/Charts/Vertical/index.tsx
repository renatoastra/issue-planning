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
import { type LocalStorageData } from "@/hooks/use-pusher/types";

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

const labels = ["PP", "P", "M", "G", "GG"];

interface ResultChartProps {
  result: UsersInRoom[] | undefined;
  roomId: string;
}

export function ResultChart({ result, roomId }: ResultChartProps) {
  const getVotesByType = (type: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return result?.filter((user: UsersInRoom) => user.choose === type);
  };

  const data = () => {
    return {
      labels,
      datasets: [
        {
          label: "Votos",
          data: labels.map((p) => getVotesByType(p)?.length ?? []),
          backgroundColor: "rgb(79, 70, 229)",
          borderColor: "rgb(79, 70, 229)",
        },
      ],
    };
  };

  return <Bar options={options} data={data()} />;
}
