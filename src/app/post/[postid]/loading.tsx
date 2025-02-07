import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPostId() {
  return (
    <div className="max-w-3xl mx-auto px-3 w-full flex flex-col gap-5">
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
