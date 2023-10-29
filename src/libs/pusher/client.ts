import Pusher from "pusher-js";

export const pusherClient = new Pusher(
  process.env.NEXT_PUBLIC_SOKETI_DEFAULT_APP_KEY!,
  {
    cluster: "",
    wsHost: process.env.NEXT_PUBLIC_SOKETI_URL!,
    wsPort: Number(process.env.NEXT_PUBLIC_SOKETI_PORT),
    forceTLS: false,
    disableStats: true,
    enabledTransports: ["ws", "wss"],

    authEndpoint: "/api/pusher",
  },
);
