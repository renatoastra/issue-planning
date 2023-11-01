import { type UsersInRoom } from "@/types/users-in-room";
import { type ReactNode, createContext, useState } from "react";
import { type VoteResultContextProps } from "./types";

export const VoteResultContext = createContext({} as VoteResultContextProps);

export const VoteResultContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [usersResult, setUsersResult] = useState<UsersInRoom[]>([]);
  return (
    <VoteResultContext.Provider value={{ usersResult, setUsersResult }}>
      {children}
    </VoteResultContext.Provider>
  );
};
