import { db } from "@/lib/db"; // Assuming Prisma is used here
import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { quizId: string } }) {
  try {
    // Get the current user
    const user = await currentUser();
    console.log('Current user:', user); // Log the user info
    const userId = user?.id ?? "";

    // If there's no authenticated user, return unauthorized
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse the request body to get the submitted answers
    const body = await req.json();
    const { answers } = body; // Assuming answers are now an array of { idx, answer } objects

    console.log('Received answers:', answers);

    // Ensure answers are provided and are in the correct format (array of { idx, answer } objects)
    if (!answers || !Array.isArray(answers) || !answers.every(a => a.idx !== undefined && a.answer !== undefined)) {
      return new NextResponse("Invalid answers format", { status: 400 });
    }

    // Check if the quiz exists using quizId from params
    const quiz = await db.quiz.findUnique({
      where: {
        id: params.quizId, // Get the quiz based on the quizId from the URL params
      },
      include: {
        questions: true, // Include questions related to this quiz
      }
    });

    console.log('Retrieved quiz:', quiz);

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    // Calculate the score based on the answers
    const score = calculateScore(quiz.questions, answers);

    // Create a new quiz attempt record in the database
    const quizAttempt = await db.quizAttempt.create({
      data: {
        userId, // Save the user who submitted the quiz
        quizId: params.quizId, // Save the quizId from the URL
        answers, // Store the answers
        score, // Store the calculated score
        createdAt: new Date(),
      },
    });

    // Return a success response with the quiz attempt details
    return NextResponse.json(quizAttempt);
  } catch (error) {
    console.error("[QUIZ_ATTEMPT_SUBMISSION]", error); // Log full error object for better debugging
    if (error instanceof Error) {
      return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Helper function to calculate score
function calculateScore(questions: any[], answers: { idx: number; answer: string }[]) {
  let score = 0;

  // Map questions by their idx for quick lookup
  const questionMap = new Map(questions.map(q => [q.idx, q.answer]));

  answers.forEach(({ idx, answer }) => {
    const correctAnswer = questionMap.get(idx); // Find correct answer by question idx
    console.log('Correct answer:', correctAnswer, 'Submitted answer:', answer); // Log the comparison

    // Check if the submitted answer matches the correct answer
    if (answer === correctAnswer) {
      score++;
    }
  });

  return score;
}
