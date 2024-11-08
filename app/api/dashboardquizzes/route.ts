import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    const userId = user?.id ?? "";

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Step 1: Fetch the teacher IDs the user follows
    const followedTeachers = await db.teacherFollower.findMany({
      where: { userId },
      select: { teacherId: true },
    });
    const followedTeacherIds = followedTeachers.map(f => f.teacherId);

    // Step 2: Fetch active quizzes created by followed teachers
    const activeQuizzes = await db.quiz.findMany({
      where: {
        isActive: true,
        userId: { in: followedTeacherIds },
      },
      select: {
        id: true,
        title: true,
        description: true,
        userId: true,
        createdAt: true,
        isActive:true,
        questions: {
          select: {
            id: true,
          },
        },
        accessCode: true,
      },
    });

    // Step 3: Fetch attempted quizzes for the current user
    const attemptedQuizzes = await db.quizAttempt.findMany({
      where: { userId },
      select: {
        quizId: true,
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            userId: true,
            isActive:true,
            questions: {
              select: {
                id: true,
              },
            },
            accessCode: true,
          },
        },
      },
    });

    // Step 4: Gather all unique userIds from active and attempted quizzes
    const teacherIds = [
      ...new Set([
        ...activeQuizzes.map(quiz => quiz.userId),
        ...attemptedQuizzes.map(attempt => attempt.quiz.userId),
      ]),
    ];

    // Step 5: Fetch user names for these teacherIds
    const teachers = await db.user.findMany({
      where: { id: { in: teacherIds } },
      select: { id: true, name: true },
    });
    const teacherNames = Object.fromEntries(teachers.map(t => [t.id, t.name]));

    // Step 6: Map teacher names to quizzes
    const activeQuizzesWithNames = activeQuizzes.map(quiz => ({
      ...quiz,
      teacherName: teacherNames[quiz.userId],
    }));
    const attemptedQuizzesWithNames = attemptedQuizzes.map(attempt => ({
      ...attempt.quiz,
      teacherName: teacherNames[attempt.quiz.userId],
    }));

    return NextResponse.json({
      activeQuizzes: activeQuizzesWithNames,
      attemptedQuizzes: attemptedQuizzesWithNames,
    });
  } catch (error) {
    console.error("[Fetch_Quizzes_for_Dashboard]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
