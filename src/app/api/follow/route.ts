import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// ✅ Fetch follow count & status
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const session = await auth();

  if (!userId)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const followers = await db.follow.count({ where: { followingId: userId } });
    const following = await db.follow.count({ where: { followerId: userId } });

    const isFollowing = await db.follow.findFirst({
      where: { followerId: session.user.id, followingId: userId },
    });

    return NextResponse.json({
      followers,
      following,
      isFollowing: !!isFollowing,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

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
