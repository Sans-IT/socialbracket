"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { MEDIATYPE } from "@prisma/client";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { ImagePlusIcon } from "lucide-react";
import Image from "next/image";

const FormSchema = z.object({
  title: z.string().min(1).max(60),
  description: z.string().max(600),
  authorId: z.string(),
  source: z.string(),
  type: z.nativeEnum(MEDIATYPE),
});

export default function AddPostForm({ session }: { session: Session | null }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [filePreview, setFilePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleClick = () => {
    return fileInputRef.current?.click();
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      authorId: session?.user?.id || "",
      source: crypto.randomUUID(),
      type: "NONE",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["createpost"],
    mutationFn: async (props: z.infer<typeof FormSchema>) => {
      if (selectedFile) {
        const { error: uploadError } = await supabase.storage
          .from("post")
          .upload(
            `${session?.user.name}/${form.getValues("source")}`,
            selectedFile,
            {
              upsert: true,
            }
          );
        if (uploadError) {
          throw new Error(`Upload gagal: ${uploadError.message}`);
        }
      }

      const { data } = await axios.post("/api/post", props);
      return data;
    },
    onSuccess: () => {
      toast({
        variant: "default",
        title: "Berhasil!",
        description: "Postingan telah dibuat.",
      });
      router.replace(`/profile/${session?.user.username}`);
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

  const handleDeleteFile = () => {
    setFilePreview("");
    setSelectedFile(null);
    form.setValue("type", "NONE");

    // ✅ Reset file input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));

      // ✅ Set file type (image or video) dynamically
      const fileType = file.type.startsWith("image") ? "IMAGE" : "VIDEO";

      // ✅ Update form values
      form.setValue("type", fileType); // Store file type
    }
  };

  return (
    <MaxWidthSize className="sm:max-w-2xl space-y-5">
      <h1 className="font-bold text-4xl">Buat Postingan</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            mutate(data);
          })}
          className="w-full space-y-6"
        >
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                {form.getValues("type") !== "NONE" ? (
                  <FormLabel className="w-fit h-fit border-2 border-dashed border-muted-foreground p-3 cursor-pointer flex items-center justify-center">
                    {form.getValues("type") === "IMAGE" ? (
                      <Image
                        src={filePreview}
                        alt="Uploaded Preview"
                        width={500}
                        height={500}
                        className="w-96 h-96 object-contain aspect-square"
                      />
                    ) : form.getValues("type") === "VIDEO" ? (
                      <video
                        src={filePreview}
                        controls
                        className="w-full h-full object-contain aspect-video"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 h-96 w-96 bg-secondary">
                        <ImagePlusIcon className="h-full w-full p-5 opacity-30" />
                      </div>
                    )}
                  </FormLabel>
                ) : null}

                <div className="space-x-2 pt-3">
                  <div className={cn(buttonVariants())} onClick={handleClick}>
                    Upload Gambar/Video
                  </div>
                  <div
                    className={cn(buttonVariants({ variant: "destructive" }))}
                    onClick={() => handleDeleteFile()}
                  >
                    Hapus
                  </div>
                </div>

                <FormControl>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            Postingkan
          </Button>
        </form>
      </Form>
    </MaxWidthSize>
  );
}
