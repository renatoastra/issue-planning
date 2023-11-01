import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { ROOM_STATUS } from "@/enum/status";
import { UsersInRoom } from "@/types/users-in-room";

export const roomRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        description: z.string().min(1),
        title: z.string(),
        link: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { description, link, title } = input;
      try {
        const query = await ctx.db.room.create({
          data: {
            description,
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

      const query = await ctx.db.votes.create({
        data: {
          value: value,
          room: { connect: { id: roomId } },
          user: { connect: { id: userId } },
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
        },
        select: {
          status: true,
        },
      });

      return query;
    }),
});
