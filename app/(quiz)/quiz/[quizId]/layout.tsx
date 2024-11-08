import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const QuizLayout = async ({ children, params }: { children: React.ReactNode; params: { quizId: string } }) => {
  const user = await currentUser();
  const userId = user?.id ?? "";

  if (!userId) {
    return redirect("/");
  }

  const quiz = await db.quiz.findUnique({
    where: {
      id: params.quizId,
    },
    include: {
      questions: true,
    },
  });

  if (!quiz) {
    return redirect("/");
  }

  return (
    <div className="h-full dashboard-container">
      <main className="h-full">
        {children}
      </main>
    </div>
  );
};

export default QuizLayout;
