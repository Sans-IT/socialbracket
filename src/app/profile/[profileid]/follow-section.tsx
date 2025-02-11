"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export default function FollowSection({
  userId,
  postCount,
}: {
  userId: string;
  postCount: number;
}) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const router = useRouter();
  const pathname = usePathname();

  const listUserProfile = [
    { name: "mengikuti", key: "following" },
    { name: "pengikut", key: "followers" },
  ];

  // ✅ Fetch follow status & counts
  const { data: followData, isLoading: isLoadingFollowData } = useQuery({
    queryKey: ["follow-data", userId],
    queryFn: async () => {
      const res = await axios.get(`/api/follow?userId=${userId}`);
      return res.data;
    },
  });

  const isFollowing = followData?.isFollowing;
  const followCount = followData || { followers: 0, following: 0 };

  // ✅ Follow & Unfollow Mutations
  const followMutation = useMutation({
    mutationFn: async () =>
      axios.post("/api/follow", { userIdToFollow: userId }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["follow-data", userId] }),
  });

  const unfollowMutation = useMutation({
    mutationFn: async () =>
      axios.delete("/api/follow", { data: { userIdToUnfollow: userId } }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["follow-data", userId] }),
  });

  const handleFollow = async () => {
    if (isFollowing) {
      await unfollowMutation.mutateAsync();
    } else {
      await followMutation.mutateAsync();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ✅ Show Follow Stats */}
      <div className="flex text-center items-center gap-5 sm:gap-20">
        <div>
          <p>Postingan</p>
          <p className="text-xl font-semibold">{postCount}</p>
        </div>
        {listUserProfile.map((item) => (
          <Link href={`${pathname}/${item.name}`} key={item.key}>
            <p className="capitalize">{item.name}</p>
            <p className="text-xl font-semibold">
              {isLoadingFollowData ? "..." : followCount?.[item.key] || 0}
            </p>
          </Link>
        ))}
      </div>

      {/* ✅ Follow Button (Disabled for Self) */}
      {session?.user ? (
        currentUserId !== userId ? (
          <Button
            onClick={handleFollow}
            disabled={followMutation.isPending || unfollowMutation.isPending}
            variant={!isFollowing !== true ? "destructive" : "default"}
          >
            {isLoadingFollowData
              ? "Loading..."
              : followMutation.isPending || unfollowMutation.isPending
              ? "Processing..."
              : isFollowing
              ? "Unfollow"
              : "Follow"}
          </Button>
        ) : (
          <Link
            href={"/settings"}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Edit Profile
          </Link>
        )
      ) : null}
    </div>
  );
}
