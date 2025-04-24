import React, { useMemo } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PieChart, BarChart, LineChart, ResponsiveContainer, Tooltip, Cell, XAxis, YAxis, CartesianGrid, Legend, Pie, Bar, Line } from "recharts";
import { format, subDays, isSameDay, isSameMonth, subMonths } from "date-fns";
import { ArrowRight, Plus, DollarSign, TrendingDown, TrendingUp, LineChart as LineChartIcon, PieChart as PieChartIcon, ChartBar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const Dashboard: React.FC = () => {
  const { expenses, wallet, budget, categories, spendingTrends } = useData();
  const navigate = useNavigate();
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
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
  
  // Prepare data for pie chart
  const pieChartData = useMemo(() => {
    return spendingByCategory.map(category => ({
      name: category.name,
      value: category.total,
      color: category.color,
    }));
  }, [spendingByCategory]);
  
  // Prepare data for timeline chart
  const timelineData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, "dd MMM"),
        amount: expenses
          .filter(expense => isSameDay(new Date(expense.date), date))
          .reduce((sum, expense) => sum + expense.amount, 0),
      };
    });
    
    return last7Days;
  }, [expenses]);
  
  // Prepare monthly spending data
  const monthlyData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      const month = format(date, "MMM");
      const year = format(date, "yyyy");
      const monthExpenses = expenses.filter(expense => {
        const expDate = new Date(expense.date);
        return expDate.getMonth() === date.getMonth() && 
               expDate.getFullYear() === date.getFullYear();
      });
      
      return {
        name: month,
        year: year,
        amount: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      };
    });
    
    return last6Months;
  }, [expenses]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB'];
  
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
                <TabsTrigger value="monthly">
                  <ChartBar className="h-4 w-4 mr-2" />
                  Monthly
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="categories" className="h-[250px]">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-2 border rounded shadow text-sm">
                                <p className="font-medium">{data.name}</p>
                                <p>{formatCurrency(data.value)}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        formatter={(value) => <span className="text-xs">{value}</span>}
                      />
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No spending data to display
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="timeline" className="h-[250px]">
                {timelineData.some(day => day.amount > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        tickFormatter={(value) => `${wallet.currency} ${value}`} 
                      />
                      <Tooltip formatter={(value) => [`${formatCurrency(Number(value))}`, 'Spent']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        name="Daily Spending" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No daily spending data to display
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="monthly" className="h-[250px]">
                {monthlyData.some(month => month.amount > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `${wallet.currency} ${value}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`${formatCurrency(Number(value))}`, 'Spent']} 
                        labelFormatter={(label) => `${label}`}
                      />
                      <Legend />
                      <Bar 
                        dataKey="amount" 
                        name="Monthly Spending" 
                        fill="#3b82f6"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No monthly spending data to display
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
