import { ResultChart } from "@/components/Charts/Vertical";
import { VoteResultContext } from "@/context/vote-result";
import { type UsersInRoom } from "@/types/users-in-room";

import { useCallback, useContext } from "react";
interface VotedSectionProps {
  usersInRoom: UsersInRoom[];
}

export const VotedSection = ({ usersInRoom }: VotedSectionProps) => {
  const { usersResult } = useContext(VoteResultContext);

  const Result = useCallback(() => {
    return <ResultChart usersInRoom={usersInRoom} />;
  }, [usersInRoom]);
  return Result();
};
