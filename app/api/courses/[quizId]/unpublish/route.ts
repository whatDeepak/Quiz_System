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

    // Update quiz to be unpublished and set accessCode to null
    const unpublishedQuiz = await db.quiz.update({
      where: {
        id: params.quizId,
      },
      data: {
        isPublished: false,
        accessCode: null, // Set accessCode to null
      },
    });

    return NextResponse.json(unpublishedQuiz);
  } catch (error) {
    console.log("[QUIZ_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
