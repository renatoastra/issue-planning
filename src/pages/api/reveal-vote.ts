import { type NextApiRequest, type NextApiResponse } from "next";
import { pusher } from "@/libs/pusher/server";
import { PrismaClient } from "@prisma/client";

export type RequestBodyPusher = {
  roomId: string;
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const { roomId } = req.body as RequestBodyPusher;
  try {
    await pusher.trigger(`presence-room-${roomId}`, "reveal-vote", {
      roomId,
    });
    res.json({ message: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
}
