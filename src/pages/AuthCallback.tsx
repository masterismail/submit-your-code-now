
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { handleAuthCallback } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AuthCallback: React.FC = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        setIsProcessing(true);
        const params = new URLSearchParams(location.search);
        
        // Check for error from Cognito
        if (params.has('error')) {
          const errorDescription = params.get('error_description') || 'Authentication failed';
          throw new Error(errorDescription);
        }
        
        // Process the callback
        await handleAuthCallback(params);
        
        toast({
          title: "Sign in successful!",
          description: "Welcome to Smart Spend Monitor!",
        });
        
      } catch (error: any) {
        console.error("Authentication callback error:", error);
        setError(error.message || "Authentication failed. Please try again.");
        
        toast({
          title: "Authentication failed",
          description: error.message || "An error occurred during sign-in. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [location, toast]);

  if (isProcessing) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-semibold">Processing authentication...</h1>
        <p className="text-muted-foreground mt-2">Please wait while we complete your sign-in</p>
      </div>
    );
  }

  if (error) {
    setTimeout(() => {
      window.location.href = "/landing";
    }, 3000);
    
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold text-red-500">Authentication Failed</h1>
        <p className="text-muted-foreground mt-2">{error}</p>
        <p className="mt-4">Redirecting to landing page...</p>
      </div>
    );
  }

  // If no error and processing is complete, redirect to dashboard
  return <Navigate to="/" replace />;
};

export default AuthCallback;
