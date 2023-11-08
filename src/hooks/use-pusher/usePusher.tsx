import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import { useEffect, useRef, useState } from "react";
import {
  type RemovedMemberResponse,
  type AddedMemberResponse,
  type VoteApiResponse,
  type RevealVotesResponse,
  type ResetRoomResponse,
  type SetTimerResponse,
  type LocalStorageData,
} from "./types";
import { api } from "@/utils/api";
import { ROOM_STATUS } from "@/enum/status";
import { type UsersInRoom, type UserVoted } from "@/types/users-in-room";
import { type MembersResponse } from "@/types/members";
import { useTimer } from "../use-timer/useTimer";

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
  const { data: getRoom } = api.room.getByRoomId.useQuery({
    id: roomId,
  });
  const { formatedTimer, setTimer, isTimerRunning } = useTimer();

  const { data: roomData, refetch: refetchRoomData } =
    api.room.getRoomData.useQuery({ roomId });
  const { mutateAsync: onInsertVote } = api.room.createVote.useMutation();
  const { mutateAsync: onRevealRoom } = api.room.revealRoom.useMutation({});
  console.log("🚀 ~ roomData:", roomData);

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
    }
  };

  useEffect(() => {
    if (!data?.user.id) return;
    let mounted = true;

    // const storageData = JSON.parse(
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   //@ts-ignore
    //   localStorage.getItem(`${roomId}-vote`),
    // ) as LocalStorageData;

    const storageData = {
      users: roomData?.users,
      timer: roomData?.timer,
    };

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
              storageData?.users?.find((user) => user.id === data.user.id)
                ?.voted ?? false,
            choose:
              storageData?.users?.find((user) => user.id === data.user.id)
                ?.choose ?? null,
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

          const userVoted = storageData?.users?.find((v) => v.id === user.id);
          if (!userVoted) return user;

          return userVoted;
        });

        const localDate = new Date(storageData?.timer ?? 0);
        const currentDate = new Date();

        const timer =
          localDate > currentDate
            ? Math.floor((localDate.getTime() - currentDate.getTime()) / 1000)
            : 0;

        setTimer(timer);

        const data = {
          users,
          timer: storageData?.timer ?? 0,
        };
        localStorage.setItem(`${roomId}-vote`, JSON.stringify(data));
        setUsersInRoom(users);
      },
    );

    channel.bind("vote", ({ users }: VoteApiResponse) => {
      setUsersInRoom(users);

      const data = {
        users: users,
        timer: 0,
      };
      const json = JSON.stringify(data);
      localStorage.setItem(`${roomId}-vote`, json);
    });

    channel.bind("reset-vote", async ({ roomId, users }: ResetRoomResponse) => {
      setStep(ROOM_STATUS.VOTING);
      setUsersInRoom(users);
      const data = {
        users,
        timer: 0,
      };
      localStorage.setItem(`${roomId}-vote`, JSON.stringify(data));
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
    channel.bind(
      "pusher:member_removed",
      function (member: RemovedMemberResponse) {
        member.info &&
          setUsersInRoom((prev) => {
            return prev.filter((user) => user?.id !== member.info.id);
          });
      },
    );

    channel.bind("set-timer", ({ timer, users }: SetTimerResponse) => {
      const timerToDate = new Date(new Date().getTime() + timer * 60 * 1000);

      const data = {
        roomId,
        users,
        timer: timerToDate,
      };
      setUsersInRoom(users);
      setTimer(timer * 60);

      setStep(ROOM_STATUS.VOTING);
      localStorage.setItem(`${roomId}-vote`, JSON.stringify(data));
    });

    channel.bind("pusher:member_added", function (member: AddedMemberResponse) {
      const currentUser = storageData?.users?.find(
        (user) => user.id === member.info.id,
      );

      if (currentUser) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        member.info &&
          setUsersInRoom((prev) => {
            return prev.map((user) => {
              if (user?.id === member.info.id) {
                return {
                  ...user,
                  voted: currentUser.voted,
                  choose: currentUser.choose,
                };
              }
              return user;
            });
          });
      } else {
        member.info && setUsersInRoom((prev) => [...prev, member.info]);
      }
    });
    return () => {
      pusherRef.current?.disconnect();
      mounted = false;
      channel.unsubscribe();
    };
  }, [roomId, data, setTimer, roomData?.timer, roomData?.users]);

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
  };
};
