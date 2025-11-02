"use client";
import React, { useEffect } from "react";
import CardPost from "../cardpost/CardPost";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useInView } from "react-intersection-observer";
import LoadingBar from "../loadingbar";

export default function GeneralPostFeed() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search");

  const fetchPosts = async ({ pageParam }: { pageParam: string | null }) => {
    try {
      const url = searchQuery
        ? `/api/post?search=${searchQuery}&cursor=${pageParam || ""}`
        : `/api/post?cursor=${pageParam || ""}`;
      const res = await axios.get(url);
      return res.data; // { data: Post[], nextCursor: string | null }
    } catch (err) {
      console.error(err);
      return { data: [], nextCursor: null }; // fallback
    }
  };

  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["posts", searchQuery],
    queryFn: fetchPosts,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
  });

  // Fetch next page saat inView
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Loading pertama kali
  if (status === "pending" && !data) return <LoadingBar />;

  // Error fetch
  if (status === "error")
    return <div className="text-center">Terjadi kesalahan: {error?.message}</div>;

const allPosts =
  Array.isArray(data?.pages)
    ? data.pages.flatMap((page) => Array.isArray(page.data) ? page.data : [])
    : [];
console.log("data", data);

  return (
    <div className="space-y-5">
      {allPosts.length === 0 ? (
        <div className="text-center py-5">Belum ada postingan</div>
      ) : (
        <>
          {data?.pages?.map((group, i) => (
            <React.Fragment key={i}>
              {group.data.map((item: any) => (
                <CardPost key={item.id} item={item} session={session} />
              ))}
            </React.Fragment>
          ))}

          <div ref={ref} className="text-center py-5">
            {isFetchingNextPage ? (
              <LoaderCircle className="animate-spin mx-auto" />
            ) : hasNextPage ? (
              <LoaderCircle className="animate-spin mx-auto" />
            ) : (
              "Tidak ada postingan lagi"
            )}
          </div>
        </>
      )}
    </div>
  );
}
