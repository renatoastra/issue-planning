import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { roomRouter } from "@/server/api/routers/room";

type RouterOutput = inferRouterOutputs<typeof roomRouter>;

export type GetResult = RouterOutput["getResult"];
