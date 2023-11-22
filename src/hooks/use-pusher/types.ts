import { type UsersInRoom } from "@/types/users-in-room";

type RemovedMemberInfo = {
  id: string;
  username: string;
  user_image_url: string;
  choose: string | null;
  voted: boolean;
};

export type RemovedMemberResponse = {
  id: string;
  info: RemovedMemberInfo;
};

export type AddedMemberResponse = {
  id: string;
  info: RemovedMemberInfo;
};

export type VoteApiResponse = {
  choose: string;
  username: string;
  roomId: string;
  voted: boolean;
  user_image_url: string;
  id: string;
  users: UsersInRoom[];
};

export type RevealVotesResponse = {
  roomId: string;
  users: UsersInRoom[];
};

export type ResetRoomResponse = {
  roomId: string;
  users: UsersInRoom[];
};

export type SetTimerResponse = {
  roomId: string;
  users: UsersInRoom[];
  timer: number;
};

export type LocalStorageData = {
  users: UsersInRoom[];
  timer: Date;
};

export type RemoveMemberResponse = {
  roomId: string;
  users: UsersInRoom[];
  memberIdToRemove: string;
};

export type Room = {
  me: UsersInRoom;
  id: string;
  status: string;
  timer: number | null;
  users: UsersInRoom[];
};
