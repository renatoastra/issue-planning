import { type UsersInRoom } from "@/types/users-in-room";
import { type SetStateAction, type Dispatch } from "react";

export interface VoteResultContextProps {
  setUsersResult: Dispatch<SetStateAction<UsersInRoom[]>>;
  usersResult: UsersInRoom[];
}
