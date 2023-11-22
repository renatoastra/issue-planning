import { pusher } from "@/libs/pusher/server";
import { type UsersInRoom } from "@/types/users-in-room";
import { type NextApiRequest, type NextApiResponse } from "next";

export type RequestBodyPusher = {
  choose: string;
  username: string;
  roomId: string;
  voted: boolean;
  user_image_url: string;
  id: string;
  users: UsersInRoom[];
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return res.status(405).end();

  const { username, choose, roomId, voted, user_image_url, id, users } =
    req.body as RequestBodyPusher;

  const updatedUsers = users.map((user) => {
    if (user.id === id) {
      return {
        ...user,
        choose,
        voted,
      };
    }
    return user;
  });

  console.log("VOTOU");
  try {
    await pusher.trigger(`presence-room-${roomId}`, "vote", {
      username,
      choose,
      voted,
      user_image_url,
      id,
      users: updatedUsers,
    });

    return res.status(200).end();
  } catch (e) {
    console.log(e);
    return res.status(500).end();
  }
};

export default handler;
