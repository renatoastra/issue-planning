import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import mathitoImg from "@/assets/mathito.png";

export const useTimer = () => {
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const minutes = Math.floor((timer % 3600) / 60);
  const seconds = timer % 60;
  const { toast } = useToast();

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

  useEffect(() => {
    if (timer === 20 && isTimerRunning) {
      toast({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        title: <h1 className="text-xl font-bold">{"Tempo acabando!"}</h1>,
        description: (
          <span className="flex gap-2">
            <Image
              width={120}
              src={mathitoImg.src}
              alt="Mathito"
              height={120}
            />
            <span className="text-lg font-normal">
              {" "}
              - Faltam 20 segundos para votar gurizada!
            </span>
          </span>
        ),
      });
    }
  }, [isTimerRunning, timer, toast]);

  const formatedTimer = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  return { formatedTimer, setTimer, isTimerRunning };
};
