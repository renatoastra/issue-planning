type Member = {
  id: string;
  username: string;
  user_image_url: string;
  choose: string;
  voted: boolean;
};

type Members = Record<string, Member>;

type Me = {
  id: string;
  info: Member;
};

type Data = {
  members: Members;
  count: number;
  myID: string;
  me: Me;
};

export type MembersResponse = {
  members: Members;
  count: number;
  myID: string;
  me: Me;
};
