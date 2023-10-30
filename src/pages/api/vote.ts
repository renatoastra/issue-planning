import { pusher } from "@/libs/pusher/server";
import { type NextApiRequest, type NextApiResponse } from "next";

export type RequestBodyPusher = {
  choose: string;
  username: string;
  roomId: string;
  voted: boolean;
  user_image_url: string;
  id: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return res.status(405).end();

  const { username, choose, roomId, voted, user_image_url, id } =
    req.body as RequestBodyPusher;
  try {
    // const response = await pusher.trigger(`presence-room-${roomId}`, "vote", {
    //   username,
    //   choose,
    //   voted,
    //   user_image_url,
    //   id,
    // });
    const response = await pusher.sendToUser(id, "vote", {
      username: username,
    });
    console.log(response);
  } catch (e) {
    console.log(e);
  }
};

export default handler;
