import React, { useState } from "react";
import { Badge } from "./ui/badge"; 
import { IconBadge } from "./icon-badge";
import { CircleHelp } from "lucide-react";
import Link from "next/link";
import { InputOTPForm } from "./InputOTPForm";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface QuizCardProps {
  id: string;
  title: string;
  description?: string; 
  isActive: boolean;
  teacherName?: string;
  questionsCount: number;
  accessCode: string;  // Access code for the quiz
  isAttempted: boolean;  // Flag to determine if quiz has been attempted
}

export const QuizCard: React.FC<QuizCardProps> = ({
  id,
  title,
  isActive,
  teacherName,
  questionsCount,
  accessCode,
  isAttempted // new prop
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleAccessCodeSubmit = (enteredCode: string) => {
    console.log(accessCode);
    if (enteredCode === accessCode) {
      handleModalClose();
      router.push(`/quiz/${id}`);
    } else {
      toast.error("Invalid access code. Please try again.");
    }
  };

  return (
    <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full relative">
      <div className="flex flex-col pt-4">
        {/* Title */}
        <div className="text-lg font-semibold">{title}</div>

        {/* Teacher Name */}
        <p className="text-xs text-muted-foreground mt-2">
          {teacherName || "Teacher not available"}
        </p>

        {/* Number of Questions */}
        <div className="flex items-center gap-x-1 text-slate-500 text-sm mt-2">
          <IconBadge size="sm" icon={CircleHelp} />
          <span>{questionsCount} {questionsCount === 1 ? "Question" : "Questions"}</span>
        </div>

        {/* Status (Attempted) */}
        <div className="mt-2">
          {isAttempted ? (
            <span className="text-blue-500 text-base">Attempted</span>
          ) : (
            <span className="text-green-500 text-base">Active</span>
          )}
        </div>

        {/* Button Text */}
        <div className="mt-2">
          {isAttempted ? (
            <button 
              onClick={() => router.push(`/quiz/${id}`)} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Check Quiz
            </button>
          ) : (
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Start Quiz
            </button>
          )}
        </div>
      </div>

      {/* Modal for OTP Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Enter Access Code</h2>
            <InputOTPForm onSubmit={handleAccessCodeSubmit} onClose={handleModalClose} />
          </div>
        </div>
      )}
    </div>
  );
};
