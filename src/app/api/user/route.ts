import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// Define an interface for the request body
interface PatchUserProps {
  username?: string;
  bio?: string;
  image?: string;
}

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Fetch user by username
    const user = await db.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// Handle the PATCH request
export async function PATCH(req: NextRequest) {
  try {
    // Parse the request body
    const body: PatchUserProps = await req.json();

    // Ensure request contains valid data
    if (!body.username && !body.bio && !body.image) {
      return NextResponse.json(
        { error: "Tidak ada data yang diberikan." },
        { status: 400 }
      );
    }

    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if username already exists (excluding the current user)
    if (body.username) {
      const existingUser = await db.user.findUnique({
        where: { username: body.username },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: "Username sudah digunakan, pilih yang lain." },
          { status: 409 }
        );
      }
    }

    // Update user data
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        username: body.username,
        bio: body.bio,
        image: body.image,
      },
    });

    // Return updated user data
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Username sudah digunakan, silakan pilih yang lain." },
          { status: 409 }
        );
      }
    }

    // General error handling
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui profil." },
      { status: 500 }
    );
  }
}
