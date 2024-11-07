import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { quizId: string } }) {
  try {
    const user = await currentUser();
    let userId = user?.id ?? "";

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ownQuiz = await db.quiz.findUnique({
      where: {
        id: params.quizId,
        userId,
      },
    });

    if (!ownQuiz) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const quiz = await db.quiz.findUnique({
      where: {
        id: params.quizId,
      },
      include: {
        questions: true,
      },
    });

    if (!quiz || !quiz.title || quiz.questions.length === 0) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Generate a random 6-digit access code
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

    const publishedQuiz = await db.quiz.update({
      where: {
        id: params.quizId,
      },
      data: {
        isPublished: true,
        accessCode, // Save the generated access code
      },
    });

    return NextResponse.json(publishedQuiz);
  } catch (error) {
    console.log("[QUIZ_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
