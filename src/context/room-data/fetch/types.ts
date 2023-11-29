import {
  type GetRoom,
  type GetRoomDataRefetch,
  type IsMutatingVote,
  type OnInsertVote,
  type OnResetRoom,
  type OnRevealRoom,
  type OnSetTimer,
  type RoomData,
} from "@/types/room-mutation-procedure";

interface RoomApiContextProps {
  getRoomDataRefetch: GetRoomDataRefetch;
  isMutatingVote: IsMutatingVote;
  onInsertVote: OnInsertVote;
  onResetRoom: OnResetRoom;
  onRevealRoom: OnRevealRoom;
  onSetTimer: OnSetTimer;
  roomData: RoomData;
  getRoom: GetRoom;
}

interface RoomApiProviderProps {
  roomId: string;
  children: React.ReactNode;
}

export type { RoomApiContextProps, RoomApiProviderProps };
