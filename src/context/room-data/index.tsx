import { type UsersInRoom } from "@/types/users-in-room";
import { type ReactNode, createContext, useState } from "react";
import { type RoomProviderProps, type RoomContextProps } from "./types";
import { useSession } from "next-auth/react";
import { ROOM_STATUS } from "@/enum/status";

export const RoomContext = createContext({} as RoomContextProps);

export const RoomContextProvider = ({
  children,
  roomId,
  link,
  roomOwnerId,
  title,
}: RoomProviderProps) => {
  const [step, setStep] = useState<ROOM_STATUS>(ROOM_STATUS.VOTING);
  const [sideBarIsLoading, setSideBarIsLoading] = useState(false);

  const [usersInRoom, setUsersInRoom] = useState<UsersInRoom[]>([]);
  const { data } = useSession();
  const isLoggedUserAdmin = roomOwnerId === data?.user.id;

  const labels = ["PP", "P", "M", "G", "GG", "🍆"];

  const loading = {
    sideBarIsLoading,
    setSideBarIsLoading,
  };
  return (
    <RoomContext.Provider
      value={{
        setStep,
        step,
        usersInRoom,
        setUsersInRoom,
        roomId,
        roomOwnerId,
        title,
        link,
        isLoggedUserAdmin,
        labels,
        loading,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
