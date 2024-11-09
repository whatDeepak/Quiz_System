"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CourseProgress } from "@/components/course-progress";
import { ArrowLeft, ArrowRight, Timer } from "lucide-react";  // Import the Timer icon from lucide-react
import axios from "axios";
import { IconBadge } from "@/components/icon-badge";

const QuizPage = ({ params }: { params: { quizId: string } }) => {
    const [quiz, setQuiz] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [modalMessage, setModalMessage] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);  // State for confirmation modal
    const router = useRouter();

    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                const response = await axios.get(`/api/quizzes/quiz/${params.quizId}`);
                const data = response.data;

                if (data.quizAttempts?.length > 0) {
                    const attempt = data.quizAttempts[0];
                    setAnswers(attempt.answers);
                    setScore(attempt.score);
                    setIsSubmitted(true);
                }

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
            answer,
        };

        setAnswers(updatedAnswers);
        localStorage.setItem(`quiz-${params.quizId}`, JSON.stringify(updatedAnswers));
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
            const response = await axios.post(`/api/quizzes/quiz/${quiz.id}/submit`, { answers });
            localStorage.removeItem(`quiz-${params.quizId}`);
            setIsSubmitted(true);

            const correctAnswersCount = answers.filter((answer, index) => answer.answer === quiz.questions[index].answer).length;
            const percentage = (correctAnswersCount / quiz.questions.length) * 100;
            setScore(correctAnswersCount);

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
            setShowModal(true);
        } catch (error) {
            console.error("Error submitting quiz:", error);
        }
    };

    const handleConfirmSubmit = () => {
        setShowConfirmModal(false);  // Close the confirmation modal
        handleSubmitQuiz();  // Proceed with the quiz submission
    };

    const handleCancelSubmit = () => {
        setShowConfirmModal(false);  // Close the confirmation modal
    };

    const question = quiz?.questions[currentQuestionIndex];

    const handleModalClose = (action: string) => {
        if (action === "dashboard") {
            router.push("/dashboard");
        } else if (action === "review") {
            router.refresh();
        }
        setShowModal(false);
    };

    if (!quiz) {
        return <div>Loading quiz...</div>;
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            {/* Top Section: Quiz Name, Progress Bar, Timer */}
            <div className="flex items-center justify-between mb-8 mt-4">
                <div className="text-xl font-bold">{quiz.title}</div>

                {/* Progress Bar Container */}
                <div className="flex-grow px-4 mx-8">
                    <CourseProgress value={(currentQuestionIndex + 1) / quiz.questions.length * 100} />
                </div>

                <div className="flex items-center gap-2">
                    <IconBadge icon={Timer} size="sm" />
                    <span>{quiz.timer}</span>
                </div>
            </div>

            {/* Question Navigation */}
            <div className="flex gap-4 mb-8 justify-start">
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

            {/* Main Quiz Section */}
            <div className="p-6 rounded-lg bg-[#f1f1f1] mb-8 h-[350px]">
                <div className="text-lg font-semibold">
                    Question {currentQuestionIndex + 1}
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
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mb-8">
                {/* Previous and Next Buttons in the center */}
                <div className="flex justify-center gap-4 mb-8">
                    {/* Previous Button */}
                    <button
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 hover:text-gray-800 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                        <IconBadge icon={ArrowLeft} />
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={handleNext}
                        disabled={currentQuestionIndex === quiz.questions.length - 1}
                        className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 hover:text-gray-800 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                        <IconBadge icon={ArrowRight} />
                    </button>
                </div>

                {/* Submit Button on the right */}
                {!isSubmitted && (
                    <div className="flex justify-end mb-8">
                        <button
                            onClick={() => setShowConfirmModal(true)} // Show the confirmation modal
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Submit Quiz
                        </button>
                    </div>
                )}

                {isSubmitted && score !== null && (
                    <div className="text-xl font-semibold justify-end mb-8">
                        <div>Your Score: {score}/{quiz.questions.length}</div>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-xs w-full">
                        <div className="text-lg font-bold">Are you sure you want to submit the quiz?</div>
                        <div className="mt-4">
                            <button
                                onClick={handleCancelSubmit}
                                className="px-4 py-2 bg-gray-300 text-black rounded-lg mr-8"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSubmit}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Result Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg max-w-lg w-full">
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-semibold">{modalMessage}</h2>
                            <p className="text-lg mt-2">Your Score: {score}/{quiz.questions.length}</p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => handleModalClose("dashboard")} className="px-6 py-3 bg-gray-300 text-black rounded-lg hover:bg-gray-400">
                                Go to Dashboard
                            </button>
                            <button onClick={() => handleModalClose("review")} className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                                Review Answers
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizPage;
