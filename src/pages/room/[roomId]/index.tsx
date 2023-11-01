/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { UserAvatar } from "@/components/Avatar";
import { VoteCard } from "@/components/VoteCard";
import { UserDialog } from "@/components/Dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { usePusher } from "@/hooks/use-pusher/usePusher";
import { PrismaClient } from "@prisma/client";
import {
  ArrowLeftCircle,
  ArrowRight,
  ArrowRightCircle,
  Link,
  UserIcon,
} from "lucide-react";
import { type GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ROOM_STATUS } from "@/enum/status";
import { VotedSection } from "../../../view/VotedSection";
import { Input } from "@/components/ui/input";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard/useCopyToClipboard";
import { LoadingSpinner } from "@/components/Loading";
import { useState } from "react";
import clsx from "clsx";

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
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const {
    usersInRoom,
    allUsersVoted,
    getMyVote,
    getRoom,
    mutateRoomStatus,
    step,
    handleResetVote,
    isLoading,
    handleCreateVote,
  } = usePusher({ roomId });
  const [value, copy] = useCopyToClipboard();

  const roomOwner = userId === data?.user.id;

  return (
    <>
      <div className="relative flex h-full w-full  items-center  ">
        <div
          className={clsx(
            `absolute right-0 h-full   overflow-y-auto border-l  border-l-secondary bg-primary-foreground transition-all 
              duration-500 ease-in-out xl:w-72  `,
            toggleSidebar ? "xl:w-40" : "w-0",
          )}
        >
          <h1
            className={`p-6 text-3xl font-bold transition-all duration-500 ease-in-out ${
              toggleSidebar ? "" : ""
            }`}
          >
            {toggleSidebar ? <UserIcon /> : "Usuarios"}
          </h1>
          <Button
            onClick={() => setToggleSidebar((prev) => !prev)}
            variant="ghost"
            className="p-6 text-3xl font-bold transition-all duration-500 ease-in-out"
          >
            {toggleSidebar ? <ArrowLeftCircle /> : <ArrowRightCircle />}
          </Button>
          <div>
            {usersInRoom?.map((user, index) => (
              <div
                key={index}
                className={`flex ${
                  toggleSidebar ? "gap-1" : "gap-3"
                }  items-center justify-between gap-3 p-6 py-6 transition-all duration-500 ease-in-out hover:bg-secondary hover:bg-opacity-95 `}
              >
                <UserAvatar
                  src={user?.user_image_url ?? ""}
                  fallback={user?.username ?? ""}
                />
                <div
                  className={clsx(
                    `flex  items-center justify-center gap-3`,
                    toggleSidebar && "justify-center",
                  )}
                >
                  <p
                    className={`hidden lg:block ${
                      toggleSidebar ? "text-[12px]" : ""
                    }`}
                  >
                    {user.username}
                  </p>
                  {userId === user.id && !toggleSidebar && (
                    <div title="Room leader" className="">
                      <span className="text-xl">👑</span>
                    </div>
                  )}

                  {toggleSidebar && <Checkbox disabled checked={user.voted} />}
                </div>

                {!toggleSidebar && <Checkbox disabled checked={user.voted} />}
              </div>
            ))}
          </div>
        </div>
        <div className="flex h-full  w-[calc(100%-12.23rem)] flex-col   items-center justify-between  gap-6  xl:w-[calc(100%-18rem)]">
          <div className="flex h-full flex-col items-center justify-between py-8 xl:w-[58rem]">
            <div className="flex w-full flex-col gap-8">
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
                        <LoadingSpinner
                          text="Revelar votos"
                          isLoading={isLoading}
                        />
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
                          <LoadingSpinner
                            text="Resetar votação"
                            isLoading={isLoading}
                          />
                        </Button>
                        <p className="text-xs text-primary">
                          Resetar todos os votos e voltar para votação
                        </p>
                      </div>
                      {/* <div>
                        <Button
                          className="mb-4 w-[200px] cursor-pointer"
                          disabled={!allUsersVoted}
                          onClick={async () =>
                            mutateRoomStatus(ROOM_STATUS.CLOSED, "close-room")
                          }
                        >
                          <LoadingSpinner
                            text="Fechar votacão"
                            isLoading={isLoading}
                          />
                        </Button>
                        <p className="text-xs text-primary">
                          Finalizar a votação
                        </p>
                      </div> */}
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
              <div className="flex h-52  w-full items-center justify-center xl:h-80">
                <VotedSection usersInRoom={usersInRoom} />
              </div>
            ) : (
              <>
                {step === ROOM_STATUS.VOTING && (
                  <div className="flex gap-4 justify-self-end ">
                    <VoteCard
                      onClick={() => handleCreateVote("PP")}
                      title="PP"
                      description="Ja ta pronto e testado"
                      currentChoice={getMyVote?.choose === "PP"}
                    />
                    <VoteCard
                      onClick={() => handleCreateVote("P")}
                      title="P"
                      description="Faço de olhos fechados"
                      currentChoice={getMyVote?.choose === "P"}
                    />
                    <VoteCard
                      onClick={() => handleCreateVote("M")}
                      title="M"
                      description="P com gordurinha"
                      currentChoice={getMyVote?.choose === "M"}
                    />
                    <VoteCard
                      onClick={() => handleCreateVote("G")}
                      title="G"
                      description="Vai demorar"
                      currentChoice={getMyVote?.choose === "G"}
                    />
                    <VoteCard
                      onClick={() => handleCreateVote("GG")}
                      title="GG"
                      description="Dificil para car#@#!@#"
                      currentChoice={getMyVote?.choose === "GG"}
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
