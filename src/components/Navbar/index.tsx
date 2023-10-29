import { signIn, signOut, useSession } from "next-auth/react";
import { ModeToggle } from "../Theme/ModeToggle";
import { Button } from "../ui/button";

export const Navbar = () => {
  const { data } = useSession();
  return (
    <div className="flex w-full items-center justify-between border-b border-primary-foreground bg-gradient-to-tr px-4 py-6 shadow-md">
      <h1 className="text-primary">Issue Planning</h1>

      <div className="flex items-center gap-4">
        {data?.user ? (
          <Button variant="outline" onClick={() => signOut()}>
            Logout
          </Button>
        ) : (
          <Button variant="outline" onClick={() => signIn()}>
            Login
          </Button>
        )}
        <ModeToggle />
      </div>
    </div>
  );
};
