"use client";
import { Post, User } from "@prisma/client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { CommentSection } from "./CommentSection";

import { toast } from "@/hooks/use-toast";
import { EllipsisVerticalIcon, PencilIcon } from "lucide-react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { DeleteDialogPost } from "./DeleteDialogPost";
import { PostMedia } from "./Postmedia";
import Image from "next/image";

export type CardPostProps = {
  item: Post & { author: User }; // Include author as part of the Post type
  session: Session | null;
};

// interface LikePostProps {
//   postId: string;
//   userId: string;
// }

export default function CardPost({ item, session }: CardPostProps) {
  const router = useRouter();
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link Copied!",
        description: "The post link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Copy",
        description: "Could not copy the link. Please try again.",
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <Card className="w-full" key={item.id}>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div className={"flex items-center space-x-3"}>
              <Link href={`/profile/${item.author.username}`}>
                <Avatar>
                  <AvatarImage
                    alt={item.author.name || item.id}
                    src={item.author.image || item.id}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {item.author?.username?.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Link href={`/post/${item.id}`} className="text-xl font-bold">
                <span>{item.author.username}</span>
              </Link>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button size={"icon"} variant={"ghost"} className="h-8 w-8">
                  <EllipsisVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {session?.user.id === item.authorId ? (
                  <>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <DeleteDialogPost session={session} item={item} />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push(`/post/edit/${item.id}`)}
                    >
                      <PencilIcon />
                      Edit
                    </DropdownMenuItem>
                  </>
                ) : null}
                <DropdownMenuItem
                  onClick={() => {
                    const linkToCopy = `${window.location.origin}/post/${item.id}`;
                    copyToClipboard(linkToCopy);
                  }}
                >
                  Salin Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardTitle className="font-semibold text-lg">{item.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {item.type !== "NONE" ? (
            <div className="mb-5">
              <PostMedia item={item} />
            </div>
          ) : null}

          <span className="text-base whitespace-pre-line">
            {item.description || null}
          </span>
        </CardContent>
        <CardFooter className="gap-2">
          <CommentSection postProps={item} />
          {/* <LikeButton PostId={item.id} /> */}
        </CardFooter>
      </Card>
    </div>
  );
}

// const LikeButton = ({ PostId }: { PostId: string }) => {
//   const { data: session } = useSession();

//   const {
//     data: getLikePost,
//     isLoading,
//     refetch,
//   } = useQuery({
//     queryKey: [`getlikepost${PostId}`],
//     queryFn: async () => {
//       const { data } = await axios.get(`/api/like?id=${PostId}`);
//       return data;
//     },
//   });

//   const { mutate: likeOnPost } = useMutation({
//     mutationKey: ["likeonpost"],
//     mutationFn: async (props: LikePostProps) => {
//       const { data } = await axios.post("/api/like", props);
//       return data;
//     },
//   });

//   return (
//     <div className="flex items-center gap-2">
//       <HeartIcon
//         className={`w-5 h-5 cursor-pointer`}
//         onClick={() => (
//           session?.user?.id &&
//             likeOnPost({ userId: session.user.id, postId: post.id }),
//           refetch()
//         )}
//       />
//       {isLoading ? (
//         <LoaderCircleIcon className="animate-spin" />
//       ) : (
//         <span>{getLikePost.length}</span>
//       )}
//     </div>
//   );
// };
