import { createContext, useState } from "react";
import { type RoomApiProviderProps, type RoomApiContextProps } from "./types";
import { useFetchRoomData } from "@/hooks/use-fetch-room-data";

const RoomApiContext = createContext({} as RoomApiContextProps);

const RoomApiContextProvider = ({ roomId, children }: RoomApiProviderProps) => {
  const {
    getRoomDataRefetch,
    isMutatingVote,
    onInsertVote,
    onResetRoom,
    onRevealRoom,
    onSetTimer,
    roomData,
    getRoom,
    isLoadingRoomQueries,
    isMutatingOnResetRoom,
  } = useFetchRoomData({ roomId: roomId });

  return (
    <RoomApiContext.Provider
      value={{
        getRoomDataRefetch,
        isMutatingVote,
        onInsertVote,
        onResetRoom,
        onRevealRoom,
        onSetTimer,
        roomData,
        getRoom,
        isLoadingRoomQueries,
        isMutatingOnResetRoom,
      }}
    >
      {children}
    </RoomApiContext.Provider>
  );
};

export { RoomApiContextProvider, RoomApiContext };
