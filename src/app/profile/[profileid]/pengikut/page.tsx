import { db } from "@/lib/db";
import Follower from "./follower";
import { notFound } from "next/navigation";

export default async function Pengikut({
  params,
}: {
  params: Promise<{ profileid: string }>;
}) {
  const { profileid } = await params;

  const user = await db.user.findUnique({
    where: { username: profileid },
    select: { id: true },
  });

  if (!user) {
    return notFound();
  }

  return <Follower userId={user.id} />;
}
