import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import clsx from "clsx";
import Image from "next/image";

interface VoteCardProps {
  title: string;
  description?: string;
  onClick?: () => void;
  currentChoice?: boolean;
  isLoading: boolean;
  src?: string;
}
export const VoteCard = ({
  description,
  title,
  onClick,
  currentChoice,
  isLoading,
  src,
}: VoteCardProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="disabled:cursor-not-allowed"
    >
      <Card
        className={clsx(
          "h-40 w-[128px] cursor-pointer bg-primary-foreground 2xl:h-44 2xl:w-32",
          currentChoice && "bg-indigo-700 text-white",
          isLoading && "cursor-not-allowed",
        )}
      >
        <CardHeader className="h-full w-full ">
          <CardTitle className="m-auto text-6xl">{title}</CardTitle>
          <div className="flex w-full items-center justify-center rounded-lg">
            {src && <Image src={src} width={70} height={70} alt="" />}
          </div>
        </CardHeader>
      </Card>
    </button>
  );
};
