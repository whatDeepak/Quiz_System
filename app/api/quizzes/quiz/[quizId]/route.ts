import { db } from "@/lib/db"; // Assuming Prisma is used here
import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { quizId: string } }) {
  try {
    // Get the current user
    const user = await currentUser();
    const userId = user?.id ?? "";

    // If there's no authenticated user, return unauthorized
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch the quiz data from the database by quizId
    const quiz = await db.quiz.findUnique({
      where: {
        id: params.quizId, // Get the quiz based on the quizId from the URL params
      },
      include: {
        questions: true, // Include questions related to this quiz
      },
    });

    // If no quiz is found, return a 404 response
    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    // Return the quiz data as JSON
    return NextResponse.json(quiz);
  } catch (error) {
    console.error("[QUIZ_ROUTE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
