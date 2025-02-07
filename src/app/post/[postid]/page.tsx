import CardPost from "@/components/cardpost/CardPost";
import MaxWidthDiv from "@/components/MaxWidthDiv";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { urlImage } from "@/lib/global-var";
import { Metadata, ResolvingMetadata } from "next";
import React from "react";

type Params = Promise<{ postid: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { postid } = await params;

  const post = await db.post.findFirst({
    where: { id: postid },
    include: { author: true },
  });

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found.",
    };
  }

  // ✅ Ensure a valid image URL
  const sourceFilePath =
    post.author?.name && post.source
      ? `${urlImage}/post/${post.author.name}/${post.source}`
      : "/default-image.png";

  // ✅ Use a safe BASE URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return {
    title: `${post.title} | SocialBracket`,
    description: post.description || "Check out this post on SocialBracket!",
    openGraph: {
      title: post.title,
      description: post.description || "Check out this post on SocialBracket!",
      url: `${baseUrl}/post/${post.id}`,
      type: "article",
      images: [
        {
          url: sourceFilePath,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function PostId({
  params,
}: {
  params: Promise<{ postid: string }>;
}) {
  const postid = (await params).postid;
  const session = await auth();

  const data = await db.post.findFirst({
    where: { id: postid },
    include: { author: true },
  });

  if (!data) {
    return <div className="text-center py-10">Post not found</div>;
  }

  return (
    <MaxWidthDiv className="sm:max-w-2xl">
      <CardPost item={data} session={session} />
    </MaxWidthDiv>
  );
}
