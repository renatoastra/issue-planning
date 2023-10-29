export interface UsersInRoom {
  id: string;
  username: string;
  voted: boolean;
  user_image_url: string;
  choose: string | null;
}

export interface UserVoted extends UsersInRoom {
  choose: string;
}
