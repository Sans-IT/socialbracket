"use client";
import React, { useEffect } from "react";
import CardPost from "../cardpost/CardPost";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "../ui/skeleton";
import { Post, User } from "@prisma/client";
import { useInView } from "react-intersection-observer";
import { LoaderCircle } from "lucide-react";
import LoadingBar from "../loadingbar";

export default function GeneralPostFeed() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search");

  // Fetching posts with infinite scroll
  const fetchProjects = async ({ pageParam }: { pageParam: string | null }) => {
    const url = searchQuery
      ? `/api/post?search=${searchQuery}&cursor=${pageParam || ""}`
      : `/api/post?cursor=${pageParam || ""}`;

    const res = await axios.get(url);
    return res.data;
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
    queryKey: ["posts", searchQuery], // Tambahkan searchQuery agar query berubah saat search berubah
    queryFn: fetchProjects,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor, // Ambil `nextCursor` dari response
  });

  // Fetch next page saat `inView` aktif
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (status === "pending") {
    return <LoadingBar />;
  }

  if (status === "error") {
    return (
      <div className="text-center">Terjadi kesalahan: {error.message}</div>
    );
  }

  return (
    <div className="space-y-5">
      {data.pages.map((group, i) => (
        <React.Fragment key={i}>
          {group.data.map((item: Post & { author: User }) => (
            <CardPost key={item.id} item={item} session={session} />
          ))}
        </React.Fragment>
      ))}

      {/* Observer untuk trigger infinite scroll */}
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
