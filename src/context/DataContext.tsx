import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Expense, 
  Category, 
  Wallet, 
  Budget, 
  ThresholdAlert, 
  FinancialGoal, 
  Notification,
  SpendingTrend
} from "@/types";
import { format } from "date-fns";

// Sample categories with icons from lucide-react
const defaultCategories: Category[] = [
  { id: "1", name: "Food", color: "#4CAF50", icon: "pie-chart" },
  { id: "2", name: "Transport", color: "#2196F3", icon: "credit-card" },
  { id: "3", name: "Shopping", color: "#FFC107", icon: "shopping-bag" },
  { id: "4", name: "Entertainment", color: "#9C27B0", icon: "music" },
  { id: "5", name: "Health", color: "#F44336", icon: "heart" },
  { id: "6", name: "Utilities", color: "#607D8B", icon: "zap" },
  { id: "7", name: "Other", color: "#9E9E9E", icon: "more-horizontal" },
];

// Sample expenses
const defaultExpenses: Expense[] = [
  {
    id: "1",
    amount: 45.99,
    category: "Food",
    description: "Grocery shopping",
    date: new Date(2025, 3, 20),
  },
  {
    id: "2",
    amount: 25.00,
    category: "Transport",
    description: "Uber ride",
    date: new Date(2025, 3, 19),
  },
  {
    id: "3",
    amount: 129.99,
    category: "Shopping",
    description: "New headphones",
    date: new Date(2025, 3, 17),
    receipt: "receipt1.jpg",
  },
  {
    id: "4",
    amount: 15.50,
    category: "Entertainment",
    description: "Movie ticket",
    date: new Date(2025, 3, 15),
  },
  {
    id: "5",
    amount: 35.75,
    category: "Health",
    description: "Pharmacy",
    date: new Date(2025, 3, 14),
  },
  {
    id: "6",
    amount: 78.23,
    category: "Utilities",
    description: "Electricity bill",
    date: new Date(2025, 3, 10),
  },
];

// Default values
const defaultWallet: Wallet = { balance: 2450.75, currency: "USD" };
const defaultBudget: Budget = { amount: 1000, period: "monthly" };
const defaultThresholdAlert: ThresholdAlert = { amount: 500, enabled: true };
const defaultGoals: FinancialGoal[] = [
  {
    id: "1",
    name: "Vacation",
    targetAmount: 1500,
    currentAmount: 750,
    deadline: new Date(2025, 8, 1),
    description: "Summer vacation in Italy",
  },
  {
    id: "2",
    name: "New Laptop",
    targetAmount: 1200,
    currentAmount: 300,
    deadline: new Date(2025, 6, 15),
    description: "MacBook Air",
  },
];
const defaultNotifications: Notification[] = [
  {
    id: "1",
    message: "You've reached 90% of your monthly budget",
    read: false,
    date: new Date(2025, 3, 22),
    type: "alert",
  },
  {
    id: "2",
    message: "Your electricity bill was higher than usual",
    read: true,
    date: new Date(2025, 3, 18),
    type: "info",
  },
];

// Calculate spending trends from expenses
const calculateSpendingTrends = (expenses: Expense[]): SpendingTrend[] => {
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const categoryMap = new Map<string, number>();
  for (const expense of expenses) {
    const currentAmount = categoryMap.get(expense.category) || 0;
    categoryMap.set(expense.category, currentAmount + expense.amount);
  }
  
  const trends: SpendingTrend[] = [];
  categoryMap.forEach((amount, category) => {
    trends.push({
      category,
      amount,
      percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      previousAmount: amount * 0.9, // Simulating previous period data
      change: 10, // Simulating 10% increase
    });
  });
  
  return trends.sort((a, b) => b.amount - a.amount);
};

interface DataContextType {
  expenses: Expense[];
  categories: Category[];
  wallet: Wallet;
  budget: Budget;
  thresholdAlert: ThresholdAlert;
  goals: FinancialGoal[];
  notifications: Notification[];
  spendingTrends: SpendingTrend[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateWallet: (wallet: Wallet) => void;
  setBudget: (budget: Budget) => void;
  setThresholdAlert: (alert: ThresholdAlert) => void;
  addGoal: (goal: Omit<FinancialGoal, "id">) => void;
  updateGoal: (goal: FinancialGoal) => void;
  deleteGoal: (goalId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  uploadReceipt: (expenseId: string, receiptUrl: string) => void;
  deleteExpense: (expenseId: string) => void;
  addNotification: (notification: Omit<Notification, "id" | "date" | "read">) => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(defaultExpenses);
  const [categories] = useState<Category[]>(defaultCategories);
  const [wallet, setWallet] = useState<Wallet>(defaultWallet);
  const [budget, setBudgetState] = useState<Budget>(defaultBudget);
  const [thresholdAlert, setThresholdAlertState] = useState<ThresholdAlert>(defaultThresholdAlert);
  const [goals, setGoals] = useState<FinancialGoal[]>(defaultGoals);
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [spendingTrends, setSpendingTrends] = useState<SpendingTrend[]>([]);

  // Update spending trends whenever expenses change
  useEffect(() => {
    setSpendingTrends(calculateSpendingTrends(expenses));
  }, [expenses]);

  // Check budget threshold and notify if needed
  useEffect(() => {
    if (!thresholdAlert.enabled) return;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    if (totalSpent >= thresholdAlert.amount && budget.period === "monthly") {
      // Check if we already have a similar notification
      const existingAlert = notifications.some(
        notif => notif.type === "alert" && notif.message.includes("threshold")
      );
      
      if (!existingAlert) {
        addNotification({
          message: `You've exceeded your ${thresholdAlert.amount} ${wallet.currency} spending threshold`,
          type: "alert"
        });
      }
    }
  }, [expenses, thresholdAlert, budget, notifications, wallet.currency]);

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    
    setExpenses(prev => [newExpense, ...prev]);
    
    // Update wallet balance
    setWallet(prev => ({
      ...prev,
      balance: prev.balance - expense.amount,
    }));
  };

  const updateWallet = (updatedWallet: Wallet) => {
    setWallet(updatedWallet);
  };

  const setBudget = (newBudget: Budget) => {
    setBudgetState(newBudget);
    addNotification({
      message: `Budget updated to ${newBudget.amount} ${wallet.currency} (${newBudget.period})`,
      type: "info"
    });
  };

  const setThresholdAlert = (alert: ThresholdAlert) => {
    setThresholdAlertState(alert);
  };

  const addGoal = (goal: Omit<FinancialGoal, "id">) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: Date.now().toString(),
    };
    
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (updatedGoal: FinancialGoal) => {
    setGoals(prev =>
      prev.map(goal => (goal.id === updatedGoal.id ? updatedGoal : goal))
    );
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const uploadReceipt = (expenseId: string, receiptUrl: string) => {
    setExpenses(prev =>
      prev.map(expense =>
        expense.id === expenseId ? { ...expense, receipt: receiptUrl } : expense
      )
    );
  };

  const deleteExpense = (expenseId: string) => {
    const expenseToDelete = expenses.find(expense => expense.id === expenseId);
    
    if (expenseToDelete) {
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
      
      // Refund wallet balance
      setWallet(prev => ({
        ...prev,
        balance: prev.balance + expenseToDelete.amount,
      }));
    }
  };

  const addNotification = (notification: Omit<Notification, "id" | "date" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <DataContext.Provider
      value={{
        expenses,
        categories,
        wallet,
        budget,
        thresholdAlert,
        goals,
        notifications,
        spendingTrends,
        addExpense,
        updateWallet,
        setBudget,
        setThresholdAlert,
        addGoal,
        updateGoal,
        deleteGoal,
        markNotificationAsRead,
        uploadReceipt,
        deleteExpense,
        addNotification,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
