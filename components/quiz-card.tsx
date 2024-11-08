// quiz-card.tsx

import React from "react";

interface QuizCardProps {
  id: string;
  title: string;
  description?: string;  // Make description optional
  isActive: boolean;
  teacherName?: string
}

export const QuizCard: React.FC<QuizCardProps> = ({
  id,
  title,
  description,
  isActive,
  teacherName
}) => {
    console.log()
  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{teacherName || "Teacher is not available"}</p>
      <div className="mt-2">
        {isActive ? (
          <span className="text-green-500">Active</span>
        ) : (
          <span className="text-red-500">Inactive</span>
        )}
      </div>
      {/* {progress !== null && (
        <div className="mt-2 text-blue-500">
          Progress: {progress}%
        </div>
      )} */}
    </div>
  );
};
