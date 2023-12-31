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
  const usersWithoutVote = users.map((user) => {
    return {
      ...user,
      choose: null,
      voted: false,
    };
  });
  try {
    await pusher.trigger(`presence-room-${roomId}`, "reset-vote", {
      users: usersWithoutVote,
      roomId,
    });
    res.status(200).json({ message: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
}
