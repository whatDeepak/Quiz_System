"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { CourseProgress } from "@/components/course-progress"; // Assuming this component exists
import axios from "axios";

const QuizPage = ({ params }: { params: { quizId: string } }) => {
    const [quiz, setQuiz] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]); // Store answers in an array
    const [isSubmitted, setIsSubmitted] = useState(false);
    const router = useRouter();

    // Fetch quiz data using useEffect
    useEffect(() => {
        const fetchQuizData = async () => {
          try {
            const response = await axios.get(`/api/quiz/${params.quizId}`);
            setQuiz(response.data);
          } catch (error) {
            console.error("Error fetching quiz:", error);
          }
        };
    
        fetchQuizData();
      }, [params.quizId]);

    // Ensure quiz exists
    if (!quiz) {
        return <div>Loading quiz...</div>;
    }

    const handleAnswer = (answer: string) => {
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestionIndex] = answer;
        setAnswers(updatedAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        // Submit the quiz and answers to the database (e.g., creating a quiz attempt)
        try {
            await axios.post("/api/quiz/submit", {
                quizId: quiz.id,
                answers,
            });
            setIsSubmitted(true);
            router.push("/quiz/completed"); // Redirect after submission
        } catch (error) {
            console.error("Error submitting quiz:", error);
        }
    };

    const question = quiz.questions[currentQuestionIndex];

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="mb-4">
                <CourseProgress value={(currentQuestionIndex + 1) / quiz.questions.length * 100} />
            </div>

            <div className="flex gap-4 mb-4">
                {quiz.questions.map((_question:any, index: number) => (
                    <div
                        key={index}
                        className={`w-8 h-8 rounded-full border flex justify-center items-center ${currentQuestionIndex === index ? "bg-blue-500 text-white" : "bg-gray-200"
                            }`}
                        onClick={() => setCurrentQuestionIndex(index)}
                    >
                        {index + 1}
                    </div>
                ))}
            </div>

            <div className="text-lg font-semibold">
                Question {currentQuestionIndex + 1}/{quiz.questions.length}
            </div>
            <div className="mt-2 text-xl">{question.text}</div>

            <div className="mt-4">
                {question.type === "MCQ" ? (
                    <>
                        <div>
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={question.option1 ?? ''}
                                onChange={() => handleAnswer(question.option1 ?? '')}
                            />
                            <label>{question.option1}</label>
                        </div>
                        <div>
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={question.option2 ?? ''}
                                onChange={() => handleAnswer(question.option2 ?? '')}
                            />
                            <label>{question.option2}</label>
                        </div>
                        <div>
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={question.option3 ?? ''}
                                onChange={() => handleAnswer(question.option3 ?? '')}
                            />
                            <label>{question.option3}</label>
                        </div>
                        <div>
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={question.option4 ?? ''}
                                onChange={() => handleAnswer(question.option4 ?? '')}
                            />
                            <label>{question.option4}</label>
                        </div>
                    </>
                ) : (
                    <input
                        type="text"
                        onChange={(e) => handleAnswer(e.target.value)}
                        className="w-full p-2 border rounded-md mt-2"
                    />
                )}
            </div>

            <div className="flex justify-between mt-4">
                <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0 || isSubmitted}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                    Previous
                </button>
                <button
                    onClick={currentQuestionIndex === quiz.questions.length - 1 ? handleSubmit : handleNext}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                    {currentQuestionIndex === quiz.questions.length - 1 ? "Submit" : "Next"}
                </button>
            </div>
        </div>
    );
};

export default QuizPage;
