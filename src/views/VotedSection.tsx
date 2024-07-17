import { BarChartResult } from "@/components/bar-chart";
import { api } from "@/utils/api";

import { useCallback } from "react";
interface VotedSectionProps {
  roomId: string;
}

export const VotedSection = ({ roomId }: VotedSectionProps) => {
  const { data: result } = api.room.getResult.useQuery({ roomId });
  const Result = useCallback(() => {
    return <BarChartResult result={result} />;
  }, [result]);
  return Result();
};
