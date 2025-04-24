
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { ArrowRight, Mail, User } from "lucide-react";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signinSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Sign up form
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Sign in form
  const signinForm = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // OTP form
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Handle sign up
  const handleSignUp = (values: z.infer<typeof signupSchema>) => {
    setUserEmail(values.email);
    setShowOtpForm(true);
    
    // In a real app, this would call an API to send OTP
    toast({
      title: "OTP Sent!",
      description: `A verification code has been sent to ${values.email}`,
    });
  };

  // Handle sign in
  const handleSignIn = (values: z.infer<typeof signinSchema>) => {
    // In a real app, this would authenticate with a backend
    toast({
      title: "Signed in!",
      description: "Welcome back to Smart Spend Monitor",
    });
    
    // Redirect to dashboard
    navigate("/");
  };

  // Verify OTP and complete signup
  const verifyOtp = (values: z.infer<typeof otpSchema>) => {
    // In a real app, this would verify the OTP with a backend
    
    toast({
      title: "Account created!",
      description: "You have successfully signed up",
    });
    
    // Reset forms and states
    setShowOtpForm(false);
    signupForm.reset();
    
    // Redirect to dashboard
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b py-4 px-8">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Smart Spend Monitor</h1>
          <div className="flex space-x-4">
            <Button variant="ghost" onClick={() => navigate("/")}>Features</Button>
            <Button variant="ghost" onClick={() => navigate("/")}>Pricing</Button>
            <Button variant="ghost" onClick={() => navigate("/")}>About</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex">
        <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900">
          <div className="max-w-xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Take Control of Your Spending</h2>
            <p className="text-lg mb-8 text-muted-foreground">
              Smart Spend Monitor helps you track expenses, set budgets, and achieve your financial goals with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => navigate("/")}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Auth Section */}
        <div className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md">
            {showOtpForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Verify Your Email</CardTitle>
                  <CardDescription>
                    We've sent a 6-digit verification code to {userEmail}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(verifyOtp)} className="space-y-6">
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
                      <Button type="submit" className="w-full">Verify</Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="link" onClick={() => setShowOtpForm(false)}>
                    Go back
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Tabs defaultValue="signin">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="signin">
                  <Card>
                    <CardHeader>
                      <CardTitle>Welcome Back</CardTitle>
                      <CardDescription>
                        Sign in to your account to continue
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...signinForm}>
                        <form onSubmit={signinForm.handleSubmit(handleSignIn)} className="space-y-4">
                          <FormField
                            control={signinForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your email" 
                                    type="email" 
                                    {...field} 
                                    className="flex h-10" 
                                    icon={<Mail className="h-4 w-4" />}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={signinForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input placeholder="••••••••" type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button type="submit" className="w-full">Sign In</Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <Button variant="link">Forgot password?</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                <TabsContent value="signup">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create an Account</CardTitle>
                      <CardDescription>
                        Sign up to start managing your finances
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...signupForm}>
                        <form onSubmit={signupForm.handleSubmit(handleSignUp)} className="space-y-4">
                          <FormField
                            control={signupForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your name" 
                                    {...field} 
                                    className="flex h-10" 
                                    icon={<User className="h-4 w-4" />}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={signupForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your email" 
                                    type="email" 
                                    {...field} 
                                    className="flex h-10" 
                                    icon={<Mail className="h-4 w-4" />}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={signupForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input placeholder="••••••••" type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button type="submit" className="w-full">Sign Up</Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-8 bg-muted/40">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Smart Spend Monitor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
