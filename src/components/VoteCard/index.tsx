import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VoteCardProps {
  title: string;
  description: string;
  onClick?: () => void;
  currentChoice?: boolean;
}
export const VoteCard = ({
  description,
  title,
  onClick,
  currentChoice,
}: VoteCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={` h-44 w-32 max-w-[128px] cursor-pointer bg-primary-foreground ${
        currentChoice ? "bg-indigo-700 text-white" : ""
      }`}
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
  );
};
