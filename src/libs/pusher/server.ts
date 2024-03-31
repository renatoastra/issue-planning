import Pusher from "pusher";

export const pusher = new Pusher({
  appId: process.env.SOKETI_DEFAULT_APP_ID!,
  secret: process.env.SOKETI_DEFAULT_APP_SECRET!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  useTLS: true,
  host: process.env.NEXT_PUBLIC_SOKETI_URL!,
  cluster: process.env.SOKETI_CLUSTER!,
});
