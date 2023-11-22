import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import clsx from "clsx";

interface VoteCardProps {
  title: string;
  description: string;
  onClick?: () => void;
  currentChoice?: boolean;
  isLoading: boolean;
}
export const VoteCard = ({
  description,
  title,
  onClick,
  currentChoice,
  isLoading,
}: VoteCardProps) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="disabled:cursor-not-allowed"
    >
      <Card
        className={clsx(
          "h-40 max-w-[128px] cursor-pointer bg-primary-foreground 2xl:h-44 2xl:w-32",
          currentChoice && "bg-indigo-700 text-white",
          isLoading && "cursor-not-allowed",
        )}
      >
        <CardHeader className="w-full ">
          <CardTitle className="m-auto text-4xl">{title}</CardTitle>
          <CardDescription
            className={`m-auto w-full text-center  ${
              currentChoice ? " text-white" : ""
            }`}
          >
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </button>
  );
};
