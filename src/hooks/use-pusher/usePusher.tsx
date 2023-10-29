import { type UserVoted, type UsersInRoom } from "@/pages/room/[roomId]/types";
import { type MembersResponse } from "@/types/members";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import { useEffect, useRef, useState } from "react";
import { type RemovedMemberResponse, type AddedMemberResponse } from "./types";
import { api } from "@/utils/api";
import { ROOM_STATUS } from "@/enum/status";

Pusher.logToConsole = true;
interface UsePusherProps {
  roomId: string;
}
export const usePusher = ({ roomId }: UsePusherProps) => {
  const pusherRef = useRef<Pusher>();
  const { data } = useSession();
  const [step, setStep] = useState("");
  const [usersInRoom, setUsersInRoom] = useState<UsersInRoom[]>([]);

  const { data: getRoom, refetch: getRoomRefetch } =
    api.room.getByRoomId.useQuery({
      id: roomId,
    });

  const { data: getVoteByUser, refetch } = api.room.getVoteByUser.useQuery({
    roomId,
  });
  const { mutateAsync: onChangeStatus } = api.room.changeRoomStatus.useMutation(
    {
      onSuccess: async (data) => {
        setStep(data.status);
        await refetch();
        await getRoomRefetch();
      },
    },
  );

  const getMyVote = usersInRoom.find((user) => user.id === data?.user.id);

  useEffect(() => {
    if (!data?.user.id) return;
    let mounted = true;
    if (mounted) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: "",
        wsHost: process.env.NEXT_PUBLIC_SOKETI_URL!,
        wsPort: Number(process.env.NEXT_PUBLIC_SOKETI_PORT),
        forceTLS: false,
        disableStats: true,
        enabledTransports: ["ws", "wss"],
        authEndpoint: "/api/pusher",

        auth: {
          params: {
            username: data.user.name,
            id: data.user.id,
            image: data.user.image,
            voted: getMyVote?.voted ?? false,
            choose: getMyVote?.choose ?? null,
          },
        },
      });
    }
    if (!pusherRef.current) return;
    const channel = pusherRef.current.subscribe(`presence-room-${roomId}`);
    channel.bind(
      "pusher:subscription_succeeded",
      (members: MembersResponse) => {
        const userResponse = Object.values(
          members.members,
        ) as unknown as UsersInRoom[];

        const users = userResponse.map((user) => {
          if (!getVoteByUser) return user;

          const userVoted = getVoteByUser.find((v) => v.user.id === user.id);
          if (!userVoted) return user;

          return {
            ...user,
            voted: userVoted.value ? true : false,
            choose: userVoted.value,
          };
        });
        setUsersInRoom(users);

        channel.bind("vote", async (userVote: UserVoted) => {
          const userHasAlreadyVoted = users.find(
            (user) => user.id === userVote.id,
          );
          if (userHasAlreadyVoted?.voted) return;

          setUsersInRoom((prev) => {
            return prev.map((user) => {
              if (user.id === userVote.id) {
                return {
                  ...user,
                  voted: true,
                  choose: userVote.choose,
                };
              }
              return user;
            });
          });
        });
        channel.bind(
          "reveal-vote",
          async ({ status, roomId }: { status: string; roomId: string }) => {
            setStep(ROOM_STATUS.VOTED);
          },
        );
      },
    );

    channel.bind(
      "pusher:member_removed",
      function (member: RemovedMemberResponse) {
        member.info &&
          setUsersInRoom((prev) => {
            return prev.filter((user) => user.id !== member.info.id);
          });
      },
    );

    channel.bind("pusher:member_added", function (member: AddedMemberResponse) {
      member.info && setUsersInRoom((prev) => [...prev, member.info]);
    });

    return () => {
      pusherRef.current?.disconnect();
      mounted = false;
      channel.unsubscribe();
      channel.unbind("pusher:subscription_succeeded");
    };
  }, [
    roomId,
    data,
    getVoteByUser,
    getMyVote?.voted,
    getMyVote?.choose,
    getRoomRefetch,
  ]);
  const pusher = pusherRef.current;
  const allUsersVoted = usersInRoom.every((user) => user.voted);

  useEffect(() => {
    if (!getRoom) return;
    switch (getRoom.status) {
      case ROOM_STATUS.VOTING:
        setStep(ROOM_STATUS.VOTING);
        break;
      case ROOM_STATUS.VOTED:
        setStep(ROOM_STATUS.VOTED);
        break;
      case ROOM_STATUS.CLOSED:
        setStep(ROOM_STATUS.CLOSED);
        break;
      default:
        break;
    }
  }, [getRoom, step]);

  const mutateRoomStatus = async (
    status: ROOM_STATUS,
    type: "reveal-vote" | "reset-vote",
  ) => {
    try {
      await onChangeStatus({
        roomId,
        status,
        type,
      });
    } catch (error) {
      console.log(error);
    }
  };
  console.log("🚀 ~ allUsersVoted:", allUsersVoted);
  console.log("🚀 ~ getMyVote:", getMyVote);
  return {
    pusher,
    usersInRoom,
    allUsersVoted,
    getMyVote,
    getRoom,
    mutateRoomStatus,
    step,
  };
};
