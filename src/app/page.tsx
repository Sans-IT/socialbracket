import GeneralPostFeed from "@/components/homepage/GeneralPostFeed";
import LoadingBar from "@/components/loadingbar";
import MaxWidthDiv from "@/components/MaxWidthDiv";
import { Skeleton } from "@/components/ui/skeleton";
import React, { Suspense } from "react";

export default function Home() {
  return (
    <MaxWidthDiv className="sm:max-w-3xl">
      <Suspense
        fallback={
          <LoadingBar />  
        }
      >
        <GeneralPostFeed />
      </Suspense>
    </MaxWidthDiv>
  );
}
