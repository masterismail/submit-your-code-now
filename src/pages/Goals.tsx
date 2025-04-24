
import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Plus, Target, Pencil, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const Goals: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, wallet } = useData();
  const { toast } = useToast();
  
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalAmount, setNewGoalAmount] = useState("");
  const [newGoalCurrentAmount, setNewGoalCurrentAmount] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState<Date | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet.currency,
    }).format(amount);
  };
  
  const handleAddGoal = () => {
    if (!newGoalName || !newGoalAmount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const targetAmount = parseFloat(newGoalAmount);
    const currentAmount = newGoalCurrentAmount ? parseFloat(newGoalCurrentAmount) : 0;
    
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast({
        title: "Invalid target amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(currentAmount) || currentAmount < 0) {
      toast({
        title: "Invalid current amount",
        description: "Please enter a valid non-negative number.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentAmount > targetAmount) {
      toast({
        title: "Invalid amounts",
        description: "Current amount cannot be greater than target amount.",
        variant: "destructive",
      });
      return;
    }
    
    addGoal({
      name: newGoalName,
      targetAmount,
      currentAmount,
      description: newGoalDescription,
      deadline: newGoalDeadline,
    });
    
    // Reset form
    setNewGoalName("");
    setNewGoalAmount("");
    setNewGoalCurrentAmount("");
    setNewGoalDescription("");
    setNewGoalDeadline(undefined);
    setDialogOpen(false);
    
    toast({
      title: "Goal added",
      description: "Your financial goal has been created successfully.",
    });
  };
  
  const handleDeleteGoal = () => {
    if (selectedGoal) {
      deleteGoal(selectedGoal);
      
      toast({
        title: "Goal deleted",
        description: "The financial goal has been deleted.",
      });
      
      setDeleteDialogOpen(false);
      setSelectedGoal(null);
    }
  };
  
  const confirmDelete = (id: string) => {
    setSelectedGoal(id);
    setDeleteDialogOpen(true);
  };
  
  // Contribute to goal
  const [contributeAmount, setContributeAmount] = useState("");
  const [contributeDialogOpen, setContributeDialogOpen] = useState(false);
  
  const handleContribute = () => {
    if (!selectedGoal || !contributeAmount) return;
    
    const amount = parseFloat(contributeAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }
    
    const goal = goals.find(g => g.id === selectedGoal);
    
    if (!goal) return;
    
    if (goal.currentAmount + amount > goal.targetAmount) {
      toast({
        title: "Exceeds target",
        description: "This contribution would exceed the target amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (amount > wallet.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance to contribute this amount.",
        variant: "destructive",
      });
      return;
    }
    
    updateGoal({
      ...goal,
      currentAmount: goal.currentAmount + amount,
    });
    
    setContributeDialogOpen(false);
    setContributeAmount("");
    setSelectedGoal(null);
    
    toast({
      title: "Contribution added",
      description: `You've contributed ${formatCurrency(amount)} to your goal.`,
    });
  };
  
  const openContributeDialog = (id: string) => {
    setSelectedGoal(id);
    setContributeDialogOpen(true);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Financial Goals</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-expense-primary hover:bg-expense-primary/90">
              <Plus className="h-4 w-4 mr-2" /> New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Financial Goal</DialogTitle>
              <DialogDescription>
                Create a new savings goal to track your progress.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input 
                  id="name" 
                  placeholder="E.g., New Car, Emergency Fund" 
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    {wallet.currency === "USD" ? "$" : wallet.currency}
                  </span>
                  <Input 
                    id="targetAmount" 
                    type="number" 
                    className="pl-7"
                    placeholder="0.00"
                    value={newGoalAmount}
                    onChange={(e) => setNewGoalAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentAmount">Current Progress (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    {wallet.currency === "USD" ? "$" : wallet.currency}
                  </span>
                  <Input 
                    id="currentAmount" 
                    type="number"
                    className="pl-7"
                    placeholder="0.00"
                    value={newGoalCurrentAmount}
                    onChange={(e) => setNewGoalCurrentAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline">Target Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newGoalDeadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newGoalDeadline ? format(newGoalDeadline, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newGoalDeadline}
                      onSelect={setNewGoalDeadline}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Add more details about your goal"
                  value={newGoalDescription}
                  onChange={(e) => setNewGoalDescription(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddGoal}>
                Add Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const isCompleted = progress === 100;
          
          return (
            <Card key={goal.id} className={isCompleted ? "border-green-500/50" : ""}>
              <CardHeader className={isCompleted ? "pb-2 border-b border-green-500/20" : "pb-2"}>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{goal.name}</CardTitle>
                    <CardDescription>
                      {isCompleted ? (
                        <span className="flex items-center text-green-500 mt-1">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Goal achieved
                        </span>
                      ) : goal.deadline ? (
                        `Target: ${format(new Date(goal.deadline), "PPP")}`
                      ) : (
                        "No deadline set"
                      )}
                    </CardDescription>
                  </div>
                  <div className="bg-expense-primary/10 p-2 rounded-full">
                    <Target className="h-5 w-5 text-expense-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">
                        {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                      </span>
                      <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  {goal.description && (
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  )}
                  
                  {!isCompleted && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {formatCurrency(goal.targetAmount - goal.currentAmount)} remaining
                      </span>
                      
                      {goal.deadline && new Date(goal.deadline) < new Date() && (
                        <span className="flex items-center text-yellow-500">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => confirmDelete(goal.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                {!isCompleted && (
                  <Button 
                    size="sm"
                    onClick={() => openContributeDialog(goal.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Contribute
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
        
        {goals.length === 0 && (
          <Card className="col-span-full bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="rounded-full bg-background p-3 mb-4">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-1">No Goals Yet</h3>
              <p className="text-center text-muted-foreground mb-4">
                Create your first financial goal to start tracking your progress.
              </p>
              <Button 
                onClick={() => setDialogOpen(true)}
                className="bg-expense-primary hover:bg-expense-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this goal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGoal}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Contribute Dialog */}
      <Dialog open={contributeDialogOpen} onOpenChange={setContributeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contribute to Goal</DialogTitle>
            <DialogDescription>
              Add funds toward this financial goal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contributeAmount">Contribution Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">
                  {wallet.currency === "USD" ? "$" : wallet.currency}
                </span>
                <Input 
                  id="contributeAmount" 
                  type="number" 
                  className="pl-7"
                  placeholder="0.00"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                Available balance: {formatCurrency(wallet.balance)}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setContributeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleContribute}>
              Contribute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
