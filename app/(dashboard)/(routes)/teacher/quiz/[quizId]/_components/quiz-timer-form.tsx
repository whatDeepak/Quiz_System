"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Form, FormField, FormControl, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface QuizTimerFormProps {
  initialData: {
    timer: number; // Timer stored as seconds in the database
  };
  quizId: string;
}

// Helper function to convert seconds to hh:mm:ss format
const secondsToHMS = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// Helper function to convert hh:mm:ss format to seconds
const hmsToSeconds = (hms: string) => {
  const [hours, minutes, seconds] = hms.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

const formSchema = z.object({
  timer: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Please enter time in HH:MM:SS format"),
});

export const QuizTimerForm = ({
  initialData,
  quizId,
}: QuizTimerFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timer: secondsToHMS(initialData.timer), // Convert initial timer (in seconds) to hh:mm:ss format for display
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Convert hh:mm:ss to seconds before sending to the backend
      const timerInSeconds = hmsToSeconds(values.timer);
      await axios.patch(`/api/quizzes/${quizId}`, { timer: timerInSeconds });
      toast.success("Quiz timer updated");
      toggleEdit();
      router.refresh();
    } catch (error) {
      console.error("[QUIZ_TIMER_UPDATE]", error);
      toast.error("Failed to update quiz timer");
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Quiz timer
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit timer
            </>
          )}
        </Button>
      </div>
      {!isEditing && <p className="text-sm mt-2">{secondsToHMS(initialData.timer)}</p>}
      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="timer"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="HH:MM:SS"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit">
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
