"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

export default function FeedbackForm() {
  const [text, setText] = useState("");
  const queryClient = useQueryClient();

  const feedbackMutation = useMutation({
    mutationFn: async () => axios.post("/api/feedback", { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      setText(""); // Reset form setelah submit
    },
  });

  return (
    <div className="w-full py-5 max-w-lg">
      <h2 className="text-xl font-semibold mb-3">Buat Masukan</h2>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="tuliskan masukanmu disini..."
        disabled={feedbackMutation.isPending}
      />
      <Button
        className="mt-2 w-full"
        onClick={() => feedbackMutation.mutate()}
        disabled={!text.trim() || feedbackMutation.isPending}
      >
        {feedbackMutation.isPending ? "Loading..." : "Kirim"}
      </Button>
    </div>
  );
}
