import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  src: string;
  fallback: string;
}

export const UserAvatar = ({ fallback, src }: UserAvatarProps) => {
  return (
    <Avatar>
      <AvatarImage src={src} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
};
