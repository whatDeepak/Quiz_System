import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CourseProgressProps {
  value: number;
  variant?: "default" | "success";
  size?: "default" | "sm";
}

const colorByVariant = {
  default: "text-custom-primary",
  success: "text-emerald-700",
};

const sizeByVariant = {
  default: "text-sm",
  sm: "text-xs",
};

export const CourseProgress = ({
  value,
  variant,
  size,
}: CourseProgressProps) => {
  return (
    <div className="flex items-center gap-4">
      {/* Progress Bar */}
      <Progress
        className="h-2 flex-grow"
        value={value}
        variant={variant}
      />
      
      {/* Completion Text */}
      <p className={cn(
        "font-medium text-custom-primary whitespace-nowrap", // Ensure text doesn't wrap
        colorByVariant[variant ?? "default"],
        sizeByVariant[size ?? "default"],
      )}>
        {Math.round(value)}% Complete
      </p>
    </div>
  );
};
