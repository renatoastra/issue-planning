import { type NextApiRequest, type NextApiResponse } from "next";
import { pusher } from "@/libs/pusher/server";

type ChannelAuth = {
  socket_id: string;
  channel_name: string;
  username: string;
  image: string;
  userId: string;
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { socket_id, username, userId, image } = req.body as ChannelAuth;

  const presenceData = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    user_id: userId,
    user_info: {
      id: userId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      username: username,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user_image_url: image,
    },
  };

  if (!socket_id)
    return res.status(400).json({ error: "Missing socket_id or channel_name" });

  try {
    const authorizeUser = pusher.authenticateUser(
      socket_id,
      presenceData.user_info,
    );

    res.send(authorizeUser);
  } catch (err) {
    console.log(err);
  }
};

export default handler;
