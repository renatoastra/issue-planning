import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { ROOM_STATUS } from "@/enum/status";

export const roomRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        planning: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { planning } = input;
      console.log("🚀 ~ planning:", planning);
      try {
        const query = await ctx.db.room.create({
          data: {
            planning: planning,
            user: { connect: { id: ctx.session.user.id } },
            status: ROOM_STATUS.VOTING,
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
      return query;
    }),
  changeRoomStatus: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        status: z.string(),
        type: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { roomId, status, type } = input;

      if (type === "reveal-vote") {
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
      }
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

      await ctx.db.votes.deleteMany({
        where: {
          roomId: roomId,
        },
      });

      return query;
    }),
});
