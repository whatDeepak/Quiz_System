"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CourseProgress } from "@/components/course-progress";
import { ArrowLeft, ArrowRight, Timer } from "lucide-react";
import axios from "axios";
import { IconBadge } from "@/components/icon-badge";
import { optional } from "zod";

type Question = {
    id: string;
    text: string;
    type: "MCQ" | "NORMAL";
    answer: string;
    option1?: string;
    option2?: string;
    option3?: string;
    option4?: string;
    idx: number;
};

type Quiz = {
    title: string;
    questions: Question[];
    timer: number;
    quizAttempts: Array<{
        answers: { idx: number; answer: string }[];
        score: number;
    }>;
};

const QuizPage = ({ params }: { params: { quizId: string } }) => {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [answers, setAnswers] = useState<{ idx: number; answer: string }[]>([]);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [score, setScore] = useState<number | null>(null);
    const [modalMessage, setModalMessage] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [timer, setTimer] = useState<string>("00:00");  // Timer in mm:ss format
    const router = useRouter();

    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                const response = await axios.get(`/api/quizzes/quiz/${params.quizId}`);
                const data = response.data as Quiz; // Type-cast response data to the Quiz type

                if (data.quizAttempts?.length > 0) {
                    const attempt = data.quizAttempts[0];
                    setAnswers(attempt.answers);
                    setScore(attempt.score);
                    setIsSubmitted(true);
                }

                const sortedQuestions = data.questions.sort((a, b) => a.idx - b.idx);
                setQuiz({ ...data, questions: sortedQuestions });

                const storedStartTime = localStorage.getItem(`quiz-start-time-${params.quizId}`);
                const storedEndTime = localStorage.getItem(`quiz-end-time-${params.quizId}`);

                if (storedEndTime && storedStartTime) {
                    const endTime = parseInt(storedEndTime, 10);
                    const currentTime = Date.now();
                    let remainingTime = endTime - currentTime;

                    if (remainingTime > 0) {
                        updateTimerDisplay(remainingTime);

                        const interval = setInterval(() => {
                            remainingTime = endTime - Date.now();
                            console.log("Remaining Time: ", remainingTime);  // Debug log

                            if (remainingTime <= 0) {
                                clearInterval(interval); // Ensure the interval is cleared
                                setTimer("00:00");
                                handleConfirmSubmit(); // Trigger quiz submission when time is up
                            } else {
                                updateTimerDisplay(remainingTime);
                            }
                        }, 1000);

                        return () => clearInterval(interval); // Cleanup interval when component unmounts
                    }
                } else {
                    const quizDuration = data.timer ? data.timer * 1000 : 0;
                    const endTime = Date.now() + quizDuration;
                    localStorage.setItem(`quiz-start-time-${params.quizId}`, Date.now().toString());
                    localStorage.setItem(`quiz-end-time-${params.quizId}`, endTime.toString());
                }
            } catch (error) {
                console.error("Error fetching quiz:", error);
            }
        };

        fetchQuizData();
    }, [params.quizId]);

    const updateTimerDisplay = (remainingTime: number) => {
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        setTimer(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };

    const handleSubmitQuiz = async () => {
        console.log("Submitting quiz..."); // Debug log
        try {
            // Ensure answers are updated with the latest selection or input
            const updatedAnswers = [...answers];

            // Always update the answer for the current question, ensuring it's set properly when time runs out
            updatedAnswers[currentQuestionIndex] = {
                idx: quiz?.questions[currentQuestionIndex].idx || 0,
                answer: answers[currentQuestionIndex]?.answer || "", // Ensure any unmarked answers are captured
            };

            setAnswers(updatedAnswers); // Update state explicitly
            localStorage.setItem(`quiz-${params.quizId}`, JSON.stringify(updatedAnswers)); // Store in localStorage

            const response = await axios.post(`/api/quizzes/quiz/${params.quizId}/submit`, { answers: updatedAnswers });

            localStorage.removeItem(`quiz-${params.quizId}`);
            localStorage.removeItem(`quiz-start-time-${params.quizId}`);
            localStorage.removeItem(`quiz-end-time-${params.quizId}`);
            setIsSubmitted(true);

            // Calculate score based on the updated answers
            const correctAnswersCount = updatedAnswers.filter((answer, index) => answer.answer === quiz?.questions[index].answer).length;
            const percentage = (correctAnswersCount / (quiz?.questions.length || 1)) * 100;
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


    const handleAnswer = (answer: string) => {
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestionIndex] = {
            idx: quiz?.questions[currentQuestionIndex].idx || 0,
            answer,
        };

        setAnswers(updatedAnswers);
        localStorage.setItem(`quiz-${params.quizId}`, JSON.stringify(updatedAnswers));
    };

    const handleNext = () => {
        if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
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
                    <span>{isSubmitted ? "00:00" : timer}</span>
                </div>
            </div>

            {/* Question Navigation */}
            <div className="flex gap-4 mb-8 justify-start">
                {quiz.questions.map((_, index) => (
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
            <div className="p-6 rounded-lg bg-[#f1f1f1] mb-8 min-h-[400px]">
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
                                    <div
                                        key={idx}
                                        className={`group flex items-center justify-between p-3 rounded-lg border-l-4 border-gray-400 hover:shadow-lg hover:border-primary hover:border-custom-primary hover:scale-105 transition-all mb-2
                    ${isSubmitted
                                                ? (answers[currentQuestionIndex]?.answer === option
                                                    ? 'border-green-500 hover:border-green-500' // Correct answer border
                                                    : 'border-red-500 hover:border-red-500'   // Incorrect answer border
                                                )
                                                : ''
                                            }`}
                                        style={{
                                            backgroundColor: '#e0e0e0', // Contrasting background
                                        }}
                                        onClick={() => handleAnswer(option)} // Handle click on the div
                                    >
                                        {/* Custom Left Line */}
                                        <div className="h-full w-1 bg-custom-primary group-hover:bg-custom-primary"></div>

                                        {/* Option Text */}
                                        <label className="flex-1 text-left pl-2">
                                            {option}
                                        </label>

                                        {/* Radio Button */}
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            value={option}
                                            checked={answers[currentQuestionIndex]?.answer === option}
                                            onChange={() => handleAnswer(option)}
                                            disabled={isSubmitted}
                                            className="ml-2" // Hide the actual radio button
                                        />
                                    </div>
                                ) : null
                            )}
                        </>
                    ) : (
                        <input
                            type="text"
                            value={answers[currentQuestionIndex]?.answer || ""}
                            onChange={(e) => handleAnswer(e.target.value)}
                            className={`w-full p-2 border rounded-md mt-2 ${isSubmitted && question ? (answers[currentQuestionIndex]?.answer === question.answer ? "border-green-500" : "border-red-500") : ""}`}
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
