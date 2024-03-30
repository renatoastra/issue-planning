/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { RoomContextProvider } from "@/context/room-data";
import { Room } from "@/views/room";
import { RoomApiContextProvider } from "@/context/room-data/fetch";
import { type GetServerSidePropsContext } from "next/types";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { prisma } from "@/server/db";

type PageProps = {
  roomId: string;
  userId: string;
  description: string;
  status: string;
  title: string;
  link: string;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const roomId = context.query.roomId;
  const query = await prisma.room.findFirst({
    where: {
      id: String(roomId),
    },
    select: {
      createdById: true,
      status: true,
      title: true,
      link: true,
    },
  });

  if (!query) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      roomId,
      userId: query.createdById,
      status: query.status,
      title: query.title,
      link: query.link,
    },
  };
};

const Page = ({ roomId, userId, link, title }: PageProps) => {
  const [eventMsg, setEventMsg] = useState(false);
  return (
    <RoomContextProvider
      link={link}
      title={title}
      roomId={roomId}
      roomOwnerId={userId}
    >
      <RoomApiContextProvider roomId={roomId}>
        <AnimatePresence>
          {eventMsg && (
            <motion.div
              className="relative flex w-full items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 py-2 text-center text-sm text-black"
              initial={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="font-bold text-white">Novidades em breve...</p>
              <button
                className="absolute right-3"
                onClick={() => setEventMsg(false)}
              >
                <X color="white" size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <Room id={roomId} />
      </RoomApiContextProvider>
    </RoomContextProvider>
  );
};

export default Page;
