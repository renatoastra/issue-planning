export interface UsersInRoom {
  id: string;
  username: string | null;
  voted: boolean;
  user_image_url: string | null;
  choose: string | null;
}

export interface UserVoted extends UsersInRoom {
  choose: string;
}
