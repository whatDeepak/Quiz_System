"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CourseProgress } from "@/components/course-progress"; // Assuming this component exists
import axios from "axios";

const QuizPage = ({ params }: { params: { quizId: string } }) => {
    const [quiz, setQuiz] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]); // Store answers in an array
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0); // To store the user's score
    const [quizAttempt, setQuizAttempt] = useState<any>(null); // Store the quiz attempt data
    const [showModal, setShowModal] = useState(false); // To control the modal visibility
    const [modalMessage, setModalMessage] = useState(""); // To display message in the modal
    const router = useRouter();

    // Fetch quiz data using useEffect
    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                const response = await axios.get(`/api/quizzes/quiz/${params.quizId}`);
                const sortedQuestions = response.data.questions.sort((a: any, b: any) => a.idx - b.idx); // Sort questions by idx
                setQuiz({ ...response.data, questions: sortedQuestions }); // Set the sorted quiz data
            } catch (error) {
                console.error("Error fetching quiz:", error);
            }
        };

        fetchQuizData();
    }, [params.quizId]);

    // Load saved answers from localStorage if they exist
    useEffect(() => {
        const savedAnswers = localStorage.getItem(`quiz-${params.quizId}`);
        if (savedAnswers) {
            setAnswers(JSON.parse(savedAnswers));
        }
    }, [params.quizId]);

    // Fetch quiz attempt data after submission or on page load
    const fetchQuizAttemptData = async () => {
        try {
            const response = await axios.get(`/api/quizzes/quiz-attempt/${params.quizId}`);
            setQuizAttempt(response.data);
        } catch (error) {
            console.error("Error fetching quiz attempt:", error);
        }
    };

    // Ensure quiz exists
    if (!quiz) {
        return <div>Loading quiz...</div>;
    }

    const handleAnswer = (answer: string) => {
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestionIndex] = answer;
        setAnswers(updatedAnswers);

        // Save answers to localStorage
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
        // Calculate score for all questions
        let finalScore = 0;
        quiz.questions.forEach((question: any, index: number) => {
            const currentAnswer = answers[index];
            if (question.type === "MCQ" && currentAnswer === question.correctOption) {
                finalScore++;
            }
        });
        setScore(finalScore);

        try {
            // Submit all answers to the API
            await axios.post("/api/quizzes/quiz/submit", {
                quizId: quiz.id,
                answers,
            });

            // Fetch quiz attempt data after submission
            await fetchQuizAttemptData();

            // Clear saved answers from localStorage after submission
            localStorage.removeItem(`quiz-${params.quizId}`);

            setIsSubmitted(true);

            // Show the modal with the score and message
            setModalMessage(finalScore === quiz.questions.length ? "Congratulations!" : "Good try! Keep it up.");
            setShowModal(true);

            // Redirect to the quiz completed page after the modal interaction
        } catch (error) {
            console.error("Error submitting quiz:", error);
        }
    };

    const question = quiz.questions[currentQuestionIndex];

    const closeModal = () => {
        setShowModal(false);
        router.push("/dashboard"); // Redirect to dashboard after modal is closed
    };

    const handleExploreQuiz = () => {
        router.push(`/quiz/explore/${params.quizId}`); // Redirect to the explore quiz page
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            {/* Course progress bar */}
            <div className="mb-4">
                <CourseProgress value={(currentQuestionIndex + 1) / quiz.questions.length * 100} />
            </div>

            {/* Question navigation */}
            <div className="flex gap-4 mb-4">
                {quiz.questions.map((_question: any, index: number) => (
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

            {/* Question and answer display */}
            <div className="text-lg font-semibold">
                Question {currentQuestionIndex + 1}/{quiz.questions.length}
            </div>
            <div className="mt-2 text-xl">{question.text}</div>

            <div className="mt-4">
                {question.type === "MCQ" ? (
                    <>
                        {question.option1 && (
                            <div>
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={question.option1}
                                    checked={answers[currentQuestionIndex] === question.option1 || quizAttempt?.answers[currentQuestionIndex] === question.option1}
                                    onChange={() => handleAnswer(question.option1)}
                                    disabled={isSubmitted || quizAttempt}
                                />
                                <label>{question.option1}</label>
                            </div>
                        )}
                        {question.option2 && (
                            <div>
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={question.option2}
                                    checked={answers[currentQuestionIndex] === question.option2 || quizAttempt?.answers[currentQuestionIndex] === question.option2}
                                    onChange={() => handleAnswer(question.option2)}
                                    disabled={isSubmitted || quizAttempt}
                                />
                                <label>{question.option2}</label>
                            </div>
                        )}
                        {question.option3 && (
                            <div>
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={question.option3}
                                    checked={answers[currentQuestionIndex] === question.option3 || quizAttempt?.answers[currentQuestionIndex] === question.option3}
                                    onChange={() => handleAnswer(question.option3)}
                                    disabled={isSubmitted || quizAttempt}
                                />
                                <label>{question.option3}</label>
                            </div>
                        )}
                        {question.option4 && (
                            <div>
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={question.option4}
                                    checked={answers[currentQuestionIndex] === question.option4 || quizAttempt?.answers[currentQuestionIndex] === question.option4}
                                    onChange={() => handleAnswer(question.option4)}
                                    disabled={isSubmitted || quizAttempt}
                                />
                                <label>{question.option4}</label>
                            </div>
                        )}
                    </>
                ) : (
                    <input
                        type="text"
                        value={answers[currentQuestionIndex] || ""}
                        onChange={(e) => handleAnswer(e.target.value)}
                        className="w-full p-2 border rounded-md mt-2"
                        disabled={isSubmitted || quizAttempt}
                    />
                )}
            </div>

            {/* Navigation and submission */}
            <div className="flex justify-between mt-4">
                <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0 || isSubmitted}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                    Previous
                </button>
                {currentQuestionIndex < quiz.questions.length - 1 && !isSubmitted && (
                    <button
                        onClick={handleNext}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                        Next
                    </button>
                )}
            </div>

            {/* Submit button or score display */}
            {!isSubmitted && !quizAttempt && (
                <div className="mt-6">
                    <button
                        onClick={handleSubmitQuiz}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg"
                    >
                        Submit Quiz
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-xl font-semibold mb-4">{modalMessage}</h2>
                        <div className="mb-4">
                            <p>Your score: {score}/{quiz.questions.length}</p>
                        </div>
                        <div className="flex justify-between">
                            <button onClick={closeModal} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Finish</button>
                            <button onClick={handleExploreQuiz} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Explore Quiz</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizPage;
