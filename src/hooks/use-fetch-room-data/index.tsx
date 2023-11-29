import { api } from "@/utils/api";

export const useFetchRoomData = ({ roomId }: { roomId: string }) => {
  const { data: roomData, refetch: getRoomDataRefetch } =
    api.room.getRoomData.useQuery({ roomId });
  const { mutateAsync: onInsertVote, isLoading: isMutatingVote } =
    api.room.createVote.useMutation();
  const { mutateAsync: onRevealRoom } = api.room.revealRoom.useMutation({});
  const { mutateAsync: onResetRoom } = api.room.resetRoom.useMutation({});
  const { mutateAsync: onSetTimer } = api.room.setTimer.useMutation({});
  const { data: getRoom } = api.room.getByRoomId.useQuery({
    id: roomId,
  });
  return {
    onRevealRoom,
    onResetRoom,
    onSetTimer,
    onInsertVote,
    isMutatingVote,
    getRoomDataRefetch,
    roomData,
    getRoom,
  };
};
