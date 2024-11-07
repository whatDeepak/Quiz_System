"use client"

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Eye, EyeOff  } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Quiz } from "@prisma/client";

function AccessCodeCell({ accessCode }: { accessCode: string | null }) {
  const [isCodeVisible, setIsCodeVisible] = useState(false);

  const toggleCodeVisibility = () => setIsCodeVisible((prev: boolean) => !prev);

  if (accessCode === null) {
    // If accessCode is null, show "Not Active" and no eye icon
    return <div>Not Active</div>;
  }

  const maskedCode = accessCode.replace(/./g, "X");  // Mask the code with X's

  return (
    <div className="flex items-center space-x-2">
      <span>
        {isCodeVisible ? accessCode : maskedCode}  {/* Show either the actual code or masked version */}
      </span>

      <button
        onClick={toggleCodeVisibility}
        className="flex items-center justify-center p-0"
        aria-label={isCodeVisible ? "Hide code" : "Show code"}
      >
        {isCodeVisible ? (
          <EyeOff className="h-4 w-4 cursor-pointer" /> // Eye with a cross when the code is visible
        ) : (
          <Eye className="h-4 w-4 cursor-pointer" /> // Eye icon when the code is hidden
        )}
      </button>
    </div>
  );
}

// Column definitions for the table
export const columns: ColumnDef<Quiz>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Published
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") || false;

      return (
        <Badge
          className={cn("bg-slate-500", isPublished && "bg-sky-700")}
        >
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "accessCode",
    header: "Access Code",
    cell: ({ row }) => {
      const accessCode = row.getValue<string>("accessCode");  // Explicitly type as string
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
