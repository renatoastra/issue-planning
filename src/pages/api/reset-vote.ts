import { type NextApiRequest, type NextApiResponse } from "next";
import { pusher } from "@/libs/pusher/server";

export type RequestBodyPusher = {
  choose: string;
  roomId: string;
  voted: boolean;
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const { choose, roomId, voted } = req.body as RequestBodyPusher;
  try {
    await pusher.trigger(`presence-room-${roomId}`, "reset-vote", {
      choose,
      voted,
    });
    res.json({ message: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
}
