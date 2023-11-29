import type { inferRouterOutputs } from "@trpc/server";
import {
  createTRPCReact,
  type inferReactQueryProcedureOptions,
} from "@trpc/react-query";
import type { roomRouter } from "@/server/api/routers/room";
import { type AppRouter } from "@/server/api/root";
export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>;

type RouterOutput = inferRouterOutputs<typeof roomRouter>;

type GetResult = RouterOutput["getResult"];

type GetRoomData = RouterOutput["getRoomData"];

type RevealRoom = RouterOutput["revealRoom"];

type ResetRoom = RouterOutput["resetRoom"];

type SetTimer = RouterOutput["setTimer"];

export type { GetResult, GetRoomData, RevealRoom, ResetRoom, SetTimer };
