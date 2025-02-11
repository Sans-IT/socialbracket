"use client";
import LoadingBar from "@/components/loadingbar";
import MaxWidthDiv from "@/components/MaxWidthDiv";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Follow, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";

type FollowWithUser = Follow & { following: User };

export default function Following({ userId }: { userId: string }) {
  const { data: following, isLoading } = useQuery<FollowWithUser[]>({
    queryKey: ["following", userId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/follow?type=mengikuti&userId=${userId}`
      );
      return data;
    },
  });

  if (isLoading) return <LoadingBar />;

  return (
    <MaxWidthDiv className="sm:max-w-xl flex flex-col gap-2">
      {following && following.length > 0 ? (
        following.map((item) => (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <Link
                href={`/profile/${item.following.username}`}
                className="flex flex-row items-center gap-2"
              >
                <Avatar>
                  <AvatarImage
                    src={item.following.image || item.following.id}
                    alt={item.following.username || "/default-user.png"}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {item.following.username?.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold">{item.following.username}</p>
              </Link>
              <Link
                href={`/profile/${item.following.username}`}
                className={cn(
                  buttonVariants({ size: "sm", variant: "outline" })
                )}
              >
                Lihat Profil
              </Link>
            </CardHeader>
          </Card>
        ))
      ) : (
        <p className="text-center">Tidak ada pengikut</p>
      )}
    </MaxWidthDiv>
  );
}
