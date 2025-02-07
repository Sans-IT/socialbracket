import MaxWidthDiv from "@/components/MaxWidthDiv";
import { db } from "@/lib/db";
import Image from "next/image";
import { notFound } from "next/navigation";
import FollowSection from "./follow-section";
import ProfilePost from "./profile-post";

export const revalidate = 60;

type Params = Promise<{ profileid: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { profileid } = await params;

  const userProfile = await db.user.findUnique({
    where: { username: profileid },
    select: { username: true, bio: true, image: true },
  });

  if (!userProfile) {
    return { title: "Profile Not Found", description: "User does not exist" };
  }

  return {
    title: `${userProfile.username} - Profile`,
    description: userProfile.bio || "User profile page",
    icons: {
      icon: userProfile.image || "/default-avatar.png",
    },
  };
}

export async function generateStaticParams() {
  const users = await db.user.findMany({
    select: { username: true },
  });

  return users.map((user) => ({
    profileid: user.username,
  }));
}

export default async function ProfileId({
  params,
}: {
  params: Promise<{ profileid: string }>;
}) {
  const profileid = (await params).profileid; // ✅ Tidak perlu await

  const userProfile = await db.user.findUnique({
    where: { username: profileid },
    select: {
      id: true,
      username: true,
      bio: true,
      image: true,
      _count: { select: { Post: true } }, // Hanya ambil jumlah post
    },
  });

  if (!userProfile) return notFound();

  return (
    <MaxWidthDiv className="sm:max-w-2xl">
      <div className="flex flex-col gap-3">
        {/* Profile Section */}
        <div className="flex flex-col gap-3 py-5 border-b border-muted">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-20">
            {/* Avatar */}
            <div className="w-[150px] h-[150px] relative">
              <Image
                src={userProfile.image || "/default-avatar.png"}
                alt={userProfile.username || "User Profile"}
                layout="fill"
                className="rounded-full object-cover border-muted border-4"
              />
            </div>

            {/* Username & Bio */}
            <div className="flex-1 flex flex-col gap-2">
              <h1 className="text-3xl font-bold">@{userProfile.username}</h1>
              <span className="w-full whitespace-pre-line">
                {userProfile.bio || ""}
              </span>
            </div>
          </div>

          {/* Follow Section (Hanya Ditampilkan Sekali) */}
          <FollowSection
            userId={userProfile.id}
            postCount={userProfile._count.Post}
          />
        </div>

        {/* Posts Section */}
        <ProfilePost userId={userProfile.id} />
      </div>
    </MaxWidthDiv>
  );
}
