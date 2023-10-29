/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { UserAvatar } from "@/components/Avatar";
import { VoteCard } from "@/components/VoteCard";
import { UserDialog } from "@/components/Dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { usePusher } from "@/hooks/use-pusher/usePusher";
import { PrismaClient } from "@prisma/client";
import { Crown, Link } from "lucide-react";
import { type GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ROOM_STATUS } from "@/enum/status";
import { VotedSection } from "../view/VotedSection";
import { Input } from "@/components/ui/input";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard/useCopyToClipboard";

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
  const prisma = new PrismaClient();
  const query = await prisma.room.findFirst({
    where: {
      id: String(roomId),
    },
    select: {
      createdById: true,
      description: true,
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
      description: query.description,
      status: query.status,
      title: query.title,
      link: query.link,
    },
  };
};

const Page = ({ roomId, userId, description, link, title }: PageProps) => {
  const { data } = useSession();
  const {
    usersInRoom,
    allUsersVoted,
    getMyVote,
    getRoom,
    mutateRoomStatus,
    step,
    mutateCreateVote,
    handleResetVote,
  } = usePusher({ roomId });
  const [value, copy] = useCopyToClipboard();

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
          <div className="flex h-full flex-col justify-between py-8 xl:w-[38rem]">
            <div className="flex flex-col gap-8">
              <div className="flex w-full flex-col  gap-2">
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  Titulo
                </h3>
                <Input
                  disabled
                  className="w-full bg-primary-foreground"
                  value={title}
                />
              </div>

              <div className="flex w-full flex-col  gap-2">
                <h3
                  onClick={() => copy(link)}
                  className="flex cursor-pointer items-center gap-2 text-xl font-bold"
                  title="Copiar link"
                >
                  Link
                  <Link />
                </h3>
                <Input
                  disabled
                  className="w-full bg-primary-foreground"
                  value={link}
                />
              </div>

              <Textarea
                className="h-38 w-full resize-none bg-primary-foreground"
                disabled
                value={description}
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
                          onClick={async () => handleResetVote()}
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
                {step === ROOM_STATUS.VOTING && (
                  <div className="flex gap-8 justify-self-end ">
                    <VoteCard
                      onClick={() => mutateCreateVote("PP")}
                      title="PP"
                      description="P de"
                      currentChoice={getMyVote?.choose === "PP"}
                    />
                    <VoteCard
                      onClick={() => mutateCreateVote("P")}
                      title="P"
                      description="P de"
                      currentChoice={getMyVote?.choose === "P"}
                    />
                    <VoteCard
                      onClick={() => mutateCreateVote("M")}
                      title="M"
                      description="P de"
                      currentChoice={getMyVote?.choose === "M"}
                    />
                    <VoteCard
                      onClick={() => mutateCreateVote("G")}
                      title="G"
                      description="P de"
                      currentChoice={getMyVote?.choose === "G"}
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
