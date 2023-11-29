import { type useFetchRoomData } from "@/hooks/use-fetch-room-data";

type UseFetchRoomDataReturn = ReturnType<typeof useFetchRoomData>;

type GetRoomDataRefetch = UseFetchRoomDataReturn["getRoomDataRefetch"];
type IsMutatingVote = UseFetchRoomDataReturn["isMutatingVote"];
type OnInsertVote = UseFetchRoomDataReturn["onInsertVote"];
type OnResetRoom = UseFetchRoomDataReturn["onResetRoom"];
type OnRevealRoom = UseFetchRoomDataReturn["onRevealRoom"];
type OnSetTimer = UseFetchRoomDataReturn["onSetTimer"];
type RoomData = UseFetchRoomDataReturn["roomData"];
type GetRoom = UseFetchRoomDataReturn["getRoom"];

export type {
  GetRoomDataRefetch,
  IsMutatingVote,
  OnInsertVote,
  OnResetRoom,
  OnRevealRoom,
  OnSetTimer,
  RoomData,
  GetRoom,
};
