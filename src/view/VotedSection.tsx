import { ResultChart } from "@/components/Charts/Vertical";
import { type UsersInRoom } from "@/types/users-in-room";
import { api } from "@/utils/api";

import { useCallback } from "react";
interface VotedSectionProps {
  usersInRoom: UsersInRoom[];
  roomId: string;
}

export const VotedSection = ({ usersInRoom, roomId }: VotedSectionProps) => {
  const { data: result } = api.room.getResult.useQuery({ roomId });
  const Result = useCallback(() => {
    return <ResultChart result={result} roomId={roomId} />;
  }, [result, roomId]);
  return Result();
};
