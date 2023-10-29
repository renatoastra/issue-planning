import { ResultChart } from "@/components/Charts/Vertical";
import { type UsersInRoom } from "@/types/users-in-room";

import { useCallback } from "react";
interface VotedSectionProps {
  usersInRoom: UsersInRoom[];
}

export const VotedSection = ({ usersInRoom }: VotedSectionProps) => {
  const Result = useCallback(() => {
    return <ResultChart usersInRoom={usersInRoom} />;
  }, [usersInRoom]);
  return Result();
};
