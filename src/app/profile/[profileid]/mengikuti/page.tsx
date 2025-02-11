import { db } from "@/lib/db";
import Following from "./following";
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

  return <Following userId={user.id} />;
}
