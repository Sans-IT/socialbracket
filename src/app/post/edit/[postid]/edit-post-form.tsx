"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MaxWidthSize from "@/components/MaxWidthDiv";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { Post, User } from "@prisma/client";

export type CardPostProps = {
  post: Post & { author: User }; // Include author as part of the Post type
};

const FormSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(60),
  description: z.string().max(600),
  authorId: z.string(),
});

export default function EditPostForm({ post }: CardPostProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: post.id,
      title: post.title,
      description: post.description || "",
      authorId: post.authorId,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["updatepost"],
    mutationFn: async (props: z.infer<typeof FormSchema>) => {
      const { data } = await axios.patch("/api/post", props);
      return data;
    },
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Berhasil!",
        description: "Postingan telah dibuat.",
      }),
        router.push("/");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    },
  });

  return (
    <MaxWidthSize className="sm:max-w-2xl space-y-5">
      <h1 className="font-bold text-4xl">Edit Postingan "{post.title}"</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            console.log("Form Data:", data);
            mutate(data);
          })}
          className="w-full space-y-6"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul</FormLabel>
                <FormControl>
                  <Input placeholder="tulis judul postingan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea
                    className="resize-none h-48"
                    placeholder="tulis deskripsi postingan"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" isLoading={isPending}>
            Update
          </Button>
        </form>
      </Form>
    </MaxWidthSize>
  );
}
