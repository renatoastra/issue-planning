import { UserAvatar } from "@/components/Avatar";
import { VoteCard } from "@/components/VoteCard";
import { UserDialog } from "@/components/Dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { usePusher } from "@/hooks/use-pusher/usePusher";
import { PrismaClient } from "@prisma/client";
import { Crown } from "lucide-react";
import { type GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import { ResultChart } from "@/components/Charts/Vertical";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ROOM_STATUS } from "@/enum/status";
import { VotedSection } from "../view/VotedSection";
import error from "next/error";

type PageProps = {
  roomId: string;
  userId: string;
  planning: string;
  status: string;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const roomId = context.query.roomId;

  const prisma = new PrismaClient();
  const query = await prisma.room.findFirst({
    where: {
      id: String(roomId),
    },
    select: {
      createdById: true,
      planning: true,
      status: true,
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
      planning: query.planning,
      status: query.status,
    },
  };
};

const Page = ({ roomId, userId, planning }: PageProps) => {
  const { data } = useSession();
  const {
    usersInRoom,
    allUsersVoted,
    getMyVote,
    getRoom,
    mutateRoomStatus,
    step,
  } = usePusher({ roomId });

  const handleVote = async (type: string) => {
    try {
      const payload = {
        id: data?.user.id,
        username: data?.user.name,
        user_image_url: data?.user.image,
        choose: type,
        roomId: roomId,
        voted: true,
      };

      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const roomOwner = userId === data?.user.id;
  return (
    <>
      <div className="relative flex h-full w-full  items-center  ">
        <div className="absolute right-0 h-full   overflow-y-auto border-l  border-l-secondary bg-primary-foreground xl:w-72   ">
          <h1 className=" p-6 text-3xl font-bold">Usuários</h1>
          <div>
            {usersInRoom?.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 p-6 py-6 hover:bg-secondary hover:bg-opacity-95"
              >
                <UserAvatar
                  src={user.user_image_url}
                  fallback={user.username}
                />
                <div className=" flex items-center justify-center gap-3 ">
                  <p className="hidden lg:block">{user.username}</p>
                  {userId === user.id && (
                    <div title="Room leader" className="">
                      <Crown strokeWidth={1.5} size={18} />
                    </div>
                  )}
                </div>
                <Checkbox disabled checked={user.voted} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex h-full  w-[calc(100%-12.23rem)] flex-col   items-center justify-between  gap-6  xl:w-[calc(100%-18rem)]">
          <div className="flex h-full flex-col justify-between py-16 xl:w-[38rem]">
            <div className="flex flex-col gap-8">
              <h3 className="text-3xl">Assunto a ser discutido:</h3>
              <Textarea
                className="h-38 w-full resize-none bg-primary-foreground"
                disabled
                value={planning}
              />

              {roomOwner && (
                <div className="flex flex-col gap-2">
                  {getRoom?.status === ROOM_STATUS.VOTING && (
                    <>
                      <Button
                        className="w-[200px] cursor-pointer"
                        disabled={!allUsersVoted}
                        onClick={async () =>
                          mutateRoomStatus(ROOM_STATUS.VOTED, "reveal-vote")
                        }
                      >
                        Revelar votos
                      </Button>
                      <p className="text-xs text-primary">
                        Todos os usuarios devem ter votado antes
                      </p>
                    </>
                  )}

                  {getRoom?.status === ROOM_STATUS.VOTED && (
                    <div className="flex w-full items-center justify-between">
                      <div>
                        <Button
                          className="mb-4 w-[200px] cursor-pointer"
                          disabled={!allUsersVoted}
                          onClick={async () =>
                            mutateRoomStatus(ROOM_STATUS.VOTING, "reset-vote")
                          }
                        >
                          Resetar votos
                        </Button>
                        <p className="text-xs text-primary">
                          Resetar todos os votos e voltar para votação
                        </p>
                      </div>
                      <div>
                        <Button
                          className="mb-4 w-[200px] cursor-pointer"
                          disabled={!allUsersVoted}
                          onClick={async () =>
                            mutateRoomStatus(ROOM_STATUS.CLOSED, "reveal-vote")
                          }
                        >
                          Fechar votação
                        </Button>
                        <p className="text-xs text-primary">
                          Finalizar a votação
                        </p>
                      </div>
                    </div>
                  )}

                  {getRoom?.status === ROOM_STATUS.CLOSED && (
                    <div className="flex w-full justify-center ">
                      <h2 className="text-3xl">Votação finalizada</h2>
                    </div>
                  )}
                </div>
              )}
            </div>
            {step === ROOM_STATUS.VOTED ? (
              <>
                <VotedSection usersInRoom={usersInRoom} />
              </>
            ) : (
              <>
                {getMyVote?.voted && step === ROOM_STATUS.VOTING && (
                  <div className="flex gap-8 self-center ">
                    <VoteCard
                      onClick={() => console.log("XD")}
                      title={getMyVote?.choose ?? ""}
                      description="Meu voto"
                    />
                  </div>
                )}

                {!getMyVote?.voted &&
                  !allUsersVoted &&
                  step === ROOM_STATUS.VOTING && (
                    <div className="flex gap-8 justify-self-end ">
                      <VoteCard
                        onClick={() => handleVote("PP")}
                        title="PP"
                        description="P de"
                      />
                      <VoteCard
                        onClick={() => handleVote("P")}
                        title="P"
                        description="P de"
                      />
                      <VoteCard
                        onClick={() => handleVote("M")}
                        title="M"
                        description="P de"
                      />
                      <VoteCard
                        onClick={() => handleVote("G")}
                        title="G"
                        description="P de"
                      />
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
      <UserDialog />
    </>
  );
};

export default Page;
