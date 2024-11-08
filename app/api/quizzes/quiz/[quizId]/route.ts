// /api/quizzes/quiz/[quizId].ts

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { quizId: string } }) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch quiz data with attempt data if it exists for the user
    const quiz = await db.quiz.findUnique({
      where: { id: params.quizId },
      include: {
        questions: {
          orderBy: { idx: 'asc' },
        },
        quizAttempts: {
          where: { userId: user.id },
          select: {
            answers: true,
            score: true,
          },
          take: 1,
        },
      },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("[QUIZ_ROUTE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
