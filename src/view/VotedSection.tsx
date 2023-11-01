import { ResultChart } from "@/components/Charts/Vertical";
import { VoteResultContext } from "@/context/vote-result";
import { type UsersInRoom } from "@/types/users-in-room";

import { useCallback, useContext } from "react";
interface VotedSectionProps {
  usersInRoom: UsersInRoom[];
  roomId: string;
}

export const VotedSection = ({ usersInRoom, roomId }: VotedSectionProps) => {
  const Result = useCallback(() => {
    return <ResultChart usersInRoom={usersInRoom} roomId={roomId} />;
  }, [roomId, usersInRoom]);
  return Result();
};
