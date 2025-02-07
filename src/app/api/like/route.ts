import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const getId = searchParams.get("id");

  try {
    const data = await db.like.findMany({
      where: {
        postId: getId as string,
      },
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(`${err} tidak dapat mendapatkan comment`, {
      status: 500,
    });
  }
}

export async function POST(request: NextRequest) {
  const query = await request.json();

  try {
    const data = await db.like.create({
      data: {
        postId: query.postId,
        userId: query.userId,
      },
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(err);
  }
}
