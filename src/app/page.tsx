import GeneralPostFeed from "@/components/homepage/GeneralPostFeed";
import MaxWidthDiv from "@/components/MaxWidthDiv";
import { Skeleton } from "@/components/ui/skeleton";
import React, { Suspense } from "react";

export default function Home() {
  return (
    <MaxWidthDiv className="sm:max-w-3xl">
      <Suspense
        fallback={
          <div className="space-y-3">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        }
      >
        <GeneralPostFeed />
      </Suspense>
    </MaxWidthDiv>
  );
}
