import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { ROOM_STATUS } from "@/enum/status";
import { pusher } from "@/libs/pusher/server";

export const roomRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        link: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { link, title } = input;

      try {
        const query = await ctx.db.room.create({
          data: {
            link,
            title,
            status: ROOM_STATUS.VOTING,
            user: { connect: { id: ctx.session.user.id } },
          },
        });
        return query;
      } catch (e) {
        console.log(e);
      }
    }),

  getByRoomId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.room.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  createVote: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        value: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { roomId, value, userId } = input;

      const hasVote = await ctx.db.votes.findFirst({
        where: {
          roomId: roomId,
          userId: userId,
        },
        select: {
          id: true,
        },
      });

      if (hasVote) {
        const query = await ctx.db.votes.update({
          where: {
            id: hasVote.id,
          },
          data: {
            value: value,
          },
          select: {
            id: true,
          },
        });

        return query;
      }

      const query = await ctx.db.votes.create({
        data: {
          value: value,
          room: { connect: { id: roomId } },
          user: { connect: { id: userId } },
        },
        select: {
          id: true,
        },
      });

      return query;
    }),

  getVoteByUser: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { roomId } = input;
      const query = await ctx.db.votes.findMany({
        where: {
          roomId: roomId,
        },
        include: {
          user: true,
        },
      });

      const users = query.map((vote) => {
        return {
          id: vote.user.id,
          username: vote.user.name,
          choose: vote.value,
          user_image_url: vote.user.image,
          voted: true,
        };
      });
      return users;
    }),
  revealRoom: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        status: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { roomId, status } = input;

      const query = await ctx.db.room.update({
        where: {
          id: roomId,
        },
        data: {
          status,
        },
        select: {
          status: true,
        },
      });

      if (!query) {
        throw new Error("Room not found");
      }

      return query;
    }),

  resetRoom: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        status: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { roomId, status } = input;
      const query = await ctx.db.room.update({
        where: {
          id: roomId,
        },
        data: {
          status,
          timer: null,
        },
        select: {
          status: true,
        },
      });

      if (!query) {
        throw new Error("Room not found");
      }

      await ctx.db.votes.deleteMany({
        where: {
          roomId: roomId,
        },
      });

      return query;
    }),

  getRoomData: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { roomId } = input;
      const query = await ctx.db.room.findUnique({
        where: {
          id: roomId,
        },
        include: {
          votes: {
            orderBy: {
              user: {
                name: "desc",
              },
            },
          },
          users: true,
        },
      });

      const timer = await ctx.db.room.findUnique({
        where: {
          id: roomId,
        },
        select: {
          timer: true,
        },
      });
      const roomOwner = query?.createdById;
      const users = query?.users.map((user) => {
        const vote = query.votes.find((vote) => vote.userId === user.id);
        return {
          id: user.id,
          username: user.name,
          choose: vote?.value ?? null,
          user_image_url: user.image,
          voted: vote?.value ? true : false,
        };
      });

      return {
        users,
        timer: timer?.timer ?? 0,
      };
    }),

  setTimer: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        timer: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { roomId, timer } = input;

      const currentDate = new Date();
      const timerToDate = new Date(currentDate.getTime() + timer * 60 * 1000);
      const query = await ctx.db.room.update({
        where: {
          id: roomId,
        },
        data: {
          timer: timerToDate,
        },
        select: {
          timer: true,
        },
      });

      return query;
    }),

  insertMemberInRoom: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { roomId, userId } = input;

      return await ctx.db.room.update({
        where: {
          id: roomId,
        },
        data: {
          user: { connect: { id: userId } },
        },
      });
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        memberIdToRemove: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { roomId, memberIdToRemove } = input;
      try {
        await ctx.db.room.update({
          where: {
            id: roomId,
          },
          data: {
            users: {
              disconnect: {
                id: memberIdToRemove,
              },
            },
            votes: {
              deleteMany: {
                userId: memberIdToRemove,
              },
            },
          },
        });

        await pusher.trigger(`presence-room-${roomId}`, "remove-member", {
          memberIdToRemove,
        });

        await pusher.trigger(
          `presence-user-${memberIdToRemove}`,
          "user-removed",
          {
            message: "You have been removed from the room",
          },
        );

        return { message: "success" };
      } catch (err) {
        console.log(err);
        return { message: err };
      }
    }),
  getResult: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { roomId } = input;

      const query = await ctx.db.votes.findMany({
        where: {
          roomId: roomId,
        },
        include: {
          user: true,
        },
      });

      const users = query.map((vote) => {
        return {
          id: vote.user.id,
          username: vote.user.name,
          choose: vote.value,
          user_image_url: vote.user.image,
          voted: true,
        };
      });
      return users;
    }),
});
