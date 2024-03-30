import { type NextApiRequest, type NextApiResponse } from "next";
import { pusher } from "@/libs/pusher/server";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/server/db";

type RequestBodyPusher = {
  roomId: string;
  memberIdToRemove: string;
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  const { roomId, memberIdToRemove } = req.body as RequestBodyPusher;

  try {
    await pusher.trigger(`presence-room-${roomId}`, "remove-member", {
      memberIdToRemove,
    });

    await pusher.trigger(`presence-user-${memberIdToRemove}`, "user-removed", {
      message: "You have been removed from the room",
    });

    await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        users: {
          disconnect: {
            id: memberIdToRemove,
          },
        },
        votes: {
          deleteMany: {
            userId: memberIdToRemove,
          },
        },
      },
    });
    res.status(200).json({ message: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
}
