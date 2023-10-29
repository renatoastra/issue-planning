import { type NextApiRequest, type NextApiResponse } from "next";
import { pusher } from "@/libs/pusher/server";

type ChannelAuth = {
  socket_id: string;
  channel_name: string;
  username: string;
  image: string;
  id: string;
  choose: string | null;
  voted: string;
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { socket_id, channel_name, username, id, image, choose, voted } =
    req.body as ChannelAuth;

  const presenceData = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    user_id: id,
    user_info: {
      id: id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      username: username,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user_image_url: image,
      choose: choose ?? null,
      voted: voted === "true" ? true : false,
    },
  };

  if (!socket_id || !channel_name)
    return res.status(400).json({ error: "Missing socket_id or channel_name" });

  const channelAuth = pusher.authorizeChannel(
    socket_id,
    channel_name,
    presenceData,
  );

  res.send(channelAuth);
};

export default handler;
