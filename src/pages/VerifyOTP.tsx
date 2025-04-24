
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { verifyOTP } from "@/services/authService";
import { Loader2, ArrowLeft } from "lucide-react";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const userEmail = sessionStorage.getItem("userEmail");

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  React.useEffect(() => {
    // If no email in session, redirect to landing page
    if (!userEmail) {
      navigate("/landing");
      toast({
        title: "Session expired",
        description: "Please sign up again.",
        variant: "destructive",
      });
    }
  }, [userEmail, navigate, toast]);

  const verifyOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Call the verification service
      const success = await verifyOTP(values.otp);
      
      if (success) {
        toast({
          title: "Account verified!",
          description: "You have successfully created your account.",
        });
        
        // Redirect to dashboard
        navigate("/");
      } else {
        toast({
          title: "Invalid OTP",
          description: "The verification code you entered is incorrect.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to {userEmail || "your email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(verifyOtpSubmit)} className="space-y-6">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center space-y-3">
                    <FormLabel>Verification Code</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => navigate("/landing")} disabled={isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign Up
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyOTP;
