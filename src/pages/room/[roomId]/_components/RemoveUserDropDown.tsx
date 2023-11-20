import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserX } from "lucide-react";
import { api } from "@/utils/api";

export const RemoveUserDropDown = ({
  children,
  isRoomOwner,
  roomId,
  userId,
}: {
  children: React.ReactNode;
  isRoomOwner: boolean;
  roomId: string;
  userId: string;
}) => {
  const { mutateAsync: onRemoveMember } = api.room.removeMember.useMutation();
  if (!isRoomOwner) {
    return <>{children}</>;
  }

  const handleRemoveUser = async () => {
    try {
      // const response = await fetch("/api/remove-member", {
      //   method: "POST",
      //   body: JSON.stringify({
      //     roomId: roomId,
      //     memberIdToRemove: userId,
      //   }),
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });

      await onRemoveMember({
        memberIdToRemove: userId,
        roomId: roomId,
      });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="z-50 w-56 ">
        <DropdownMenuLabel>Controle de usuário</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleRemoveUser}>
            <UserX className="mr-2 h-4 w-4" />
            <span>Remover usuário</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
