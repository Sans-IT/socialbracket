"use client";
import React, { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { urlImage } from "@/lib/global-var";
import { useSession } from "next-auth/react";

const FormSchema = z.object({
  username: z
    .string()
    .max(20)
    .min(2)
    .regex(/^[a-z0-9_-]+$/, {
      message:
        "Username harus menggunakan '-' atau '_' dan tidak boleh mengandung spasi atau huruf kapital.",
    }),
  bio: z.string().max(200).optional(),
  image: z.string().optional(),
});

export default function SettingsForm({ session }: { session: Session }) {
  const { update } = useSession();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [imagePreview, setImagePreview] = useState(session?.user?.image || "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const profileFilePath = `${urlImage}/profile/${session.user.name}/${
    session.user.id
  }?t=${new Date().toString()}`;

  const handleClick = () => {
    return fileInputRef.current?.click();
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: session?.user?.username || "",
      bio: session?.user?.bio || "",
      image: session?.user?.image || "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["updateUserSettings"],
    mutationFn: async (props: z.infer<typeof FormSchema>) => {
      // Upload image to Supabase Storage
      if (selectedImage) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("profile")
          .upload(`${session.user.name}/${session.user.id}`, selectedImage, {
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Upload gagal: ${uploadError.message}`);
        }
      }

      const { data } = await axios.patch("/api/user", props);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Berhasil!",
        description: "Profil telah diperbarui.",
      });
      update();
      router.push(`/profile/${form.getValues("username")}`);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        // If the response has an error message, display it in the toast
        const errorMessage =
          error.response?.data?.error ||
          error.message || // This handles the Axios error message itself
          "Terjadi kesalahan yang tidak diketahui."; // Fallback message

        toast({
          variant: "destructive",
          title: "Gagal memperbarui profil",
          description: errorMessage,
        });
      } else {
        // Catch other errors not related to Axios
        toast({
          variant: "destructive",
          title: "Gagal memperbarui profil",
          description: "Terjadi kesalahan yang tidak diketahui.",
        });
      }
    },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "File tidak valid!",
          description: "Harap unggah file gambar (JPEG, PNG, dll).",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));

      // ✅ Set form image field to file name (not the file itself)
      form.setValue("image", profileFilePath);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => mutate(data))}
          className="w-full space-y-6"
        >
          {/* Preview Gambar */}
          <div className="flex flex-col gap-4">
            <div className="w-[150px] h-[150px] relative">
              <Image
                src={imagePreview || "/default-profile.png"} // Use default image if empty
                alt="Profile Picture"
                layout="fill"
                onClick={handleClick}
                className="rounded-full object-cover border-muted border-4 cursor-pointer"
              />
            </div>

            {/* file */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div
                      className={cn(buttonVariants(), "cursor-pointer w-fit")}
                    >
                      Pilih Gambar
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      className="hidden"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* bio */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tuliskan bio"
                    className="h-36 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" isLoading={isPending}>
            Submit
          </Button>
        </form>
      </Form>
    </>
  );
}
