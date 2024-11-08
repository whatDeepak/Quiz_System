import { db } from "@/lib/db"; // Assuming Prisma is used here
import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { quizId: string } }) {
  try {
    // Get the current user
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch the quiz attempt data from the database by quizId
    const quizAttempt = await db.quizAttempt.findUnique({
      where: {
        id: params.quizId, // Make sure this matches the field in your database schema
      },
      select: {
        answers: true,
        score: true, // Assuming score is stored here
      },
    });

    // If no quiz attempt is found, return a 404 response
    if (!quizAttempt) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    // Return the quiz attempt data as JSON
    return NextResponse.json(quizAttempt);
  } catch (error) {
    console.error("[QUIZ_ROUTE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
