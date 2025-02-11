import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (type === "pengikut") {
      return await getFollowerType(userId);
    }

    if (type === "mengikuti") {
      return await getFollowingType(userId);
    }

    return await getByUserId(userId);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

const getByUserId = async (userId: string) => {
  const session = await auth();

  try {
    const followers = await db.follow.count({
      where: { followingId: userId },
    });

    const following = await db.follow.count({
      where: { followerId: userId },
    });

    const isFollowing = !!(session?.user?.id
      ? await db.follow.findFirst({
          where: { followerId: session.user.id, followingId: userId },
        })
      : null);

    return NextResponse.json({ followers, following, isFollowing });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
};

const getFollowingType = async (userId: string) => {
  try {
    const data = await db.follow.findMany({
      where: { followerId: userId },
      include: { following: true },
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mendapatkan daftar yang diikuti" },
      { status: 500 }
    );
  }
};

const getFollowerType = async (userId: string) => {
  try {
    const data = await db.follow.findMany({
      where: { followingId: userId },
      include: { follower: true },
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mendapatkan pengikut" },
      { status: 500 }
    );
  }
};

// ✅ Follow User
export async function POST(req: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userIdToFollow } = await req.json();
  if (!userIdToFollow)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (session.user.id === userIdToFollow)
    return NextResponse.json(
      { error: "Cannot follow yourself" },
      { status: 400 }
    );

  try {
    await db.follow.create({
      data: { followerId: session.user.id, followingId: userIdToFollow },
    });

    return NextResponse.json({ message: "Followed successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to follow user" },
      { status: 500 }
    );
  }
}

// ✅ Unfollow User
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userIdToUnfollow } = await req.json();
  if (!userIdToUnfollow)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    await db.follow.deleteMany({
      where: { followerId: session.user.id, followingId: userIdToUnfollow },
    });

    return NextResponse.json({ message: "Unfollowed successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500 }
    );
  }
}
