import { type NextApiRequest, type NextApiResponse } from "next";
import { pusher } from "@/libs/pusher/server";
import { type UsersInRoom } from "@/types/users-in-room";

export type RequestBodyPusher = {
  roomId: string;
  users: UsersInRoom[];
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const { roomId, users } = req.body as RequestBodyPusher;
  try {
    await pusher.trigger(`presence-room-${roomId}`, "reveal-vote", {
      roomId,
      users,
    });

    res.status(200).send({ message: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
}
