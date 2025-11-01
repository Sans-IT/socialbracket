import { urlImage } from "@/lib/global-var";
import { Post, User } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";

interface Props {
  item: Post & { author: User };
}

export const PostMedia = ({ item }: Props) => {
  const baseUrl = `${urlImage}/post/${item.author.name}/${item.source}`;
  const [src, setSrc] = useState(baseUrl);

  const tryNextFormat = () => {
    // urutan fallback: tanpa ekstensi → .jpg → .webp → .mp4
    const fallbackList = [
      baseUrl,
      `${baseUrl}.jpg`,
      `${baseUrl}.webp`,
      `${baseUrl}.mp4`,
    ];

    const currentIndex = fallbackList.indexOf(src);
    if (currentIndex < fallbackList.length - 1) {
      setSrc(fallbackList[currentIndex + 1]);
    }
  };

  if (item.type === "IMAGE") {
    return (
      <Image
        src={src}
        alt="post image"
        width={400}
        height={400}
        className="w-full h-auto"
        onError={tryNextFormat}
      />
    );
  } else if (item.type === "VIDEO") {
    return (
      <video
        src={src}
        controls
        className="w-full"
        onError={tryNextFormat}
      />
    );
  }

  return null;
};
