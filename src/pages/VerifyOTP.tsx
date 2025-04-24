
import React, { useEffect } from "react";
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
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userEmail = sessionStorage.getItem("userEmail");

  useEffect(() => {
    // Display informational toast
    toast({
      title: "Verification in Process",
      description: "Cognito is handling the email verification. You'll be redirected to sign in when complete.",
    });
    
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            We're processing your registration via AWS Cognito. 
            You should receive an email verification code at {userEmail || "your email"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Please check your email inbox and follow the verification instructions from AWS Cognito.
          </p>
          <p className="text-sm text-muted-foreground">
            Once verified, you'll be able to sign in to your new account.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => navigate("/landing")} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyOTP;
