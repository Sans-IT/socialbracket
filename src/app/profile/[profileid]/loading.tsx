import MaxWidthDiv from "@/components/MaxWidthDiv";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProfileId() {
  return (
    <MaxWidthDiv className="sm:max-w-2xl flex flex-col gap-5">
      <Skeleton className="h-40 w-40 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-8 w-[300px]" />
      </div>
    </MaxWidthDiv>
  );
}
