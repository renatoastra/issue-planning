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
