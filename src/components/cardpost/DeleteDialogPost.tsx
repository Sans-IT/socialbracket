import { toast } from "@/hooks/use-toast";
import { authPages, cn } from "@/lib/utils";
import { Post } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Trash2Icon } from "lucide-react";
import { Session } from "next-auth";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { AlertDialogHeader, AlertDialogFooter } from "../ui/alert-dialog";
import { buttonVariants } from "../ui/button";
import { urlImage } from "@/lib/global-var";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const DeleteDialogPost = ({
  session,
  item,
}: {
  session: Session | null;
  item: Post & { author: User };
}) => {
  const router = useRouter();
  const query = useQueryClient();
  const supabase = createClientComponentClient();
  const postBucketFile = `${session?.user.name}/${item.source}`;

  const { mutate: DeletePost } = useMutation({
    mutationKey: [`deletepost`],
    mutationFn: async ({
      postId,
      authorId,
    }: {
      postId: string;
      authorId?: string;
    }) => {
      await supabase.storage.from("post").remove([postBucketFile]);
      const { data } = await axios.delete(
        `/api/post?id=${postId}&authorid=${authorId}`
      );
      return data;
    },
    onSuccess: () => {
      query.invalidateQueries({ queryKey: ["getpost", "user-posts"] });
      // router.replace(`/profile/${item.author.username}`);
      router.replace(`/`)
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal delete post",
      });
      if (!session?.user) return router.push(authPages.signIn);
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger className="w-full flex items-center gap-1 cursor-default">
        <Trash2Icon className="w-4 h-4" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus postingan</AlertDialogTitle>
          <AlertDialogDescription>
            tindakan ini akan menghapus postingan kamu yang berjudul &quot;
            {item.title}&quot;
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={() =>
              DeletePost({
                postId: item.id,
                authorId: item.author.id,
              })
            }
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
