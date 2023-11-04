import { type NextApiRequest, type NextApiResponse } from "next";
import { pusher } from "@/libs/pusher/server";
import { type UsersInRoom } from "@/types/users-in-room";

export type RequestBodyPusher = {
  roomId: string;
  timer: number;
  users: UsersInRoom[];
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const { roomId, users, timer } = req.body as RequestBodyPusher;
  try {
    await pusher.trigger(`presence-room-${roomId}`, "set-timer", {
      roomId,
      users,
      timer,
    });

    res.status(200).send({ message: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
}
