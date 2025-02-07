import { urlImage } from "@/lib/global-var";
import { MEDIATYPE, Post, User } from "@prisma/client";
import { Session } from "next-auth";
import Image from "next/image";

interface Props {
  item: Post & { author: User };
}

export const PostMedia = ({ item }: Props) => {
  const sourceFilePath = `${urlImage}/post/${item.author.name}/${item.source}`;

  if (item.type === "IMAGE") {
    return (
      <Image
        src={sourceFilePath}
        alt={sourceFilePath}
        width={400}
        height={400}
        className="w-full h-auto"
      />
    );
  } else if (item.type === "VIDEO") {
    return <video src={sourceFilePath} controls className="w-full" />;
  }
  return null; // Return null for NONE type
};
