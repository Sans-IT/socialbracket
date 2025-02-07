import CardPost from "@/components/cardpost/CardPost";
import MaxWidthDiv from "@/components/MaxWidthDiv";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import React from "react";
import EditPostForm from "./edit-post-form";
import { redirect } from "next/navigation";

export default async function PostId({
  params,
}: {
  params: Promise<{ postid: string }>;
}) {
  const session = await auth();
  const { postid } = await params;

  const data = await db.post.findUnique({
    where: { id: postid },
    include: { author: true },
  });

  if (!data) {
    return (
      <MaxWidthDiv className="sm:max-w-4xl text-center">
        <p>Post not found</p>
      </MaxWidthDiv>
    );
  }

  if (data.authorId !== session?.user.id) {
    redirect("/");
  }

  return (
    <MaxWidthDiv className="sm:max-w-4xl">
      <EditPostForm post={data} />
    </MaxWidthDiv>
  );
}
