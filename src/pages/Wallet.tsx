
import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet as WalletIcon, CreditCard, ArrowDown, ArrowUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Wallet: React.FC = () => {
  const { wallet, updateWallet, expenses } = useData();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState("");
  const [operation, setOperation] = useState<"add" | "withdraw">("add");
  const [newCurrency, setNewCurrency] = useState(wallet.currency);
  
  // Calculate total spent
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet.currency,
    }).format(amount);
  };
  
  const handleUpdateBalance = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }
    
    const amountValue = parseFloat(amount);
    const newBalance = operation === "add" 
      ? wallet.balance + amountValue
      : wallet.balance - amountValue;
    
    if (operation === "withdraw" && amountValue > wallet.balance) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough balance to withdraw this amount.",
        variant: "destructive",
      });
      return;
    }
    
    updateWallet({
      ...wallet,
      balance: newBalance,
    });
    
    toast({
      title: operation === "add" ? "Funds added" : "Funds withdrawn",
      description: `You have ${operation === "add" ? "added" : "withdrawn"} ${formatCurrency(amountValue)}.`,
    });
    
    setAmount("");
  };
  
  const handleChangeCurrency = () => {
    if (newCurrency !== wallet.currency) {
      updateWallet({
        ...wallet,
        currency: newCurrency,
      });
      
      toast({
        title: "Currency updated",
        description: `Your wallet currency is now set to ${newCurrency}.`,
      });
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Wallet</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle>Wallet Overview</CardTitle>
            <CardDescription>Manage your balance and transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted/10">
              <WalletIcon className="h-12 w-12 text-expense-primary mb-4" />
              <h2 className="text-4xl font-bold">{formatCurrency(wallet.balance)}</h2>
              <p className="text-muted-foreground mt-1">Current Balance</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Spent</span>
                <span className="font-medium">{formatCurrency(totalSpent)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Currency</span>
                <span className="font-medium">{wallet.currency}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Add or Withdraw Funds</CardTitle>
            <CardDescription>Update your wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={operation === "add" ? "default" : "outline"}
                  className={operation === "add" ? "bg-expense-primary hover:bg-expense-primary/90" : ""}
                  onClick={() => setOperation("add")}
                >
                  <ArrowDown className="h-4 w-4 mr-2" /> Add Funds
                </Button>
                <Button
                  variant={operation === "withdraw" ? "default" : "outline"}
                  className={operation === "withdraw" ? "bg-expense-primary hover:bg-expense-primary/90" : ""}
                  onClick={() => setOperation("withdraw")}
                >
                  <ArrowUp className="h-4 w-4 mr-2" /> Withdraw
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    {wallet.currency === "USD" ? "$" : wallet.currency}
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-7"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleUpdateBalance}
                className="w-full bg-expense-primary hover:bg-expense-primary/90"
              >
                {operation === "add" ? "Add to Balance" : "Withdraw from Balance"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Currency Settings</CardTitle>
            <CardDescription>Change your preferred currency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Select Currency</Label>
                <Select value={newCurrency} onValueChange={setNewCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                    <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                    <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                    <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={handleChangeCurrency}
                disabled={newCurrency === wallet.currency}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Update Currency
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Note: Changing currency does not convert your existing balance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Wallet;
