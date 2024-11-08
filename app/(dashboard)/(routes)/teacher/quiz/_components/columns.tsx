"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Quiz } from "@prisma/client";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function AccessCodeCell({ accessCode }: { accessCode: string | null }) {
  const [isCodeVisible, setIsCodeVisible] = useState(false);

  const toggleCodeVisibility = () => setIsCodeVisible((prev: boolean) => !prev);

  if (accessCode === null) {
    return <div>Not Active</div>;
  }

  const maskedCode = accessCode.replace(/./g, "X");

  return (
    <div className="flex items-center space-x-2">
      <span>{isCodeVisible ? accessCode : maskedCode}</span>
      <button
        onClick={toggleCodeVisibility}
        className="flex items-center justify-center p-0"
        aria-label={isCodeVisible ? "Hide code" : "Show code"}
      >
        {isCodeVisible ? (
          <EyeOff className="h-4 w-4 cursor-pointer" />
        ) : (
          <Eye className="h-4 w-4 cursor-pointer" />
        )}
      </button>
    </div>
  );
}

function ActiveStatusCell({ isActive, quizId }: { isActive: boolean; quizId: string }) {
  const [active, setActive] = useState(isActive);
  const router = useRouter();

  const handleToggleActive = async () => {
    try {
      if (active) {
        await axios.patch(`/api/courses/${quizId}/deactivate`);
        toast.success("Quiz deactivated");
      } else {
        await axios.patch(`/api/courses/${quizId}/activate`);
        toast.success("Quiz activated");
      }
      setActive((prev) => !prev);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update active status");
    }
  };

  return (
    <Badge
      onClick={handleToggleActive}
      className={cn(
        "px-2 py-1 cursor-pointer",
        active ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-700 hover:bg-gray-400 hover:text-white"
      )}
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

export const columns: ColumnDef<Quiz>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Published
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") || false;
      return (
        <Badge className={cn("bg-slate-500", isPublished && "bg-sky-700")}>
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Active Status",
    cell: ({ row }) => {
      const isActive = row.getValue<boolean>("isActive") || false;
      const quizId = row.original.id;
      return <ActiveStatusCell isActive={isActive} quizId={quizId} />;
    },
  },
  {
    accessorKey: "accessCode",
    header: "Access Code",
    cell: ({ row }) => {
      const accessCode = row.getValue<string>("accessCode");
      return <AccessCodeCell accessCode={accessCode} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { id } = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-4 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/teacher/quiz/${id}`}>
              <DropdownMenuItem>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
