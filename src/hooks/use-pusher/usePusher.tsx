import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import { useEffect, useRef, useState } from "react";
import {
  type AddedMemberResponse,
  type VoteApiResponse,
  type RevealVotesResponse,
  type ResetRoomResponse,
  type SetTimerResponse,
  type RemoveMemberResponse,
} from "./types";
import { api } from "@/utils/api";
import { ROOM_STATUS } from "@/enum/status";
import { type UsersInRoom } from "@/types/users-in-room";
import { type MembersResponse } from "@/types/members";
import { useTimer } from "../use-timer/useTimer";
import { useRouter } from "next/router";

Pusher.logToConsole = false;
interface UsePusherProps {
  roomId: string;
}

export const usePusher = ({ roomId }: UsePusherProps) => {
  const pusherRef = useRef<Pusher>();
  const { data } = useSession();
  const router = useRouter();
  const [step, setStep] = useState("");
  const [usersInRoom, setUsersInRoom] = useState<UsersInRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cardIsLoading, setCardIsLoading] = useState(false);
  const { data: getRoom } = api.room.getByRoomId.useQuery({
    id: roomId,
  });
  const { formatedTimer, setTimer, isTimerRunning } = useTimer();

  const { data: roomData, refetch: getRoomDataRefetch } =
    api.room.getRoomData.useQuery({ roomId });
  const { mutateAsync: onInsertVote, isLoading: isMutatingVote } =
    api.room.createVote.useMutation();
  const { mutateAsync: onRevealRoom } = api.room.revealRoom.useMutation({});
  const { mutateAsync: onResetRoom } = api.room.resetRoom.useMutation({});
  const { mutateAsync: onSetTimer } = api.room.setTimer.useMutation({});
  const getMyVote = usersInRoom.find((user) => user?.id === data?.user.id);

  const pusher = pusherRef.current;
  const canRevealVote =
    usersInRoom.every((user) => user?.voted) ||
    step === "voted" ||
    !isTimerRunning;

  const handleResetVote = async () => {
    try {
      await onResetRoom({
        roomId,
        status: ROOM_STATUS.VOTING,
      });
      const payload = {
        choose: null,
        roomId: roomId,
        voted: false,
        users: usersInRoom,
      };
      await fetch("/api/reset-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(payload),
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

      await onRevealRoom({
        roomId,
        status: ROOM_STATUS.VOTED,
      });
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
      setStep(ROOM_STATUS.VOTED);
    }
  };

  useEffect(() => {
    if (!data?.user.id) return;
    let mounted = true;
    const timer = roomData?.timer ?? 0;
    const users = roomData?.users ?? [];
    const dbData = {
      timer,
      users,
    };

    if (mounted) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_SOKETI_CLUSTER!,
        forceTLS: false,
        enabledTransports: ["ws", "wss"],
        authEndpoint: "/api/pusher",
        userAuthentication: {
          endpoint: "/api/user-auth",
          transport: "ajax",
          params: {
            userId: data.user.id,
            username: data.user.name,
            image: data.user.image,
          },
        },
        auth: {
          params: {
            roomId,
            username: data.user.name,
            id: data.user.id,
            image: data.user.image,
            voted:
              dbData?.users?.find((user) => user.id === data.user.id)?.voted ??
              false,
            choose:
              dbData?.users?.find((user) => user.id === data.user.id)?.choose ??
              null,
          },
        },
      });
    }
    if (!pusherRef.current) return;

    const channel = pusherRef.current.subscribe(`presence-room-${roomId}`);
    const userChannel = pusherRef.current.subscribe(
      `presence-user-${data.user.id}`,
    );

    userChannel.bind("user-removed", async () => {
      await router.push("https://www.google.com");
    });

    channel.bind(
      "pusher:subscription_succeeded",
      (members: MembersResponse) => {
        console.log("🚀 ~ members:", members);
        const userResponse = Object.values(
          members.members,
        ) as unknown as UsersInRoom[];

        const users = userResponse
          .map((user) => {
            if (!dbData) return user;

            const userVoted = dbData?.users?.find((v) => v.id === user.id);
            if (!userVoted) return user;

            return userVoted;
          })
          .sort((a, b) => {
            if (!a.username || !b.username) return 0;
            return a.username.localeCompare(b.username);
          });

        const localDate = new Date(dbData?.timer ?? 0);
        const currentDate = new Date();

        const timer =
          localDate > currentDate
            ? Math.floor((localDate.getTime() - currentDate.getTime()) / 1000)
            : 0;

        setUsersInRoom(users);
        setTimer(timer);
      },
    );

    channel.bind("vote", ({ id, choose }: VoteApiResponse) => {
      setUsersInRoom((prev) => {
        return prev.map((user) => {
          if (user?.id === id) {
            return {
              ...user,
              voted: true,
              choose,
            };
          }
          return user;
        });
      });
    });

    channel.bind("reset-vote", ({ roomId, users }: ResetRoomResponse) => {
      setStep(ROOM_STATUS.VOTING);
      setUsersInRoom((prev) =>
        prev.map((user) => {
          return {
            ...user,
            voted: false,
            choose: null,
          };
        }),
      );
    });

    channel.bind("reveal-vote", ({ users }: RevealVotesResponse) => {
      if (!users) return;
      const data = {
        roomId,
        users,
        timer: 0,
      };
      localStorage.setItem(`${roomId}-vote`, JSON.stringify(data));
      setUsersInRoom(users);
      setStep(ROOM_STATUS.VOTED);
    });
    channel.bind("set-timer", ({ timer, users }: SetTimerResponse) => {
      setUsersInRoom(users);
      setTimer(timer * 60);

      setStep(ROOM_STATUS.VOTING);
    });

    channel.bind(
      "remove-member",
      ({ memberIdToRemove }: RemoveMemberResponse) => {
        setUsersInRoom((prev) =>
          prev.filter((user) => user?.id !== memberIdToRemove),
        );
      },
    );

    channel.bind("pusher:member_added", function (member: AddedMemberResponse) {
      member.info &&
        setUsersInRoom((prev) => {
          const filteredMembers = prev.filter((m) => m.id !== member.info.id);
          const members = [...filteredMembers, member.info];
          return members;
        });
    });

    return () => {
      pusherRef.current?.disconnect();
      mounted = false;
      channel.unsubscribe();
      userChannel.unsubscribe();
    };
  }, [
    data?.user.id,
    data?.user.image,
    data?.user.name,
    roomData,
    roomId,
    router,
    setTimer,
  ]);

  const handleCreateVote = async (choose: string) => {
    if (cardIsLoading) return;
    try {
      if (!data?.user.id) return;
      setCardIsLoading(true);
      await onInsertVote({
        roomId,
        value: choose,
        userId: data?.user.id,
      });
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

  const handleInitTimer = async (timer: number) => {
    if (cardIsLoading) return;

    try {
      setCardIsLoading(true);
      await onSetTimer({
        roomId,
        timer,
      });
      const payload = {
        roomId: roomId,
        timer: timer,
        users: usersInRoom,
      };

      await fetch("/api/timer", {
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
    canRevealVote,
    getMyVote,
    handleCreateVote,
    getRoom,
    handleResetVote,
    step,
    isLoading,
    cardIsLoading,
    handleRevealVote,
    handleInitTimer,
    formatedTimer,
    isTimerRunning,
    getRoomDataRefetch,
    isMutatingVote,
  };
};
