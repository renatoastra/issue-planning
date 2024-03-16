import { signIn, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import Link from "next/link";

import { UserButton } from "./user-button";

export const Navbar = () => {
  const { data } = useSession();
  return (
    <div className="flex w-full items-center justify-between border-b  bg-gradient-to-tr px-11 py-6 shadow-md">
      <Link
        title="Gebra planning"
        href={"/"}
        className="flex items-center gap-3 text-primary"
      >
        <div className="flex flex-col items-center">
          <p className="text-4xl  uppercase leading-6">Genebra Planning</p>
          <p className="text-gray-500">Making it simple and stupid</p>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        {data?.user ? (
          <div className="flex items-center gap-6">
            <UserButton />
          </div>
        ) : (
          <Button variant="outline" onClick={() => signIn()}>
            Login
          </Button>
        )}
      </div>
    </div>
  );
};
