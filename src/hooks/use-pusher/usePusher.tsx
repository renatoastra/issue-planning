import { type MembersResponse } from "@/types/members";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import { useEffect, useRef, useState } from "react";
import { type RemovedMemberResponse, type AddedMemberResponse } from "./types";
import { api } from "@/utils/api";
import { ROOM_STATUS } from "@/enum/status";
import { type UsersInRoom, type UserVoted } from "@/types/users-in-room";

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

  const { data: getVoteByUser } = api.room.getVoteByUser.useQuery({
    roomId,
  });
  const { mutateAsync: onChangeStatus } = api.room.changeRoomStatus.useMutation(
    {
      onSuccess: async () => {
        await getRoomRefetch();
      },
    },
  );

  const getMyVote = usersInRoom.find((user) => user.id === data?.user.id);

  const pusher = pusherRef.current;
  const allUsersVoted = usersInRoom.every((user) => user.voted);

  const handleResetVote = async () => {
    await mutateRoomStatus(ROOM_STATUS.VOTING, "reset-vote");

    try {
      const payload = {
        choose: null,
        roomId: roomId,
        voted: false,
      };
      await fetch("/api/reset-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.log(error);
    }
  };

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
  }, [getRoom]);
  const handleRevealVote = async () => {
    try {
      const payload = {
        roomId: roomId,
      };
      await fetch("/api/reveal-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.log(error);
    }
  };

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

      localStorage.setItem(`${roomId}-vote`, type);
      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const mutateCreateVote = async (type: string) => {
    await handleVote(type);
  };

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

      if (type === "reveal-vote") {
        await handleRevealVote();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!data?.user.id) return;
    let mounted = true;
    const storageVote = localStorage.getItem(`${roomId}-vote`);
    if (mounted) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_SOKETI_CLUSTER!,
        forceTLS: false,
        disableStats: true,
        enabledTransports: ["ws", "wss"],
        authEndpoint: "/api/pusher",
        userAuthentication: {
          endpoint: "/api/pusher",
          transport: "ajax",
        },
        auth: {
          params: {
            username: data.user.name,
            id: data.user.id,
            image: data.user.image,
            voted: storageVote ? true : false,
            choose: storageVote,
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

        channel.bind("vote", (userVote: UserVoted) => {
          setUsersInRoom((prev) => {
            return prev.map((user) => {
              if (user.id === userVote.id) {
                return {
                  ...user,
                  voted: userVote.voted,
                  choose: userVote.choose,
                };
              }
              return user;
            });
          });
        });
      },
    );
    channel.bind("reset-vote", ({}: { status: string; roomId: string }) => {
      localStorage.removeItem(`${roomId}-vote`);
      setUsersInRoom((prev) => {
        return prev.map((user) => {
          return {
            ...user,
            voted: false,
            choose: null,
          };
        });
      });
      setStep(ROOM_STATUS.VOTING);
    });

    channel.bind("reveal-vote", () => {
      setStep(ROOM_STATUS.VOTED);
    });
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
  }, [roomId, data, getVoteByUser, getRoomRefetch]);

  return {
    pusher,
    usersInRoom,
    allUsersVoted,
    getMyVote,
    mutateCreateVote,
    getRoom,
    mutateRoomStatus,
    handleResetVote,
    step,
  };
};
