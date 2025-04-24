
import React, { useMemo } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PieChart, BarChart, LineChart } from "recharts";
import { format, subDays, isSameDay, isSameMonth } from "date-fns";
import { ArrowRight, Plus, DollarSign, TrendingDown, TrendingUp, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { expenses, wallet, budget, categories } = useData();
  const navigate = useNavigate();
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet.currency,
    }).format(amount);
  };
  
  // Calculate total spent
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate recent spending (last 7 days)
  const recentSpending = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      const sevenDaysAgo = subDays(new Date(), 7);
      return expenseDate >= sevenDaysAgo;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate budget progress
  const budgetUsed = useMemo(() => {
    // Filter expenses based on budget period
    const relevantExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const today = new Date();
      
      switch (budget.period) {
        case 'daily':
          return isSameDay(expenseDate, today);
        case 'weekly':
          const weekStart = subDays(today, today.getDay());
          return expenseDate >= weekStart;
        case 'monthly':
          return isSameMonth(expenseDate, today);
        case 'yearly':
          return expenseDate.getFullYear() === today.getFullYear();
        default:
          return false;
      }
    });
    
    return relevantExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses, budget.period]);
  
  const budgetProgress = (budgetUsed / budget.amount) * 100;
  const isOverBudget = budgetUsed > budget.amount;
  
  // Calculate spending by category
  const spendingByCategory = useMemo(() => {
    const categoryTotals = categories.map(category => {
      const total = expenses
        .filter(expense => expense.category === category.name)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        name: category.name,
        total,
        color: category.color,
      };
    });
    
    return categoryTotals
      .filter(cat => cat.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [expenses, categories]);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => navigate("/add-expense")} className="bg-expense-primary hover:bg-expense-primary/90">
          <Plus className="h-4 w-4 mr-2" /> Add Expense
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(wallet.balance)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available in your wallet
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time expenses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(recentSpending)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>
              Your {budget.period} budget status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  {formatCurrency(budgetUsed)} of {formatCurrency(budget.amount)}
                </span>
                <span className={`text-sm font-medium ${isOverBudget ? 'text-expense-danger' : 'text-expense-success'}`}>
                  {budgetProgress.toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={Math.min(budgetProgress, 100)} 
                className={`h-2 ${isOverBudget ? 'bg-muted' : 'bg-muted'}`} 
              />
              {isOverBudget && (
                <p className="text-sm text-expense-danger mt-2">
                  You've exceeded your {budget.period} budget!
                </p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3">Top Spending Categories</h3>
              <div className="space-y-4">
                {spendingByCategory.slice(0, 3).map((category) => (
                  <div key={category.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{category.name}</span>
                      <span className="text-sm font-medium">{formatCurrency(category.total)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${(category.total / totalSpent) * 100}%`,
                          backgroundColor: category.color || '#7c3aed'
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/expenses")}
            >
              View All Expenses
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length > 0 ? (
              <div className="space-y-4">
                {expenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="bg-expense-primary/10 p-2 rounded-full">
                        <DollarSign className="h-4 w-4 text-expense-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">{expense.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(expense.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(expense.date), "MMM d")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No expenses yet</p>
                <Button 
                  variant="link" 
                  onClick={() => navigate("/add-expense")} 
                  className="mt-2"
                >
                  Add your first expense
                </Button>
              </div>
            )}
          </CardContent>
          {expenses.length > 5 && (
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full text-expense-primary" 
                onClick={() => navigate("/expenses")}
              >
                View more
              </Button>
            </CardFooter>
          )}
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Spending Trends</CardTitle>
            <CardDescription>Compare your spending habits</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="categories">
              <TabsList className="mb-4">
                <TabsTrigger value="categories">
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Categories
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <LineChartIcon className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="categories">
                <div className="h-[200px] flex items-center justify-center">
                  <div className="text-center text-sm text-muted-foreground">
                    Categorical spending chart would go here
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="timeline">
                <div className="h-[200px] flex items-center justify-center">
                  <div className="text-center text-sm text-muted-foreground">
                    Timeline spending chart would go here
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
