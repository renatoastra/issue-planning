import { type ROOM_STATUS } from "@/enum/status";
import { type UsersInRoom } from "@/types/users-in-room";
import { type SetStateAction, type Dispatch } from "react";

interface RoomContextProps {
  setUsersInRoom: Dispatch<SetStateAction<UsersInRoom[]>>;
  usersInRoom: UsersInRoom[];
  roomId: string;
  roomOwnerId: string;
  link: string;
  title: string;
  step: ROOM_STATUS;
  setStep: Dispatch<SetStateAction<ROOM_STATUS>>;
  isLoggedUserAdmin: boolean;
  labels: string[];
}

interface RoomProviderProps {
  children: React.ReactNode;
  roomId: string;
  roomOwnerId: string;
  link: string;
  title: string;
}

export type { RoomProviderProps, RoomContextProps };
