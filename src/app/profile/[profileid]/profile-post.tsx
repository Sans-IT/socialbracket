"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import CardPost from "@/components/cardpost/CardPost"; // Pastikan ini sesuai dengan komponen Post kamu
import { useSession } from "next-auth/react";
import { LoaderCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingBar from "@/components/loadingbar";

type Props = { userId: string };

export default function ProfilePost({ userId }: Props) {
  const { ref, inView } = useInView(); // Untuk mendeteksi ketika user scroll ke bawah
  const { data: session } = useSession();

  // ✅ Fetch Post dengan Infinite Scroll
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["user-posts", userId],
      queryFn: async ({ pageParam }) => {
        const res = await axios.get(
          `/api/post?id=${userId}&cursor=${pageParam || ""}`
        );
        return res.data;
      },
      initialPageParam: null,
      getNextPageParam: (lastPage) => lastPage.nextCursor, // Ambil cursor untuk request berikutnya
    });

  // ✅ Trigger fetchNextPage ketika user scroll ke bawah
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage]);

  if (status === "pending") {
    return <LoadingBar />;
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {data?.pages.map((page) =>
        page.post?.map((item: any) => (
          <CardPost item={item} key={item.id} session={session} />
        ))
      )}

      <div ref={ref} className="text-center py-5">
        {isFetchingNextPage ? (
          <LoaderCircle className="animate-spin mx-auto" />
        ) : hasNextPage ? (
          <LoaderCircle className="animate-spin mx-auto" />
        ) : (
          "Tidak ada postingan lagi"
        )}
      </div>
    </div>
  );
}
