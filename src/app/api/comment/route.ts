import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const getId = searchParams.get("id");

  try {
    const data = await db.comment.findMany({
      where: {
        postId: getId as string,
      },
      include: {
        User: true,
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
  const session = await auth();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const data = await db.comment.create({
      data: {
        text: query.text as string,
        post: {
          connect: {
            id: query.postId as string,
          },
        },
        User: {
          connect: {
            id: query.id as string,
          },
        },
      },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: err + " gagal menambahkan komentar" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const getId = searchParams.get("id");
  const getAuthorId = searchParams.get("authorid");

  const session = await auth();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (session.user.id !== getAuthorId) {
    return new Response(
      "Forbidden: You're not allowed to delete this comment",
      {
        status: 403,
      }
    );
  }
  try {
    const data = await db.comment.delete({
      where: {
        id: getId as string,
      },
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(err);
  }
}
