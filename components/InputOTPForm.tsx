import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormItem,
  FormDescription,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

interface InputOTPFormProps {
  onSubmit: (enteredCode: string) => void;  // Accept the onSubmit function
  onClose: () => void;  // Accept the onClose function to close the modal
}

export function InputOTPForm({ onSubmit, onClose }: InputOTPFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  function handleSubmitForm(data: z.infer<typeof FormSchema>) {
    onSubmit(data.pin);  // Pass the entered OTP code to the parent
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitForm)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                Please enter the Access Code.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between space-x-4 mt-4">
          {/* Submit Button */}
          <Button type="submit" className="w-full md:w-auto">
            Submit
          </Button>

          {/* Close Modal Button */}
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            className="w-full md:w-auto"
          >
            Close
          </Button>
        </div>
      </form>
    </Form>
  );
}
