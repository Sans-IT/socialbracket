import React from "react";
import { Skeleton } from "./ui/skeleton";
import MaxWidthDiv from "./MaxWidthDiv";

export default function LoadingBar() {
  return (
    <MaxWidthDiv className="space-y-3 sm:max-w-2xl">
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[200px] w-full" />
    </MaxWidthDiv>
  );
}
