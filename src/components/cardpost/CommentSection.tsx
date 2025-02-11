import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import {
  EllipsisVerticalIcon,
  LoaderCircle,
  LoaderCircleIcon,
  MessageSquareIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Comment, Post, User } from "@prisma/client";
import { Input } from "../ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { authPages } from "@/lib/utils";

interface CommentSectionProps extends Comment {
  User: User;
}

interface PostProps {
  postProps: Post & {
    author: User;
  };
}

const FormSchema = z.object({
  text: z.string().min(1).max(100),
});

export const CommentSection = ({ postProps }: PostProps) => {
  const { data: session } = useSession();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      text: "",
    },
  });

  const {
    data: CommentData,
    isLoading,
    refetch,
  } = useQuery<CommentSectionProps[]>({
    queryKey: [`getcommentbypost${postProps.id}`],
    queryFn: async () => {
      const response = await axios.get(`/api/comment?id=${postProps.id}`);
      return response.data;
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["postcomment"],
    mutationFn: async (props: z.infer<typeof FormSchema>) => {
      const { data } = await axios.post("/api/comment", {
        text: props.text,
        postId: postProps.id,
        id: session?.user?.id,
      });
      return data;
    },
    onSuccess: () => {
      refetch();
      form.setValue("text", "");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "gagal menambahkan komentar",
      });
      if (!session?.user) return router.push(authPages.signIn);
    },
  });

  const { mutate: DeleteComment } = useMutation({
    mutationKey: ["deletecomment"],
    mutationFn: async (commentId: string) => {
      const { data } = await axios.delete(
        `/api/comment?id=${commentId}&authorid=${session?.user.id}`
      );
      return data;
    },
    onSuccess: () => {
      refetch();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "gagal delete komentar",
      });
      if (!session?.user) return router.push(authPages.signIn);
    },
  });

  return (
    <Sheet>
      <SheetTrigger
        onClick={() => refetch()}
        className="flex items-center gap-2"
      >
        <MessageSquareIcon className="w-5 h-5" />
        {isLoading ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : CommentData?.length == 0 ? null : (
          CommentData?.length
        )}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[500px] overflow-y-auto flex flex-col gap-2"
      >
        {isLoading ? (
          <div>
            <LoaderCircleIcon className="animate-spin m-auto" />
          </div>
        ) : CommentData ? (
          <>
            <SheetTitle>{CommentData?.length} Komentar</SheetTitle>
            <SheetHeader className="flex gap-3 flex-grow w-full overflow-x-hidden">
              {CommentData?.map((item) => (
                <div
                  className="flex items-center flex-row justify-between"
                  key={item.id}
                >
                  <div className="w-full flex items-center justify-between flex-row text-pretty break-words text-start">
                    <div className="flex items-center justify-between gap-3">
                      <Link href={`/profile/${item.User.username}`}>
                        <Avatar>
                          <AvatarImage
                            src={item.User?.image || ""}
                            className="object-cover"
                          />
                          <AvatarFallback>
                            {item.User?.username?.slice(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex flex-col items-start">
                        <Link
                          href={`/profile/${item.User.username}`}
                          className="hover:underline text-sm"
                        >
                          {item.User?.username}
                        </Link>
                        <SheetDescription className="text-balance break-words text-start w-full">
                          {item.text}
                        </SheetDescription>
                      </div>
                    </div>
                    {session?.user.id === item.userId ||
                    session?.user.id === postProps.authorId ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            size={"icon"}
                            variant={"ghost"}
                            className="h-8 w-8"
                          >
                            <EllipsisVerticalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => DeleteComment(item.id)}
                          >
                            <Trash2Icon />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </div>
                </div>
              ))}
            </SheetHeader>
            <div className="flex-shrink-0 sticky bottom-0 bg-background py-3">
              <SheetFooter>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) => mutate(data))}
                    className="w-full flex gap-2 items-center"
                  >
                    <FormField
                      control={form.control}
                      name="text"
                      render={({ field }) => {
                        return (
                          <FormItem className="w-full">
                            <Input
                              placeholder="Tulis Komentarmu..."
                              {...field}
                            />
                          </FormItem>
                        );
                      }}
                    />
                    <div>
                      <Button size="icon" type="submit" disabled={isPending}>
                        <SendIcon />
                      </Button>
                    </div>
                  </form>
                </Form>
              </SheetFooter>
            </div>
          </>
        ) : (
          <span className="text-center">tidak ada komentar</span>
        )}
      </SheetContent>
    </Sheet>
  );
};
