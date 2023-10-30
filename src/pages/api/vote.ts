import { type NextApiRequest, type NextApiResponse } from "next";
import Pusher from "pusher";

export type RequestBodyPusher = {
  choose: string;
  username: string;
  roomId: string;
  voted: boolean;
  user_image_url: string;
  id: string;
};

const pusher = new Pusher({
  appId: process.env.SOKETI_DEFAULT_APP_ID!,
  secret: process.env.SOKETI_DEFAULT_APP_SECRET!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  cluster: "" as string,
  host: process.env.NEXT_PUBLIC_SOKETI_URL!,
  port: process.env.NEXT_PUBLIC_SOKETI_PORT!,
});

// eslint-disable-next-line @typescript-eslint/require-await
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const { username, choose, roomId, voted, user_image_url, id } =
    req.body as RequestBodyPusher;
  try {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    pusher.trigger(`presence-room-${roomId}`, "vote", {
      username,
      choose,
      voted,
      user_image_url,
      id,
    });
  } catch (err) {
    console.log(err);
  }

  res.send({ message: "success" });
}
