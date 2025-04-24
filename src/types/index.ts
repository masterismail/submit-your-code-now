export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  receipt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Wallet {
  balance: number;
  currency: string;
}

export interface Budget {
  amount: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
}

export interface ThresholdAlert {
  amount: number;
  enabled: boolean;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  description?: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  date: Date;
  type: "alert" | "info" | "success";
}

export interface SpendingTrend {
  category: string;
  amount: number;
  percentage: number;
  previousAmount?: number;
  change?: number;
}

export interface DataContextType {
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
