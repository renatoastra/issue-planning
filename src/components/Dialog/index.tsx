import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { signIn, useSession } from "next-auth/react";

interface UserDialogProps {
  roomId: string;
  setUser: (value: string) => void;
  user: string;
}
export const UserDialog = () => {
  const [open, setOpen] = useState(false);
  const { status } = useSession();
  useEffect(() => {
    if (typeof window !== "undefined" && status === "unauthenticated") {
      setOpen(true);
    }
  }, [status]);
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="my-5 text-3xl">
            Precisamos te conhecer melhor
          </DialogTitle>
          <DialogDescription className="flex h-32 w-full items-center justify-center">
            <Button
              className="w-full"
              onClick={() => signIn("discord")}
              type="submit"
            >
              Entrar com discord
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
