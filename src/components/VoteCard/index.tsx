import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { title } from "process";

interface VoteCardProps {
  title: string;
  description: string;
  onClick?: () => void;
}
export const VoteCard = ({ description, title, onClick }: VoteCardProps) => {
  return (
    <Card
      onClick={onClick}
      className="h-44 w-32 cursor-pointer bg-primary-foreground "
    >
      <CardHeader className="w-full ">
        <CardTitle className="m-auto text-4xl">{title}</CardTitle>
        <CardDescription className="m-auto">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
};
