import { type NextApiRequest, type NextApiResponse } from "next";
import { pusher } from "@/libs/pusher/server";
import { PrismaClient } from "@prisma/client";

export type RequestBodyPusher = {
  choose: string;
  username: string;
  roomId: string;
  voted: boolean;
  user_image_url: string;
  id: string;
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const { username, choose, roomId, voted, user_image_url, id } =
    req.body as RequestBodyPusher;
  const prisma = new PrismaClient();
  try {
    await prisma.votes.create({
      data: {
        value: choose,
        user: {
          connect: {
            id: id,
          },
        },
        room: {
          connect: {
            id: roomId,
          },
        },
      },
    });
    await pusher.trigger(`presence-room-${roomId}`, "vote", {
      username,
      choose,
      voted,
      user_image_url,
      id,
    });
    res.json({ message: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
}
