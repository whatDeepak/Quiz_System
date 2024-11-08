"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CourseProgress } from "@/components/course-progress";
import axios from "axios";

const QuizPage = ({ params }: { params: { quizId: string } }) => {
    const [quiz, setQuiz] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]); // Store the answers for comparison
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [modalMessage, setModalMessage] = useState<string>(""); // Modal message
    const [showModal, setShowModal] = useState<boolean>(false); // Modal visibility
    const router = useRouter();

    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                const response = await axios.get(`/api/quizzes/quiz/${params.quizId}`);
                const data = response.data;

                // If there's an attempt, populate answers and score
                if (data.quizAttempts?.length > 0) {
                    const attempt = data.quizAttempts[0];
                    setAnswers(attempt.answers);
                    setScore(attempt.score);
                    setIsSubmitted(true);
                }

                // Sort questions and set quiz data
                const sortedQuestions = data.questions.sort((a: any, b: any) => a.idx - b.idx);
                setQuiz({ ...data, questions: sortedQuestions });
            } catch (error) {
                console.error("Error fetching quiz:", error);
            }
        };

        fetchQuizData();
    }, [params.quizId]);

    const handleAnswer = (answer: string) => {
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestionIndex] = {
            idx: quiz.questions[currentQuestionIndex].idx,
            answer, // Save answer directly as a string
        };

        setAnswers(updatedAnswers);
        localStorage.setItem(`quiz-${params.quizId}`, JSON.stringify(updatedAnswers));

        console.log("Updated Answers: ", updatedAnswers); // Log updated answers
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

    const handleSubmitQuiz = async () => {
        try {
            // Submit the quiz answers
            const response = await axios.post(`/api/quizzes/quiz/${quiz.id}/submit`, { answers });
            localStorage.removeItem(`quiz-${params.quizId}`);
            setIsSubmitted(true);

            // Calculate the score based on correct answers
            const correctAnswersCount = answers.filter((answer, index) => {
                return answer.answer === quiz.questions[index].answer;
            }).length;

            const percentage = (correctAnswersCount / quiz.questions.length) * 100;
            setScore(correctAnswersCount);
            // Set the modal message based on the percentage
            let message = "";
            if (percentage >= 90) {
                message = "Excellent! You got it right!";
            } else if (percentage >= 70) {
                message = "Good job! Keep it up!";
            } else if (percentage >= 50) {
                message = "Keep going! You're doing well!";
            } else {
                message = "Needs improvement, but don't give up!";
            }

            setModalMessage(message);
            setShowModal(true); // Show the modal after submission

        } catch (error) {
            console.error("Error submitting quiz:", error);
        }
    };

    const question = quiz?.questions[currentQuestionIndex];

    // Function to handle the modal actions
    const handleModalClose = (action: string) => {
        if (action === "dashboard") {
            router.push("/dashboard"); // Navigate to dashboard
        } else if (action === "review") {
            router.refresh(); // Refresh the page to review the quiz attempt
        }
        setShowModal(false); // Close the modal
    };

    if (!quiz) {
        return <div>Loading quiz...</div>;
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="mb-4">
                <CourseProgress value={(currentQuestionIndex + 1) / quiz.questions.length * 100} />
            </div>

            {/* Question Navigation */}
            <div className="flex gap-4 mb-4">
                {quiz.questions.map((_question: any, index: number) => (
                    <div
                        key={index}
                        className={`w-8 h-8 rounded-full border flex justify-center items-center ${currentQuestionIndex === index ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                        onClick={() => setCurrentQuestionIndex(index)}
                    >
                        {index + 1}
                    </div>
                ))}
            </div>

            {/* Question Content */}
            <div className="text-lg font-semibold">
                Question {currentQuestionIndex + 1}/{quiz.questions.length}
            </div>
            <div className="mt-2 text-xl">{question?.text}</div>

            {/* Answer Input */}
            <div className="mt-4">
                {question?.type === "MCQ" ? (
                    <>
                        {[question.option1, question.option2, question.option3, question.option4].map((option, idx) =>
                            option ? (
                                <div key={idx}>
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={option}
                                        checked={answers[currentQuestionIndex]?.answer === option}
                                        onChange={() => handleAnswer(option)}
                                        disabled={isSubmitted}
                                    />
                                    <label>{option}</label>
                                    {/* Show color-coding and correct answer only if quiz is submitted */}
                                    {isSubmitted && answers[currentQuestionIndex]?.answer === option && (
                                        <div className={`text-sm ${answers[currentQuestionIndex]?.answer === question.answer ? "text-green-500" : "text-red-500"}`}>
                                            {answers[currentQuestionIndex]?.answer === question.answer ? "Correct!" : "Incorrect!"}
                                        </div>
                                    )}
                                </div>
                            ) : null
                        )}
                    </>
                ) : (
                    <input
                        type="text"
                        value={answers[currentQuestionIndex]?.answer || ""}
                        onChange={(e) => handleAnswer(e.target.value)}
                        className={`w-full p-2 border rounded-md mt-2 ${isSubmitted ? (answers[currentQuestionIndex]?.answer === question.answer ? "border-green-500" : "border-red-500") : ""}`}
                        disabled={isSubmitted}
                    />
                )}
            </div>

            {/* Correct Answer Display */}
            {isSubmitted && question?.answer && (
                <div className="mt-4 text-lg">
                    <strong>Correct Answer:</strong> {question?.answer}
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
                <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="px-4 py-2 bg-gray-300 rounded-lg">
                    Previous
                </button>
                {currentQuestionIndex < quiz.questions.length - 1 && (
                    <button onClick={handleNext} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                        Next
                    </button>
                )}
            </div>

            {/* Submit Button */}
            {!isSubmitted && (
                <div className="mt-6">
                    <button onClick={handleSubmitQuiz} className="w-full py-3 bg-blue-500 text-white rounded-lg">
                        Submit Quiz
                    </button>
                </div>
            )}

            {/* Score Display */}
            {isSubmitted && score !== null && (
                <div className="mt-6 text-xl font-semibold">
                    <div>Your Score: {score}/{quiz.questions.length}</div>
                </div>
            )}

            {/* Modal for Score */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg max-w-lg w-full">
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-semibold">{modalMessage}</h2>
                            <p className="text-lg mt-2">Your Score: {score}/{quiz.questions.length}</p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => handleModalClose("dashboard")} className="px-6 py-2 bg-green-500 text-white rounded-lg">
                                Go to Dashboard
                            </button>
                            <button onClick={() => handleModalClose("review")} className="px-6 py-2 bg-blue-500 text-white rounded-lg">
                                Review Quiz
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizPage;
