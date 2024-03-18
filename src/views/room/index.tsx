/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { VoteCard } from "@/components/VoteCard";
import { UserDialog } from "@/components/Dialog";
import { Textarea } from "@/components/ui/textarea";
import { usePusher } from "@/hooks/use-pusher/usePusher";

import { Link, MousePointerClick, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROOM_STATUS } from "@/enum/status";
import { VotedSection } from "../VotedSection";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/Loading";
import { ToolTip } from "@/components/Tooltip";
import Head from "next/head";

import { FadedComponent } from "@/components/FadedComponent";
import { useContext, useState } from "react";
import { RoomContext } from "@/context/room-data";
import { useCopyLinks } from "./hooks/use-copy-links";
import { UserSideBar } from "@/components/Sidebar";

interface RoomProps {
  id: string;
}

export const Room = ({ id }: RoomProps) => {
  const { roomId, link, title, step, isLoggedUserAdmin } =
    useContext(RoomContext);
  console.log("🚀 ~ title:", title);
  const {
    canRevealVote,
    getMyVote,
    handleResetVote,
    isLoading,
    handleCreateVote,
    handleRevealVote,
    handleInitTimer,
    formatedTimer,
    isMutatingVote,
  } = usePusher({ roomId: id });

  const { handleCopyLink, handleCopyRoomUrl } = useCopyLinks({ linkUrl: link });

  const [handleTimer, setHandleTimer] = useState(0);

  return (
    <>
      <Head>
        <title>GEBRA PLANNING - Voting Room</title>
        <meta name="description" content="Vote no peso da sua issue" />
        <link rel="icon" href="/gebra-icon.svg" />
      </Head>
      <div className="relative flex h-[calc(100vh-89px)] w-full  items-center  ">
        {/* <div className="absolute left-0  px-12 2xl:block">
          <a
            className="flex flex-col gap-3"
            href="https://www.youtube.com/watch?v=tl9WC-OPP18"
            target="_blank"
          >
            <p className="w-40 break-words">
              Anoes solteiros na sua região querem te conhecer!
            </p>
            <p className="w-40 break-words">Clique aqui e saiba mais</p>
            <Image src={joaoImg.src} width={100} height={100} alt="joao-anao" />
          </a>
        </div> */}
        <UserSideBar />
        <FadedComponent className="flex h-full  w-[calc(100%-12.23rem)] flex-col   items-center justify-between  gap-6  ">
          <div className="flex h-full flex-col items-center justify-between py-8 xl:w-[42rem]">
            <div className="flex w-96 flex-col gap-2 xl:w-full 2xl:gap-8">
              <div className="flex w-full flex-col  gap-2">
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  Issue:
                </h3>
                <div className="flex items-center justify-between">
                  <Input
                    disabled
                    className="w-[70%] bg-primary-foreground"
                    value={!!title ? title : "Welcome to the room"}
                  />
                  <Button onClick={handleCopyRoomUrl} className="gap-3">
                    Share room
                    <MousePointerClick />
                  </Button>
                </div>
              </div>
              <div
                onClick={handleCopyLink}
                className="flex w-full flex-col  gap-2"
              >
                <div className="items-center gap-3">
                  <ToolTip text="Clique para copiar">
                    <h3 className="flex cursor-pointer items-center gap-2 text-xl font-bold">
                      Link
                      <Link />
                    </h3>
                  </ToolTip>
                </div>

                <Input
                  disabled
                  className="w-full bg-primary-foreground"
                  value={!!link ? link : "No link provided"}
                />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-bold">You should vote based on:</h3>
                <Textarea
                  className="h-38 w-full resize-none bg-primary-foreground"
                  disabled
                  value={`- Avaliar o trabalho com todas as stacks envolvidas. 
- Avaliar o tempo gasto com possíveis ajustes que ocorram durante a issue.`}
                />
                {step === ROOM_STATUS.VOTING && (
                  <div className="flex w-full items-center justify-center gap-4 text-center text-4xl ">
                    <Timer size={32} /> {formatedTimer}
                  </div>
                )}
              </div>
              {isLoggedUserAdmin && (
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
                            text="Review votes"
                            isLoading={isLoading}
                          />
                        </Button>
                      </div>
                      <div className="flex w-48 flex-col gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          placeholder="In seconds"
                          onChange={(e) =>
                            setHandleTimer(Number(e.target.value) / 60)
                          }
                        />

                        <Button
                          className=" cursor-pointer"
                          disabled={!handleTimer}
                          onClick={async () => handleInitTimer(handleTimer)}
                        >
                          <LoadingSpinner
                            text={
                              handleTimer > 0 ? "Reset timer" : "Start timer"
                            }
                            isLoading={isLoading}
                          />
                        </Button>
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
                            text="Reset votes"
                            isLoading={isLoading}
                          />
                        </Button>
                        <p className="text-xs text-primary">
                          Reset all votes and back.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {step === ROOM_STATUS.VOTED ? (
              <div className="flex h-52  w-96 items-center justify-center xl:h-72 xl:w-full">
                <VotedSection roomId={roomId} />
              </div>
            ) : (
              <>
                {step === ROOM_STATUS.VOTING && (
                  <div className="z-20 flex gap-4 justify-self-end ">
                    <VoteCard
                      onClick={() => handleCreateVote("PP")}
                      title="PP"
                      currentChoice={getMyVote?.choose === "PP"}
                      isLoading={isMutatingVote}
                    />
                    <VoteCard
                      onClick={() => handleCreateVote("P")}
                      title="P"
                      currentChoice={getMyVote?.choose === "P"}
                      isLoading={isMutatingVote}
                    />
                    <VoteCard
                      onClick={() => handleCreateVote("M")}
                      title="M"
                      currentChoice={getMyVote?.choose === "M"}
                      isLoading={isMutatingVote}
                    />
                    <VoteCard
                      onClick={() => handleCreateVote("G")}
                      title="G"
                      currentChoice={getMyVote?.choose === "G"}
                      isLoading={isMutatingVote}
                    />
                    <VoteCard
                      onClick={() => handleCreateVote("GG")}
                      title="GG"
                      currentChoice={getMyVote?.choose === "GG"}
                      isLoading={isMutatingVote}
                    />
                    <VoteCard
                      onClick={() => handleCreateVote("🍆")}
                      title="🍆"
                      currentChoice={getMyVote?.choose === "🍆"}
                      isLoading={isMutatingVote}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </FadedComponent>
      </div>
      <UserDialog />
    </>
  );
};
