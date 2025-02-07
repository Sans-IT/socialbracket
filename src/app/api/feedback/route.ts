import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth"; // Sesuaikan dengan sistem autentikasi

// ✅ GET: Ambil semua feedback
export async function GET() {
  try {
    const feedback = await db.feedback.findMany({
      include: {
        User: { select: { username: true, image: true } }, // Ambil user terkait
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// ✅ POST: Tambah feedback baru
export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const newFeedback = await db.feedback.create({
      data: {
        text,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

// delete
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (id) return DeleteFeedbackById(id);
  return DeleteAllFeedback();
}

const DeleteAllFeedback = async () => {
  try {
    const feedback = await db.feedback.deleteMany();

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
};

const DeleteFeedbackById = async (id: string) => {
  try {
    const feedback = await db.feedback.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
};
