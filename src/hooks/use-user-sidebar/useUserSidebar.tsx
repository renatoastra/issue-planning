import { ROOM_STATUS } from "@/enum/status";
import { api } from "@/utils/api";
import { useContext, useState } from "react";
import { RoomContext } from "@/context/room-data";

export const useUserSidebar = () => {
  const {
    step,
    roomId,
    usersInRoom,
    roomOwnerId,
    isLoggedUserAdmin,
    labels,
    loading,
  } = useContext(RoomContext);
  const { data: getVoteResult } = api.room.getResult.useQuery(
    { roomId },
    { enabled: step === ROOM_STATUS.VOTED },
  );
  const [open, setOpen] = useState(true);
  return {
    labels,
    usersInRoom,
    getVoteResult,
    isLoggedUserAdmin,
    roomOwnerId,
    step,
    open,
    setOpen,
    loading,
  };
};
