
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const LandingPage = () => {
  const handleGetStarted = () => {
    window.location.href = "https://ap-south-1cn1xkgrvi.auth.ap-south-1.amazoncognito.com/login?client_id=40ce95qriabb1vg4llg4quav19&response_type=code&scope=email+openid+phone&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapp%2Fdashboard";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-accent/20">
      <div className="text-center space-y-6 max-w-3xl px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          Welcome to Your Financial Dashboard
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Take control of your finances with our powerful expense tracking and management tools.
        </p>
        <Button
          size="lg"
          onClick={handleGetStarted}
          className="group text-lg"
        >
          Get Started
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
