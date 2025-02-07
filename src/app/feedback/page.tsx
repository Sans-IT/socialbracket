"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MaxWidthDiv from "@/components/MaxWidthDiv";
import FeedbackForm from "./feedback-form";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";

export default function Feedback() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // ✅ Ambil semua feedback
  const { data, isLoading, error } = useQuery({
    queryKey: ["feedback"],
    queryFn: async () => {
      const res = await axios.get("/api/feedback");
      return res.data;
    },
  });

  // ✅ Hapus semua feedback (Admin)
  const deleteAllFeedback = useMutation({
    mutationKey: ["feedback"],
    mutationFn: async () => {
      await axios.delete("/api/feedback");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
  });

  // ✅ Hapus feedback per user
  const deleteFeedbackById = useMutation({
    mutationKey: ["feedback"],
    mutationFn: async (id: string) => {
      await axios.delete(`/api/feedback?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
    },
  });

  if (isLoading) return <p className="text-center">Loading feedback...</p>;
  if (error) return <p className="text-center">Failed to load feedback</p>;

  return (
    <MaxWidthDiv className="sm:max-w-2xl">
      <h1 className="font-bold text-3xl">Berikan Feedback</h1>
      <span>Berikan request / pendapatmu untuk website ini ke depannya.</span>
      <FeedbackForm />

      {session?.user.role === "ADMIN" && (
        <Button
          onClick={() => deleteAllFeedback.mutate()}
          disabled={deleteAllFeedback.isPending}
          variant="destructive"
        >
          {deleteAllFeedback.isPending ? "Deleting..." : "Delete All Feedback"}
        </Button>
      )}

      <div className="w-full max-w-lg space-y-4 mt-5">
        {data.map((item: any) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 border rounded-md shadow"
          >
            <Avatar>
              <AvatarImage src={item.User.image || "/default-avatar.png"} />
              <AvatarFallback>
                {item.User.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{item.User.username}</p>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </div>

            {/* ✅ Tombol hapus hanya muncul untuk feedback milik user */}
            {session?.user.id === item.userId && (
              <Button
                className="ms-auto"
                variant="destructive"
                size="icon"
                onClick={() => deleteFeedbackById.mutate(item.id)}
                disabled={deleteFeedbackById.isPending}
              >
                <TrashIcon />
              </Button>
            )}
          </div>
        ))}
      </div>
    </MaxWidthDiv>
  );
}
