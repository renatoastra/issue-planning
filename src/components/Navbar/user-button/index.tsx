"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import Link from "next/link";
import {
  AtSign,
  DoorClosed,
  LogOut,
  MessageCircle,
  Moon,
  MoonIcon,
  Package,
  Settings,
  Sun,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const UserButton = () => {
  const user = useCurrentUser();
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.image ?? ""} />
          <AvatarFallback>
            {user?.name?.slice(0, 2).toLocaleUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="DropdownMenuContent text-duo-studio-gray-500 w-60 space-y-4 bg-background text-sm">
        <DropdownMenuItem className="flex w-full justify-between">
          <div className="flex items-center">
            <AtSign className="mr-2 h-4 w-4" />
            {user?.name}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="h-px bg-border" />
        <div className="mr-2 flex items-center justify-between p-2">
          <div className="flex items-center">
            <Sun className="mr-2 h-4 w-4  rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute mr-2  h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
            <p className="text-gray-400">Theme</p>
          </div>
          <Switch
            onCheckedChange={() => setTheme(theme == "dark" ? "light" : "dark")}
          />
        </div>

        <Link href="/settings">
          <DropdownMenuItem className="flex cursor-not-allowed items-center justify-between">
            <div className="flex items-center">
              <DoorClosed className="mr-2 h-4 w-4" />
              <span className="text-sm text-gray-400">My rooms</span>
            </div>
            <p className="animate-pulse text-xs text-purple-500">Soon</p>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator className="h-px bg-border" />
        <DropdownMenuItem>
          <MessageCircle className="mr-2 h-4 w-4" />
          Discord
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { UserButton };
