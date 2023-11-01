import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import { useEffect, useRef, useState } from "react";
import {
  type RemovedMemberResponse,
  type AddedMemberResponse,
  type VoteApiResponse,
} from "./types";
import { api } from "@/utils/api";
import { ROOM_STATUS } from "@/enum/status";
import { type UsersInRoom, type UserVoted } from "@/types/users-in-room";
import { type MembersResponse } from "@/types/members";

Pusher.logToConsole = true;
interface UsePusherProps {
  roomId: string;
}

export const usePusher = ({ roomId }: UsePusherProps) => {
  const pusherRef = useRef<Pusher>();
  const { data } = useSession();
  const [step, setStep] = useState("");
  const [usersInRoom, setUsersInRoom] = useState<UsersInRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cardIsLoading, setCardIsLoading] = useState(false);
  const { data: getRoom, refetch: getRoomRefetch } =
    api.room.getByRoomId.useQuery({
      id: roomId,
    });

  const { mutateAsync: onRevealRoom } = api.room.revealRoom.useMutation({
    onSuccess: async (data) => {
      await getRoomRefetch();
    },
  });

  const { mutateAsync: onResetRoom } = api.room.resetRoom.useMutation({
    onSuccess: async () => {
      await getRoomRefetch();
    },
  });

  const getMyVote = usersInRoom.find((user) => user?.id === data?.user.id);

  const pusher = pusherRef.current;
  const allUsersVoted =
    usersInRoom.every((user) => user?.voted) || step === "voted";

  const handleResetVote = async () => {
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
      await onResetRoom({
        roomId,
        status: ROOM_STATUS.VOTING,
      });
    } catch (error) {
      console.log(error);
    } finally {
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
      setIsLoading(true);
      const payload = {
        roomId: roomId,
        users: usersInRoom,
      };
      await fetch("/api/reveal-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const mutateRoomStatus = async (
    status: ROOM_STATUS,
    type: "reveal-vote" | "reset-vote",
  ) => {
    try {
      setIsLoading(true);

      if (type === "reveal-vote") {
        await handleRevealVote();
      }

      await onRevealRoom({
        roomId,
        status,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!data?.user.id) return;
    let mounted = true;

    const storageData = JSON.parse(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      localStorage.getItem(`${roomId}-vote`),
    ) as UsersInRoom[];

    if (mounted) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_SOKETI_CLUSTER!,
        wsHost: process.env.NEXT_PUBLIC_SOKETI_URL!,
        wsPort: parseInt(process.env.NEXT_PUBLIC_SOKETI_PORT!),
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
            voted:
              storageData?.find((user) => user.id === data.user.id)?.voted ??
              false,
            choose:
              storageData?.find((user) => user.id === data.user.id)?.choose ??
              null,
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
          if (!storageData) return user;

          const userVoted = storageData.find((v) => v.id === user.id);
          if (!userVoted) return user;

          return userVoted;
        });

        localStorage.setItem(`${roomId}-vote`, JSON.stringify(users));
        setUsersInRoom(users);
      },
    );

    channel.bind("vote", (userVote: VoteApiResponse) => {
      setUsersInRoom(userVote.users);

      const json = JSON.stringify(userVote.users);
      localStorage.setItem(`${roomId}-vote`, json);
    });

    channel.bind("reset-vote", ({}: { status: string; roomId: string }) => {
      setUsersInRoom((prev) => {
        return prev.map((user) => {
          return {
            ...user,
            voted: false,
            choose: null,
          };
        });
      });
      const userReseted = storageData.map((user) => {
        return {
          ...user,
          voted: false,
          choose: null,
        };
      });
      setStep(ROOM_STATUS.VOTING);
      const json = JSON.stringify(userReseted);
      localStorage.setItem(`${roomId}-vote`, json);
    });

    channel.bind("reveal-vote", () => {
      setStep(ROOM_STATUS.VOTED);
    });
    channel.bind(
      "pusher:member_removed",
      function (member: RemovedMemberResponse) {
        member.info &&
          setUsersInRoom((prev) => {
            return prev.filter((user) => user?.id !== member.info.id);
          });
      },
    );

    channel.bind("pusher:member_added", function (member: AddedMemberResponse) {
      const currentUser = storageData?.find(
        (user) => user.id === member.info.id,
      );

      if (currentUser) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        member.info && setUsersInRoom((prev) => [...prev, currentUser]);
      } else {
        member.info && setUsersInRoom((prev) => [...prev, member.info]);
      }
    });
    return () => {
      pusherRef.current?.disconnect();
      mounted = false;
      channel.unsubscribe();
    };
  }, [roomId, data]);

  const handleCreateVote = async (choose: string) => {
    if (cardIsLoading) return;
    try {
      setCardIsLoading(true);
      const payload = {
        id: data?.user.id,
        username: data?.user.name,
        user_image_url: data?.user.image,
        choose: choose,
        roomId: roomId,
        voted: true,
        users: usersInRoom,
      };

      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.log(error);
    } finally {
      setCardIsLoading(false);
    }
  };

  return {
    pusher,
    usersInRoom,
    allUsersVoted,
    getMyVote,
    handleCreateVote,
    getRoom,
    mutateRoomStatus,
    handleResetVote,
    step,
    isLoading,
    cardIsLoading,
  };
};
