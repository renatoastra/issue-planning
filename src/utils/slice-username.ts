export const sliceUsername = (username: string | null, numberValue: number) =>
  username?.slice(0, numberValue) + "...";
