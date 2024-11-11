import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

interface HeaderProps {
  label: string;
  type: "signIn" | "signUp" | "error";
}

export const Header = ({
  label,
  type,
}: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 justify-start items-start">
      <h1
        className={cn(
          "text-md sm:text-lg md:text-xl lg:text-xl font-semibold",
          font.className
        )}
      >
        Welcome! Let&apos;s get you signed in.
      </h1>
      <p className="text-muted-foreground text-xs md:text-sm lg:text-md">
        {label}
      </p>
    </div>
  );
};
