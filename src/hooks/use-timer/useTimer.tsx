import { useEffect, useState } from "react";

export const useTimer = () => {
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const hours = Math.floor(timer / 3600);
  const minutes = Math.floor((timer % 3600) / 60);
  const seconds = timer % 60;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev === 0 ? 0 : prev - 1));
    }, 1000);

    if (timer === 0) {
      setIsTimerRunning(false);
    }

    if (timer > 0) {
      setIsTimerRunning(true);
    }

    return () => {
      clearInterval(interval);
    };
  }, [timer]);

  const formatedTimer = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return { formatedTimer, setTimer, isTimerRunning };
};
