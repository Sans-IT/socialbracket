import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const pageSize = 3; // Jumlah post per halaman

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const search = req.nextUrl.searchParams.get("search");
  const cursor = req.nextUrl.searchParams.get("cursor") as string;

  if (id) return GetPostById(id, cursor);
  if (search) return GetPostBySearchParams(search, cursor);
  return GetAllPost(cursor);
}

const GetPostBySearchParams = async (search: string, cursor?: string) => {
  try {
    const data = await db.post.findMany({
      where: {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize, // Ambil `pageSize` post
      skip: cursor ? 1 : 0, // Lewati 1 item jika ada cursor
      cursor: cursor ? { id: cursor } : undefined, // Mulai dari cursor tertentu jika ada
    });

    const nextCursor =
      data.length === pageSize ? data[data.length - 1].id : null; // Ambil ID terakhir sebagai cursor berikutnya

    return NextResponse.json({ data, nextCursor });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

const GetAllPost = async (cursor?: string) => {
  try {
    const data = await db.post.findMany({
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor =
      data.length === pageSize ? data[data.length - 1].id : null;

    return NextResponse.json({ data, nextCursor });
  } catch (err) {
    return NextResponse.json(err);
  }
};

const GetPostById = async (id: string, cursor?: string) => {
  try {
    const posts = await db.post.findMany({
      where: {
        authorId: id,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize,
      skip: cursor ? 1 : 0, // Skip jika ada cursor (menghindari duplikasi data)
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor =
      posts.length === pageSize ? posts[posts.length - 1].id : null;

    return NextResponse.json({ post: posts, nextCursor });
  } catch (err) {
    console.error("Error fetching posts:", err);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
};

// post
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json("unauthorized", { status: 401 });

  const query = await req.json();
  try {
    const data = await db.post.create({
      data: {
        authorId: query.authorId,
        title: query.title,
        description: query.description,
        type: query.type,
        source: query.source,
      },
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(err);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json("unauthorized", { status: 401 });

  const query = await req.json();
  try {
    const data = await db.post.update({
      where: {
        id: query.id,
      },
      data: {
        authorId: query.authorId,
        title: query.title,
        description: query.description,
      },
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(err);
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const getId = searchParams.get("id");
  const getAuthorId = searchParams.get("authorid");

  const session = await auth();
  if (!session) return NextResponse.json("unauthorized", { status: 401 });
  if (session.user.id !== getAuthorId) {
    return new Response(
      "Forbidden: You're not allowed to delete this comment",
      {
        status: 403,
      }
    );
  }

  try {
    const data = await db.post.delete({
      where: {
        id: getId as string,
      },
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(err);
  }
}
