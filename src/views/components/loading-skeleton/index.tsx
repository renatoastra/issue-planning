import { Skeleton } from "@/components/ui/skeleton";

export const PageLoadingSkeleton = () => {
  return (
    <div className="flex h-full  w-[calc(100%-12.23rem)] flex-col   items-center justify-between  gap-6 ">
      <div className="flex h-full flex-col gap-14  py-8 xl:w-[42rem]">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="flex h-[40px] w-[470px] " />
          <Skeleton className="h-[40px] w-[140px]" />
        </div>

        <Skeleton className="flex h-[40px] w-full " />
        <Skeleton className="flex h-[120px] w-full " />

        <div className="flex items-center justify-center gap-4">
          <Skeleton className="flex h-[40px] w-[120px] " />
        </div>

        <div className="z-20 mt-6 flex gap-4 justify-self-end ">
          <Skeleton className="h-[178px] w-[126px] rounded-lg" />
          <Skeleton className="h-[178px] w-[126px] rounded-lg" />
          <Skeleton className="h-[178px] w-[126px] rounded-lg" />
          <Skeleton className="h-[178px] w-[126px] rounded-lg" />
          <Skeleton className="h-[178px] w-[126px] rounded-lg" />
        </div>
      </div>
    </div>
  );
};
