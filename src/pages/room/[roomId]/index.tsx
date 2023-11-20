/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { UserAvatar } from "@/components/Avatar";
import { VoteCard } from "@/components/VoteCard";
import { UserDialog } from "@/components/Dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { usePusher } from "@/hooks/use-pusher/usePusher";
import { PrismaClient } from "@prisma/client";
import { Link } from "lucide-react";
import { type GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ROOM_STATUS } from "@/enum/status";
import { VotedSection } from "../../../view/VotedSection";
import { Input } from "@/components/ui/input";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard/useCopyToClipboard";
import { LoadingSpinner } from "@/components/Loading";
import { useState } from "react";
import { sliceUsername } from "@/utils/slice-username";
import { RemoveUserDropDown } from "@/components/RemoveUserDropDown";

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
    canRevealVote,
    getMyVote,
    getRoom,
    step,
    handleResetVote,
    isLoading,
    handleCreateVote,
    handleRevealVote,
    handleInitTimer,
    formatedTimer,
  } = usePusher({ roomId });
  const [value, copy] = useCopyToClipboard();

  const [handleTimer, setHandleTimer] = useState(0);

  const roomOwner = userId === data?.user.id;

  return (
    <>
      <div className="relative flex h-full w-full  items-center  ">
        <div className="absolute right-0 h-full overflow-y-auto border-l  border-l-secondary bg-primary-foreground xl:w-60   ">
          <h1 className=" p-6 text-3xl font-bold">Usuários</h1>
          <div>
            {usersInRoom?.map((user) => (
              <RemoveUserDropDown
                roomId={roomId}
                userId={user.id}
                isRoomOwner={roomOwner}
                key={user.id}
              >
                <div className="flex items-center justify-between  gap-2 p-3  text-sm hover:bg-secondary hover:bg-opacity-95">
                  <UserAvatar
                    src={user?.user_image_url ?? ""}
                    fallback={user?.username ?? ""}
                  />
                  <div className=" flex items-center justify-center gap-2  ">
                    <p className="hidden lg:block">
                      {user?.username && user?.username?.length > 12
                        ? sliceUsername(user?.username, 12)
                        : user?.username}
                    </p>
                    {userId === user?.id && (
                      <div title="Room leader" className="text-start">
                        <span className="text-xl">👑</span>
                      </div>
                    )}
                  </div>
                  <Checkbox disabled checked={user?.voted} />
                </div>
              </RemoveUserDropDown>
            ))}
          </div>
        </div>
        <div className="flex h-full  w-[calc(100%-12.23rem)] flex-col   items-center justify-between  gap-6  xl:w-[calc(100%-18rem)]">
          <div className="flex h-full flex-col items-center justify-between py-8 xl:w-[58rem]">
            <div className="flex w-full flex-col gap-2 2xl:gap-8">
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
              <div className="w-full items-center  text-center text-xl 2xl:text-4xl">
                {formatedTimer}
              </div>

              {roomOwner && (
                <div className="flex flex-col gap-2">
                  {step === ROOM_STATUS.VOTING && (
                    <div className="flex justify-between">
                      <div className="flex w-48 flex-col  justify-center gap-2">
                        <Button
                          className="w-full cursor-pointer"
                          disabled={!canRevealVote}
                          onClick={async () => handleRevealVote()}
                        >
                          <LoadingSpinner
                            text="Revelar votos"
                            isLoading={isLoading}
                          />
                        </Button>
                        <p className="text-xs text-primary">
                          Todos os usuarios devem ter votado antes
                        </p>
                      </div>
                      <div className="flex w-48 flex-col gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          placeholder="Digite um numero"
                          onChange={(e) =>
                            setHandleTimer(Number(e.target.value))
                          }
                        />
                        <Button
                          className=" cursor-pointer"
                          disabled={!handleTimer}
                          onClick={async () => handleInitTimer(handleTimer)}
                        >
                          <LoadingSpinner
                            text="Iniciar timer"
                            isLoading={isLoading}
                          />
                        </Button>
                        <p className="text-xs text-primary">
                          Os votos poderão ser revelados mesmo sem todos os
                          usuarios estiverem votado.{" "}
                        </p>
                      </div>
                    </div>
                  )}

                  {step === ROOM_STATUS.VOTED && (
                    <div className="flex w-full items-center justify-between">
                      <div>
                        <Button
                          className="mb-4 w-[200px] cursor-pointer"
                          disabled={!canRevealVote}
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
                <VotedSection roomId={roomId} usersInRoom={usersInRoom} />
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
