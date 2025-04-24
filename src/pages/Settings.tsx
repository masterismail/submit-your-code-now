
import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Bell, Wallet, PieChart } from "lucide-react";

const Settings: React.FC = () => {
  const { budget, setBudget, thresholdAlert, setThresholdAlert, wallet } = useData();
  const { toast } = useToast();
  
  const [budgetAmount, setBudgetAmount] = useState(budget.amount.toString());
  const [budgetPeriod, setBudgetPeriod] = useState(budget.period);
  const [thresholdAmount, setThresholdAmount] = useState(thresholdAlert.amount.toString());
  const [thresholdEnabled, setThresholdEnabled] = useState(thresholdAlert.enabled);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet.currency,
    }).format(amount);
  };
  
  const handleSaveBudget = () => {
    const amount = parseFloat(budgetAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid budget amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }
    
    setBudget({
      amount,
      period: budgetPeriod,
    });
    
    toast({
      title: "Budget updated",
      description: `Your ${budgetPeriod} budget has been set to ${formatCurrency(amount)}.`,
    });
  };
  
  const handleSaveThreshold = () => {
    const amount = parseFloat(thresholdAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid threshold amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }
    
    setThresholdAlert({
      amount,
      enabled: thresholdEnabled,
    });
    
    toast({
      title: "Spending threshold updated",
      description: thresholdEnabled 
        ? `You will be notified when you spend more than ${formatCurrency(amount)}.` 
        : "Spending threshold notifications have been disabled.",
    });
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-expense-primary" />
              <CardTitle>Budget Settings</CardTitle>
            </div>
            <CardDescription>Configure your spending budget</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budgetAmount">Budget Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">
                  {wallet.currency === "USD" ? "$" : wallet.currency}
                </span>
                <Input
                  id="budgetAmount"
                  type="number"
                  placeholder="0.00"
                  className="pl-7"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budgetPeriod">Budget Period</Label>
              <Select value={budgetPeriod} onValueChange={(value) => setBudgetPeriod(value as any)}>
                <SelectTrigger id="budgetPeriod">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Current budget: {formatCurrency(budget.amount)} ({budget.period})
              </p>
              <Button onClick={handleSaveBudget} className="w-full">
                Save Budget Settings
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-expense-primary" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
            <CardDescription>Configure alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="thresholdEnabled" className="mb-1 block">
                  Spending Threshold Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when you spend beyond your threshold
                </p>
              </div>
              <Switch
                id="thresholdEnabled"
                checked={thresholdEnabled}
                onCheckedChange={setThresholdEnabled}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="thresholdAmount">Threshold Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">
                  {wallet.currency === "USD" ? "$" : wallet.currency}
                </span>
                <Input
                  id="thresholdAmount"
                  type="number"
                  placeholder="0.00"
                  className="pl-7"
                  value={thresholdAmount}
                  onChange={(e) => setThresholdAmount(e.target.value)}
                  disabled={!thresholdEnabled}
                  min="0.01"
                  step="0.01"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                You will be notified when your spending exceeds this amount.
              </p>
            </div>
            
            <Separator className="my-4" />
            
            <Button 
              onClick={handleSaveThreshold} 
              className="w-full"
              disabled={!thresholdEnabled}
            >
              Save Notification Settings
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-expense-primary" />
            <CardTitle>Data Management</CardTitle>
          </div>
          <CardDescription>Manage your expense data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-1">Export Data</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Export your expense data for backup or analysis
            </p>
            <Button variant="outline">
              Export to CSV
            </Button>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-1 text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Permanently delete your data
            </p>
            <Button variant="destructive">
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
