
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bug, Wrench } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DiagnosticCardProps {
  title: string;
  description: string;
  status: 'fixed' | 'broken' | 'warning';
  items: Array<{
    name: string;
    fixed: boolean;
  }>;
}

const DiagnosticCard = ({ title, description, status, items }: DiagnosticCardProps) => {
  const { toast } = useToast();
  
  const handleFix = (name: string) => {
    toast({
      title: `Fixing ${name}`,
      description: "Applying automated fixes...",
    });
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'fixed':
        return <Badge className="bg-rescue-green hover:bg-rescue-green">Working</Badge>;
      case 'broken':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-rescue-yellow text-rescue-yellow">Warning</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className={`diagnostic-card border ${
      status === 'fixed' ? 'border-rescue-lightGreen' : 
      status === 'broken' ? 'border-rescue-lightRed' : 
      'border-rescue-lightYellow'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className={`flex justify-between items-center p-2 rounded bg-gray-50 
              ${item.fixed ? 'fixed-item' : status === 'broken' ? 'broken-item' : 'warning-item'}`}>
              <span className="flex items-center gap-2">
                {item.fixed ? 
                  <Wrench className="h-4 w-4 text-rescue-green" /> : 
                  <Bug className="h-4 w-4 text-rescue-red" />
                }
                <span>{item.name}</span>
              </span>
              <Button 
                variant={item.fixed ? "outline" : "default"}
                size="sm"
                disabled={item.fixed}
                className={`fix-button ${item.fixed ? 'text-rescue-green border-rescue-green' : ''}`}
                onClick={() => handleFix(item.name)}
              >
                {item.fixed ? 'Fixed' : 'Fix Issue'}
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-2 flex justify-end">
        <Button 
          variant="outline" 
          className="text-sm"
          disabled={status === 'fixed'}
        >
          {status === 'fixed' ? 'All Issues Resolved' : 'Fix All Issues'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DiagnosticCard;
