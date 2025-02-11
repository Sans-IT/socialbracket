"use client";
import LoadingBar from "@/components/loadingbar";
import MaxWidthDiv from "@/components/MaxWidthDiv";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Follow, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FollowWithUser = Follow & { follower: User };

export default function Follower({ userId }: { userId: string }) {
  const { data: followers, isLoading } = useQuery<FollowWithUser[]>({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/api/follow?type=pengikut&userId=${userId}`
      );
      return data;
    },
  });

  if (isLoading) return <LoadingBar />;
  return (
    <MaxWidthDiv className="sm:max-w-xl flex flex-col gap-2">
      {followers && followers.length > 0 ? (
        followers.map((item) => (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <Link
                href={`/profile/${item.follower.username}`}
                className="flex flex-row items-center gap-2"
              >
                <Avatar>
                  <AvatarImage
                    src={item.follower.image || item.follower.id}
                    alt={item.follower.username || "/default-user.png"}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {item.follower.username?.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-semibold">{item.follower.username}</p>
              </Link>
              <Link
                href={`/profile/${item.follower.username}`}
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
