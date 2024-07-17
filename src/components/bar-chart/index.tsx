"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { type UsersInRoom } from "@/types/users-in-room";

const labels = ["PP", "P", "M", "G", "GG"];

interface BarChartResultProps {
  result: UsersInRoom[] | undefined;
}

const chartConfig = {
  desktop: {
    label: "Votes",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function BarChartResult({ result }: BarChartResultProps) {
  const getVotesByType = () => {
    return labels.map((p) => ({
      label: p,
      quantity: result?.filter((user: UsersInRoom) => user.choose === p).length,
    }));
  };
  console.log("🚀 ~ getVotesByType:", getVotesByType());

  return (
    <Card className="mt-6 w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          Result
          <TrendingUp />
        </CardTitle>
        <CardDescription>voting room result.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={getVotesByType()}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="quantity" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
    </Card>
  );
}
